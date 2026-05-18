'use server'

import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

type AsistenciaRegistro = { estado: string | null }
type CursoBasico = { id: string; nombre: string }
type AlumnoBasico = { id: string }
type SigeDeclaracion = { tipo: string | null }
type EstablecimientoIntegraciones = {
  sige_user?: string | null
  sae_user?: string | null
  junaeb_user?: string | null
}

export async function getDashboardStats() {
  const supabase = await createClient()
  const db = supabase as any
  const hoy = format(new Date(), 'yyyy-MM-dd')

  const [alumnos, asistenciaHoy, evaluacionesPendientes] = await Promise.all([
    db.from('alumnos').select('id', { count: 'exact', head: true }).eq('activo', true),
    db.from('asistencia').select('estado').eq('fecha', hoy),
    db.from('evaluaciones').select('id', { count: 'exact', head: true }).lt('fecha', hoy),
  ])

  const registros = (asistenciaHoy.data ?? []) as AsistenciaRegistro[]
  const presentes = registros.filter((r) => r.estado === 'P').length
  const totalAsist = registros.length

  return {
    totalAlumnos: alumnos.count ?? 0,
    pctAsistenciaHoy: totalAsist > 0 ? Math.round((presentes / totalAsist) * 1000) / 10 : null,
    evalPendientes: evaluacionesPendientes.count ?? 0,
    alertas: registros.filter((r) => r.estado === 'A').length,
  }
}

export async function getAsistenciaPorCurso() {
  const supabase = await createClient()
  const db = supabase as any
  const hoy = format(new Date(), 'yyyy-MM-dd')

  const { data: cursosData } = await db
    .from('cursos')
    .select('id, nombre')
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
        .eq('curso_id', curso.id)
        .eq('activo', true)

      const alumnoIds = ((alumnosData ?? []) as AlumnoBasico[]).map((a) => a.id)
      if (!alumnoIds.length) {
        return { cursoId: curso.id, nombre: curso.nombre, presentes: 0, total: 0, porcentaje: null }
      }

      const { data } = await db
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

  return resultados
}

export async function getActividadReciente() {
  const supabase = await createClient()
  const db = supabase as any

  const { data } = await db
    .from('mensajes')
    .select('id, contenido, enviado_en, de_usuario_id')
    .order('enviado_en', { ascending: false })
    .limit(5)

  return data ?? []
}

export async function getEvaluacionesProximas() {
  const supabase = await createClient()
  const db = supabase as any
  const hoy = format(new Date(), 'yyyy-MM-dd')

  const { data } = await db
    .from('evaluaciones')
    .select('id, titulo, asignatura, tipo, fecha, cursos(nombre)')
    .gte('fecha', hoy)
    .order('fecha', { ascending: true })
    .limit(5)

  return data ?? []
}

export async function getEstadoIntegraciones() {
  const supabase = await createClient()
  const db = supabase as any

  const { data: establecimientoData } = await db
    .from('establecimientos')
    .select('sige_user, sae_user, junaeb_user')
    .limit(1)
    .maybeSingle()

  const establecimiento = establecimientoData as EstablecimientoIntegraciones | null

  const { data: sigeDeclData } = await db
    .from('sige_declaraciones')
    .select('tipo')
    .eq('estado', 'pendiente')
    .order('creado_en', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sigeDecl = sigeDeclData as SigeDeclaracion | null

  const saePost = await db
    .from('sae_postulantes')
    .select('id', { count: 'exact', head: true })
    .eq('estado_matricula', 'pendiente')

  return {
    sige: {
      conectado: !!establecimiento?.sige_user,
      alerta: sigeDecl ? `Declaración ${sigeDecl.tipo} pendiente` : null,
    },
    sae: {
      conectado: !!establecimiento?.sae_user,
      alerta: (saePost.count ?? 0) > 0 ? `${saePost.count} postulantes esperando` : null,
    },
    junaeb: {
      conectado: !!establecimiento?.junaeb_user,
      alerta: null,
    },
  }
}
