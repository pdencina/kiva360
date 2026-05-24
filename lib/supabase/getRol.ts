'use server'

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export type Rol = 'director' | 'utp' | 'profesor' | 'apoderado' | 'admin_kiva360'

export type PerfilCompleto = {
  id: string
  nombre: string
  rol: Rol
  establecimiento_id: string | null
  establecimientos: { nombre: string; rbd: string } | null
}

// Cache por request
export const getPerfil = cache(async (): Promise<PerfilCompleto | null> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('perfiles')
    .select('*, establecimientos(nombre, rbd)')
    .eq('id', user.id)
    .single()

  return data as PerfilCompleto | null
})

export const getRol = cache(async (): Promise<Rol | null> => {
  const perfil = await getPerfil()
  return perfil?.rol ?? null
})

// Verificar permisos
export async function puedeAcceder(seccion: string): Promise<boolean> {
  const rol = await getRol()
  if (!rol) return false

  const permisos: Record<Rol, string[]> = {
    admin_kiva360: ['*'],
    director: [
      'dashboard', 'director', 'utp', 'alumnos', 'libro', 'evaluaciones',
      'planificacion', 'reportes', 'cobranzas', 'comunicacion', 'familias',
      'configuracion', 'personal', 'colaborativo', 'apoderado',
      'integraciones'
    ],
    utp: [
      'dashboard', 'utp', 'alumnos', 'libro', 'evaluaciones',
      'planificacion', 'reportes', 'comunicacion', 'colaborativo'
    ],
    profesor: [
      'dashboard', 'alumnos', 'libro', 'evaluaciones',
      'planificacion', 'comunicacion', 'colaborativo'
    ],
    apoderado: [
      'dashboard', 'apoderado', 'comunicacion'
    ],
  }

  const permitidos = permisos[rol]
  if (permitidos.includes('*')) return true
  return permitidos.includes(seccion)
}
