import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
        { href: '/dashboard',            label: 'Inicio',          badge: 0 },
        { href: '/libro',                label: 'Libro de Clases', badge: 0 },
        { href: '/evaluaciones',         label: 'Evaluaciones',    badge: 3 },
        { href: '/planificacion',        label: 'Planificación',   badge: 0 },
      ]
    },
    {
      section: 'Integración',
      items: [
        { href: '/integraciones/sige',   label: 'SIGE',            badge: 0 },
        { href: '/integraciones/sae',    label: 'SAE',             badge: 0 },
        { href: '/integraciones/junaeb', label: 'JUNAEB',          badge: 2 },
      ]
    },
    {
      section: 'Comunidad',
      items: [
        { href: '/comunicacion',         label: 'Comunicación',    badge: 5 },
        { href: '/familias',             label: 'Familias',        badge: 0 },
        { href: '/reportes',             label: 'Reportes',        badge: 0 },
      ]
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; -webkit-font-smoothing: antialiased; }
        body { font-family: 'Inter', -apple-system, sans-serif; }

        :root { --sb-w: 220px; }

        .sb {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: var(--sb-w);
          background: #FBFBFA;
          border-right: 1px solid #E8E8E5;
          display: flex; flex-direction: column;
          z-index: 100;
        }

        .sb-logo {
          height: 52px; padding: 0 1rem;
          display: flex; align-items: center; gap: 0.55rem;
          border-bottom: 1px solid #E8E8E5;
        }
        .sb-logo-k {
          width: 24px; height: 24px; background: #1E1E1E; border-radius: 5px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700; color: white; flex-shrink: 0;
        }
        .sb-logo-n { font-size: 0.88rem; font-weight: 600; color: #1E1E1E; letter-spacing: -0.02em; }

        .sb-user {
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid #E8E8E5;
          display: flex; align-items: center; gap: 0.55rem;
          cursor: pointer; transition: background 0.12s; border-radius: 0;
        }
        .sb-user:hover { background: #F0F0EE; }
        .sb-avatar {
          width: 24px; height: 24px; border-radius: 4px;
          background: #E8E8E5;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.58rem; font-weight: 600; color: #666; flex-shrink: 0;
        }
        .sb-uname { font-size: 0.78rem; color: #37352F; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sb-urole { font-size: 0.62rem; color: #9B9A97; }

        .sb-nav { flex: 1; overflow-y: auto; padding: 0.4rem 0.5rem; }
        .sb-nav::-webkit-scrollbar { width: 0; }

        .sb-section {
          font-size: 0.62rem; font-weight: 600; color: #9B9A97;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 0.9rem 0.5rem 0.25rem;
        }

        .sb-link {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.35rem 0.5rem;
          font-size: 0.82rem; color: #6B6B6B; font-weight: 400;
          text-decoration: none; transition: all 0.1s;
          border-radius: 4px;
        }
        .sb-link:hover { color: #37352F; background: #EFEEEB; }
        .sb-badge {
          margin-left: auto;
          background: #E8E8E5; color: #9B9A97;
          font-size: 0.58rem; font-weight: 600;
          padding: 0.08rem 0.38rem; border-radius: 20px;
        }

        .sb-footer {
          padding: 0.75rem;
          border-top: 1px solid #E8E8E5;
        }
        .sb-chips { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
        .sb-chip {
          font-size: 0.56rem; font-weight: 500; color: #9B9A97;
          padding: 0.1rem 0.4rem; border-radius: 3px;
          background: #F0F0EE; letter-spacing: 0.03em;
        }
        .sb-out {
          display: block; text-align: center;
          font-size: 0.68rem; color: #9B9A97; text-decoration: none;
          padding: 0.35rem; border-radius: 4px;
          transition: background 0.1s, color 0.1s;
        }
        .sb-out:hover { background: #EFEEEB; color: #37352F; }

        .main {
          margin-left: var(--sb-w);
          min-height: 100vh;
          display: flex; flex-direction: column;
          background: #F5F6FA;
        }

        .topbar {
          height: 52px; background: white;
          border-bottom: 1px solid #EBEBEB;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.5rem;
          position: sticky; top: 0; z-index: 90;
        }
        .topbar-l { font-size: 0.78rem; color: #9B9A97; }
        .topbar-l strong { color: #37352F; font-weight: 500; }
        .topbar-r { display: flex; align-items: center; gap: 0.5rem; }
        .topbar-year {
          font-size: 0.68rem; font-weight: 500; color: #6B6B6B;
          background: #F0F0EE; padding: 0.2rem 0.6rem; border-radius: 4px;
        }
        .topbar-bell {
          width: 28px; height: 28px;
          background: transparent; border: none;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.82rem; cursor: pointer; border-radius: 4px;
          transition: background 0.1s; position: relative;
        }
        .topbar-bell:hover { background: #F0F0EE; }
        .topbar-bell-dot {
          position: absolute; top: 4px; right: 4px;
          width: 5px; height: 5px; background: #37352F;
          border-radius: 50%; border: 1.5px solid white;
        }

        .page { flex: 1; padding: 1.75rem 2rem; max-width: 1100px; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside className="sb">
          <div className="sb-logo">
            <div className="sb-logo-k">K</div>
            <span className="sb-logo-n">Kiva360</span>
          </div>

          <div className="sb-user">
            <div className="sb-avatar">{iniciales}</div>
            <div style={{ minWidth: 0 }}>
              <div className="sb-uname">{user.email}</div>
              <div className="sb-urole">Administrador</div>
            </div>
          </div>

          <nav className="sb-nav">
            {NAV.map(group => (
              <div key={group.section}>
                <div className="sb-section">{group.section}</div>
                {group.items.map(item => (
                  <a key={item.href} href={item.href} className="sb-link">
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge > 0 && <span className="sb-badge">{item.badge}</span>}
                  </a>
                ))}
              </div>
            ))}
          </nav>

          <div className="sb-footer">
            <div className="sb-chips">
              {['SIGE', 'SAE', 'JUNAEB'].map(c => (
                <span key={c} className="sb-chip">{c} ●</span>
              ))}
            </div>
            <a href="/api/auth/signout" className="sb-out">Cerrar sesión</a>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <div className="topbar-l">
              <strong>Kiva360</strong>
              <span style={{ margin: '0 0.4rem', color: '#DDD' }}>·</span>
              Panel de gestión escolar
            </div>
            <div className="topbar-r">
              <div className="topbar-year">2026</div>
              <div className="topbar-bell">
                🔔
                <div className="topbar-bell-dot" />
              </div>
            </div>
          </header>

          <div className="page">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
