import type { Metadata } from 'next'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = { title: 'Crear cuenta · Kiva360' }

export default function RegisterPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: white; }

        .reg-root { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }

        .reg-left {
          background: #0A0A0A; display: flex; flex-direction: column;
          justify-content: space-between; padding: 2.5rem; position: relative; overflow: hidden;
        }
        .reg-left::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 28px 28px; pointer-events: none;
        }
        .reg-logo { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; position: relative; z-index: 1; }
        .reg-logo-k { width: 30px; height: 30px; background: white; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 0.82rem; font-weight: 700; color: #0A0A0A; }
        .reg-logo-n { font-size: 0.92rem; font-weight: 600; color: white; letter-spacing: -0.02em; }

        .reg-hero { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 2rem 0; position: relative; z-index: 1; }
        .reg-steps { display: flex; flex-direction: column; gap: 0; margin-top: 2rem; }
        .reg-step { display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.75rem 0; border-bottom: 1px solid #1A1A1A; }
        .reg-step:last-child { border-bottom: none; }
        .reg-step-n { width: 20px; height: 20px; border-radius: 50%; background: #1A1A1A; border: 1px solid #333; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; color: #666; flex-shrink: 0; margin-top: 2px; }
        .reg-step-t { font-size: 0.78rem; color: #555; font-weight: 500; }
        .reg-step-d { font-size: 0.7rem; color: #333; margin-top: 0.15rem; }

        .reg-right { display: flex; align-items: center; justify-content: center; padding: 2.5rem; background: white; }
        .reg-form-wrap { width: 100%; max-width: 380px; }
        .reg-title { font-size: 1.5rem; font-weight: 700; color: #0A0A0A; letter-spacing: -0.04em; margin-bottom: 0.35rem; }
        .reg-sub { font-size: 0.82rem; color: #999; margin-bottom: 2rem; }

        @media (max-width: 768px) { .reg-root { grid-template-columns: 1fr; } .reg-left { display: none; } }
      `}</style>

      <div className="reg-root">
        <div className="reg-left">
          <a href="/" className="reg-logo">
            <div className="reg-logo-k">K</div>
            <span className="reg-logo-n">Kiva360</span>
          </a>
          <div className="reg-hero">
            <h1 style={{ fontFamily: 'Inter', fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', fontWeight: 700, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
              Tu colegio operativo<br />en 10 minutos
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#555', fontWeight: 300, lineHeight: 1.7 }}>
              Sin contratos, sin instalación.<br />30 días gratis, sin tarjeta de crédito.
            </p>
            <div className="reg-steps">
              {[
                { n: '01', t: 'Crea tu cuenta', d: 'Correo + contraseña, listo' },
                { n: '02', t: 'Registra tu colegio', d: 'RBD y datos básicos' },
                { n: '03', t: 'Activa integraciones', d: 'SIGE, SAE y JUNAEB' },
                { n: '04', t: 'Empieza hoy', d: 'Libro digital desde el primer día' },
              ].map(s => (
                <div key={s.n} className="reg-step">
                  <div className="reg-step-n">{s.n}</div>
                  <div>
                    <div className="reg-step-t">{s.t}</div>
                    <div className="reg-step-d">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: '0.65rem', color: '#333', position: 'relative', zIndex: 1 }}>🇨🇱 Hecho en Chile · kiva360.cl</p>
        </div>

        <div className="reg-right">
          <div className="reg-form-wrap">
            <h2 className="reg-title">Crear cuenta</h2>
            <p className="reg-sub">30 días gratis · Sin tarjeta de crédito</p>
            <RegisterForm />
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#999', marginTop: '1.25rem' }}>
              ¿Ya tienes cuenta?{' '}
              <a href="/login" style={{ color: '#0A0A0A', fontWeight: 500, textDecoration: 'none' }}>Ingresar →</a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
