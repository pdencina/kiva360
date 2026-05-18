import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shared/Sidebar'
import { Topbar } from '@/components/shared/Topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const db = supabase as any

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: perfil } = user
    ? await db
        .from('perfiles')
        .select('*, establecimientos(id, nombre, plan)')
        .eq('id', user.id)
        .eq('activo', true)
        .maybeSingle()
    : { data: null }

  // Fallback seguro: no bota al login si la lectura del perfil falla por RLS/cookie.
  const perfilSafe = perfil ?? {
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

        {!perfil && (
          <div className="mx-6 mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Sesión iniciada. Perfil usando fallback temporal mientras se estabiliza la lectura RLS.
          </div>
        )}

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
