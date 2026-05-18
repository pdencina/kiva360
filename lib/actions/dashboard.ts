'use server'

import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

// ── Tipos locales para evitar inferencias never[] en Supabase ───────────────

type AsistenciaRegistro = {
  estado: string | null
}

type CursoBasico = {
  id: string | number
  nombre: string
}

type AlumnoBasico = {
  id: string | number
}

type SigeDeclaracion = {
  estado: string | null
  tipo: string | null
  periodo_fin?: string | null
}

type EstablecimientoIntegraciones = {
  sige_user?: string | null
  sae_user?: string | null
  junaeb_user?: string | null
}

// ── Stats generales del dashboard ────────────────────────────

export async function getDashboardStats() {
  const supabase = await createClient()
  const hoy = format(new Date(), 'yyyy-MM-dd')

  const [alumnos, asistenciaHoy, evaluacionesPendientes] = await Promise.all([

    // Total alumnos activos
    supabase
      .from('alumnos')
      .select('id', { count: 'exact', head: true })
      .eq('activo', true),

    // Asistencia hoy (porcentaje)
    supabase
      .from('asistencia')
      .select('estado')
      .eq('fecha', hoy),

    // Evaluaciones pendientes de calificar
    supabase
      .from('evaluaciones')
      .select('id', { count: 'exact', head: true })
      .lt('fecha', hoy),
  ])

  // Calcular % asistencia
  const registros = (asistenciaHoy.data ?? []) as AsistenciaRegistro[]
  const presentes = registros.filter((r) => r.estado === 'P').length
  const totalAsist = registros.length
  const pctAsistencia = totalAsist > 0
    ? Math.round((presentes / totalAsist) * 1000) / 10
    : null

  return {
    totalAlumnos:        alumnos.count ?? 0,
    pctAsistenciaHoy:    pctAsistencia,
    evalPendientes:      evaluacionesPendientes.count ?? 0,
    alertas:             14, // TODO: implementar lógica real de alertas
  }
}

// ── Asistencia por curso hoy ──────────────────────────────────

export async function getAsistenciaPorCurso() {
  const supabase = await createClient()
  const hoy = format(new Date(), 'yyyy-MM-dd')

  const { data: cursosData } = await supabase
    .from('cursos')
    .select('id, nombre')
    .eq('activo', true)
    .eq('anio', new Date().getFullYear())
    .order('nombre')

  const cursos = (cursosData ?? []) as CursoBasico[]

  if (!cursos.length) return []

  const resultados = await Promise.all(
    cursos.map(async (curso) => {
      const { data: alumnosData } = await supabase
        .from('alumnos')
        .select('id')
        .eq('curso_id', curso.id)
        .eq('activo', true)

      const alumnoIds = ((alumnosData ?? []) as AlumnoBasico[]).map((a) => a.id)

      const { data } = await supabase
        .from('asistencia')
        .select('estado')
        .eq('fecha', hoy)
        .in('alumno_id', alumnoIds)

      const registros = (data ?? []) as AsistenciaRegistro[]
      const presentes = registros.filter((r) => r.estado === 'P').length
      const total = registros.length

      return {
        cursoId: curso.id,
        nombre: curso.nombre,
        presentes,
        total,
        porcentaje: total > 0 ? Math.round((presentes / total) * 100) : null,
      }
    })
  )

  return resultados.filter((r) => r.total > 0)
}

// ── Actividad reciente ────────────────────────────────────────

export async function getActividadReciente() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('mensajes')
    .select('id, contenido, enviado_en, de_usuario_id, perfiles!de_usuario_id(nombre, rol)')
    .order('enviado_en', { ascending: false })
    .limit(5)

  return data ?? []
}

// ── Evaluaciones próximas ─────────────────────────────────────

export async function getEvaluacionesProximas() {
  const supabase = await createClient()
  const hoy = format(new Date(), 'yyyy-MM-dd')

  const { data } = await supabase
    .from('evaluaciones')
    .select('id, titulo, asignatura, tipo, fecha, cursos(nombre)')
    .gte('fecha', hoy)
    .order('fecha', { ascending: true })
    .limit(5)

  return data ?? []
}

// ── Estado integraciones ──────────────────────────────────────

export async function getEstadoIntegraciones() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: establecimientoData } = await supabase
    .from('establecimientos')
    .select('sige_user, sae_user, junaeb_user')
    .single()

  const establecimiento = establecimientoData as EstablecimientoIntegraciones | null

  const { data: sigeDeclData } = await supabase
    .from('sige_declaraciones')
    .select('estado, tipo, periodo_fin')
    .eq('estado', 'pendiente')
    .order('creado_en', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sigeDecl = sigeDeclData as SigeDeclaracion | null

  const saePost = await supabase
    .from('sae_postulantes')
    .select('id', { count: 'exact', head: true })
    .eq('estado_matricula', 'pendiente')

  return {
    sige: {
      conectado:   !!establecimiento?.sige_user,
      alerta:      sigeDecl ? `Declaración ${sigeDecl.tipo} pendiente` : null,
    },
    sae: {
      conectado:   !!establecimiento?.sae_user,
      alerta:      (saePost.count ?? 0) > 0
                   ? `${saePost.count} postulantes esperando`
                   : null,
    },
    junaeb: {
      conectado:   !!establecimiento?.junaeb_user,
      alerta:      null,
    },
  }
}
