import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Ingresar · Kiva360' }

export default function LoginPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: white; color: #0A0A0A; }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        /* ── Panel izquierdo ── */
        .l-left {
          background: #0A0A0A;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem;
          position: relative;
          overflow: hidden;
        }
        /* Grid de puntos decorativo */
        .l-left::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        .l-logo {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 0.6rem;
        }
        .l-logo-k {
          width: 30px; height: 30px; background: white; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.82rem; font-weight: 700; color: #0A0A0A; letter-spacing: -0.04em;
        }
        .l-logo-n { font-size: 0.92rem; font-weight: 600; color: white; letter-spacing: -0.02em; }

        .l-hero { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 2rem 0; }
        .l-eyebrow {
          font-size: 0.68rem; font-weight: 500; color: #555;
          letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.2rem;
        }
        .l-title {
          font-size: clamp(1.8rem, 2.5vw, 2.6rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.1;
          color: white;
          margin-bottom: 1.2rem;
        }
        .l-sub {
          font-size: 0.85rem; color: #555; font-weight: 400;
          line-height: 1.7; margin-bottom: 2.5rem; max-width: 380px;
        }
        .l-features { display: flex; flex-direction: column; gap: 0.6rem; }
        .l-feat {
          display: flex; align-items: center; gap: 0.75rem;
          font-size: 0.78rem; color: #666; font-weight: 400;
          padding: 0.6rem 0;
          border-bottom: 1px solid #1A1A1A;
        }
        .l-feat:last-child { border-bottom: none; }
        .l-feat-check {
          width: 16px; height: 16px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid #333;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.55rem; color: #666; flex-shrink: 0;
        }

        .l-footer {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: space-between;
        }
        .l-chips { display: flex; gap: 0.4rem; }
        .l-chip {
          font-size: 0.6rem; font-weight: 500; color: #444;
          padding: 0.2rem 0.6rem; border-radius: 20px;
          border: 1px solid #222; background: transparent;
          letter-spacing: 0.04em;
        }
        .l-made { font-size: 0.65rem; color: #333; }

        /* ── Panel derecho ── */
        .l-right {
          display: flex; align-items: center; justify-content: center;
          padding: 2.5rem; background: white;
        }
        .l-form-wrap { width: 100%; max-width: 360px; }
        .l-form-title {
          font-size: 1.5rem; font-weight: 700; color: #0A0A0A;
          letter-spacing: -0.04em; margin-bottom: 0.35rem;
        }
        .l-form-sub { font-size: 0.82rem; color: #999; margin-bottom: 2rem; font-weight: 400; }

        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .l-left { display: none; }
        }
      `}</style>

      <div className="login-root">
        {/* Izquierdo */}
        <div className="l-left">
          <div className="l-logo">
            <div className="l-logo-k">K</div>
            <span className="l-logo-n">Kiva360</span>
          </div>

          <div className="l-hero">
            <div className="l-eyebrow">Gestión escolar · Chile</div>
            <h1 className="l-title">
              La plataforma que<br />los colegios chilenos<br />estaban esperando
            </h1>
            <p className="l-sub">
              SIGE · SAE · JUNAEB integrados.<br />
              Sin doble digitación. Sin errores.
            </p>
            <div className="l-features">
              {[
                'Libro de clases digital conforme MINEDUC',
                'Integración directa SIGE, SAE y JUNAEB',
                'Comunicación con apoderados en tiempo real',
                'Dashboard de gestión para directivos',
              ].map(f => (
                <div key={f} className="l-feat">
                  <div className="l-feat-check">✓</div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="l-footer">
            <div className="l-chips">
              {['SIGE', 'SAE', 'JUNAEB'].map(c => (
                <span key={c} className="l-chip">{c}</span>
              ))}
            </div>
            <span className="l-made">🇨🇱 Hecho en Chile</span>
          </div>
        </div>

        {/* Derecho */}
        <div className="l-right">
          <div className="l-form-wrap">
            <h2 className="l-form-title">Bienvenido/a</h2>
            <p className="l-form-sub">Ingresa con la cuenta de tu colegio</p>
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  )
}
