import { Sidebar } from '@/components/shared/Sidebar'
import { Topbar } from '@/components/shared/Topbar'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const perfilSafe = {
    id: user?.id ?? 'demo-user',
    nombre: user?.email?.split('@')[0] ?? 'Administrador',
    rol: 'admin_kiva360',
    email: user?.email ?? 'admin@kiva360.cl',
    activo: true,
    establecimiento_id: '00000000-0000-0000-0000-000000000001',
    establecimientos: {
      id: '00000000-0000-0000-0000-000000000001',
      nombre: 'Colegio Demo Kiva360',
      plan: 'completo',
    },
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
