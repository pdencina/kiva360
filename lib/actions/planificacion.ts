'use server'

import { createClient } from '@/lib/supabase/server'

const EST_ID = '00000000-0000-0000-0000-000000000001'

// ── Listar planes de clase ─────────────────────────────────────
export async function getPlanesClasei(filtro?: { asignatura?: string; cursoId?: string }) {
  const supabase = await createClient()
  let query = supabase
    .from('planes_clase')
    .select('*, cursos(nombre, nivel), perfiles(nombre)')
    .eq('establecimiento_id', EST_ID)
    .order('fecha', { ascending: false })

  if (filtro?.asignatura) query = query.eq('asignatura', filtro.asignatura)
  if (filtro?.cursoId)    query = query.eq('curso_id', filtro.cursoId)

  const { data } = await query
  return data ?? []
}

// ── Obtener plan de clase por ID ──────────────────────────────
export async function getPlanClase(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('planes_clase')
    .select('*, cursos(nombre, nivel)')
    .eq('id', id)
    .eq('establecimiento_id', EST_ID)
    .single()
  return data
}

// ── Obtener banco de estrategias ──────────────────────────────
export async function getEstrategias(tipo?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('estrategias_banco')
    .select('*')
    .eq('activa', true)
    .order('tipo')
  if (tipo) query = query.eq('tipo', tipo)
  const { data } = await query
  return data ?? []
}

// ── Resumen planificación ─────────────────────────────────────
export async function getResumenPlanificacion() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('planes_clase')
    .select('estado, asignatura, fecha')
    .eq('establecimiento_id', EST_ID)

  const planes = data ?? []
  const total      = planes.length
  const realizados = planes.filter(p => p.estado === 'realizado').length
  const proximos   = planes.filter(p => p.estado === 'publicado').length
  const borradores = planes.filter(p => p.estado === 'borrador').length
  const asigs      = [...new Set(planes.map(p => p.asignatura))].length

  return { total, realizados, proximos, borradores, asigs }
}

// ── Crear plan de clase ───────────────────────────────────────
export async function crearPlanClase(params: {
  cursoId?:       string
  asignatura:     string
  titulo:         string
  fecha:          string
  horaInicio?:    string
  horaFin?:       string
  oas:            string[]
  objetivoClase?: string
  estrategias:    string[]
  inicio?:        string
  desarrollo?:    string
  cierre?:        string
  recursos:       string[]
  evaluacionTipo?: string
  tarea?:         string
  observaciones?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const { error } = await supabase.from('planes_clase').insert({
    establecimiento_id: EST_ID,
    curso_id:           params.cursoId ?? null,
    creado_por:         user.id,
    asignatura:         params.asignatura,
    titulo:             params.titulo,
    fecha:              params.fecha,
    hora_inicio:        params.horaInicio ?? null,
    hora_fin:           params.horaFin ?? null,
    oas:                params.oas,
    objetivo_clase:     params.objetivoClase ?? null,
    estrategias:        params.estrategias,
    inicio:             params.inicio ?? null,
    desarrollo:         params.desarrollo ?? null,
    cierre:             params.cierre ?? null,
    recursos:           params.recursos,
    evaluacion_tipo:    params.evaluacionTipo ?? 'ninguna',
    tarea:              params.tarea ?? null,
    observaciones:      params.observaciones ?? null,
    estado:             'borrador',
  })

  if (error) return { error: error.message, success: false }
  return { success: true, error: null }
}

// ── Actualizar estado plan ────────────────────────────────────
export async function actualizarEstadoPlan(id: string, estado: 'borrador' | 'publicado' | 'realizado') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('planes_clase')
    .update({ estado })
    .eq('id', id)
    .eq('establecimiento_id', EST_ID)
  if (error) return { error: error.message, success: false }
  return { success: true, error: null }
}

// ── Obtener cursos del colegio ────────────────────────────────
export async function getCursosPlanificacion() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cursos')
    .select('id, nombre, nivel')
    .order('nombre')
  return data ?? []
}
