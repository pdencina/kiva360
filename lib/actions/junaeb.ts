'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Estado general JUNAEB ─────────────────────────────────────
export async function getJunaebEstado() {
  const supabase = await createClient()
  const hoy      = new Date().toISOString().split('T')[0]
  const anio     = new Date().getFullYear()
  const inicioMes = `${anio}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`

  const [paeHoy, alumnosSep, alumnosPae, alumnosTne, paeRaciones] = await Promise.all([
    supabase.from('junaeb_pae_registros').select('*').eq('fecha', hoy).maybeSingle(),
    supabase.from('alumnos').select('id', { count: 'exact', head: true }).eq('alumno_sep', true).eq('activo', true),
    supabase.from('alumnos').select('id', { count: 'exact', head: true }).eq('beneficio_pae', true).eq('activo', true),
    supabase.from('alumnos').select('id', { count: 'exact', head: true }).eq('beneficio_tne', true).eq('activo', true),
    supabase.from('junaeb_pae_registros').select('raciones_desayuno, raciones_almuerzo').gte('fecha', inicioMes).lte('fecha', hoy),
  ])

  const totalDesayuno = (paeRaciones.data ?? []).reduce((a, r) => a + r.raciones_desayuno, 0)
  const totalAlmuerzo = (paeRaciones.data ?? []).reduce((a, r) => a + r.raciones_almuerzo, 0)

  return {
    pae_hoy:         paeHoy.data,
    alumnos_sep:     alumnosSep.count ?? 0,
    alumnos_pae:     alumnosPae.count ?? 0,
    alumnos_tne:     alumnosTne.count ?? 0,
    ive_porcentaje:  54.3, // IVE-SINAE 2025 - normalmente viene del MINEDUC
    raciones_mes: {
      desayuno: totalDesayuno,
      almuerzo: totalAlmuerzo,
      dias:     (paeRaciones.data ?? []).length,
    },
    encuesta_porcentaje: 65, // % de encuesta vulnerabilidad completada
  }
}

// ── Registrar raciones PAE del día ───────────────────────────
export async function registrarRacionesPae(
  raciones_desayuno: number,
  raciones_almuerzo: number,
  observaciones?: string
) {
  const supabase = await createClient()
  const hoy = new Date().toISOString().split('T')[0]

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('establecimiento_id')
    .eq('id', user.id)
    .single()

  const establecimiento_id = perfil?.establecimiento_id ?? '00000000-0000-0000-0000-000000000001'

  const { error } = await supabase
    .from('junaeb_pae_registros')
    .upsert({
      establecimiento_id,
      fecha: hoy,
      raciones_desayuno,
      raciones_almuerzo,
      observaciones: observaciones ?? null,
      declarado_junaeb: false,
    }, { onConflict: 'establecimiento_id,fecha' })

  if (error) { console.error('registrarRacionesPae:', error); return { error: 'Error al registrar', success: false } }
  revalidatePath('/integraciones/junaeb')
  return { success: true, error: null }
}

// ── Historial PAE ─────────────────────────────────────────────
export async function getHistorialPae() {
  const supabase = await createClient()
  const anio     = new Date().getFullYear()
  const inicioAnio = `${anio}-01-01`

  const { data } = await supabase
    .from('junaeb_pae_registros')
    .select('*')
    .gte('fecha', inicioAnio)
    .order('fecha', { ascending: false })
    .limit(30)

  return data ?? []
}

// ── Alumnos SEP ───────────────────────────────────────────────
export async function getAlumnosSep() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('alumnos')
    .select('id, nombre, apellido_paterno, apellido_materno, rut, prioridad_sinae, beneficio_pae, beneficio_tne, cursos(nombre)')
    .eq('alumno_sep', true)
    .eq('activo', true)
    .order('prioridad_sinae', { ascending: true })
    .order('apellido_paterno')

  return (data ?? []).map((a, idx) => ({
    ...a,
    numero:          idx + 1,
    nombre_completo: [a.apellido_paterno, a.apellido_materno, a.nombre].filter(Boolean).join(' '),
  }))
}
