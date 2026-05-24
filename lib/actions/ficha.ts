'use server'

import { createClient } from '@/lib/supabase/server'
import { requireEstablecimientoId } from '@/lib/supabase/getEstablecimientoId'

export async function getFichaCompleta(alumnoId: string) {
  const supabase = await createClient()
  const hoy        = new Date()
  const inicioAnio = `${hoy.getFullYear()}-01-01`
  const inicioMes  = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-01`
  const hoyStr     = hoy.toISOString().split('T')[0]

  const [alumno, asistAnio, asistMes, notas, evals, anotaciones, derivaciones, entrevistas] =
    await Promise.all([
      supabase.from('alumnos').select('*, cursos(nombre, nivel)').eq('id', alumnoId).single(),
      supabase.from('asistencia').select('estado, fecha').eq('alumno_id', alumnoId).gte('fecha', inicioAnio).lte('fecha', hoyStr).order('fecha', { ascending: false }),
      supabase.from('asistencia').select('estado, fecha').eq('alumno_id', alumnoId).gte('fecha', inicioMes).lte('fecha', hoyStr),
      supabase.from('notas').select('nota, evaluacion_id').eq('alumno_id', alumnoId),
      supabase.from('evaluaciones').select('id, titulo, asignatura, fecha, ponderacion, tipo').order('fecha', { ascending: false }),
      supabase.from('anotaciones').select('*, perfiles(nombre)').eq('alumno_id', alumnoId).order('fecha', { ascending: false }),
      supabase.from('derivaciones').select('*, perfiles(nombre)').eq('alumno_id', alumnoId).order('fecha_solicitud', { ascending: false }),
      supabase.from('entrevistas').select('*, perfiles(nombre)').eq('alumno_id', alumnoId).order('fecha', { ascending: false }),
    ])

  if (!alumno.data) return null

  const asistAnioData = asistAnio.data ?? []
  const asistMesData  = asistMes.data ?? []
  const pctAnio = asistAnioData.length > 0 ? Math.round(asistAnioData.filter(a => a.estado === 'P').length / asistAnioData.length * 100) : null
  const pctMes  = asistMesData.length > 0  ? Math.round(asistMesData.filter(a => a.estado === 'P').length / asistMesData.length * 100) : null

  const notasData = notas.data ?? []
  const evalsData = evals.data ?? []
  const asignaturas: Record<string, { notas: number[]; prom: number | null }> = {}
  for (const nota of notasData) {
    const ev = evalsData.find(e => e.id === nota.evaluacion_id)
    if (!ev || nota.nota === null) continue
    if (!asignaturas[ev.asignatura]) asignaturas[ev.asignatura] = { notas: [], prom: null }
    asignaturas[ev.asignatura].notas.push(nota.nota)
  }
  for (const asig of Object.values(asignaturas)) {
    asig.prom = asig.notas.length > 0 ? Math.round(asig.notas.reduce((a,b) => a+b,0) / asig.notas.length * 10) / 10 : null
  }
  const todasNotas  = notasData.map(n => n.nota).filter(Boolean) as number[]
  const promGeneral = todasNotas.length > 0 ? Math.round(todasNotas.reduce((a,b) => a+b,0) / todasNotas.length * 10) / 10 : null

  return {
    alumno: alumno.data,
    asistencia: {
      anio: { pct: pctAnio, dias: asistAnioData.length, presentes: asistAnioData.filter(a => a.estado === 'P').length },
      mes:  { pct: pctMes,  dias: asistMesData.length,  presentes: asistMesData.filter(a => a.estado === 'P').length  },
      historial: asistAnioData.slice(0, 30),
    },
    rendimiento: { promGeneral, porAsignatura: asignaturas, notas: notasData, evaluaciones: evalsData },
    anotaciones:  anotaciones.data ?? [],
    derivaciones: derivaciones.data ?? [],
    entrevistas:  entrevistas.data ?? [],
  }
}

export async function getAlumnosColegio() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('alumnos')
    .select('id, nombre, apellido_paterno, apellido_materno, rut, alumno_sep, pie, cursos(nombre, nivel)')
    .eq('activo', true)
    .order('apellido_paterno')
  return data ?? []
}

export async function crearAnotacion(params: {
  alumnoId: string; tipo: string; titulo: string; descripcion: string; privada: boolean; fecha: string
}) {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const { error } = await supabase.from('anotaciones').insert({
    establecimiento_id: estId,
    alumno_id:     params.alumnoId,
    tipo:          params.tipo,
    titulo:        params.titulo,
    descripcion:   params.descripcion,
    privada:       params.privada,
    fecha:         params.fecha,
    registrado_por: user.id,
  })
  if (error) return { error: error.message, success: false }
  return { success: true, error: null }
}

export async function crearDerivacion(params: {
  alumnoId: string; profesional: string; motivo: string; descripcion?: string
}) {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const { error } = await supabase.from('derivaciones').insert({
    establecimiento_id: estId,
    alumno_id:     params.alumnoId,
    profesional:   params.profesional,
    motivo:        params.motivo,
    descripcion:   params.descripcion ?? null,
    solicitado_por: user.id,
  })
  if (error) return { error: error.message, success: false }
  return { success: true, error: null }
}

export async function crearEntrevista(params: {
  alumnoId: string; tipo: string; motivo: string; descripcion?: string
  nombreApoderado: string; fecha: string; hora?: string
}) {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const { error } = await supabase.from('entrevistas').insert({
    establecimiento_id: estId,
    alumno_id:        params.alumnoId,
    tipo:             params.tipo,
    motivo:           params.motivo,
    descripcion:      params.descripcion ?? null,
    nombre_apoderado: params.nombreApoderado,
    fecha:            params.fecha,
    hora:             params.hora ?? null,
    realizada_por:    user.id,
  })
  if (error) return { error: error.message, success: false }
  return { success: true, error: null }
}
