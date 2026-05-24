'use server'

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

// Cache por request — evita múltiples queries a Supabase en la misma request
export const getEstablecimientoId = cache(async (): Promise<string | null> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Primero intentar desde los metadatos del usuario (se setea en onboarding)
  const metaId = user.user_metadata?.establecimiento_id
  if (metaId) return metaId

  // Fallback: buscar en la tabla perfiles
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('establecimiento_id')
    .eq('id', user.id)
    .single()

  return perfil?.establecimiento_id ?? null
})

// Helper para usar en Server Actions — retorna el ID o lanza error
export async function requireEstablecimientoId(): Promise<string> {
  const id = await getEstablecimientoId()
  if (!id) throw new Error('Sin establecimiento asociado. Completa el onboarding.')
  return id
}
