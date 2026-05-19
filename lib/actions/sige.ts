'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Estado general de la integración SIGE ────────────────────
export async function getSigeEstado() {
  const supabase = await createClient()

  const hoy      = new Date()
  const anio     = hoy.getFullYear()
  const mes      = hoy.getMonth() + 1
  const inicioMes = `${anio}-${String(mes).padStart(2, '0')}-01`
  const hoyStr   = hoy.toISOString().split('T')[0]

  const [declaraciones, alumnos, asistenciaHoy, errores] = await Promise.all([
    supabase
      .from('sige_declaraciones')
      .select('*')
      .order('creado_en', { ascending: false })
      .limit(10),

    supabase
      .from('alumnos')
      .select('id', { count: 'exact', head: true })
      .eq('activo', true),

    supabase
      .from('asistencia')
      .select('estado')
      .eq('fecha', hoyStr),

    supabase
      .from('sige_declaraciones')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'error'),
  ])

  // Calcular % asistencia hoy
  const registros  = asistenciaHoy.data ?? []
  const presentes  = registros.filter(r => r.estado === 'P').length
  const pctAsist   = registros.length > 0
    ? Math.round((presentes / registros.length) * 100)
    : null

  // Calcular días hábiles del período actual (1-15 o 16-fin de mes)
  const dia = hoy.getDate()
  const periodoInicio = dia <= 15
    ? `${anio}-${String(mes).padStart(2, '0')}-01`
    : `${anio}-${String(mes).padStart(2, '0')}-16`
  const periodoFin = dia <= 15
    ? `${anio}-${String(mes).padStart(2, '0')}-15`
    : new Date(anio, mes, 0).toISOString().split('T')[0]

  // Verificar si el período actual ya fue declarado
  const { data: declaradoActual } = await supabase
    .from('sige_declaraciones')
    .select('id, estado')
    .eq('tipo', 'asistencia')
    .eq('periodo_inicio', periodoInicio)
    .maybeSingle()

  return {
    conectado:        true,
    rbd:              '12345-6',
    totalAlumnos:     alumnos.count ?? 0,
    pctAsistenciaHoy: pctAsist,
    declaraciones:    declaraciones.data ?? [],
    errores:          errores.count ?? 0,
    periodoActual: {
      inicio:      periodoInicio,
      fin:         periodoFin,
      declarado:   !!declaradoActual,
      estadoDecl:  declaradoActual?.estado ?? null,
    },
  }
}

// ── Obtener inconsistencias antes de declarar ─────────────────
export async function getInconsistencias() {
  const supabase = await createClient()

  const hoy = new Date()
  const dia = hoy.getDate()
  const mes = hoy.getMonth() + 1
  const anio = hoy.getFullYear()

  const periodoInicio = dia <= 15
    ? `${anio}-${String(mes).padStart(2, '0')}-01`
    : `${anio}-${String(mes).padStart(2, '0')}-16`
  const periodoFin = dia <= 15
    ? `${anio}-${String(mes).padStart(2, '0')}-15`
    : new Date(anio, mes, 0).toISOString().split('T')[0]

  // Obtener alumnos activos
  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, nombre, apellido_paterno, rut, curso_id, cursos(nombre)')
    .eq('activo', true)

  if (!alumnos?.length) return { inconsistencias: [], periodoInicio, periodoFin }

  // Obtener asistencia del período
  const { data: asistencias } = await supabase
    .from('asistencia')
    .select('alumno_id, fecha, estado')
    .gte('fecha', periodoInicio)
    .lte('fecha', periodoFin)
    .in('alumno_id', alumnos.map(a => a.id))

  const inconsistencias: {
    tipo:     'error' | 'aviso' | 'info'
    alumno:   string
    rut:      string
    curso:    string
    mensaje:  string
  }[] = []

  // Detectar alumnos sin asistencia registrada en el período
  const alumnosConAsist = new Set((asistencias ?? []).map(a => a.alumno_id))
  for (const alumno of alumnos) {
    if (!alumnosConAsist.has(alumno.id)) {
      inconsistencias.push({
        tipo:    'aviso',
        alumno:  `${alumno.apellido_paterno}, ${alumno.nombre}`,
        rut:     alumno.rut ?? 'Sin RUT',
        curso:   (alumno as any).cursos?.nombre ?? '—',
        mensaje: 'Sin asistencia registrada en el período',
      })
    }
  }

  // Detectar alumnos sin RUT
  for (const alumno of alumnos) {
    if (!alumno.rut) {
      inconsistencias.push({
        tipo:    'error',
        alumno:  `${alumno.apellido_paterno}, ${alumno.nombre}`,
        rut:     'Sin RUT',
        curso:   (alumno as any).cursos?.nombre ?? '—',
        mensaje: 'RUT no registrado — requerido por SIGE',
      })
    }
  }

  // Detectar asistencia > días hábiles (datos inconsistentes)
  const mapaAsist = new Map<string, number>()
  for (const a of (asistencias ?? [])) {
    mapaAsist.set(a.alumno_id, (mapaAsist.get(a.alumno_id) ?? 0) + 1)
  }

  const diasPeriodo = Math.ceil(
    (new Date(periodoFin).getTime() - new Date(periodoInicio).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1

  for (const [alumnoId, dias] of mapaAsist.entries()) {
    if (dias > diasPeriodo) {
      const alumno = alumnos.find(a => a.id === alumnoId)
      if (alumno) {
        inconsistencias.push({
          tipo:    'error',
          alumno:  `${alumno.apellido_paterno}, ${alumno.nombre}`,
          rut:     alumno.rut ?? '—',
          curso:   (alumno as any).cursos?.nombre ?? '—',
          mensaje: `Días registrados (${dias}) superan el período (${diasPeriodo} días)`,
        })
      }
    }
  }

  return { inconsistencias, periodoInicio, periodoFin }
}

// ── Declarar asistencia al SIGE ───────────────────────────────
export async function declararAsistencia(periodoInicio: string, periodoFin: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('establecimiento_id')
    .eq('id', user.id)
    .single()

  const establecimiento_id = perfil?.establecimiento_id ?? '00000000-0000-0000-0000-000000000001'

  // Verificar inconsistencias críticas antes de declarar
  const { inconsistencias } = await getInconsistencias()
  const erroresCriticos = inconsistencias.filter(i => i.tipo === 'error')

  if (erroresCriticos.length > 0) {
    return {
      error: `No se puede declarar: hay ${erroresCriticos.length} error(es) crítico(s) sin resolver.`,
      success: false,
    }
  }

  // Crear registro de declaración
  const { data: declaracion, error } = await supabase
    .from('sige_declaraciones')
    .insert({
      establecimiento_id,
      tipo:           'asistencia',
      periodo_inicio: periodoInicio,
      periodo_fin:    periodoFin,
      estado:         'enviado',
      enviado_en:     new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('declararAsistencia:', error)
    return { error: 'Error al registrar la declaración', success: false }
  }

  // Marcar asistencia del período como declarada
  await supabase
    .from('asistencia')
    .update({ declarado_sige: true })
    .gte('fecha', periodoInicio)
    .lte('fecha', periodoFin)

  revalidatePath('/integraciones/sige')
  return { success: true, error: null, declaracionId: declaracion.id }
}

// ── Obtener alumnos con % asistencia del período ──────────────
export async function getAlumnosSige(periodoInicio: string, periodoFin: string) {
  const supabase = await createClient()

  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, nombre, apellido_paterno, apellido_materno, rut, cursos(nombre)')
    .eq('activo', true)
    .order('apellido_paterno')

  if (!alumnos?.length) return []

  const { data: asistencias } = await supabase
    .from('asistencia')
    .select('alumno_id, estado, declarado_sige')
    .gte('fecha', periodoInicio)
    .lte('fecha', periodoFin)
    .in('alumno_id', alumnos.map(a => a.id))

  const mapaAsist = new Map<string, { p: number; total: number; declarado: boolean }>()
  for (const a of (asistencias ?? [])) {
    if (!mapaAsist.has(a.alumno_id)) mapaAsist.set(a.alumno_id, { p: 0, total: 0, declarado: false })
    const m = mapaAsist.get(a.alumno_id)!
    m.total++
    if (a.estado === 'P') m.p++
    if (a.declarado_sige) m.declarado = true
  }

  return alumnos.map((a, idx) => {
    const asist = mapaAsist.get(a.id)
    const pct   = asist && asist.total > 0 ? Math.round((asist.p / asist.total) * 100) : null
    return {
      ...a,
      numero:          idx + 1,
      nombre_completo: [a.apellido_paterno, a.apellido_materno, a.nombre].filter(Boolean).join(' '),
      presentes:       asist?.p ?? 0,
      total_dias:      asist?.total ?? 0,
      pct_asistencia:  pct,
      declarado:       asist?.declarado ?? false,
    }
  })
}
