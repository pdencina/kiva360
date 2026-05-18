import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingClient } from '@/components/onboarding/OnboardingClient'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Si ya completó el onboarding → dashboard
  if (user.user_metadata?.onboarding_complete) redirect('/dashboard')

  // Recuperar paso actual
  const stepActual = (user.user_metadata?.onboarding_step as number) ?? 1

  return (
    <main className="min-h-screen bg-[#0A1929] flex items-center justify-center p-4">
      <OnboardingClient
        stepInicial={stepActual}
        nombreUsuario={user.user_metadata?.nombre ?? user.email?.split('@')[0] ?? 'Usuario'}
      />
    </main>
  )
}
