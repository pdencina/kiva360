import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LayoutClient } from '@/components/layout/LayoutClient'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // ── Decisión de onboarding SOLO por metadatos (nunca por query) ──
  // El RLS puede bloquear la query a perfiles y disparar un loop infinito,
  // así que el gate del onboarding se basa en los metadatos del usuario.
  const onboardingCompleto =
    user.user_metadata?.onboarding_complete === true ||
    !!user.user_metadata?.establecimiento_id

  if (!onboardingCompleto) redirect('/onboarding')

  // ── Datos cosméticos (si la query falla, usamos defaults) ────────
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*, establecimientos(nombre, rbd)')
    .eq('id', user.id)
    .single()

  const rol           = perfil?.rol ?? (user.user_metadata?.rol as string) ?? 'profesor'
  const email         = user.email ?? ''
  const iniciales     = email.slice(0, 2).toUpperCase()
  const nombreColegio = (perfil as any)?.establecimientos?.nombre ?? 'Mi Colegio'

  return (
    <LayoutClient
      email={email}
      iniciales={iniciales}
      rol={rol}
      nombreColegio={nombreColegio}
    >
      {children}
    </LayoutClient>
  )
}
