'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Stats generales SAE ───────────────────────────────────────
export async function getSaeEstado() {
  const supabase = await createClient()
  const anio = new Date().getFullYear() + 1 // Proceso SAE es para el año siguiente

  const [postulantes, matriculados, pendientes, vacantes] = await Promise.all([
    supabase.from('sae_postulantes').select('id', { count: 'exact', head: true }).eq('proceso_anio', anio),
    supabase.from('sae_postulantes').select('id', { count: 'exact', head: true }).eq('proceso_anio', anio).eq('estado_matricula', 'matriculado'),
    supabase.from('sae_postulantes').select('id', { count: 'exact', head: true }).eq('proceso_anio', anio).eq('estado_matricula', 'pendiente'),
    supabase.from('cursos').select('id', { count: 'exact', head: true }).eq('activo', true),
  ])

  return {
    proceso_anio:  anio,
    total:         postulantes.count ?? 0,
    matriculados:  matriculados.count ?? 0,
    pendientes:    pendientes.count ?? 0,
    rechazados:    (postulantes.count ?? 0) - (matriculados.count ?? 0) - (pendientes.count ?? 0),
    vacantes:      vacantes.count ?? 0,
    tasa_matricula: postulantes.count
      ? Math.round(((matriculados.count ?? 0) / postulantes.count) * 100)
      : 0,
  }
}

// ── Obtener postulantes ───────────────────────────────────────
export async function getSaePostulantes(filtro: 'todos' | 'pendiente' | 'matriculado' | 'rechazo_apoderado' = 'todos') {
  const supabase = await createClient()
  const anio = new Date().getFullYear() + 1

  let query = supabase
    .from('sae_postulantes')
    .select('*')
    .eq('proceso_anio', anio)
    .order('prioridad', { ascending: true })
    .order('preferencia', { ascending: true })

  if (filtro !== 'todos') {
    query = query.eq('estado_matricula', filtro)
  }

  const { data, error } = await query
  if (error) { console.error('getSaePostulantes:', error); return [] }
  return data ?? []
}

// ── Matricular postulante ─────────────────────────────────────
export async function matricularPostulante(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('sae_postulantes')
    .update({ estado_matricula: 'matriculado' })
    .eq('id', id)

  if (error) return { error: 'Error al matricular', success: false }
  revalidatePath('/integraciones/sae')
  return { success: true, error: null }
}

// ── Rechazar postulante ───────────────────────────────────────
export async function rechazarPostulante(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('sae_postulantes')
    .update({ estado_matricula: 'rechazo_apoderado' })
    .eq('id', id)

  if (error) return { error: 'Error al rechazar', success: false }
  revalidatePath('/integraciones/sae')
  return { success: true, error: null }
}

// ── Importar nómina SAE (seed de prueba) ─────────────────────
export async function importarNominaSae() {
  const supabase = await createClient()
  const anio = new Date().getFullYear() + 1

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('establecimiento_id')
    .eq('id', user.id)
    .single()

  const establecimiento_id = perfil?.establecimiento_id ?? '00000000-0000-0000-0000-000000000001'

  // Datos de prueba simulando nómina MINEDUC
  const postulantes = [
    { rut_alumno: '25111222-3', nombre_alumno: 'Emilio Salinas Araya',     nivel_postulado: '1° básico', prioridad: 'hermano',    preferencia: 1 },
    { rut_alumno: '25222333-4', nombre_alumno: 'Daniela Mora Torres',      nivel_postulado: '1° básico', prioridad: 'cercania',   preferencia: 1 },
    { rut_alumno: '25333444-5', nombre_alumno: 'Martín Fuentes Vidal',     nivel_postulado: '5° básico', prioridad: 'prioritario',preferencia: 1 },
    { rut_alumno: '25444555-6', nombre_alumno: 'Catalina Reyes Muñoz',     nivel_postulado: '2° básico', prioridad: 'sorteo',     preferencia: 2 },
    { rut_alumno: '25555666-7', nombre_alumno: 'Benjamín Castro López',    nivel_postulado: '3° básico', prioridad: 'hermano',    preferencia: 1 },
    { rut_alumno: '25666777-8', nombre_alumno: 'Isadora Vargas Pérez',     nivel_postulado: '1° básico', prioridad: 'nee',        preferencia: 1 },
    { rut_alumno: '25777888-9', nombre_alumno: 'Nicolás Herrera Soto',     nivel_postulado: '4° básico', prioridad: 'cercania',   preferencia: 2 },
    { rut_alumno: '25888999-0', nombre_alumno: 'Antonia Díaz Contreras',   nivel_postulado: '1° básico', prioridad: 'prioridad',  preferencia: 1 },
  ]

  const rows = postulantes.map(p => ({
    ...p,
    establecimiento_id,
    proceso_anio:    anio,
    estado_matricula: 'pendiente' as const,
  }))

  const { error } = await supabase.from('sae_postulantes').insert(rows)
  if (error) {
    console.error('importarNominaSae:', error)
    return { error: 'Error al importar nómina', success: false }
  }

  revalidatePath('/integraciones/sae')
  return { success: true, error: null, importados: rows.length }
}
