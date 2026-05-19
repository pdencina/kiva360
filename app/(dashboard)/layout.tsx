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

  const nombre   = user.email?.split('@')[0] ?? 'Usuario'
  const iniciales = nombre.slice(0, 2).toUpperCase()

  const navGroups = [
    {
      section: 'Principal',
      items: [
        { icon: '🏠', label: 'Inicio',          href: '/dashboard' },
        { icon: '📒', label: 'Libro de Clases', href: '/libro' },
        { icon: '📝', label: 'Evaluaciones',    href: '/evaluaciones', badge: 3 },
        { icon: '🗓️', label: 'Planificación',   href: '/planificacion' },
      ]
    },
    {
      section: 'Integración MINEDUC',
      items: [
        { icon: '🔗', label: 'SIGE',   href: '/integraciones/sige' },
        { icon: '🎓', label: 'SAE',    href: '/integraciones/sae' },
        { icon: '🍽️', label: 'JUNAEB', href: '/integraciones/junaeb', badge: 2 },
      ]
    },
    {
      section: 'Comunidad',
      items: [
        { icon: '💬', label: 'Comunicación', href: '/comunicacion', badge: 5 },
        { icon: '👨‍👩‍👧', label: 'Familias',     href: '/familias' },
        { icon: '📊', label: 'Reportes',     href: '/reportes' },
      ]
    },
  ]

  return (
    <>
      <style>{`
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 1rem;
          color: #90A4AE;
          font-size: 0.8rem;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .nav-item:hover {
          background: rgba(255,255,255,0.06);
          color: #B0BEC5;
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui' }}>

        {/* SIDEBAR */}
        <aside style={{
          width: '240px', background: '#0A1929',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        }}>

          {/* Logo */}
          <div style={{
            padding: '1.2rem 1rem',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', gap: '0.6rem'
          }}>
            <div style={{
              width: '34px', height: '34px',
              background: 'linear-gradient(135deg,#1976D2,#42A5F5)',
              borderRadius: '9px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
            }}>📚</div>
            <div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem', lineHeight: 1 }}>
                Kiva360
              </div>
              <div style={{ color: '#64B5F6', fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '600' }}>
                Educación Chile
              </div>
            </div>
          </div>

          {/* Usuario */}
          <div style={{
            padding: '0.8rem 1rem',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', gap: '0.6rem'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#1565C0', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '0.7rem', fontWeight: '800', flexShrink: 0
            }}>{iniciales}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                color: '#E3F2FD', fontSize: '0.75rem', fontWeight: '600',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {user.email}
              </div>
              <div style={{ color: '#64B5F6', fontSize: '0.62rem' }}>Administrador</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto' }}>
            {navGroups.map(group => (
              <div key={group.section}>
                <div style={{
                  fontSize: '0.58rem', fontWeight: '700',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: '#1E3A5F', padding: '0.8rem 1rem 0.3rem'
                }}>
                  {group.section}
                </div>
                {group.items.map(item => (
                  <a key={item.href} href={item.href} className="nav-item">
                    <span style={{ fontSize: '0.95rem', width: '18px', textAlign: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        background: '#E53935', color: 'white',
                        fontSize: '0.58rem', fontWeight: '800',
                        padding: '0.1rem 0.4rem', borderRadius: '10px',
                        minWidth: '18px', textAlign: 'center'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div style={{ padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{
              fontSize: '0.58rem', color: '#1E3A5F', fontWeight: '700',
              marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>
              Integraciones activas
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
              {['SIGE ●', 'SAE ●', 'JUNAEB ●'].map(chip => (
                <span key={chip} style={{
                  fontSize: '0.58rem', fontWeight: '700',
                  padding: '0.15rem 0.5rem', borderRadius: '4px',
                  background: 'rgba(0,137,123,0.1)', color: '#4DB6AC',
                  border: '1px solid rgba(0,137,123,0.2)'
                }}>{chip}</span>
              ))}
            </div>
            <a href="/api/auth/signout" style={{
              display: 'block', fontSize: '0.72rem', color: '#546E7A',
              textDecoration: 'none', textAlign: 'center',
              padding: '0.4rem', borderRadius: '6px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              Cerrar sesión
            </a>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          {/* Topbar */}
          <div style={{
            height: '52px', background: 'white',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 90,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              Kiva360 <strong style={{ color: '#0F172A' }}>· Dashboard</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{
                background: '#1976D2', color: 'white',
                fontSize: '0.68rem', fontWeight: '800',
                padding: '0.25rem 0.7rem', borderRadius: '6px'
              }}>2026</div>
              <div style={{
                width: '32px', height: '32px',
                background: '#F1F5F9', borderRadius: '8px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', position: 'relative'
              }}>
                🔔
                <span style={{
                  position: 'absolute', top: '5px', right: '5px',
                  width: '7px', height: '7px', background: '#E53935',
                  borderRadius: '50%', border: '2px solid white'
                }} />
              </div>
            </div>
          </div>

          {/* Contenido de la página */}
          <div style={{ flex: 1, background: '#F0F4F8' }}>
            {children}
          </div>

        </main>
      </div>
    </>
  )
}