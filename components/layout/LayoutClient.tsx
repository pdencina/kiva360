'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

const NAV = [
  {
    section: 'Principal',
    items: [
      { href: '/dashboard',            label: 'Inicio',          icon: '○', badge: 0 },
      { href: '/libro',                label: 'Libro de Clases', icon: '▦', badge: 0 },
      { href: '/evaluaciones',         label: 'Evaluaciones',    icon: '✎', badge: 3 },
      { href: '/planificacion',        label: 'Planificación',   icon: '◫', badge: 0 },
    ]
  },
  {
    section: 'Integración',
    items: [
      { href: '/integraciones/sige',   label: 'SIGE',            icon: '⬡', badge: 0 },
      { href: '/integraciones/sae',    label: 'SAE',             icon: '⬢', badge: 0 },
      { href: '/integraciones/junaeb', label: 'JUNAEB',          icon: '⬟', badge: 2 },
    ]
  },
  {
    section: 'Comunidad',
    items: [
      { href: '/comunicacion',         label: 'Comunicación',    icon: '◉', badge: 5 },
      { href: '/familias',             label: 'Familias',        icon: '◈', badge: 0 },
      { href: '/reportes',             label: 'Reportes',        icon: '◧', badge: 0 },
    ]
  },
]

export function LayoutClient({ email, iniciales, children }: { email: string; iniciales: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const [active, setActive] = useState('')

  useEffect(() => {
    setActive(window.location.pathname)
  }, [])

  const SB_W = 220

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; -webkit-font-smoothing: antialiased; }
        body { font-family: 'Inter', -apple-system, sans-serif; }

        .sb {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: ${SB_W}px;
          background: #FBFBFA;
          border-right: 1px solid #E8E8E5;
          display: flex; flex-direction: column;
          z-index: 100;
          transform: translateX(0);
          transition: transform 0.22s cubic-bezier(0.4,0,0.2,1), width 0.22s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
        }
        .sb.closed {
          transform: translateX(-100%);
        }

        .sb-logo {
          height: 52px; padding: 0 1rem;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #E8E8E5; flex-shrink: 0;
        }
        .sb-logo-inner { display: flex; align-items: center; gap: 0.55rem; }
        .sb-logo-k {
          width: 24px; height: 24px; background: #37352F; border-radius: 5px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700; color: white; flex-shrink: 0;
        }
        .sb-logo-n { font-size: 0.88rem; font-weight: 600; color: #37352F; letter-spacing: -0.02em; }
        .sb-close-btn {
          width: 24px; height: 24px; border: none; background: none;
          cursor: pointer; border-radius: 4px; color: #9B9A97;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; transition: background 0.12s, color 0.12s;
          flex-shrink: 0;
        }
        .sb-close-btn:hover { background: #EFEEEB; color: #37352F; }

        .sb-user {
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid #E8E8E5;
          display: flex; align-items: center; gap: 0.55rem;
          flex-shrink: 0;
        }
        .sb-avatar {
          width: 24px; height: 24px; border-radius: 4px;
          background: #E8E8E5; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.58rem; font-weight: 600; color: #6B6B6B;
        }
        .sb-uname { font-size: 0.75rem; color: #37352F; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sb-urole { font-size: 0.6rem; color: #9B9A97; }

        .sb-nav { flex: 1; overflow-y: auto; padding: 0.4rem 0.5rem; }
        .sb-nav::-webkit-scrollbar { width: 0; }

        .sb-section {
          font-size: 0.6rem; font-weight: 600; color: #C2C0BB;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 0.85rem 0.5rem 0.25rem;
        }

        .sb-link {
          display: flex; align-items: center; gap: 0.55rem;
          padding: 0.38rem 0.6rem;
          font-size: 0.82rem; color: #6B6B6B; font-weight: 400;
          text-decoration: none; border-radius: 5px;
          transition: background 0.1s, color 0.1s, transform 0.15s;
          user-select: none;
        }
        .sb-link:hover {
          background: #EFEEEB;
          color: #37352F;
          transform: translateX(3px);
        }
        .sb-link.active {
          background: #EFEEEB;
          color: #37352F;
          font-weight: 500;
        }
        .sb-link.active .sb-link-dot {
          opacity: 1;
        }
        .sb-link-dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: #37352F; flex-shrink: 0; opacity: 0;
          transition: opacity 0.1s;
        }
        .sb-link-icon { font-size: 0.75rem; color: #B5B3AD; flex-shrink: 0; width: 14px; text-align: center; }
        .sb-badge {
          margin-left: auto;
          background: #E8E8E5; color: #9B9A97;
          font-size: 0.58rem; font-weight: 600;
          padding: 0.08rem 0.4rem; border-radius: 20px; min-width: 18px; text-align: center;
        }

        .sb-footer {
          padding: 0.75rem; border-top: 1px solid #E8E8E5; flex-shrink: 0;
        }
        .sb-chips { display: flex; gap: 0.25rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
        .sb-chip {
          font-size: 0.55rem; font-weight: 500; color: #9B9A97;
          padding: 0.1rem 0.4rem; border-radius: 3px; background: #F0F0EE;
        }
        .sb-out {
          display: block; text-align: center; font-size: 0.68rem; color: #9B9A97;
          text-decoration: none; padding: 0.35rem; border-radius: 4px;
          transition: background 0.1s, color 0.1s;
        }
        .sb-out:hover { background: #EFEEEB; color: #37352F; }

        /* ── MAIN ── */
        .main-wrap {
          min-height: 100vh; display: flex; flex-direction: column;
          background: #F5F6FA;
          margin-left: ${SB_W}px;
          transition: margin-left 0.22s cubic-bezier(0.4,0,0.2,1);
        }
        .main-wrap.sb-closed { margin-left: 0; }

        .topbar {
          height: 52px; background: white;
          border-bottom: 1px solid #EBEBEB;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.25rem;
          position: sticky; top: 0; z-index: 90;
        }
        .topbar-l { display: flex; align-items: center; gap: 0.6rem; }
        .hamburger {
          width: 30px; height: 30px; border: none; background: none;
          cursor: pointer; border-radius: 5px; color: #9B9A97;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; transition: background 0.1s, color 0.1s;
        }
        .hamburger:hover { background: #F0F0EE; color: #37352F; }
        .topbar-breadcrumb { font-size: 0.78rem; color: #9B9A97; }
        .topbar-breadcrumb strong { color: #37352F; font-weight: 500; }
        .topbar-r { display: flex; align-items: center; gap: 0.5rem; }
        .topbar-year {
          font-size: 0.68rem; font-weight: 500; color: #6B6B6B;
          background: #F0F0EE; padding: 0.2rem 0.6rem; border-radius: 4px;
        }
        .topbar-bell {
          width: 28px; height: 28px; background: none; border: none;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.82rem; cursor: pointer; border-radius: 4px;
          transition: background 0.1s; position: relative;
        }
        .topbar-bell:hover { background: #F0F0EE; }
        .bell-dot {
          position: absolute; top: 4px; right: 4px;
          width: 5px; height: 5px; background: #37352F;
          border-radius: 50%; border: 1.5px solid white;
        }

        .page { flex: 1; padding: 1.5rem; width: 100%; min-width: 0; }

        /* Overlay cuando sidebar abierto en mobile */
        .sb-overlay {
          display: none;
          position: fixed; inset: 0; background: rgba(0,0,0,0.3);
          z-index: 99;
        }
        @media (max-width: 768px) {
          .sb-overlay.visible { display: block; }
          .main-wrap { margin-left: 0 !important; }
        }
      `}</style>

      {/* Overlay mobile */}
      <div
        className={`sb-overlay${!open ? '' : ' visible'}`}
        onClick={() => setOpen(false)}
        style={{ display: open ? 'none' : 'none' }}
      />

      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* SIDEBAR */}
        <aside className={`sb${open ? '' : ' closed'}`}>
          <div className="sb-logo">
            <div className="sb-logo-inner">
              <div className="sb-logo-k">K</div>
              <span className="sb-logo-n">Kiva360</span>
            </div>
            <button className="sb-close-btn" onClick={() => setOpen(false)} title="Ocultar menú">
              ←
            </button>
          </div>

          <div className="sb-user">
            <div className="sb-avatar">{iniciales}</div>
            <div style={{ minWidth: 0 }}>
              <div className="sb-uname">{email}</div>
              <div className="sb-urole">Administrador</div>
            </div>
          </div>

          <nav className="sb-nav">
            {NAV.map(group => (
              <div key={group.section}>
                <div className="sb-section">{group.section}</div>
                {group.items.map(item => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`sb-link${active === item.href ? ' active' : ''}`}
                  >
                    <span className="sb-link-dot" />
                    <span className="sb-link-icon">{item.icon}</span>
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

        {/* MAIN */}
        <div className={`main-wrap${open ? '' : ' sb-closed'}`}>
          <header className="topbar">
            <div className="topbar-l">
              <button className="hamburger" onClick={() => setOpen(o => !o)} title={open ? 'Ocultar menú' : 'Mostrar menú'}>
                ☰
              </button>
              <div className="topbar-breadcrumb">
                <strong>Kiva360</strong>
                <span style={{ margin: '0 0.35rem', color: '#DDD' }}>·</span>
                Panel de gestión escolar
              </div>
            </div>
            <div className="topbar-r">
              <div className="topbar-year">2026</div>
              <button className="topbar-bell">
                🔔
                <div className="bell-dot" />
              </button>
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
