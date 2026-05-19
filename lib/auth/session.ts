import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type PerfilSeguro = {
  id: string
  establecimiento_id: string
  nombre: string
  rol: 'admin_kiva360' | 'director' | 'utp' | 'inspector' | 'profesor' | 'apoderado' | string
  activo?: boolean
  establecimientos?: {
    id: string
    nombre: string
    plan?: string | null
  } | null
}

export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function getCurrentPerfil(): Promise<PerfilSeguro | null> {
  const supabase = await createClient()
  const db = supabase as any

  const user = await getCurrentUser()

  if (!user) return null

  const { data: perfil, error } = await db
    .from('perfiles')
    .select('*, establecimientos(id, nombre, plan)')
    .eq('id', user.id)
    .eq('activo', true)
    .maybeSingle()

  if (error) {
    console.error('getCurrentPerfil error:', error)
    return null
  }

  return perfil as PerfilSeguro | null
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    // redirect('/login')
  }

  return user
}

export async function requirePerfil() {
  const perfil = await getCurrentPerfil()

  if (!perfil) {
    // redirect('/login?reason=profile')
  }

  return perfil
}

export function hasRole(perfil: PerfilSeguro | null, roles: string[]) {
  if (!perfil) return false
  return roles.includes(perfil.rol)
}

export async function requireRole(roles: string[]) {
  const perfil = await requirePerfil()

  if (!hasRole(perfil, roles)) {
    redirect('/dashboard?reason=forbidden')
  }

  return perfil
}
