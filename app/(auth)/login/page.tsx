import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Kiva360 — Ingresa' }

export default function LoginPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #080C14;
          color: white;
          min-height: 100vh;
        }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
          overflow: hidden;
        }

        /* ── Fondo mesh animado ── */
        .mesh-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: #080C14;
          overflow: hidden;
        }
        .mesh-bg::before {
          content: '';
          position: absolute;
          top: -20%;
          left: -10%;
          width: 60%;
          height: 60%;
          background: radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%);
          animation: drift1 12s ease-in-out infinite alternate;
        }
        .mesh-bg::after {
          content: '';
          position: absolute;
          bottom: -20%;
          right: -10%;
          width: 55%;
          height: 55%;
          background: radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%);
          animation: drift2 15s ease-in-out infinite alternate;
        }
        .mesh-orb {
          position: absolute;
          top: 45%;
          left: 40%;
          width: 300px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%);
          animation: drift3 10s ease-in-out infinite alternate;
        }

        @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(5%,8%) scale(1.1); } }
        @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-6%,-5%) scale(1.15); } }
        @keyframes drift3 { from { transform: translate(0,0); } to { transform: translate(3%,-4%); } }

        /* Ruido de fondo */
        .noise {
          position: fixed;
          inset: 0;
          z-index: 1;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
          pointer-events: none;
        }

        /* ── Panel izquierdo ── */
        .left-panel {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          border-right: 1px solid rgba(255,255,255,0.05);
        }

        .logo-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .logo-mark {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #F59E0B, #EF4444);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          color: white;
          letter-spacing: -0.05em;
          box-shadow: 0 0 24px rgba(245,158,11,0.3);
        }
        .logo-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          color: white;
          letter-spacing: -0.02em;
        }

        .hero-block { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 2rem 0; }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.72rem;
          font-weight: 500;
          color: #F59E0B;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }
        .eyebrow-dot {
          width: 6px; height: 6px;
          background: #F59E0B;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(245,158,11,0.8);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 8px rgba(245,158,11,0.8); }
          50% { box-shadow: 0 0 16px rgba(245,158,11,1), 0 0 32px rgba(245,158,11,0.4); }
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.2rem, 3.5vw, 3rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.04em;
          color: white;
          margin-bottom: 1.2rem;
        }
        .hero-title .accent {
          background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-sub {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.4);
          line-height: 1.7;
          font-weight: 300;
          margin-bottom: 2.5rem;
          max-width: 420px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          padding: 0.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          transition: all 0.2s;
        }
        .feature-item:hover {
          background: rgba(245,158,11,0.06);
          border-color: rgba(245,158,11,0.15);
        }
        .feature-icon {
          font-size: 1rem;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .feature-text {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.5;
          font-weight: 400;
        }
        .feature-text strong {
          color: rgba(255,255,255,0.85);
          font-weight: 500;
          display: block;
          margin-bottom: 0.1rem;
        }

        .bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .integ-pills {
          display: flex;
          gap: 0.4rem;
        }
        .integ-pill {
          font-size: 0.62rem;
          font-weight: 500;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.05em;
        }
        .made-in {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.2);
        }

        /* ── Panel derecho — formulario ── */
        .right-panel {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: rgba(255,255,255,0.015);
        }

        .form-card {
          width: 100%;
          max-width: 420px;
        }

        .form-header { margin-bottom: 2.5rem; }
        .form-title {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin-bottom: 0.5rem;
        }
        .form-sub {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.35);
          font-weight: 300;
        }

        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .left-panel { display: none; }
        }
      `}</style>

      <div className="mesh-bg">
        <div className="mesh-orb" />
      </div>
      <div className="noise" />

      <div className="login-root">
        {/* Panel izquierdo */}
        <div className="left-panel">
          <div className="logo-row">
            <div className="logo-mark">K</div>
            <span className="logo-name">Kiva360</span>
          </div>

          <div className="hero-block">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              EdTech Chile · 2026
            </div>

            <h1 className="hero-title">
              La plataforma que los colegios{' '}
              <span className="accent">chilenos</span>{' '}
              estaban esperando
            </h1>

            <p className="hero-sub">
              SIGE · SAE · JUNAEB integrados en un solo lugar.
              Sin doble digitación, sin errores.
            </p>

            <div className="feature-grid">
              {[
                { icon: '📒', title: 'Libro Digital', desc: 'Conforme MINEDUC, sin papel' },
                { icon: '🔗', title: 'SIGE Integrado', desc: 'Declara con un clic' },
                { icon: '🎓', title: 'SAE Conectado', desc: 'Gestión de matrículas' },
                { icon: '💬', title: 'Comunicación', desc: 'Chat con apoderados' },
              ].map(f => (
                <div key={f.title} className="feature-item">
                  <span className="feature-icon">{f.icon}</span>
                  <div className="feature-text">
                    <strong>{f.title}</strong>
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bottom-row">
            <div className="integ-pills">
              {['SIGE', 'SAE', 'JUNAEB'].map(i => (
                <span key={i} className="integ-pill">{i}</span>
              ))}
            </div>
            <span className="made-in">🇨🇱 Hecho en Chile</span>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="right-panel">
          <div className="form-card">
            <div className="form-header">
              <h2 className="form-title">Bienvenido/a</h2>
              <p className="form-sub">Ingresa con la cuenta de tu colegio</p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  )
}
