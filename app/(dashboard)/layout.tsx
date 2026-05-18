import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shared/Sidebar'
import { Topbar  } from '@/components/shared/Topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Obtener perfil del usuario
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*, establecimientos(*)')
    .eq('id', user.id)
    .single()

  if (!perfil) redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar perfil={perfil} />

      <div className="flex-1 flex flex-col" style={{ marginLeft: '240px' }}>
        <Topbar perfil={perfil} />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
