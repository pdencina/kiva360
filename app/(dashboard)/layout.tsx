import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LayoutClient } from '@/components/layout/LayoutClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nombre    = user.email?.split('@')[0] ?? 'Usuario'
  const iniciales = nombre.slice(0, 2).toUpperCase()

  return (
    <LayoutClient email={user.email ?? ''} iniciales={iniciales}>
      {children}
    </LayoutClient>
  )
}
