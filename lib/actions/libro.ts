'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Obtener cursos del colegio ────────────────────────────────
export async function getCursosDelColegio() {
  const supabase = await createClient()
  const anio = new Date().getFullYear()

  const { data, error } = await supabase
    .from('cursos')
    .select('id, nombre, nivel')
    .eq('anio', anio)
    .eq('activo', true)
    .order('nombre')

  if (error) {
    console.error('getCursosDelColegio error:', error)
    return []
  }

  return data ?? []
}

// ── Obtener alumnos con asistencia de la semana ───────────────
export async function getAsistenciaSemana(cursoId: string) {
  const supabase = await createClient()

  // Calcular lunes de la semana actual
  const hoy = new Date()
  const diaSemana = hoy.getDay()
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1))

  const fechas: string[] = []
  for (let i = 0; i < 5; i++) {
    const d = new Date(lunes)
    d.setDate(lunes.getDate() + i)
    if (d <= hoy) {
      fechas.push(d.toISOString().split('T')[0])
    }
  }

  // Obtener alumnos del curso
  const { data: alumnos, error: errAlumnos } = await supabase
    .from('alumnos')
    .select('id, nombre, apellido_paterno, apellido_materno, rut, alumno_sep, beneficio_pae')
    .eq('curso_id', cursoId)
    .eq('activo', true)
    .order('apellido_paterno')

  if (errAlumnos || !alumnos?.length) {
    return { alumnos: [], fechas }
  }

  // Obtener asistencia de la semana
  const { data: asistencias } = await supabase
    .from('asistencia')
    .select('alumno_id, fecha, estado')
    .in('fecha', fechas)
    .in('alumno_id', alumnos.map(a => a.id))

  // Asistencia del mes para % mensual
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
  const { data: asistMes } = await supabase
    .from('asistencia')
    .select('alumno_id, estado')
    .gte('fecha', inicioMes)
    .lte('fecha', hoy.toISOString().split('T')[0])
    .in('alumno_id', alumnos.map(a => a.id))

  // Construir maps
  const mapSemana = new Map<string, Record<string, string>>()
  for (const a of (asistencias ?? [])) {
    if (!mapSemana.has(a.alumno_id)) mapSemana.set(a.alumno_id, {})
    mapSemana.get(a.alumno_id)![a.fecha] = a.estado
  }

  const mapMes = new Map<string, { p: number; total: number }>()
  for (const a of (asistMes ?? [])) {
    if (!mapMes.has(a.alumno_id)) mapMes.set(a.alumno_id, { p: 0, total: 0 })
    const m = mapMes.get(a.alumno_id)!
    m.total++
    if (a.estado === 'P') m.p++
  }

  const alumnosConData = alumnos.map((a, idx) => {
    const mes = mapMes.get(a.id)
    const pct = mes && mes.total > 0 ? Math.round((mes.p / mes.total) * 100) : null
    return {
      ...a,
      numero: idx + 1,
      nombre_completo: [a.apellido_paterno, a.apellido_materno, a.nombre].filter(Boolean).join(' '),
      semana: mapSemana.get(a.id) ?? {},
      pct_mes: pct,
    }
  })

  return { alumnos: alumnosConData, fechas }
}

// ── Guardar asistencia ────────────────────────────────────────
export async function guardarAsistencia(payload: {
  cursoId: string
  fecha: string
  registros: { alumno_id: string; estado: 'P' | 'A' | 'J' }[]
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('establecimiento_id')
    .eq('id', user.id)
    .single()

  // Si no tiene perfil aún, usar el establecimiento de prueba
  const establecimiento_id = perfil?.establecimiento_id ?? '00000000-0000-0000-0000-000000000001'

  const rows = payload.registros.map(r => ({
    establecimiento_id,
    alumno_id:      r.alumno_id,
    fecha:          payload.fecha,
    estado:         r.estado,
    declarado_sige: false,
  }))

  const { error } = await supabase
    .from('asistencia')
    .upsert(rows, { onConflict: 'alumno_id,fecha' })

  if (error) {
    console.error('guardarAsistencia error:', error)
    return { error: 'Error al guardar', success: false }
  }

  revalidatePath('/libro')
  return { success: true, error: null, guardados: rows.length }
}

// ── Obtener notas de un curso ─────────────────────────────────
export async function getNotasCurso(cursoId: string) {
  const supabase = await createClient()

  const { data: evaluaciones } = await supabase
    .from('evaluaciones')
    .select('id, titulo, tipo, ponderacion, asignatura, fecha')
    .eq('curso_id', cursoId)
    .order('fecha', { ascending: true })

  if (!evaluaciones?.length) return { evaluaciones: [], alumnos: [], notas: [] }

  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, nombre, apellido_paterno, apellido_materno, alumno_sep')
    .eq('curso_id', cursoId)
    .eq('activo', true)
    .order('apellido_paterno')

  if (!alumnos?.length) return { evaluaciones, alumnos: [], notas: [] }

  const { data: notas } = await supabase
    .from('notas')
    .select('evaluacion_id, alumno_id, nota')
    .in('evaluacion_id', evaluaciones.map(e => e.id))
    .in('alumno_id', alumnos.map(a => a.id))

  return {
    evaluaciones,
    alumnos: alumnos.map((a, idx) => ({
      ...a,
      numero: idx + 1,
      nombre_completo: [a.apellido_paterno, a.apellido_materno, a.nombre].filter(Boolean).join(' '),
    })),
    notas: notas ?? [],
  }
}

// ── Guardar nota ──────────────────────────────────────────────
export async function guardarNota(evaluacionId: string, alumnoId: string, nota: number | null) {
  const supabase = await createClient()

  if (nota === null) {
    await supabase.from('notas').delete()
      .eq('evaluacion_id', evaluacionId).eq('alumno_id', alumnoId)
  } else {
    const notaValida = Math.min(7.0, Math.max(1.0, nota))
    await supabase.from('notas').upsert(
      { evaluacion_id: evaluacionId, alumno_id: alumnoId, nota: notaValida },
      { onConflict: 'evaluacion_id,alumno_id' }
    )
  }

  revalidatePath('/libro')
  return { success: true }
}


// ── Hoja de vida del alumno ───────────────────────────────────
export async function getHojaVidaAlumno(alumnoId: string) {
  const supabase = await createClient()
  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]

  const [alumnoRes, asistRes, notasRes] = await Promise.allSettled([
    supabase.from('alumnos').select('*, cursos(nombre, nivel)').eq('id', alumnoId).single(),
    supabase.from('asistencia').select('fecha, estado').eq('alumno_id', alumnoId).gte('fecha', inicioMes).order('fecha', { ascending: false }),
    supabase.from('notas').select('nota, evaluaciones(titulo, asignatura, fecha, ponderacion)').eq('alumno_id', alumnoId).order('created_at', { ascending: false }).limit(10),
  ])

  if (alumnoRes.status === 'rejected' || !alumnoRes.value.data) return null

  const asist = asistRes.status === 'fulfilled' ? (asistRes.value.data ?? []) : []
  const presentes = asist.filter(a => a.estado === 'P').length
  const pctMes = asist.length > 0 ? Math.round((presentes / asist.length) * 100) : null

  return {
    alumno:     alumnoRes.value.data,
    pct_mes:    pctMes,
    presentes,
    total_dias: asist.length,
    notas:      notasRes.status === 'fulfilled' ? (notasRes.value.data ?? []) : [],
  }
}
