'use server'

import { createClient } from '@/lib/supabase/server'
import { requireEstablecimientoId } from '@/lib/supabase/getEstablecimientoId'

// ── Obtener planes históricos ─────────────────────────────────
export async function getPlanesHistoricos(filtros?: {
  anio?: number; asignatura?: string; nivel?: string; busqueda?: string
}) {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()

  let query = supabase
    .from('planes_clase')
    .select(`
      id, titulo, asignatura, fecha, anio, nivel, estado,
      oas, estrategias, objetivo_clase, inicio, desarrollo,
      cierre, recursos, evaluacion_tipo, visibilidad,
      cursos(nombre, nivel),
      perfiles(nombre),
      reflexiones_clase(que_funciono, que_cambiaria, nivel_logro, recomendacion),
      plan_votos(count)
    `)
    .eq('establecimiento_id', estId)
    .eq('estado', 'realizado')
    .neq('visibilidad', 'privado')
    .order('anio', { ascending: false })
    .order('fecha', { ascending: false })

  if (filtros?.anio)       query = query.eq('anio', filtros.anio)
  if (filtros?.asignatura) query = query.eq('asignatura', filtros.asignatura)
  if (filtros?.nivel)      query = query.eq('nivel', filtros.nivel)

  const { data } = await query.limit(100)
  let planes = data ?? []

  // Filtrar por búsqueda en cliente
  if (filtros?.busqueda) {
    const q = filtros.busqueda.toLowerCase()
    planes = planes.filter(p =>
      p.titulo.toLowerCase().includes(q) ||
      p.asignatura?.toLowerCase().includes(q) ||
      p.objetivo_clase?.toLowerCase().includes(q) ||
      (p.oas as string[])?.some((oa: string) => oa.toLowerCase().includes(q))
    )
  }

  return planes
}

// ── Años disponibles ──────────────────────────────────────────
export async function getAniosDisponibles() {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { data } = await supabase
    .from('planes_clase')
    .select('anio')
    .eq('establecimiento_id', estId)
    .eq('estado', 'realizado')
    .order('anio', { ascending: false })

  const anios = [...new Set((data ?? []).map(p => p.anio).filter(Boolean))] as number[]
  return anios
}

// ── Clonar plan al año actual ─────────────────────────────────
export async function clonarPlan(planId: string) {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  // Obtener el plan original
  const { data: original } = await supabase
    .from('planes_clase')
    .select('*')
    .eq('id', planId)
    .single()

  if (!original) return { error: 'Plan no encontrado', success: false }

  const anioActual = new Date().getFullYear()
  const fechaActual = new Date().toISOString().split('T')[0]

  // Crear copia
  const { data: nuevo, error } = await supabase.from('planes_clase').insert({
    establecimiento_id: estId,
    creado_por:      user.id,
    curso_id:        original.curso_id,
    asignatura:      original.asignatura,
    titulo:          `${original.titulo} (adaptado ${anioActual})`,
    fecha:           fechaActual,
    anio:            anioActual,
    nivel:           original.nivel,
    oas:             original.oas,
    objetivo_clase:  original.objetivo_clase,
    estrategias:     original.estrategias,
    inicio:          original.inicio,
    desarrollo:      original.desarrollo,
    cierre:          original.cierre,
    recursos:        original.recursos,
    evaluacion_tipo: original.evaluacion_tipo,
    tarea:           original.tarea,
    estado:          'borrador',
    archivado:       false,
    visibilidad:     'colegio',
  }).select('id').single()

  if (error) return { error: error.message, success: false }
  return { success: true, error: null, nuevoId: nuevo?.id }
}

// ── Agregar reflexión a un plan ───────────────────────────────
export async function agregarReflexion(params: {
  planId:        string
  queFunciono:   string
  queCambiaria:  string
  nivelLogro:    number
  recomendacion: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  // Verificar si ya tiene reflexión (solo una por plan)
  const { data: existe } = await supabase
    .from('reflexiones_clase')
    .select('id')
    .eq('plan_id', params.planId)
    .eq('autor_id', user.id)
    .single()

  if (existe) {
    // Actualizar
    const { error } = await supabase
      .from('reflexiones_clase')
      .update({
        que_funciono:   params.queFunciono,
        que_cambiaria:  params.queCambiaria,
        nivel_logro:    params.nivelLogro,
        recomendacion:  params.recomendacion,
      })
      .eq('id', existe.id)
    if (error) return { error: error.message, success: false }
  } else {
    // Insertar
    const { error } = await supabase.from('reflexiones_clase').insert({
      plan_id:        params.planId,
      autor_id:       user.id,
      que_funciono:   params.queFunciono,
      que_cambiaria:  params.queCambiaria,
      nivel_logro:    params.nivelLogro,
      recomendacion:  params.recomendacion,
    })
    if (error) return { error: error.message, success: false }
  }

  return { success: true, error: null }
}

// ── Votar un plan ─────────────────────────────────────────────
export async function votarPlan(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  // Toggle — si ya votó, quitar voto
  const { data: existe } = await supabase
    .from('plan_votos')
    .select('id')
    .eq('plan_id', planId)
    .eq('autor_id', user.id)
    .single()

  if (existe) {
    await supabase.from('plan_votos').delete().eq('id', existe.id)
    return { success: true, votado: false }
  } else {
    await supabase.from('plan_votos').insert({ plan_id: planId, autor_id: user.id })
    return { success: true, votado: true }
  }
}
