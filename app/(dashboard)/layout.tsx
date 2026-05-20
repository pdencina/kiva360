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

        /* ── SIDEBAR ── */
        .sb {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: var(--sb-w);
          background: #0A0A0A;
          border-right: 1px solid #1A1A1A;
          display: flex; flex-direction: column;
          z-index: 100;
        }

        .sb-logo {
          height: 52px; padding: 0 1rem;
          display: flex; align-items: center; gap: 0.6rem;
          border-bottom: 1px solid #1A1A1A;
        }
        .sb-logo-k {
          width: 26px; height: 26px; background: white; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; color: #0A0A0A; flex-shrink: 0;
          letter-spacing: -0.04em;
        }
        .sb-logo-n { font-size: 0.88rem; font-weight: 600; color: white; letter-spacing: -0.02em; }

        .sb-user {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #1A1A1A;
          display: flex; align-items: center; gap: 0.6rem;
        }
        .sb-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: #1A1A1A; border: 1px solid #2A2A2A;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6rem; font-weight: 600; color: #666; flex-shrink: 0;
        }
        .sb-uname { font-size: 0.72rem; color: #666; font-weight: 400; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sb-urole { font-size: 0.6rem; color: #333; }

        .sb-nav { flex: 1; overflow-y: auto; padding: 0.5rem 0; }
        .sb-nav::-webkit-scrollbar { width: 0; }

        .sb-section {
          font-size: 0.6rem; font-weight: 600; color: #333;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 0.9rem 1rem 0.3rem;
        }

        .sb-link {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.42rem 1rem;
          font-size: 0.78rem; color: #555; font-weight: 400;
          text-decoration: none; transition: color 0.12s, background 0.12s;
        }
        .sb-link:hover { color: #CCC; background: #111; }
        .sb-badge {
          margin-left: auto;
          background: #1A1A1A; color: #666;
          font-size: 0.58rem; font-weight: 600;
          padding: 0.1rem 0.4rem; border-radius: 20px;
          min-width: 18px; text-align: center;
        }

        .sb-footer {
          padding: 0.75rem 1rem;
          border-top: 1px solid #1A1A1A;
        }
        .sb-chips { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 0.6rem; }
        .sb-chip {
          font-size: 0.56rem; font-weight: 500; color: #444;
          padding: 0.12rem 0.45rem; border-radius: 20px;
          border: 1px solid #1E1E1E; letter-spacing: 0.04em;
        }
        .sb-out {
          display: block; text-align: center;
          font-size: 0.68rem; color: #444; text-decoration: none;
          padding: 0.4rem; border-radius: 6px;
          border: 1px solid #1A1A1A;
          transition: color 0.12s, border-color 0.12s;
        }
        .sb-out:hover { color: #666; border-color: #2A2A2A; }

        /* ── MAIN ── */
        .main {
          margin-left: var(--sb-w);
          min-height: 100vh;
          display: flex; flex-direction: column;
          background: #F7F7F7;
        }

        .topbar {
          height: 52px; background: white;
          border-bottom: 1px solid #EBEBEB;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.5rem;
          position: sticky; top: 0; z-index: 90;
        }
        .topbar-l { font-size: 0.78rem; color: #999; }
        .topbar-l strong { color: #0A0A0A; font-weight: 600; }
        .topbar-r { display: flex; align-items: center; gap: 0.6rem; }
        .topbar-year {
          font-size: 0.68rem; font-weight: 600; color: #0A0A0A;
          background: #F0F0F0; padding: 0.22rem 0.65rem; border-radius: 6px;
          letter-spacing: 0.02em;
        }
        .topbar-bell {
          width: 30px; height: 30px;
          background: white; border: 1px solid #EBEBEB; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.82rem; cursor: pointer; position: relative;
          transition: background 0.12s;
        }
        .topbar-bell:hover { background: #F5F5F5; }
        .topbar-bell-dot {
          position: absolute; top: 5px; right: 5px;
          width: 5px; height: 5px; background: #0A0A0A;
          border-radius: 50%; border: 1.5px solid white;
        }

        .page { flex: 1; padding: 1.5rem; }
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
