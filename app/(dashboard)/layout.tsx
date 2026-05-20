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
        { href: '/dashboard',             label: 'Inicio',          icon: '○' },
        { href: '/libro',                 label: 'Libro de Clases', icon: '▦' },
        { href: '/evaluaciones',          label: 'Evaluaciones',    icon: '◈', badge: 3 },
        { href: '/planificacion',         label: 'Planificación',   icon: '◫' },
      ]
    },
    {
      section: 'Integración',
      items: [
        { href: '/integraciones/sige',    label: 'SIGE',            icon: '⬡' },
        { href: '/integraciones/sae',     label: 'SAE',             icon: '⬢' },
        { href: '/integraciones/junaeb',  label: 'JUNAEB',          icon: '⬟', badge: 2 },
      ]
    },
    {
      section: 'Comunidad',
      items: [
        { href: '/comunicacion',          label: 'Comunicación',    icon: '◉', badge: 5 },
        { href: '/familias',              label: 'Familias',        icon: '◈' },
        { href: '/reportes',              label: 'Reportes',        icon: '◧' },
      ]
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; font-family: 'DM Sans', sans-serif; }

        :root {
          --sidebar-w: 230px;
          --amber: #F59E0B;
          --amber-dim: rgba(245,158,11,0.12);
          --surface: #0D1117;
          --surface-2: #161B22;
          --border: rgba(255,255,255,0.06);
          --text: rgba(255,255,255,0.85);
          --text-dim: rgba(255,255,255,0.35);
          --content-bg: #F4F6F9;
        }

        /* ── SIDEBAR ── */
        .sb {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: var(--sidebar-w);
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 100;
        }

        /* Glow sutil en el sidebar */
        .sb::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 200px;
          background: radial-gradient(ellipse at top left, rgba(245,158,11,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .sb-logo {
          padding: 1.2rem 1rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 0.65rem;
          position: relative;
        }
        .sb-logo-mark {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #F59E0B, #EF4444);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 0.9rem;
          color: white;
          box-shadow: 0 0 16px rgba(245,158,11,0.25);
          flex-shrink: 0;
        }
        .sb-logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          color: white;
          letter-spacing: -0.02em;
        }
        .sb-logo-sub {
          font-size: 0.52rem;
          color: var(--amber);
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.7;
        }

        .sb-user {
          padding: 0.8rem 1rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .sb-avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F59E0B40, #EF444430);
          border: 1px solid rgba(245,158,11,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.62rem;
          font-weight: 700;
          color: var(--amber);
          flex-shrink: 0;
          font-family: 'Syne', sans-serif;
        }
        .sb-user-name {
          font-size: 0.75rem;
          color: var(--text);
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sb-user-role {
          font-size: 0.6rem;
          color: var(--amber);
          opacity: 0.7;
          font-weight: 400;
        }

        .sb-nav { flex: 1; overflow-y: auto; padding: 0.5rem 0; }
        .sb-nav::-webkit-scrollbar { width: 0; }

        .sb-section {
          font-size: 0.52rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(245,158,11,0.3);
          padding: 1rem 1rem 0.3rem;
        }

        .sb-link {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.5rem 1rem;
          font-size: 0.78rem;
          color: var(--text-dim);
          text-decoration: none;
          transition: all 0.15s;
          position: relative;
          border-radius: 0;
        }
        .sb-link:hover {
          color: var(--text);
          background: rgba(255,255,255,0.03);
        }
        .sb-link:hover .sb-icon { color: var(--amber); }
        .sb-icon {
          font-size: 0.8rem;
          width: 14px;
          text-align: center;
          flex-shrink: 0;
          transition: color 0.15s;
        }
        .sb-badge {
          margin-left: auto;
          background: var(--amber);
          color: #0D1117;
          font-size: 0.52rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
        }

        .sb-footer {
          padding: 0.8rem 1rem;
          border-top: 1px solid var(--border);
        }
        .sb-integ {
          display: flex;
          gap: 0.3rem;
          margin-bottom: 0.6rem;
          flex-wrap: wrap;
        }
        .sb-integ-chip {
          font-size: 0.56rem;
          font-weight: 600;
          padding: 0.15rem 0.5rem;
          border-radius: 20px;
          background: rgba(245,158,11,0.08);
          color: rgba(245,158,11,0.6);
          border: 1px solid rgba(245,158,11,0.15);
          letter-spacing: 0.05em;
        }
        .sb-signout {
          display: block;
          text-align: center;
          font-size: 0.68rem;
          color: var(--text-dim);
          text-decoration: none;
          padding: 0.4rem;
          border-radius: 7px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          transition: all 0.15s;
        }
        .sb-signout:hover {
          color: #FCA5A5;
          background: rgba(239,68,68,0.05);
          border-color: rgba(239,68,68,0.15);
        }

        /* ── MAIN ── */
        .main-wrap {
          margin-left: var(--sidebar-w);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--content-bg);
        }

        /* ── TOPBAR ── */
        .topbar {
          height: 48px;
          background: white;
          border-bottom: 1px solid #E8ECF0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          position: sticky;
          top: 0;
          z-index: 90;
        }
        .topbar-left {
          font-size: 0.75rem;
          color: #94A3B8;
        }
        .topbar-left strong {
          color: #1E293B;
          font-weight: 600;
        }
        .topbar-right { display: flex; align-items: center; gap: 0.6rem; }
        .topbar-year {
          font-family: 'Syne', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          background: linear-gradient(135deg, #F59E0B, #EF4444);
          color: white;
          padding: 0.22rem 0.65rem;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }
        .topbar-bell {
          width: 32px; height: 32px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem;
          cursor: pointer;
          position: relative;
          transition: all 0.15s;
        }
        .topbar-bell:hover { background: #F1F5F9; }
        .topbar-bell-dot {
          position: absolute;
          top: 5px; right: 5px;
          width: 6px; height: 6px;
          background: #F59E0B;
          border-radius: 50%;
          border: 1.5px solid white;
          box-shadow: 0 0 6px rgba(245,158,11,0.8);
        }

        .page-content { flex: 1; padding: 1.5rem; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* SIDEBAR */}
        <aside className="sb">
          <div className="sb-logo">
            <div className="sb-logo-mark">K</div>
            <div>
              <div className="sb-logo-text">Kiva360</div>
              <div className="sb-logo-sub">Educación Chile</div>
            </div>
          </div>

          <div className="sb-user">
            <div className="sb-avatar">{iniciales}</div>
            <div style={{ minWidth: 0 }}>
              <div className="sb-user-name">{user.email}</div>
              <div className="sb-user-role">Administrador</div>
            </div>
          </div>

          <nav className="sb-nav">
            {NAV.map(group => (
              <div key={group.section}>
                <div className="sb-section">{group.section}</div>
                {group.items.map(item => (
                  <a key={item.href} href={item.href} className="sb-link">
                    <span className="sb-icon">{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span className="sb-badge">{item.badge}</span>
                    )}
                  </a>
                ))}
              </div>
            ))}
          </nav>

          <div className="sb-footer">
            <div className="sb-integ">
              <span className="sb-integ-chip">SIGE ●</span>
              <span className="sb-integ-chip">SAE ●</span>
              <span className="sb-integ-chip">JUNAEB ●</span>
            </div>
            <a href="/api/auth/signout" className="sb-signout">
              Cerrar sesión
            </a>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main-wrap">
          <header className="topbar">
            <div className="topbar-left">
              <strong>Kiva360</strong>
              <span style={{ margin: '0 0.4rem', color: '#CBD5E1' }}>·</span>
              Panel de gestión escolar
            </div>
            <div className="topbar-right">
              <div className="topbar-year">2026</div>
              <div className="topbar-bell">
                🔔
                <div className="topbar-bell-dot" />
              </div>
            </div>
          </header>

          <div className="page-content">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
