'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { z } from 'zod'

// ─────────────────────────────────────────────────────────────
// TIPOS LOCALES
// ─────────────────────────────────────────────────────────────

type AlumnoRow = {
  id: string
  nombre: string | null
  apellido_paterno: string | null
  apellido_materno: string | null
  rut?: string | null
  alumno_sep?: boolean | null
  beneficio_pae?: boolean | null
}

type AsistenciaRow = {
  alumno_id: string
  fecha?: string
  estado: 'P' | 'A' | 'J' | string | null
}

type EvaluacionRow = {
  id: string
  titulo: string
  tipo: string | null
  ponderacion: number | null
  asignatura: string | null
  fecha: string | null
  oa_asociados?: unknown
}

type NotaRow = {
  evaluacion_id: string
  alumno_id: string
  nota: number | null
}

type CursoRow = {
  id: string
  nombre: string
  nivel: string | null
}

type PerfilRow = {
  establecimiento_id: string
}

// ─────────────────────────────────────────────────────────────
// ASISTENCIA
// ─────────────────────────────────────────────────────────────

// Obtener alumnos de un curso con su asistencia de hoy
export async function getAlumnosCurso(cursoId: string, fecha?: string) {
  const supabase = await createClient()
  const db = supabase as any
  const dia = fecha ?? format(new Date(), 'yyyy-MM-dd')

  const { data: alumnosData, error } = await db
    .from('alumnos')
    .select('id, nombre, apellido_paterno, apellido_materno, rut, alumno_sep, beneficio_pae')
    .eq('curso_id', cursoId)
    .eq('activo', true)
    .order('apellido_paterno')

  const alumnos = (alumnosData ?? []) as AlumnoRow[]

  if (error || !alumnos.length) return []

  const alumnoIds = alumnos.map((a) => a.id)

  const { data: asistenciasData } = await db
    .from('asistencia')
    .select('alumno_id, estado')
    .eq('fecha', dia)
    .in('alumno_id', alumnoIds)

  const asistencias = (asistenciasData ?? []) as AsistenciaRow[]

  const asistenciaMap = new Map(
    asistencias.map((a) => [a.alumno_id, a.estado])
  )

  return alumnos.map((a, idx) => ({
    ...a,
    numero: idx + 1,
    nombre_completo: [a.apellido_paterno, a.apellido_materno, a.nombre]
      .filter(Boolean)
      .join(' '),
    estado_hoy: (asistenciaMap.get(a.id) ?? null) as 'P' | 'A' | 'J' | null,
  }))
}

// Obtener asistencia de toda la semana para un curso
export async function getAsistenciaSemana(cursoId: string) {
  const supabase = await createClient()
  const db = supabase as any

  const hoy = new Date()
  const diaSemana = hoy.getDay()
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1))

  const fechas: string[] = []
  for (let i = 0; i < 5; i++) {
    const d = new Date(lunes)
    d.setDate(lunes.getDate() + i)
    if (d <= hoy) fechas.push(format(d, 'yyyy-MM-dd'))
  }

  const { data: alumnosData } = await db
    .from('alumnos')
    .select('id, nombre, apellido_paterno, apellido_materno, rut, alumno_sep, beneficio_pae')
    .eq('curso_id', cursoId)
    .eq('activo', true)
    .order('apellido_paterno')

  const alumnos = (alumnosData ?? []) as AlumnoRow[]

  if (!alumnos.length) return { alumnos: [], fechas }

  const alumnoIds = alumnos.map((a) => a.id)

  const { data: asistenciasData } = await db
    .from('asistencia')
    .select('alumno_id, fecha, estado')
    .in('fecha', fechas)
    .in('alumno_id', alumnoIds)

  const asistencias = (asistenciasData ?? []) as AsistenciaRow[]

  const map = new Map<string, Record<string, string>>()

  for (const a of asistencias) {
    if (!a.fecha) continue
    if (!map.has(a.alumno_id)) map.set(a.alumno_id, {})
    map.get(a.alumno_id)![a.fecha] = String(a.estado ?? '')
  }

  const { data: asistMesData } = await db
    .from('asistencia')
    .select('alumno_id, estado')
    .gte('fecha', format(new Date(hoy.getFullYear(), hoy.getMonth(), 1), 'yyyy-MM-dd'))
    .lte('fecha', format(hoy, 'yyyy-MM-dd'))
    .in('alumno_id', alumnoIds)

  const asistMes = (asistMesData ?? []) as AsistenciaRow[]

  const mapMes = new Map<string, { p: number; total: number }>()

  for (const a of asistMes) {
    if (!mapMes.has(a.alumno_id)) mapMes.set(a.alumno_id, { p: 0, total: 0 })
    const m = mapMes.get(a.alumno_id)!
    m.total++
    if (a.estado === 'P') m.p++
  }

  const alumnosConAsistencia = alumnos.map((a, idx) => {
    const semana = map.get(a.id) ?? {}
    const mes = mapMes.get(a.id)
    const pctMes = mes && mes.total > 0
      ? Math.round((mes.p / mes.total) * 100)
      : null

    return {
      ...a,
      numero: idx + 1,
      nombre_completo: [a.apellido_paterno, a.apellido_materno, a.nombre]
        .filter(Boolean)
        .join(' '),
      semana,
      pct_mes: pctMes,
    }
  })

  return { alumnos: alumnosConAsistencia, fechas }
}

// Guardar asistencia de un día completo
const AsistenciaSchema = z.object({
  cursoId: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  registros: z.array(z.object({
    alumno_id: z.string().uuid(),
    estado: z.enum(['P', 'A', 'J']),
  })),
})

export async function guardarAsistencia(payload: unknown) {
  const supabase = await createClient()
  const db = supabase as any

  const parsed = AsistenciaSchema.safeParse(payload)

  if (!parsed.success) {
    return { error: 'Datos inválidos', success: false }
  }

  const { fecha, registros } = parsed.data

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado', success: false }
  }

  const { data: perfilData } = await db
    .from('perfiles')
    .select('establecimiento_id')
    .eq('id', user.id)
    .single()

  const perfil = perfilData as PerfilRow | null

  if (!perfil) {
    return { error: 'Sin establecimiento', success: false }
  }

  const rows = registros.map((r) => ({
    establecimiento_id: perfil.establecimiento_id,
    alumno_id: r.alumno_id,
    fecha,
    estado: r.estado,
    declarado_sige: false,
  }))

  const { error } = await db
    .from('asistencia')
    .upsert(rows, { onConflict: 'alumno_id,fecha' })

  if (error) {
    console.error('Error guardando asistencia:', error)
    return { error: 'Error al guardar. Intenta nuevamente.', success: false }
  }

  revalidatePath('/libro')

  return { success: true, error: null, guardados: registros.length }
}

// ─────────────────────────────────────────────────────────────
// NOTAS
// ─────────────────────────────────────────────────────────────

// Obtener notas de un curso por semestre
export async function getNotasCurso(cursoId: string, anio: number) {
  const supabase = await createClient()
  const db = supabase as any

  const { data: evaluacionesData } = await db
    .from('evaluaciones')
    .select('id, titulo, tipo, ponderacion, asignatura, fecha, oa_asociados')
    .eq('curso_id', cursoId)
    .order('fecha', { ascending: true })

  const evaluaciones = (evaluacionesData ?? []) as EvaluacionRow[]

  if (!evaluaciones.length) {
    return { evaluaciones: [], alumnos: [], notas: [] }
  }

  const { data: alumnosData } = await db
    .from('alumnos')
    .select('id, nombre, apellido_paterno, apellido_materno, alumno_sep')
    .eq('curso_id', cursoId)
    .eq('activo', true)
    .order('apellido_paterno')

  const alumnos = (alumnosData ?? []) as AlumnoRow[]

  if (!alumnos.length) {
    return { evaluaciones, alumnos: [], notas: [] }
  }

  const { data: notasData } = await db
    .from('notas')
    .select('evaluacion_id, alumno_id, nota')
    .in('evaluacion_id', evaluaciones.map((e) => e.id))
    .in('alumno_id', alumnos.map((a) => a.id))

  const notas = (notasData ?? []) as NotaRow[]

  return {
    evaluaciones,
    alumnos: alumnos.map((a, idx) => ({
      ...a,
      numero: idx + 1,
      nombre_completo: [a.apellido_paterno, a.apellido_materno, a.nombre]
        .filter(Boolean)
        .join(' '),
    })),
    notas,
  }
}

// Guardar una nota individual
export async function guardarNota(
  evaluacionId: string,
  alumnoId: string,
  nota: number | null
) {
  const supabase = await createClient()
  const db = supabase as any

  if (nota === null) {
    await db
      .from('notas')
      .delete()
      .eq('evaluacion_id', evaluacionId)
      .eq('alumno_id', alumnoId)
  } else {
    const notaValida = Math.min(7.0, Math.max(1.0, nota))

    await db
      .from('notas')
      .upsert(
        { evaluacion_id: evaluacionId, alumno_id: alumnoId, nota: notaValida },
        { onConflict: 'evaluacion_id,alumno_id' }
      )
  }

  revalidatePath('/libro')

  return { success: true }
}

// ─────────────────────────────────────────────────────────────
// CURSOS
// ─────────────────────────────────────────────────────────────

export async function getCursosDelColegio() {
  const supabase = await createClient()
  const db = supabase as any
  const anio = new Date().getFullYear()

  const { data } = await db
    .from('cursos')
    .select('id, nombre, nivel')
    .eq('anio', anio)
    .eq('activo', true)
    .order('nombre')

  return (data ?? []) as CursoRow[]
}

// ─────────────────────────────────────────────────────────────
// HOJA DE VIDA
// ─────────────────────────────────────────────────────────────

export async function getHojaVidaAlumno(alumnoId: string) {
  const supabase = await createClient()
  const db = supabase as any

  const [alumno, asistenciaMes, notasRecientes] = await Promise.all([
    db
      .from('alumnos')
      .select('*, cursos(nombre, nivel)')
      .eq('id', alumnoId)
      .single(),

    db
      .from('asistencia')
      .select('fecha, estado')
      .eq('alumno_id', alumnoId)
      .gte('fecha', format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'))
      .order('fecha', { ascending: false }),

    db
      .from('notas')
      .select('nota, evaluaciones(titulo, asignatura, fecha, ponderacion)')
      .eq('alumno_id', alumnoId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (!alumno.data) return null

  const asist = (asistenciaMes.data ?? []) as { estado: string | null }[]
  const presentes = asist.filter((a) => a.estado === 'P').length
  const total = asist.length
  const pctMes = total > 0 ? Math.round((presentes / total) * 100) : null

  return {
    alumno: alumno.data,
    pct_mes: pctMes,
    presentes,
    total_dias: total,
    notas: notasRecientes.data ?? [],
  }
}
