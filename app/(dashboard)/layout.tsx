import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

  const NAV = [
    {
      section: 'Principal',
      items: [
        { href: '/dashboard',         icon: '⊞', label: 'Inicio'          },
        { href: '/libro',             icon: '▦',  label: 'Libro de Clases' },
        { href: '/evaluaciones',      icon: '✎',  label: 'Evaluaciones',   badge: 3  },
        { href: '/planificacion',     icon: '◫',  label: 'Planificación'   },
      ]
    },
    {
      section: 'Integración',
      items: [
        { href: '/integraciones/sige',   icon: '⬡', label: 'SIGE'    },
        { href: '/integraciones/sae',    icon: '⬢', label: 'SAE'     },
        { href: '/integraciones/junaeb', icon: '⬟', label: 'JUNAEB', badge: 2 },
      ]
    },
    {
      section: 'Comunidad',
      items: [
        { href: '/comunicacion', icon: '◉', label: 'Comunicación', badge: 5 },
        { href: '/familias',     icon: '◈', label: 'Familias'      },
        { href: '/reportes',     icon: '◧', label: 'Reportes'      },
      ]
    },
  ]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }

        .sidebar { width: 220px; background: #0B1120; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; display: flex; flex-direction: column; border-right: 1px solid rgba(99,102,241,0.15); }

        .sidebar-logo { padding: 1.2rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 0.6rem; }
        .logo-mark { width: 32px; height: 32px; background: linear-gradient(135deg, #6366F1, #8B5CF6); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 900; color: white; }
        .logo-text { font-size: 1rem; font-weight: 700; color: white; letter-spacing: -0.02em; }
        .logo-sub  { font-size: 0.55rem; color: #6366F1; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }

        .sidebar-user { padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 0.6rem; }
        .user-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #6366F1, #8B5CF6); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; color: white; flex-shrink: 0; }
        .user-name { font-size: 0.75rem; color: #E2E8F0; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .user-role { font-size: 0.6rem; color: #6366F1; }

        .nav-section { font-size: 0.55rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(99,102,241,0.4); padding: 0.9rem 1rem 0.25rem; }

        .nav-link { display: flex; align-items: center; gap: 0.6rem; padding: 0.48rem 1rem; font-size: 0.78rem; color: #94A3B8; text-decoration: none; transition: all 0.15s; }
        .nav-link:hover { color: #E2E8F0; background: rgba(99,102,241,0.08); }
        .nav-icon { font-size: 0.9rem; width: 16px; text-align: center; flex-shrink: 0; }
        .nav-badge { margin-left: auto; background: #6366F1; color: white; font-size: 0.55rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 10px; min-width: 16px; text-align: center; }

        .sidebar-footer { padding: 0.75rem 1rem; border-top: 1px solid rgba(255,255,255,0.06); }
        .integ-label { font-size: 0.55rem; color: rgba(99,102,241,0.4); font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.4rem; }
        .integ-chips { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 0.6rem; }
        .integ-chip { font-size: 0.58rem; font-weight: 600; padding: 0.12rem 0.45rem; border-radius: 4px; background: rgba(16,185,129,0.1); color: #10B981; border: 1px solid rgba(16,185,129,0.2); }
        .signout-btn { display: block; text-align: center; font-size: 0.7rem; color: #475569; text-decoration: none; padding: 0.35rem; border-radius: 6px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); transition: all 0.15s; }
        .signout-btn:hover { color: #94A3B8; }

        .main { margin-left: 220px; min-height: 100vh; display: flex; flex-direction: column; background: #F8FAFC; }

        .topbar { height: 50px; background: white; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; position: sticky; top: 0; z-index: 90; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .topbar-left { font-size: 0.78rem; color: #94A3B8; }
        .topbar-right { display: flex; align-items: center; gap: 0.6rem; }
        .year-badge { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; font-size: 0.65rem; font-weight: 700; padding: 0.22rem 0.65rem; border-radius: 6px; }
        .notif-btn { width: 32px; height: 32px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; font-size: 0.85rem; }
        .notif-dot { position: absolute; top: 5px; right: 5px; width: 6px; height: 6px; background: #EF4444; border-radius: 50%; border: 1.5px solid white; }

        .page-content { flex: 1; padding: 1.5rem; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside className="sidebar">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-mark">K</div>
            <div>
              <div className="logo-text">Kiva360</div>
              <div className="logo-sub">Educación Chile</div>
            </div>
          </div>

          {/* Usuario */}
          <div className="sidebar-user">
            <div className="user-avatar">{iniciales}</div>
            <div style={{ minWidth: 0 }}>
              <div className="user-name">{user.email}</div>
              <div className="user-role">Administrador</div>
            </div>
          </div>

          {/* Nav — usa <a> para evitar interceptación del middleware */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '0.25rem 0' }}>
            {NAV.map(group => (
              <div key={group.section}>
                <div className="nav-section">{group.section}</div>
                {group.items.map(item => (
                  <a key={item.href} href={item.href} className="nav-link">
                    <span className="nav-icon">{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </a>
                ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="sidebar-footer">
            <div className="integ-label">Integraciones</div>
            <div className="integ-chips">
              <span className="integ-chip">SIGE ●</span>
              <span className="integ-chip">SAE ●</span>
              <span className="integ-chip">JUNAEB ●</span>
            </div>
            <a href="/api/auth/signout" className="signout-btn">
              Cerrar sesión
            </a>
          </div>
        </aside>

        <div className="main">
          {/* Topbar */}
          <header className="topbar">
            <div className="topbar-left">
              <span style={{ fontWeight: 600, color: '#1E293B' }}>Kiva360</span>
              <span style={{ margin: '0 0.4rem', color: '#CBD5E1' }}>·</span>
              <span>Panel de gestión escolar</span>
            </div>
            <div className="topbar-right">
              <div className="year-badge">2026</div>
              <div className="notif-btn">
                🔔<div className="notif-dot" />
              </div>
            </div>
          </header>

          {/* Contenido */}
          <div className="page-content">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
