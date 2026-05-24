'use server'

import { createClient } from '@/lib/supabase/server'

const EST_ID = '00000000-0000-0000-0000-000000000001'

export async function getRecursos(filtros?: { tipo?: string; asignatura?: string }) {
  const supabase = await createClient()
  let query = supabase
    .from('recursos_docentes')
    .select('*, perfiles(nombre)')
    .eq('establecimiento_id', EST_ID)
    .order('likes', { ascending: false })

  if (filtros?.tipo)       query = query.eq('tipo', filtros.tipo)
  if (filtros?.asignatura) query = query.eq('asignatura', filtros.asignatura)

  const { data } = await query
  return data ?? []
}

export async function getCodocencia() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('co_docencia')
    .select('*, cursos(nombre)')
    .eq('establecimiento_id', EST_ID)
    .order('fecha', { ascending: false })
  return data ?? []
}

export async function crearRecurso(params: {
  titulo: string; descripcion?: string; tipo: string
  asignatura?: string; nivel?: string; url?: string; tags: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const { error } = await supabase.from('recursos_docentes').insert({
    establecimiento_id: EST_ID,
    creado_por:   user.id,
    titulo:       params.titulo,
    descripcion:  params.descripcion ?? null,
    tipo:         params.tipo,
    asignatura:   params.asignatura ?? null,
    nivel:        params.nivel ?? null,
    url:          params.url ?? null,
    tags:         params.tags,
  })
  if (error) return { error: error.message, success: false }
  return { success: true, error: null }
}

export async function crearCodocencia(params: {
  cursoId?: string; asignatura: string; fecha: string
  horaInicio?: string; horaFin?: string; objetivo?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const { error } = await supabase.from('co_docencia').insert({
    establecimiento_id: EST_ID,
    docente_principal:  user.id,
    curso_id:     params.cursoId ?? null,
    asignatura:   params.asignatura,
    fecha:        params.fecha,
    hora_inicio:  params.horaInicio ?? null,
    hora_fin:     params.horaFin ?? null,
    objetivo:     params.objetivo ?? null,
  })
  if (error) return { error: error.message, success: false }
  return { success: true, error: null }
}

export async function darLike(recursoId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('recursos_docentes')
    .select('likes')
    .eq('id', recursoId)
    .single()
  if (data) {
    await supabase
      .from('recursos_docentes')
      .update({ likes: (data.likes ?? 0) + 1 })
      .eq('id', recursoId)
  }
  return { success: true }
}
