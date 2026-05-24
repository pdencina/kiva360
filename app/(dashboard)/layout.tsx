import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LayoutClient } from '@/components/layout/LayoutClient'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Obtener perfil completo con establecimiento
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*, establecimientos(nombre, rbd)')
    .eq('id', user.id)
    .single()

  // Sin perfil o sin establecimiento → onboarding
  if (!perfil || !perfil.establecimiento_id) redirect('/onboarding')

  const rol          = perfil.rol ?? 'profesor'
  const email        = user.email ?? ''
  const iniciales    = email.slice(0, 2).toUpperCase()
  const nombreColegio = (perfil as any).establecimientos?.nombre ?? 'Mi Colegio'

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
