'use server'

import { createClient } from '@/lib/supabase/server'
import { requireEstablecimientoId } from '@/lib/supabase/getEstablecimientoId'

export async function getPlanesClasei(filtro?: { asignatura?: string; cursoId?: string }) {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  let query = supabase
    .from('planes_clase')
    .select('*, cursos(nombre, nivel), perfiles(nombre)')
    .eq('establecimiento_id', estId)
    .order('fecha', { ascending: false })
  if (filtro?.asignatura) query = query.eq('asignatura', filtro.asignatura)
  if (filtro?.cursoId)    query = query.eq('curso_id', filtro.cursoId)
  const { data } = await query
  return data ?? []
}

export async function getResumenPlanificacion() {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { data } = await supabase
    .from('planes_clase').select('estado, asignatura').eq('establecimiento_id', estId)
  const planes = data ?? []
  return {
    total:      planes.length,
    realizados: planes.filter(p => p.estado === 'realizado').length,
    proximos:   planes.filter(p => p.estado === 'publicado').length,
    borradores: planes.filter(p => p.estado === 'borrador').length,
    asigs:      [...new Set(planes.map(p => p.asignatura))].length,
  }
}

export async function getEstrategias() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('estrategias_banco').select('*').eq('activa', true).order('tipo')
  return data ?? []
}

export async function getCursosPlanificacion() {
  const supabase = await createClient()
  const { data } = await supabase.from('cursos').select('id, nombre, nivel').order('nombre')
  return data ?? []
}

export async function crearPlanClase(params: {
  cursoId?: string; asignatura: string; titulo: string; fecha: string
  horaInicio?: string; horaFin?: string; oas: string[]; objetivoClase?: string
  estrategias: string[]; inicio?: string; desarrollo?: string; cierre?: string
  recursos: string[]; evaluacionTipo?: string; tarea?: string; observaciones?: string
}) {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const { error } = await supabase.from('planes_clase').insert({
    establecimiento_id: estId,
    curso_id:        params.cursoId ?? null,
    creado_por:      user.id,
    asignatura:      params.asignatura,
    titulo:          params.titulo,
    fecha:           params.fecha,
    hora_inicio:     params.horaInicio ?? null,
    hora_fin:        params.horaFin ?? null,
    oas:             params.oas,
    objetivo_clase:  params.objetivoClase ?? null,
    estrategias:     params.estrategias,
    inicio:          params.inicio ?? null,
    desarrollo:      params.desarrollo ?? null,
    cierre:          params.cierre ?? null,
    recursos:        params.recursos,
    evaluacion_tipo: params.evaluacionTipo ?? 'ninguna',
    tarea:           params.tarea ?? null,
    observaciones:   params.observaciones ?? null,
    estado:          'borrador',
  })
  if (error) return { error: error.message, success: false }
  return { success: true, error: null }
}

export async function actualizarEstadoPlan(id: string, estado: 'borrador' | 'publicado' | 'realizado') {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { error } = await supabase
    .from('planes_clase').update({ estado }).eq('id', id).eq('establecimiento_id', estId)
  if (error) return { error: error.message, success: false }
  return { success: true, error: null }
}
