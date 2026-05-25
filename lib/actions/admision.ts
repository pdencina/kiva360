'use server'

import { createClient } from '@/lib/supabase/server'
import { requireEstablecimientoId } from '@/lib/supabase/getEstablecimientoId'

// ── Obtener proceso activo ─────────────────────────────────────
export async function getProcesoActivo() {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { data } = await supabase
    .from('procesos_admision')
    .select('*')
    .eq('establecimiento_id', estId)
    .in('estado', ['abierto','evaluacion'])
    .order('anio', { ascending: false })
    .limit(1)
    .single()
  return data
}

// ── Resumen del proceso ────────────────────────────────────────
export async function getResumenAdmision() {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()

  const proceso = await getProcesoActivo()
  if (!proceso) return null

  const { data: postulantes } = await supabase
    .from('postulantes')
    .select('estado, nivel_postula')
    .eq('proceso_id', proceso.id)

  const p = postulantes ?? []
  return {
    proceso,
    total:              p.length,
    recibidos:          p.filter(x => x.estado === 'recibido').length,
    enEvaluacion:       p.filter(x => x.estado === 'en_evaluacion').length,
    entrevistaPendiente: p.filter(x => x.estado === 'entrevista_pendiente').length,
    entrevistaRealizada: p.filter(x => x.estado === 'entrevista_realizada').length,
    aceptados:          p.filter(x => x.estado === 'aceptado').length,
    listaEspera:        p.filter(x => x.estado === 'en_lista_espera').length,
    rechazados:         p.filter(x => x.estado === 'rechazado').length,
    vacantesTotal:      proceso.vacantes_total,
    vacantesDisponibles: proceso.vacantes_total - p.filter(x => x.estado === 'aceptado').length,
  }
}

// ── Listar postulantes ─────────────────────────────────────────
export async function getPostulantes(filtro?: { estado?: string; nivel?: string }) {
  const supabase = await createClient()
  const proceso = await getProcesoActivo()
  if (!proceso) return []

  let query = supabase
    .from('postulantes')
    .select('*, entrevistas_admision(*)')
    .eq('proceso_id', proceso.id)
    .order('creado_en', { ascending: false })

  if (filtro?.estado) query = query.eq('estado', filtro.estado)
  if (filtro?.nivel)  query = query.eq('nivel_postula', filtro.nivel)

  const { data } = await query
  return data ?? []
}

// ── Crear postulante ───────────────────────────────────────────
export async function crearPostulante(params: {
  nombre: string; apellidoPaterno: string; apellidoMaterno?: string
  rut?: string; fechaNacimiento?: string; nivelPostula: string
  colegioAnterior?: string; promedioAnterior?: number
  nombreApoderado: string; telefono?: string; email?: string
}) {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const proceso = await getProcesoActivo()
  if (!proceso) return { error: 'Sin proceso activo', success: false }

  // Generar número correlativo
  const { count } = await supabase
    .from('postulantes')
    .select('*', { count: 'exact', head: true })
    .eq('proceso_id', proceso.id)

  const numero = `ADM-${String((count ?? 0) + 1).padStart(3, '0')}`

  const { error } = await supabase.from('postulantes').insert({
    establecimiento_id: estId,
    proceso_id:         proceso.id,
    nombre:             params.nombre,
    apellido_paterno:   params.apellidoPaterno,
    apellido_materno:   params.apellidoMaterno ?? null,
    rut:                params.rut ?? null,
    fecha_nacimiento:   params.fechaNacimiento ?? null,
    nivel_postula:      params.nivelPostula,
    colegio_anterior:   params.colegioAnterior ?? null,
    promedio_anterior:  params.promedioAnterior ?? null,
    nombre_apoderado:   params.nombreApoderado,
    telefono:           params.telefono ?? null,
    email:              params.email ?? null,
    numero_postulacion: numero,
  })
  if (error) return { error: error.message, success: false }
  return { success: true, error: null, numero }
}

// ── Actualizar estado postulante ───────────────────────────────
export async function actualizarEstadoPostulante(
  id: string,
  estado: string,
  puntaje?: number,
  observaciones?: string
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('postulantes')
    .update({ estado, puntaje_total: puntaje ?? null, observaciones: observaciones ?? null })
    .eq('id', id)
  if (error) return { error: error.message, success: false }
  return { success: true, error: null }
}

// ── Agendar entrevista ─────────────────────────────────────────
export async function agendarEntrevista(params: {
  postulanteId: string; fecha: string; hora?: string; tipo: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('entrevistas_admision').insert({
    postulante_id:    params.postulanteId,
    entrevistador_id: user?.id ?? null,
    fecha:            params.fecha,
    hora:             params.hora ?? null,
    tipo:             params.tipo,
  })
  if (error) return { error: error.message, success: false }

  // Actualizar estado postulante
  await supabase.from('postulantes')
    .update({ estado: 'entrevista_pendiente' })
    .eq('id', params.postulanteId)

  return { success: true, error: null }
}

// ── Registrar resultado entrevista ─────────────────────────────
export async function registrarResultadoEntrevista(params: {
  entrevistaId: string; postulanteId: string
  puntaje: number; impresion: string; notas?: string
}) {
  const supabase = await createClient()

  await supabase.from('entrevistas_admision').update({
    puntaje:   params.puntaje,
    impresion: params.impresion,
    notas:     params.notas ?? null,
    realizada: true,
  }).eq('id', params.entrevistaId)

  await supabase.from('postulantes')
    .update({ estado: 'entrevista_realizada' })
    .eq('id', params.postulanteId)

  return { success: true, error: null }
}
