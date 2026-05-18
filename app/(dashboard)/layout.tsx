import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shared/Sidebar'
import { Topbar } from '@/components/shared/Topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Traer perfil SIN romper si falla
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Perfil fallback temporal
  const perfilSafe = perfil ?? {
    id: user.id,
    nombre: user.user_metadata?.nombre ?? 'Administrador',
    rol: 'admin_kiva360',
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar perfil={perfilSafe as any} />

      <div className="flex-1 flex flex-col" style={{ marginLeft: '240px' }}>
        <Topbar perfil={perfilSafe as any} />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}