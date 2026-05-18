'use server'

import { createClient } from '@/lib/supabase/server'
import { format, addDays } from 'date-fns'

type AsistenciaRegistro = {
  estado: string | null
}

type CursoBasico = {
  id: string
  nombre: string
}

type AlumnoBasico = {
  id: string
}

type EvaluacionProxima = {
  id: string
  titulo: string
  asignatura: string
  tipo?: string | null
  fecha?: string | null
  cursos?: {
    nombre?: string | null
  } | null
}

type IntegracionData = {
  sige_user?: string | null
  sae_user?: string | null
  junaeb_user?: string | null
}

type SigePendiente = {
  tipo?: string | null
}

async function getEstablecimientoId() {
  const supabase = await createClient()
  const db = supabase as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return '00000000-0000-0000-0000-000000000001'

  const { data: perfil } = await db
    .from('perfiles')
    .select('establecimiento_id')
    .eq('id', user.id)
    .maybeSingle()

  return perfil?.establecimiento_id ?? '00000000-0000-0000-0000-000000000001'
}

export async function getDashboardStats() {
  const supabase = await createClient()
  const db = supabase as any
  const hoy = format(new Date(), 'yyyy-MM-dd')
  const establecimientoId = await getEstablecimientoId()

  try {
    const [alumnos, cursos, asistenciaHoy, evaluacionesPendientes] = await Promise.all([
      db
        .from('alumnos')
        .select('id', { count: 'exact', head: true })
        .eq('establecimiento_id', establecimientoId)
        .eq('activo', true),

      db
        .from('cursos')
        .select('id', { count: 'exact', head: true })
        .eq('establecimiento_id', establecimientoId)
        .eq('activo', true),

      db
        .from('asistencia')
        .select('estado')
        .eq('establecimiento_id', establecimientoId)
        .eq('fecha', hoy),

      db
        .from('evaluaciones')
        .select('id', { count: 'exact', head: true })
        .eq('establecimiento_id', establecimientoId)
        .gte('fecha', hoy)
        .lte('fecha', format(addDays(new Date(), 7), 'yyyy-MM-dd')),
    ])

    const registros = (asistenciaHoy.data ?? []) as AsistenciaRegistro[]
    const presentes = registros.filter((r) => r.estado === 'P').length
    const ausentes = registros.filter((r) => r.estado === 'A').length
    const justificados = registros.filter((r) => r.estado === 'J').length
    const totalAsist = registros.length

    return {
      totalAlumnos: alumnos.count ?? 0,
      totalCursos: cursos.count ?? 0,
      pctAsistenciaHoy:
        totalAsist > 0 ? Math.round((presentes / totalAsist) * 1000) / 10 : null,
      presentesHoy: presentes,
      ausentesHoy: ausentes,
      justificadosHoy: justificados,
      evalPendientes: evaluacionesPendientes.count ?? 0,
      alertas: ausentes,
    }
  } catch (error) {
    console.error('getDashboardStats error:', error)

    return {
      totalAlumnos: 0,
      totalCursos: 0,
      pctAsistenciaHoy: null,
      presentesHoy: 0,
      ausentesHoy: 0,
      justificadosHoy: 0,
      evalPendientes: 0,
      alertas: 0,
    }
  }
}

export async function getAsistenciaPorCurso() {
  const supabase = await createClient()
  const db = supabase as any
  const hoy = format(new Date(), 'yyyy-MM-dd')
  const establecimientoId = await getEstablecimientoId()

  try {
    const { data: cursosData } = await db
      .from('cursos')
      .select('id, nombre')
      .eq('establecimiento_id', establecimientoId)
      .eq('activo', true)
      .eq('anio', new Date().getFullYear())
      .order('nombre')

    const cursos = (cursosData ?? []) as CursoBasico[]
    if (!cursos.length) return []

    const resultados = await Promise.all(
      cursos.map(async (curso) => {
        const { data: alumnosData } = await db
          .from('alumnos')
          .select('id')
          .eq('establecimiento_id', establecimientoId)
          .eq('curso_id', curso.id)
          .eq('activo', true)

        const alumnoIds = ((alumnosData ?? []) as AlumnoBasico[]).map((a) => a.id)

        if (!alumnoIds.length) {
          return {
            cursoId: curso.id,
            nombre: curso.nombre,
            presentes: 0,
            total: 0,
            porcentaje: null,
          }
        }

        const { data: asistenciaData } = await db
          .from('asistencia')
          .select('estado')
          .eq('establecimiento_id', establecimientoId)
          .eq('fecha', hoy)
          .in('alumno_id', alumnoIds)

        const registros = (asistenciaData ?? []) as AsistenciaRegistro[]
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

    return resultados
  } catch (error) {
    console.error('getAsistenciaPorCurso error:', error)
    return []
  }
}

export async function getEvaluacionesProximas() {
  const supabase = await createClient()
  const db = supabase as any
  const hoy = format(new Date(), 'yyyy-MM-dd')
  const establecimientoId = await getEstablecimientoId()

  try {
    const { data } = await db
      .from('evaluaciones')
      .select('id, titulo, asignatura, tipo, fecha, cursos(nombre)')
      .eq('establecimiento_id', establecimientoId)
      .gte('fecha', hoy)
      .order('fecha', { ascending: true })
      .limit(5)

    return (data ?? []) as EvaluacionProxima[]
  } catch (error) {
    console.error('getEvaluacionesProximas error:', error)
    return []
  }
}

export async function getEstadoIntegraciones() {
  const supabase = await createClient()
  const db = supabase as any
  const establecimientoId = await getEstablecimientoId()

  try {
    const [{ data: establecimiento }, { data: sigePendiente }, saePost] = await Promise.all([
      db
        .from('establecimientos')
        .select('sige_user, sae_user, junaeb_user')
        .eq('id', establecimientoId)
        .maybeSingle(),

      db
        .from('sige_declaraciones')
        .select('tipo')
        .eq('establecimiento_id', establecimientoId)
        .eq('estado', 'pendiente')
        .order('creado_en', { ascending: false })
        .limit(1)
        .maybeSingle(),

      db
        .from('sae_postulantes')
        .select('id', { count: 'exact', head: true })
        .eq('establecimiento_id', establecimientoId)
        .eq('estado_matricula', 'pendiente'),
    ])

    const integ = establecimiento as IntegracionData | null
    const sige = sigePendiente as SigePendiente | null

    return {
      sige: {
        conectado: !!integ?.sige_user,
        alerta: sige ? `Declaración ${sige.tipo ?? ''} pendiente`.trim() : null,
      },
      sae: {
        conectado: !!integ?.sae_user,
        alerta: (saePost.count ?? 0) > 0 ? `${saePost.count} postulantes esperando` : null,
      },
      junaeb: {
        conectado: !!integ?.junaeb_user,
        alerta: null,
      },
    }
  } catch (error) {
    console.error('getEstadoIntegraciones error:', error)

    return {
      sige: { conectado: false, alerta: null },
      sae: { conectado: false, alerta: null },
      junaeb: { conectado: false, alerta: null },
    }
  }
}

export async function getActividadReciente() {
  const supabase = await createClient()
  const db = supabase as any
  const establecimientoId = await getEstablecimientoId()

  try {
    const { data } = await db
      .from('mensajes')
      .select('id, contenido, enviado_en')
      .eq('establecimiento_id', establecimientoId)
      .order('enviado_en', { ascending: false })
      .limit(5)

    return data ?? []
  } catch (error) {
    console.error('getActividadReciente error:', error)
    return []
  }
}
