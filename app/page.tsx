import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kiva360 — La plataforma que los colegios chilenos estaban esperando',
  description: 'Gestión escolar completa: libro de clases digital, evaluaciones, planificación, comunicación con apoderados y reportes. Hecho en Chile para colegios chilenos.',
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: #fff; color: #0A0A0A; }

        .c    { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
        .c-sm { max-width: 680px;  margin: 0 auto; padding: 0 1.5rem; }

        /* ── NAV ── */
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 56px; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid #F0F0F0; }
        .nav-i { height: 100%; display: flex; align-items: center; justify-content: space-between; max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
        .nav-logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
        .nav-logo-k { width: 28px; height: 28px; background: #0A0A0A; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; color: white; }
        .nav-logo-n { font-size: 0.9rem; font-weight: 600; color: #0A0A0A; letter-spacing: -0.02em; }
        .nav-links { display: flex; align-items: center; gap: 2rem; }
        .nav-lk { font-size: 0.82rem; color: #666; text-decoration: none; transition: color 0.15s; }
        .nav-lk:hover { color: #0A0A0A; }
        .nav-actions { display: flex; align-items: center; gap: 0.75rem; }
        .btn { font-size: 0.88rem; font-weight: 500; padding: 0.5rem 1.1rem; border-radius: 8px; text-decoration: none; transition: all 0.15s; display: inline-flex; align-items: center; gap: 0.4rem; border: none; cursor: pointer; font-family: inherit; }
        .btn-ghost { color: #444; background: transparent; }
        .btn-ghost:hover { color: #0A0A0A; }
        .btn-dark { background: #0A0A0A; color: white; }
        .btn-dark:hover { background: #1A1A1A; }
        .btn-outline { background: white; color: #0A0A0A; border: 1.5px solid #E0E0E0; }
        .btn-outline:hover { border-color: #0A0A0A; }
        .btn-lg { font-size: 1rem; font-weight: 600; padding: 0.75rem 1.75rem; border-radius: 10px; }
        .btn-xl { font-size: 1.05rem; font-weight: 700; padding: 0.9rem 2rem; border-radius: 10px; }

        /* ── HERO ── */
        .hero { padding: 7rem 0 5rem; text-align: center; }
        .hero-badge { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; font-weight: 500; color: #444; background: #F5F5F5; border: 1px solid #E8E8E8; border-radius: 20px; padding: 0.3rem 0.85rem; margin-bottom: 1.75rem; }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #16A34A; }
        .hero-h1 { font-size: clamp(2.2rem, 5vw, 3.8rem); font-weight: 800; letter-spacing: -0.05em; line-height: 1.08; color: #0A0A0A; margin-bottom: 1.25rem; }
        .hero-h1 span { color: #666; }
        .hero-sub { font-size: 1.1rem; color: #555; line-height: 1.7; max-width: 560px; margin: 0 auto 2.5rem; }
        .hero-actions { display: flex; align-items: center; justify-content: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 3rem; }
        .hero-social { display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.8rem; color: #999; }
        .hero-social-ava { width: 28px; height: 28px; border-radius: 50%; background: #E8E8E8; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 600; color: #666; margin-left: -8px; }
        .hero-social-ava:first-child { margin-left: 0; }

        /* ── DEMO PREVIEW ── */
        .preview { background: #0A0A0A; border-radius: 16px; padding: 1px; margin: 0 auto 6rem; max-width: 900px; box-shadow: 0 40px 80px rgba(0,0,0,0.15); }
        .preview-inner { background: #F5F6FA; border-radius: 15px; overflow: hidden; }
        .preview-bar { background: white; height: 44px; display: flex; align-items: center; gap: 0.5rem; padding: 0 1rem; border-bottom: 1px solid #E8E8E5; }
        .preview-dot { width: 10px; height: 10px; border-radius: 50%; }
        .preview-url { flex: 1; margin: 0 1rem; background: #F5F6FA; border-radius: 5px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: #9B9A97; }
        .preview-screen { display: grid; grid-template-columns: 200px 1fr; min-height: 420px; }
        .preview-sidebar { background: #FBFBFA; border-right: 1px solid #E8E8E5; padding: 1rem 0; }
        .preview-sb-logo { display: flex; align-items: center; gap: 0.4rem; padding: 0 0.75rem 0.75rem; border-bottom: 1px solid #E8E8E5; margin-bottom: 0.75rem; }
        .preview-sb-k { width: 20px; height: 20px; background: #37352F; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.58rem; font-weight: 700; color: white; }
        .preview-sb-n { font-size: 0.78rem; font-weight: 600; color: #37352F; }
        .preview-sb-item { font-size: 0.72rem; color: #6B6B6B; padding: 0.3rem 0.75rem; display: flex; align-items: center; gap: 0.4rem; }
        .preview-sb-item.active { color: #37352F; font-weight: 500; background: #EFEEEB; border-radius: 4px; margin: 0 0.4rem; }
        .preview-sb-section { font-size: 0.55rem; font-weight: 600; color: #C2C0BB; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.5rem 0.75rem 0.2rem; }
        .preview-content { padding: 1.25rem; }
        .preview-kpis { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; margin-bottom: 1rem; }
        .preview-kpi { background: white; border: 1px solid #E8E8E5; border-radius: 8px; padding: 0.65rem; }
        .preview-kpi-n { font-size: 0.55rem; color: #9B9A97; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.25rem; }
        .preview-kpi-v { font-size: 1.1rem; font-weight: 700; color: #37352F; }
        .preview-kpi-t { font-size: 0.55rem; color: #C2C0BB; }
        .preview-cards { display: grid; grid-template-columns: 1.5fr 1fr; gap: 8px; }
        .preview-card { background: white; border: 1px solid #E8E8E5; border-radius: 8px; padding: 0.75rem; }
        .preview-card-t { font-size: 0.62rem; font-weight: 600; color: #37352F; margin-bottom: 0.5rem; }
        .preview-row { height: 8px; background: #F0F0EE; border-radius: 4px; margin-bottom: 0.35rem; }
        .preview-row.w80 { width: 80%; } .preview-row.w60 { width: 60%; } .preview-row.w90 { width: 90%; } .preview-row.w70 { width: 70%; }
        .preview-alert { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 6px; padding: 0.4rem 0.6rem; font-size: 0.6rem; color: #DC2626; margin-bottom: 0.4rem; }
        .preview-ok { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 0.4rem 0.6rem; font-size: 0.6rem; color: #16A34A; }

        /* ── LOGOS ── */
        .logos { padding: 3rem 0; border-top: 1px solid #F0F0F0; border-bottom: 1px solid #F0F0F0; margin-bottom: 6rem; }
        .logos-title { text-align: center; font-size: 0.8rem; color: #999; margin-bottom: 1.5rem; letter-spacing: 0.04em; }
        .logos-row { display: flex; align-items: center; justify-content: center; gap: 3rem; flex-wrap: wrap; }
        .logos-item { font-size: 0.82rem; font-weight: 600; color: #CCC; letter-spacing: 0.04em; text-transform: uppercase; }

        /* ── SECCIONES ── */
        .section { padding: 5rem 0; }
        .section-badge { display: inline-block; font-size: 0.72rem; font-weight: 600; color: #666; background: #F5F5F5; padding: 0.25rem 0.75rem; border-radius: 20px; margin-bottom: 1rem; }
        .section-h2 { font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 800; letter-spacing: -0.04em; color: #0A0A0A; margin-bottom: 1rem; line-height: 1.15; }
        .section-sub { font-size: 1rem; color: #666; line-height: 1.7; max-width: 520px; }

        /* ── FEATURES ── */
        .features { padding: 5rem 0; background: #FAFAFA; }
        .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; margin-top: 3rem; }
        .feat-card { background: white; border: 1px solid #E8E8E8; border-radius: 12px; padding: 1.5rem; transition: all 0.2s; }
        .feat-card:hover { border-color: #0A0A0A; box-shadow: 0 8px 24px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .feat-icon { font-size: 1.5rem; margin-bottom: 0.85rem; }
        .feat-title { font-size: 1rem; font-weight: 700; color: #0A0A0A; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        .feat-desc { font-size: 0.85rem; color: #666; line-height: 1.65; }
        .feat-tag { display: inline-block; margin-top: 0.75rem; font-size: 0.68rem; font-weight: 600; color: #666; background: #F5F5F5; padding: 0.15rem 0.5rem; border-radius: 4px; }

        /* ── ROLES ── */
        .roles { padding: 5rem 0; }
        .roles-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 1.25rem; margin-top: 3rem; }
        .role-card { border-radius: 12px; padding: 1.75rem; }
        .role-card.director  { background: #0A0A0A; color: white; }
        .role-card.utp       { background: #F0F0EE; }
        .role-card.profesor  { background: #EFF6FF; }
        .role-card.apoderado { background: #F0FDF4; }
        .role-icon { font-size: 1.5rem; margin-bottom: 0.85rem; }
        .role-title { font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        .role-desc { font-size: 0.85rem; line-height: 1.65; opacity: 0.75; margin-bottom: 1rem; }
        .role-items { list-style: none; display: flex; flex-direction: column; gap: 0.35rem; }
        .role-item { font-size: 0.82rem; display: flex; align-items: flex-start; gap: 0.5rem; opacity: 0.85; }
        .role-item::before { content: '→'; opacity: 0.5; flex-shrink: 0; }

        /* ── TESTIMONIOS ── */
        .testimonios { padding: 5rem 0; background: #FAFAFA; }
        .test-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; margin-top: 3rem; }
        .test-card { background: white; border: 1px solid #E8E8E8; border-radius: 12px; padding: 1.5rem; }
        .test-stars { color: #F59E0B; font-size: 0.88rem; margin-bottom: 0.75rem; }
        .test-text { font-size: 0.88rem; color: #333; line-height: 1.7; margin-bottom: 1.25rem; font-style: italic; }
        .test-autor { display: flex; align-items: center; gap: 0.65rem; }
        .test-av { width: 36px; height: 36px; border-radius: 50%; background: #E8E8E8; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; color: #666; flex-shrink: 0; }
        .test-nombre { font-size: 0.82rem; font-weight: 600; color: #0A0A0A; }
        .test-cargo { font-size: 0.75rem; color: #999; }

        /* ── PRECIOS ── */
        .precios { padding: 5rem 0; }
        .precios-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; margin-top: 3rem; }
        .precio-card { border-radius: 12px; border: 1.5px solid #E8E8E8; padding: 1.75rem; position: relative; }
        .precio-card.popular { border-color: #0A0A0A; }
        .precio-popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #0A0A0A; color: white; font-size: 0.68rem; font-weight: 700; padding: 0.2rem 0.85rem; border-radius: 20px; white-space: nowrap; }
        .precio-nombre { font-size: 0.82rem; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.75rem; }
        .precio-valor { font-size: 2.5rem; font-weight: 800; color: #0A0A0A; letter-spacing: -0.05em; line-height: 1; margin-bottom: 0.25rem; }
        .precio-valor span { font-size: 1rem; font-weight: 500; color: #999; }
        .precio-desc { font-size: 0.82rem; color: #999; margin-bottom: 1.5rem; }
        .precio-items { list-style: none; display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.75rem; }
        .precio-item { font-size: 0.85rem; color: #333; display: flex; align-items: flex-start; gap: 0.5rem; }
        .precio-item::before { content: '✓'; color: #16A34A; font-weight: 700; flex-shrink: 0; }
        .precio-item.no::before { content: '✕'; color: #CCC; }
        .precio-item.no { color: #CCC; }
        .precio-cta { display: block; text-align: center; padding: 0.7rem; border-radius: 8px; font-size: 0.88rem; font-weight: 600; text-decoration: none; transition: all 0.15s; }
        .precio-cta-dark { background: #0A0A0A; color: white; }
        .precio-cta-dark:hover { background: #1A1A1A; }
        .precio-cta-outline { border: 1.5px solid #E8E8E8; color: #0A0A0A; }
        .precio-cta-outline:hover { border-color: #0A0A0A; }
        .precios-nota { text-align: center; font-size: 0.8rem; color: #999; margin-top: 1.5rem; }

        /* ── INTEGRACIONES ── */
        .integ { padding: 5rem 0; background: #0A0A0A; }
        .integ-h2 { color: white; }
        .integ-sub { color: #555; }
        .integ-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; margin-top: 3rem; }
        .integ-card { border: 1px solid #1A1A1A; border-radius: 10px; padding: 1.25rem; }
        .integ-icon { font-size: 1.5rem; margin-bottom: 0.6rem; }
        .integ-name { font-size: 0.9rem; font-weight: 700; color: white; margin-bottom: 0.3rem; }
        .integ-desc { font-size: 0.8rem; color: #555; line-height: 1.6; }
        .integ-badge { display: inline-block; margin-top: 0.5rem; font-size: 0.65rem; font-weight: 600; color: #16A34A; background: rgba(22,163,74,0.1); padding: 0.15rem 0.5rem; border-radius: 3px; }

        /* ── FAQ ── */
        .faq { padding: 5rem 0; }
        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 3rem; }
        .faq-item { border: 1px solid #F0F0F0; border-radius: 10px; padding: 1.25rem; }
        .faq-q { font-size: 0.92rem; font-weight: 600; color: #0A0A0A; margin-bottom: 0.5rem; }
        .faq-a { font-size: 0.85rem; color: #666; line-height: 1.65; }

        /* ── CTA FINAL ── */
        .cta-final { padding: 6rem 0; background: #0A0A0A; text-align: center; }
        .cta-final h2 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; color: white; letter-spacing: -0.04em; margin-bottom: 1rem; line-height: 1.15; }
        .cta-final p { font-size: 1rem; color: #555; max-width: 500px; margin: 0 auto 2.5rem; line-height: 1.7; }
        .cta-actions { display: flex; align-items: center; justify-content: center; gap: 0.75rem; flex-wrap: wrap; }
        .btn-white { background: white; color: #0A0A0A; }
        .btn-white:hover { background: #F5F5F5; }

        /* ── FOOTER ── */
        .footer { background: #0A0A0A; border-top: 1px solid #1A1A1A; padding: 2.5rem 0; }
        .footer-i { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
        .footer-logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
        .footer-logo-k { width: 22px; height: 22px; background: white; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.62rem; font-weight: 700; color: #0A0A0A; }
        .footer-logo-n { font-size: 0.82rem; font-weight: 600; color: white; }
        .footer-links { display: flex; gap: 1.5rem; }
        .footer-lk { font-size: 0.78rem; color: #555; text-decoration: none; transition: color 0.15s; }
        .footer-lk:hover { color: white; }
        .footer-copy { font-size: 0.75rem; color: #444; }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .features-grid, .roles-grid, .test-grid, .precios-grid, .integ-grid, .faq-grid { grid-template-columns: 1fr; }
          .preview-screen { grid-template-columns: 1fr; }
          .preview-sidebar { display: none; }
          .preview-kpis { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-i">
          <a href="/" className="nav-logo">
            <div className="nav-logo-k">K</div>
            <span className="nav-logo-n">Kiva360</span>
          </a>
          <div className="nav-links">
            <a href="#funcionalidades" className="nav-lk">Funcionalidades</a>
            <a href="#roles" className="nav-lk">Roles</a>
            <a href="#precios" className="nav-lk">Precios</a>
            <a href="#faq" className="nav-lk">FAQ</a>
          </div>
          <div className="nav-actions">
            <a href="/login" className="btn btn-ghost">Iniciar sesión</a>
            <a href="/register" className="btn btn-dark">Prueba gratis →</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" style={{ paddingTop: '7rem' }}>
        <div className="c-sm">
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            Hecho en Chile 🇨🇱 · Para colegios chilenos
          </div>
          <h1 className="hero-h1">
            La plataforma que<br />
            <span>tu colegio necesitaba</span><br />
            desde hace años
          </h1>
          <p className="hero-sub">
            Libro de clases digital, evaluaciones, planificación curricular, ficha del estudiante y comunicación con apoderados — todo en un solo lugar, sin doble digitación.
          </p>
          <div className="hero-actions">
            <a href="/register" className="btn btn-dark btn-xl">Comenzar gratis →</a>
            <a href="#funcionalidades" className="btn btn-outline btn-lg">Ver funcionalidades</a>
          </div>
          <div className="hero-social">
            <div style={{ display: 'flex' }}>
              {['JR','MP','CS','AV','TH'].map(i => (
                <div key={i} className="hero-social-ava">{i}</div>
              ))}
            </div>
            <span>+50 directivos y profesores ya lo están usando</span>
          </div>
        </div>
      </section>

      {/* PREVIEW */}
      <div className="c" style={{ marginBottom: '5rem' }}>
        <div className="preview">
          <div className="preview-inner">
            <div className="preview-bar">
              <div className="preview-dot" style={{ background: '#FF5F57' }} />
              <div className="preview-dot" style={{ background: '#FFBD2E' }} />
              <div className="preview-dot" style={{ background: '#28CA41' }} />
              <div className="preview-url">kiva360.cl/dashboard</div>
            </div>
            <div className="preview-screen">
              <div className="preview-sidebar">
                <div className="preview-sb-logo">
                  <div className="preview-sb-k">K</div>
                  <span className="preview-sb-n">Kiva360</span>
                </div>
                <div className="preview-sb-section">Principal</div>
                <div className="preview-sb-item active">○ Dashboard</div>
                <div className="preview-sb-item">▦ Libro de Clases</div>
                <div className="preview-sb-item">✎ Evaluaciones</div>
                <div className="preview-sb-item">◫ Planificación</div>
                <div className="preview-sb-item">◈ Alumnos</div>
                <div className="preview-sb-section">Gestión</div>
                <div className="preview-sb-item">◉ Comunicación</div>
                <div className="preview-sb-item">◧ Reportes</div>
                <div className="preview-sb-item">◎ Cobranzas</div>
              </div>
              <div className="preview-content">
                <div style={{ fontSize: '0.65rem', color: '#9B9A97', marginBottom: '0.3rem' }}>Lunes, 24 de mayo</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#37352F', marginBottom: '1rem' }}>Hola, director 👋</div>
                <div className="preview-kpis">
                  {[
                    { n: 'Estudiantes', v: '287' },
                    { n: 'Asistencia hoy', v: '94%' },
                    { n: 'Evaluaciones', v: '12' },
                    { n: 'En riesgo', v: '3' },
                  ].map(k => (
                    <div key={k.n} className="preview-kpi">
                      <div className="preview-kpi-n">{k.n}</div>
                      <div className="preview-kpi-v">{k.v}</div>
                    </div>
                  ))}
                </div>
                <div className="preview-cards">
                  <div className="preview-card">
                    <div className="preview-card-t">Actividad reciente</div>
                    <div className="preview-row w90" style={{ background: '#E8E8E5' }} />
                    <div className="preview-row w70" style={{ background: '#E8E8E5' }} />
                    <div className="preview-row w80" style={{ background: '#E8E8E5' }} />
                    <div className="preview-row w60" style={{ background: '#E8E8E5' }} />
                  </div>
                  <div className="preview-card">
                    <div className="preview-card-t">Alertas</div>
                    <div className="preview-alert">⚠ Diego F. — asistencia 68%</div>
                    <div className="preview-ok">✓ Declaración SIGE enviada</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOGOS */}
      <div className="logos">
        <div className="c">
          <div className="logos-title">ALINEADO CON LA NORMATIVA EDUCATIVA CHILENA</div>
          <div className="logos-row">
            {['MINEDUC', 'LEY 20.370', 'PIE', 'SEP', 'PAE', 'OA CURRÍCULUM', 'LEY 19.628'].map(l => (
              <div key={l} className="logos-item">{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="features" id="funcionalidades">
        <div className="c">
          <div className="c-sm" style={{ margin: '0 auto 0' }}>
            <div className="section-badge">Funcionalidades</div>
            <h2 className="section-h2">Todo lo que un colegio necesita, en un solo sistema</h2>
            <p className="section-sub">Sin papeles, sin Excel, sin doble digitación. Kiva360 centraliza la gestión escolar completa.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: '📒', title: 'Libro de clases digital', desc: 'Asistencia, notas y hoja de vida del alumno en un solo lugar. Cumple con la normativa MINEDUC.', tag: 'Para profesores' },
              { icon: '🗓️', title: 'Planificador de clases', desc: 'Diseña tus clases con OA, estrategias didácticas y recursos. Banco de estrategias integrado.', tag: 'Para profesores' },
              { icon: '📚', title: 'Biblioteca histórica', desc: 'Explora planificaciones de años anteriores, ve qué funcionó y clona las mejores clases.', tag: 'Novedad' },
              { icon: '👥', title: 'Ficha del estudiante', desc: 'Historial académico, anotaciones, derivaciones a profesionales y entrevistas con apoderados.', tag: 'Integral' },
              { icon: '📋', title: 'Panel UTP', desc: 'Supervisa planificaciones, cobertura curricular, alumnos en riesgo y sesiones de co-docencia.', tag: 'Para UTP' },
              { icon: '🏫', title: 'Panel Director', desc: 'Vista ejecutiva con alertas tempranas, KPIs en tiempo real y acceso a todos los módulos.', tag: 'Para dirección' },
              { icon: '💰', title: 'Cobranzas y aranceles', desc: 'Gestiona planes de pago, cuotas y registra pagos. Control financiero integrado.', tag: 'Para administración' },
              { icon: '👨‍👩‍👧', title: 'Portal apoderado', desc: 'Los apoderados ven notas, asistencia y pueden comunicarse directamente con el colegio.', tag: 'Para familias' },
              { icon: '🤝', title: 'Espacio colaborativo', desc: 'Comparte recursos didácticos, programa co-docencia y trabaja en equipo con tus colegas.', tag: 'Para docentes' },
            ].map(f => (
              <div key={f.title} className="feat-card">
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
                <div className="feat-tag">{f.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="roles" id="roles">
        <div className="c">
          <div className="c-sm" style={{ margin: '0 auto 0' }}>
            <div className="section-badge">Por rol</div>
            <h2 className="section-h2">Cada actor del colegio tiene su propio espacio</h2>
            <p className="section-sub">Kiva360 se adapta a cada rol — director, UTP, profesor y apoderado ven exactamente lo que necesitan.</p>
          </div>
          <div className="roles-grid">
            {[
              {
                cls: 'director', icon: '🏫', title: 'Director/a',
                desc: 'Panorámica completa del establecimiento en tiempo real.',
                items: ['Alertas tempranas automáticas', 'KPIs académicos y financieros', 'Supervisión de todo el equipo', 'Reportes para el sostenedor']
              },
              {
                cls: 'utp', icon: '📋', title: 'UTP',
                desc: 'Supervisión curricular y acompañamiento docente.',
                items: ['Cobertura de OA por asignatura', 'Supervisión de planificaciones', 'Alumnos en riesgo académico', 'Coordinación de co-docencia']
              },
              {
                cls: 'profesor', icon: '👩‍🏫', title: 'Profesor/a',
                desc: 'Todo el trabajo pedagógico en un solo lugar.',
                items: ['Libro de clases digital', 'Planificador con estrategias', 'Ficha completa de cada alumno', 'Comunicación directa con familias']
              },
              {
                cls: 'apoderado', icon: '👨‍👩‍👧', title: 'Apoderado/a',
                desc: 'Seguimiento del rendimiento de su hijo/a.',
                items: ['Notas y asistencia en tiempo real', 'Alertas automáticas', 'Agenda de entrevistas', 'Mensajes directos con el colegio']
              },
            ].map(r => (
              <div key={r.title} className={`role-card ${r.cls}`}>
                <div className="role-icon">{r.icon}</div>
                <div className="role-title">{r.title}</div>
                <div className="role-desc">{r.desc}</div>
                <ul className="role-items">
                  {r.items.map(i => <li key={i} className="role-item">{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="testimonios">
        <div className="c">
          <div className="c-sm" style={{ margin: '0 auto 0' }}>
            <div className="section-badge">Testimonios</div>
            <h2 className="section-h2">Lo que dicen los colegios que lo están usando</h2>
          </div>
          <div className="test-grid">
            {[
              {
                texto: 'Antes pasaba 2 horas semanales copiando notas entre sistemas. Con Kiva360 lo hago en 15 minutos y tengo todo en un solo lugar.',
                nombre: 'María González', cargo: 'Profesora Jefe · 3°A Básico', iniciales: 'MG'
              },
              {
                texto: 'Como directora, finalmente tengo visibilidad en tiempo real de lo que pasa en el colegio. Las alertas tempranas me han permitido actuar antes.',
                nombre: 'Carolina Silva', cargo: 'Directora · Colegio San Patricio', iniciales: 'CS'
              },
              {
                texto: 'La biblioteca de planificaciones fue una sorpresa. Mis profesores ahora colaboran y aprovechan el trabajo de años anteriores.',
                nombre: 'Jorge Reyes', cargo: 'Jefe de UTP · Colegio del Valle', iniciales: 'JR'
              },
            ].map(t => (
              <div key={t.nombre} className="test-card">
                <div className="test-stars">★★★★★</div>
                <p className="test-text">"{t.texto}"</p>
                <div className="test-autor">
                  <div className="test-av">{t.iniciales}</div>
                  <div>
                    <div className="test-nombre">{t.nombre}</div>
                    <div className="test-cargo">{t.cargo}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="precios" id="precios">
        <div className="c">
          <div className="c-sm" style={{ margin: '0 auto 0' }}>
            <div className="section-badge">Precios</div>
            <h2 className="section-h2">Simple, transparente, sin sorpresas</h2>
            <p className="section-sub">Precios en pesos chilenos, sin contratos largos. Cancela cuando quieras.</p>
          </div>
          <div className="precios-grid">
            {[
              {
                nombre: 'Básico', valor: '$29.990', periodo: '/mes', desc: 'Para colegios pequeños hasta 200 alumnos',
                popular: false, cta: 'Comenzar gratis', ctaCls: 'precio-cta-outline',
                items: [
                  { t: 'Hasta 200 alumnos', ok: true },
                  { t: 'Libro de clases digital', ok: true },
                  { t: 'Evaluaciones y notas', ok: true },
                  { t: 'Portal apoderado', ok: true },
                  { t: 'Planificador de clases', ok: false },
                  { t: 'Ficha del estudiante', ok: false },
                  { t: 'Cobranzas y aranceles', ok: false },
                ]
              },
              {
                nombre: 'Completo', valor: '$59.990', periodo: '/mes', desc: 'Para colegios que quieren el sistema completo',
                popular: true, cta: 'Comenzar gratis', ctaCls: 'precio-cta-dark',
                items: [
                  { t: 'Alumnos ilimitados', ok: true },
                  { t: 'Todos los módulos básicos', ok: true },
                  { t: 'Planificador + Biblioteca', ok: true },
                  { t: 'Ficha completa del estudiante', ok: true },
                  { t: 'Cobranzas y aranceles', ok: true },
                  { t: 'Espacio colaborativo', ok: true },
                  { t: 'Soporte prioritario', ok: true },
                ]
              },
              {
                nombre: 'Red de Colegios', valor: 'A convenir', periodo: '', desc: 'Para sostenedores con múltiples establecimientos',
                popular: false, cta: 'Contactar', ctaCls: 'precio-cta-outline',
                items: [
                  { t: 'Múltiples establecimientos', ok: true },
                  { t: 'Dashboard del sostenedor', ok: true },
                  { t: 'Todo el plan Completo', ok: true },
                  { t: 'Implementación guiada', ok: true },
                  { t: 'Capacitación para equipos', ok: true },
                  { t: 'SLA garantizado', ok: true },
                  { t: 'Integración API Gateway', ok: true },
                ]
              },
            ].map(p => (
              <div key={p.nombre} className={`precio-card${p.popular ? ' popular' : ''}`}>
                {p.popular && <div className="precio-popular-badge">Más elegido</div>}
                <div className="precio-nombre">{p.nombre}</div>
                <div className="precio-valor">{p.valor}<span>{p.periodo}</span></div>
                <div className="precio-desc">{p.desc}</div>
                <ul className="precio-items">
                  {p.items.map(i => (
                    <li key={i.t} className={`precio-item${i.ok ? '' : ' no'}`}>{i.t}</li>
                  ))}
                </ul>
                <a href="/register" className={`precio-cta ${p.ctaCls}`}>{p.cta}</a>
              </div>
            ))}
          </div>
          <p className="precios-nota">14 días de prueba gratis · Sin tarjeta de crédito · Cancela cuando quieras</p>
        </div>
      </section>

      {/* INTEGRACIONES */}
      <section className="integ">
        <div className="c">
          <div className="c-sm" style={{ margin: '0 auto 0' }}>
            <div className="section-badge" style={{ background: '#1A1A1A', color: '#555' }}>Integraciones</div>
            <h2 className="section-h2 integ-h2">Pensado para la realidad educativa chilena</h2>
            <p className="section-sub integ-sub">Kiva360 genera los documentos y archivos que el MINEDUC requiere, en el formato correcto.</p>
          </div>
          <div className="integ-grid">
            {[
              { icon: '🔗', name: 'Compatible con SIGE', desc: 'Genera los reportes de asistencia y matrícula en el formato que SIGE requiere para importación.', badge: 'Exportación' },
              { icon: '🎓', name: 'Compatible con SAE', desc: 'Gestiona tu nómina de postulantes y matrícula preferente dentro de Kiva360.', badge: 'Gestión interna' },
              { icon: '🍽️', name: 'Compatible con JUNAEB', desc: 'Registra beneficiarios PAE, SEP y TNE en la ficha del alumno para tener todo centralizado.', badge: 'Registro interno' },
              { icon: '📚', name: 'Currículum MINEDUC', desc: 'OA actualizados por asignatura y nivel. Planificación 100% alineada al currículum nacional.', badge: 'Integrado' },
              { icon: '📧', name: 'Email con Resend', desc: 'Notificaciones automáticas por email a apoderados. Configurable con el dominio de tu colegio.', badge: 'Integrado' },
              { icon: '🔌', name: 'API Gateway EdTech', desc: 'Próximamente: conecta Kiva360 con otras plataformas EdTech a través de nuestra API.', badge: 'Próximamente' },
            ].map(i => (
              <div key={i.name} className="integ-card">
                <div className="integ-icon">{i.icon}</div>
                <div className="integ-name">{i.name}</div>
                <div className="integ-desc">{i.desc}</div>
                <div className="integ-badge">{i.badge}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="c">
          <div className="c-sm" style={{ margin: '0 auto 0' }}>
            <div className="section-badge">FAQ</div>
            <h2 className="section-h2">Preguntas frecuentes</h2>
          </div>
          <div className="faq-grid">
            {[
              { q: '¿Cuánto tiempo toma implementar Kiva360?', a: 'El proceso de registro y configuración toma menos de 30 minutos. Importas la nómina de alumnos, creas los usuarios del equipo y ya está listo para usar.' },
              { q: '¿Pueden acceder los apoderados?', a: 'Sí. Los apoderados tienen su propio portal donde ven las notas, asistencia y pueden comunicarse directamente con el colegio.' },
              { q: '¿Funciona sin internet?', a: 'La app móvil para pasar asistencia funciona offline y sincroniza cuando recuperas conexión. El resto del sistema requiere internet.' },
              { q: '¿Es seguro? ¿Dónde están los datos?', a: 'Los datos se almacenan en servidores seguros con cifrado AES-256. Cumplimos con la Ley 19.628 de protección de datos personales de Chile.' },
              { q: '¿Puedo usar Kiva360 si ya tengo otro sistema?', a: 'Sí. Kiva360 puede coexistir con otros sistemas. Además, si eres desarrollador de otra plataforma EdTech, puedes usar nuestra API Gateway.' },
              { q: '¿Hay soporte en español?', a: 'Todo el soporte es en español. Tenemos chat en la plataforma, email y videollamadas para ayudarte con la implementación.' },
            ].map(f => (
              <div key={f.q} className="faq-item">
                <div className="faq-q">{f.q}</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final">
        <div className="c-sm">
          <h2>¿Listo para transformar la gestión de tu colegio?</h2>
          <p>Únete a los colegios chilenos que ya dejaron atrás el Excel y el papel.</p>
          <div className="cta-actions">
            <a href="/register" className="btn btn-white btn-xl">Comenzar gratis →</a>
            <a href="mailto:contacto@kiva360.cl" className="btn btn-lg" style={{ color: '#555', background: 'transparent', border: '1px solid #333' }}>
              Hablar con el equipo
            </a>
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#444' }}>
            14 días gratis · Sin tarjeta de crédito · Soporte en español
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="c">
          <div className="footer-i">
            <a href="/" className="footer-logo">
              <div className="footer-logo-k">K</div>
              <span className="footer-logo-n">Kiva360</span>
            </a>
            <div className="footer-links">
              <a href="/login"    className="footer-lk">Iniciar sesión</a>
              <a href="/register" className="footer-lk">Registro</a>
              <a href="mailto:contacto@kiva360.cl" className="footer-lk">Contacto</a>
            </div>
            <div className="footer-copy">🇨🇱 Hecho en Chile · © 2026 Kiva360 SpA</div>
          </div>
        </div>
      </footer>
    </>
  )
}
