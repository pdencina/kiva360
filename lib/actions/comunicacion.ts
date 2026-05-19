'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Obtener conversaciones del usuario ────────────────────────
export async function getConversaciones() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Obtener últimos mensajes agrupados por interlocutor
  const { data } = await supabase
    .from('mensajes')
    .select('*, de_usuario:perfiles!de_usuario_id(nombre, rol), para_usuario:perfiles!para_usuario_id(nombre, rol)')
    .or(`de_usuario_id.eq.${user.id},para_usuario_id.eq.${user.id}`)
    .order('enviado_en', { ascending: false })
    .limit(50)

  if (!data?.length) return []

  // Agrupar por interlocutor
  const conversaciones = new Map<string, {
    usuario_id:   string
    nombre:       string
    rol:          string
    ultimo_msg:   string
    enviado_en:   string
    no_leidos:    number
  }>()

  for (const msg of data) {
    const interlocutorId  = msg.de_usuario_id === user.id ? msg.para_usuario_id : msg.de_usuario_id
    const interlocutor    = msg.de_usuario_id === user.id ? msg.para_usuario    : msg.de_usuario
    const noLeido         = !msg.leido && msg.para_usuario_id === user.id

    if (!conversaciones.has(interlocutorId)) {
      conversaciones.set(interlocutorId, {
        usuario_id: interlocutorId,
        nombre:     (interlocutor as any)?.nombre ?? 'Usuario',
        rol:        (interlocutor as any)?.rol    ?? 'usuario',
        ultimo_msg: msg.contenido,
        enviado_en: msg.enviado_en,
        no_leidos:  noLeido ? 1 : 0,
      })
    } else if (noLeido) {
      conversaciones.get(interlocutorId)!.no_leidos++
    }
  }

  return Array.from(conversaciones.values())
}

// ── Obtener mensajes de una conversación ──────────────────────
export async function getMensajes(otroUsuarioId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('mensajes')
    .select('*')
    .or(`and(de_usuario_id.eq.${user.id},para_usuario_id.eq.${otroUsuarioId}),and(de_usuario_id.eq.${otroUsuarioId},para_usuario_id.eq.${user.id})`)
    .order('enviado_en', { ascending: true })
    .limit(100)

  // Marcar como leídos
  await supabase
    .from('mensajes')
    .update({ leido: true })
    .eq('para_usuario_id', user.id)
    .eq('de_usuario_id', otroUsuarioId)
    .eq('leido', false)

  return data ?? []
}

// ── Enviar mensaje ────────────────────────────────────────────
export async function enviarMensaje(paraUsuarioId: string, contenido: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  if (!contenido.trim()) return { error: 'Mensaje vacío', success: false }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('establecimiento_id')
    .eq('id', user.id)
    .single()

  const establecimiento_id = perfil?.establecimiento_id ?? '00000000-0000-0000-0000-000000000001'

  const { error } = await supabase.from('mensajes').insert({
    establecimiento_id,
    de_usuario_id:   user.id,
    para_usuario_id: paraUsuarioId,
    contenido:       contenido.trim(),
    leido:           false,
  })

  if (error) { console.error('enviarMensaje:', error); return { error: 'Error al enviar', success: false } }
  revalidatePath('/comunicacion')
  return { success: true, error: null }
}

// ── Obtener todos los usuarios del colegio ────────────────────
export async function getUsuariosColegio() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('perfiles')
    .select('id, nombre, rol')
    .neq('id', user.id)
    .eq('activo', true)
    .order('nombre')

  return data ?? []
}

// ── Contar mensajes no leídos ─────────────────────────────────
export async function getNoLeidos() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await supabase
    .from('mensajes')
    .select('id', { count: 'exact', head: true })
    .eq('para_usuario_id', user.id)
    .eq('leido', false)

  return count ?? 0
}
