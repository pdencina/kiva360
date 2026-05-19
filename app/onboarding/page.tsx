import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingClient } from '@/components/onboarding/OnboardingClient'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.user_metadata?.onboarding_complete) redirect('/dashboard')

  const stepActual = (user.user_metadata?.onboarding_step as number) ?? 1

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0B1120 0%, #1E1B4B 50%, #0B1120 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    }}>
      <OnboardingClient
        stepInicial={stepActual}
        nombreUsuario={user.user_metadata?.nombre ?? user.email?.split('@')[0] ?? 'Usuario'}
      />
    </main>
  )
}
