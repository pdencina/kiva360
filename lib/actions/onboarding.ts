'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// ── Schemas de validación ─────────────────────────────────────

const ColegioSchema = z.object({
  rbd:    z.string().min(5, 'RBD inválido').max(10),
  nombre: z.string().min(3, 'Nombre muy corto').max(120),
  tipo:   z.enum(['municipal', 'particular_subvencionado', 'particular_pagado']),
  region: z.string().min(2),
  comuna: z.string().min(2),
  director: z.string().min(3),
})

const RolSchema = z.object({
  rol: z.enum(['director', 'utp', 'profesor', 'apoderado', 'admin_kiva360']),
})

const IntegSchema = z.object({
  sige:   z.boolean(),
  sae:    z.boolean(),
  junaeb: z.boolean(),
  sige_user:      z.string().optional(),
  sae_user:       z.string().optional(),
  junaeb_user:    z.string().optional(),
})

// ── Tipo del estado del onboarding ───────────────────────────

export type OnboardingState = {
  error:   string | null
  success: boolean
  field?:  string
}

// ── STEP 1: Guardar datos del colegio ────────────────────────

export async function guardarColegio(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const raw = {
    rbd:      formData.get('rbd')     as string,
    nombre:   formData.get('nombre')  as string,
    tipo:     formData.get('tipo')    as string,
    region:   formData.get('region')  as string,
    comuna:   formData.get('comuna')  as string,
    director: formData.get('director') as string,
  }

  const parsed = ColegioSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    return { error: firstError.message, success: false, field: String(firstError.path[0]) }
  }

  // Verificar si el RBD ya existe
  const { data: existing } = await supabase
    .from('establecimientos')
    .select('id')
    .eq('rbd', parsed.data.rbd)
    .single()

  if (existing) {
    return { error: 'Este RBD ya está registrado en Kiva360. Contacta soporte si crees que es un error.', success: false, field: 'rbd' }
  }

  // Crear el establecimiento
  const { data: establecimiento, error } = await supabase
    .from('establecimientos')
    .insert({
      rbd:      parsed.data.rbd,
      nombre:   parsed.data.nombre,
      tipo:     parsed.data.tipo,
      region:   parsed.data.region,
      comuna:   parsed.data.comuna,
      director: parsed.data.director,
      plan:     'completo', // plan por defecto en piloto
    })
    .select('id')
    .single()

  if (error || !establecimiento) {
    console.error('Error creando establecimiento:', error)
    return { error: 'Error al guardar. Intenta nuevamente.', success: false }
  }

  // Guardar establecimiento_id en metadata del usuario
  await supabase.auth.updateUser({
    data: { establecimiento_id: establecimiento.id, onboarding_step: 2 }
  })

  return { success: true, error: null }
}

// ── STEP 2: Guardar rol del usuario ──────────────────────────

export async function guardarRol(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const parsed = RolSchema.safeParse({ rol: formData.get('rol') })
  if (!parsed.success) {
    return { error: 'Selecciona un rol para continuar', success: false }
  }

  const establecimiento_id = user.user_metadata?.establecimiento_id
  if (!establecimiento_id) {
    return { error: 'Error de sesión. Vuelve al paso anterior.', success: false }
  }

  // Crear o actualizar el perfil del usuario
  const { error } = await supabase
    .from('perfiles')
    .upsert({
      id:                user.id,
      establecimiento_id,
      nombre:            user.user_metadata?.nombre ?? user.email?.split('@')[0] ?? 'Usuario',
      rol:               parsed.data.rol,
    })

  if (error) {
    console.error('Error guardando perfil:', error)
    return { error: 'Error al guardar. Intenta nuevamente.', success: false }
  }

  await supabase.auth.updateUser({
    data: { onboarding_step: 3 }
  })

  return { success: true, error: null }
}

// ── STEP 3: Guardar integraciones ────────────────────────────

export async function guardarIntegraciones(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const establecimiento_id = user.user_metadata?.establecimiento_id
  if (!establecimiento_id) {
    return { error: 'Error de sesión. Vuelve al paso anterior.', success: false }
  }

  const data = {
    sige:        formData.get('sige')   === 'on',
    sae:         formData.get('sae')    === 'on',
    junaeb:      formData.get('junaeb') === 'on',
    sige_user:   (formData.get('sige_user')   as string) || undefined,
    sae_user:    (formData.get('sae_user')    as string) || undefined,
    junaeb_user: (formData.get('junaeb_user') as string) || undefined,
  }

  // Guardar usuarios de integración (las contraseñas se ingresan después en Configuración)
  const updateData: Record<string, string | boolean | undefined> = {}
  if (data.sige_user)   updateData.sige_user   = data.sige_user
  if (data.sae_user)    updateData.sae_user    = data.sae_user
  if (data.junaeb_user) updateData.junaeb_user = data.junaeb_user

  if (Object.keys(updateData).length > 0) {
    await supabase
      .from('establecimientos')
      .update(updateData)
      .eq('id', establecimiento_id)
  }

  // Marcar onboarding como completado
  await supabase.auth.updateUser({
    data: {
      onboarding_step:      4,
      onboarding_complete:  true,
      integ_sige:           data.sige,
      integ_sae:            data.sae,
      integ_junaeb:         data.junaeb,
    }
  })

  return { success: true, error: null }
}

// ── Completar onboarding → redirigir a dashboard ──────────────

export async function completarOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.auth.updateUser({
    data: { onboarding_complete: true }
  })

  redirect('/dashboard')
}
