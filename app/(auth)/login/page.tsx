import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Iniciar sesión · Kiva360' }

export default function LoginPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }

        .login-wrap { min-height: 100vh; display: flex; background: #F8FAFC; }

        .login-left { width: 45%; background: #0B1120; display: flex; flex-direction: column; justify-content: space-between; padding: 2.5rem; position: relative; overflow: hidden; }

        /* Círculos decorativos */
        .deco-1 { position: absolute; top: -80px; right: -80px; width: 300px; height: 300px; background: rgba(99,102,241,0.12); border-radius: 50%; }
        .deco-2 { position: absolute; bottom: -100px; left: -60px; width: 250px; height: 250px; background: rgba(139,92,246,0.08); border-radius: 50%; }
        .deco-3 { position: absolute; top: 40%; right: 10%; width: 6px; height: 6px; background: #6366F1; border-radius: 50%; opacity: 0.6; }
        .deco-4 { position: absolute; top: 30%; left: 15%; width: 4px; height: 4px; background: #8B5CF6; border-radius: 50%; opacity: 0.4; }
        .deco-grid { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px); background-size: 28px 28px; }

        .left-content { position: relative; z-index: 1; }

        .logo-row { display: flex; align-items: center; gap: 0.7rem; margin-bottom: 3rem; }
        .logo-mark { width: 38px; height: 38px; background: linear-gradient(135deg, #6366F1, #8B5CF6); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 900; color: white; }
        .logo-name { font-size: 1.15rem; font-weight: 700; color: white; letter-spacing: -0.02em; }

        .left-title { font-size: 2rem; font-weight: 800; color: white; line-height: 1.25; letter-spacing: -0.03em; margin-bottom: 1rem; }
        .left-title span { background: linear-gradient(135deg, #A5B4FC, #C4B5FD); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .left-sub { font-size: 0.85rem; color: rgba(148,163,184,0.8); line-height: 1.7; margin-bottom: 2rem; }

        .feature-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .feature-item { display: flex; align-items: center; gap: 0.7rem; font-size: 0.78rem; color: rgba(165,180,252,0.7); }
        .feature-dot { width: 6px; height: 6px; background: #6366F1; border-radius: 50%; flex-shrink: 0; }

        .left-footer { position: relative; z-index: 1; }
        .badge-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .badge { font-size: 0.62rem; font-weight: 600; padding: 0.25rem 0.65rem; border-radius: 20px; background: rgba(99,102,241,0.15); color: rgba(165,180,252,0.7); border: 1px solid rgba(99,102,241,0.2); }
        .footer-txt { font-size: 0.65rem; color: rgba(71,85,105,0.6); }

        /* Panel derecho */
        .login-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .login-box { width: 100%; max-width: 400px; }
        .login-title { font-size: 1.75rem; font-weight: 800; color: #0F172A; letter-spacing: -0.03em; margin-bottom: 0.3rem; }
        .login-sub { font-size: 0.82rem; color: #94A3B8; margin-bottom: 2rem; }

        @media (max-width: 768px) { .login-left { display: none; } }
      `}</style>

      <div className="login-wrap">
        {/* Panel izquierdo */}
        <div className="login-left">
          <div className="deco-grid" />
          <div className="deco-1" />
          <div className="deco-2" />
          <div className="deco-3" />
          <div className="deco-4" />

          <div className="left-content">
            <div className="logo-row">
              <div className="logo-mark">K</div>
              <span className="logo-name">Kiva360</span>
            </div>

            <h1 className="left-title">
              La plataforma que los colegios{' '}
              <span>chilenos</span>{' '}
              estaban esperando
            </h1>
            <p className="left-sub">
              SIGE · SAE · JUNAEB integrados en un solo lugar.<br />
              Sin doble digitación, sin errores, sin complicaciones.
            </p>

            <div className="feature-list">
              {[
                'Libro de clases digital conforme MINEDUC',
                'Integración directa con SIGE, SAE y JUNAEB',
                'Comunicación con apoderados en tiempo real',
                'Currículum actualizado automáticamente',
                'Validador automático pre-envío SIGE',
              ].map(f => (
                <div key={f} className="feature-item">
                  <div className="feature-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="left-footer">
            <div className="badge-row">
              <span className="badge">🔗 SIGE</span>
              <span className="badge">🎓 SAE</span>
              <span className="badge">🍽️ JUNAEB</span>
              <span className="badge">📝 Libro Digital</span>
            </div>
            <p className="footer-txt">🇨🇱 Hecho en Chile · kiva360.cl</p>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="login-right">
          <div className="login-box">
            {/* Logo mobile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }} className="mobile-logo">
              <div className="logo-mark">K</div>
              <span className="logo-name" style={{ color: '#0F172A' }}>Kiva360</span>
            </div>

            <h2 className="login-title">Bienvenido/a</h2>
            <p className="login-sub">Ingresa con la cuenta de tu colegio</p>

            <LoginForm />

            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94A3B8', marginTop: '1.5rem' }}>
              ¿Problemas para ingresar?{' '}
              <a href="mailto:soporte@kiva360.cl" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 600 }}>
                Contactar soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
