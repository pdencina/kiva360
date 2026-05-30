import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kiva360 — Gestión escolar para colegios chilenos',
  description: 'Libro de clases digital, evaluaciones, planificación curricular y comunicación con apoderados. Hecho en Chile.',
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: #fff; color: #0F2540; }

        /* ── MOBILE FIRST BASE ── */
        .wrap { max-width: 1100px; margin: 0 auto; padding: 0 1.25rem; }

        /* NAV */
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 52px; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid #F0F0F0; }
        .nav-i { height: 100%; max-width: 1100px; margin: 0 auto; padding: 0 1.25rem; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
        .nav-k { display: flex; align-items: center; justify-content: center; }
        .nav-n { font-size: 0.88rem; font-weight: 700; color: #0F2540; }
        .nav-links { display: none; }
        .nav-cta { display: flex; align-items: center; gap: 0.5rem; }
        .btn { display: inline-flex; align-items: center; justify-content: center; font-family: inherit; font-weight: 600; border: none; cursor: pointer; text-decoration: none; transition: all 0.15s; border-radius: 8px; }
        .btn-sm { font-size: 0.78rem; padding: 0.4rem 0.85rem; }
        .btn-md { font-size: 0.88rem; padding: 0.55rem 1.1rem; }
        .btn-lg { font-size: 1rem; padding: 0.75rem 1.5rem; border-radius: 10px; }
        .btn-dark { background: #1E3A5F; color: white; }
        .btn-dark:hover { background: #222; }
        .btn-outline { background: white; color: #1E3A5F; border: 1.5px solid #DDD; }
        .btn-outline:hover { border-color: #1E3A5F; }
        .btn-ghost { background: transparent; color: #555; font-weight: 500; }
        .btn-white { background: white; color: #1E3A5F; }

        /* HERO */
        .hero { padding: 5.5rem 0 3rem; text-align: center; }
        .hero-badge { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; font-weight: 500; color: #444; background: #F5F5F5; border: 1px solid #E8E8E8; border-radius: 20px; padding: 0.28rem 0.8rem; margin-bottom: 1.5rem; }
        .hero-dot { width: 6px; height: 6px; border-radius: 50%; background: #16A34A; flex-shrink: 0; }
        .hero-h1 { font-size: 2.4rem; font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; color: #0F2540; margin-bottom: 1rem; }
        .hero-h1 em { color: #666; font-style: normal; }
        .hero-p { font-size: 0.95rem; color: #555; line-height: 1.7; margin-bottom: 2rem; max-width: 480px; margin-left: auto; margin-right: auto; }
        .hero-btns { display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 2rem; }
        .hero-social { display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.75rem; color: #999; flex-wrap: wrap; }
        .hero-avs { display: flex; }
        .hero-av { width: 26px; height: 26px; border-radius: 50%; background: #E8E8E8; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 600; color: #666; margin-left: -6px; }
        .hero-av:first-child { margin-left: 0; }

        /* PREVIEW MÓVIL — scroll horizontal */
        .preview-section { margin: 0 0 4rem; overflow: hidden; }
        .preview-label { text-align: center; font-size: 0.7rem; font-weight: 600; color: #999; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1.25rem; }
        .preview-scroll { display: flex; gap: 0.75rem; overflow-x: auto; padding: 0.5rem 1.25rem 1.25rem; scrollbar-width: none; -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory; }
        .preview-scroll::-webkit-scrollbar { display: none; }
        .preview-card { flex-shrink: 0; width: 280px; scroll-snap-align: start; background: #1E3A5F; border-radius: 12px; padding: 1px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .preview-inner { background: white; border-radius: 11px; overflow: hidden; }
        .preview-bar { height: 28px; display: flex; align-items: center; gap: 0.25rem; padding: 0 0.6rem; border-bottom: 1px solid #F0F0F0; background: #FAFAF8; }
        .preview-dot2 { width: 6px; height: 6px; border-radius: 50%; }
        .preview-url2 { flex: 1; text-align: center; font-size: 0.45rem; color: #C2C0BB; }
        .preview-body { padding: 0.75rem; }
        .pv-title { font-size: 0.52rem; color: #9B9A97; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.2rem; }
        .pv-h { font-size: 0.7rem; font-weight: 700; color: #37352F; margin-bottom: 0.5rem; }
        .pv-alert-r { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 4px; padding: 0.22rem 0.4rem; font-size: 0.47rem; color: #DC2626; font-weight: 500; margin-bottom: 0.22rem; }
        .pv-alert-y { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 4px; padding: 0.22rem 0.4rem; font-size: 0.47rem; color: #D97706; font-weight: 500; margin-bottom: 0.45rem; }
        .pv-kpis { display: grid; grid-template-columns: repeat(4,1fr); gap: 0.22rem; }
        .pv-kpi { background: #FAFAF8; border: 1px solid #E8E8E5; border-radius: 4px; padding: 0.3rem 0.15rem; text-align: center; }
        .pv-kpi-v { font-size: 0.6rem; font-weight: 700; color: #37352F; }
        .pv-kpi-n { font-size: 0.38rem; color: #9B9A97; text-transform: uppercase; letter-spacing: 0.03em; }
        .pv-hero2 { background: #37352F; border-radius: 6px; padding: 0.5rem; margin-bottom: 0.4rem; display: flex; gap: 0.4rem; align-items: center; }
        .pv-av { width: 22px; height: 22px; border-radius: 4px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 0.45rem; font-weight: 700; color: white; flex-shrink: 0; }
        .pv-nom { font-size: 0.52rem; font-weight: 700; color: white; }
        .pv-meta { font-size: 0.4rem; color: rgba(255,255,255,0.5); }
        .pv-prom { margin-left: auto; font-size: 0.65rem; font-weight: 700; color: #FCD34D; }
        .pv-tabs { display: flex; gap: 0.4rem; border-bottom: 1px solid #F0F0EE; padding-bottom: 0.25rem; margin-bottom: 0.35rem; }
        .pv-tab { font-size: 0.42rem; color: #C2C0BB; }
        .pv-tab.on { color: #37352F; font-weight: 700; border-bottom: 1.5px solid #37352F; margin-bottom: -1px; }
        .pv-nota-row { display: flex; gap: 0.3rem; align-items: center; padding: 0.18rem 0; border-bottom: 1px solid #F5F5F3; }
        .pv-nota-asig { flex: 1; font-size: 0.47rem; color: #37352F; }
        .pv-nota-v { font-size: 0.55rem; font-weight: 700; }
        .pv-adm-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.22rem; margin-bottom: 0.4rem; }
        .pv-adm-stat { background: #FAFAF8; border: 1px solid #E8E8E5; border-radius: 4px; padding: 0.28rem; text-align: center; }
        .pv-adm-v { font-size: 0.6rem; font-weight: 700; color: #37352F; }
        .pv-adm-n { font-size: 0.38rem; color: #9B9A97; }
        .pv-post-row { display: flex; align-items: center; gap: 0.3rem; padding: 0.18rem 0; border-bottom: 1px solid #F5F5F3; }
        .pv-post-av { width: 14px; height: 14px; border-radius: 3px; background: #F0F0EE; display: flex; align-items: center; justify-content: center; font-size: 0.35rem; font-weight: 700; color: #6B6B6B; flex-shrink: 0; }
        .pv-post-n { flex: 1; font-size: 0.45rem; color: #37352F; font-weight: 500; }
        .pv-post-niv { font-size: 0.38rem; color: #9B9A97; }
        .pv-post-est { font-size: 0.38rem; font-weight: 600; padding: 0.07rem 0.25rem; border-radius: 3px; }
        .pv-badge-b { background: #EFF6FF; color: #2563EB; }
        .pv-badge-g { background: #F0FDF4; color: #16A34A; }
        .pv-badge-y { background: #FFFBEB; color: #D97706; }
        .pv-badge-n { background: #F5F5F3; color: #9B9A97; }
        .pv-sae-note { margin-top: 0.4rem; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 4px; padding: 0.22rem 0.4rem; font-size: 0.42rem; color: #2563EB; font-weight: 500; }
        .preview-dots { display: flex; justify-content: center; gap: 0.4rem; margin-top: 0.5rem; }
        .preview-dot-i { width: 5px; height: 5px; border-radius: 50%; background: #E8E8E8; }
        .preview-dot-i.on { background: #1E3A5F; width: 14px; border-radius: 3px; }

        /* NORMATIVA */
        .norms { border-top: 1px solid #F0F0F0; border-bottom: 1px solid #F0F0F0; padding: 1.5rem 0; margin-bottom: 3.5rem; }
        .norms-lbl { text-align: center; font-size: 0.65rem; font-weight: 600; color: #CCC; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1rem; }
        .norms-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.65rem 1.25rem; }
        .norms-item { font-size: 0.72rem; font-weight: 600; color: #CCC; }

        /* SECTION */
        .sec { padding: 3.5rem 0; }
        .sec-badge { display: inline-block; font-size: 0.7rem; font-weight: 600; color: #666; background: #F5F5F5; padding: 0.22rem 0.7rem; border-radius: 20px; margin-bottom: 0.75rem; }
        .sec-h2 { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.04em; color: #0F2540; line-height: 1.15; margin-bottom: 0.75rem; }
        .sec-p { font-size: 0.88rem; color: #666; line-height: 1.7; margin-bottom: 2rem; }

        /* FEATURES */
        .feat-bg { background: #FAFAFA; }
        .feat-grid { display: flex; flex-direction: column; gap: 0.75rem; }
        .feat-card { background: white; border: 1px solid #E8E8E8; border-radius: 12px; padding: 1.25rem; }
        .feat-ic { width: 32px; height: 32px; background: #F0F0EE; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; color: #37352F; margin-bottom: 0.75rem; }
        .feat-t { font-size: 0.95rem; font-weight: 700; color: #0F2540; margin-bottom: 0.35rem; }
        .feat-d { font-size: 0.82rem; color: #666; line-height: 1.6; }
        .feat-tag { display: inline-block; margin-top: 0.6rem; font-size: 0.65rem; font-weight: 600; color: #888; background: #F5F5F5; padding: 0.12rem 0.45rem; border-radius: 4px; }

        /* ROLES */
        .roles-grid { display: flex; flex-direction: column; gap: 0.75rem; }
        .role-card { border-radius: 12px; padding: 1.5rem; }
        .role-card.dir { background: #1E3A5F; }
        .role-card.utp { background: #F0F0EE; }
        .role-card.prof { background: #EFF6FF; }
        .role-card.apod { background: #F0FDF4; }
        .role-ic { font-size: 1.25rem; margin-bottom: 0.6rem; }
        .role-t { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.3rem; letter-spacing: -0.01em; }
        .role-d { font-size: 0.82rem; line-height: 1.6; opacity: 0.7; margin-bottom: 0.75rem; }
        .role-items { list-style: none; display: flex; flex-direction: column; gap: 0.3rem; }
        .role-item { font-size: 0.8rem; display: flex; gap: 0.4rem; opacity: 0.8; }
        .role-item::before { content: '→'; opacity: 0.4; flex-shrink: 0; }

        /* TESTIMONIOS */
        .test-bg { background: #FAFAFA; }
        .test-grid { display: flex; flex-direction: column; gap: 0.75rem; }
        .test-card { background: white; border: 1px solid #E8E8E8; border-radius: 12px; padding: 1.25rem; }
        .test-stars { color: #F59E0B; font-size: 0.85rem; margin-bottom: 0.6rem; }
        .test-txt { font-size: 0.85rem; color: #333; line-height: 1.7; font-style: italic; margin-bottom: 1rem; }
        .test-autor { display: flex; align-items: center; gap: 0.6rem; }
        .test-av2 { width: 34px; height: 34px; border-radius: 50%; background: #E8E8E8; display: flex; align-items: center; justify-content: center; font-size: 0.68rem; font-weight: 700; color: #666; flex-shrink: 0; }
        .test-nom { font-size: 0.8rem; font-weight: 600; color: #0F2540; }
        .test-cargo { font-size: 0.72rem; color: #999; }

        /* CONTACTO */
        .contact-grid { display: flex; flex-direction: column; gap: 0.75rem; }
        .contact-card { border-radius: 12px; padding: 1.5rem; border: 1.5px solid #E8E8E8; display: flex; flex-direction: column; gap: 0.65rem; }
        .contact-card.dark { background: #1E3A5F; border-color: #1E3A5F; }
        .contact-ic { font-size: 1.5rem; }
        .contact-t { font-size: 0.95rem; font-weight: 700; }
        .contact-d { font-size: 0.82rem; line-height: 1.6; }
        .contact-info { margin-top: 0.75rem; background: #FAFAFA; border: 1px solid #F0F0F0; border-radius: 10px; padding: 1rem; }
        .contact-info-t { font-size: 0.78rem; color: #555; margin-bottom: 0.75rem; text-align: center; }
        .contact-links { display: flex; flex-direction: column; gap: 0.5rem; align-items: center; }
        .contact-lk { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; color: #555; text-decoration: none; }

        /* INTEGRACIONES */
        .integ-bg { background: #1E3A5F; }
        .integ-h2 { color: white; }
        .integ-p { color: #555; }
        .integ-grid { display: flex; flex-direction: column; gap: 0.75rem; }
        .integ-card { border: 1px solid #1A1A1A; border-radius: 10px; padding: 1.1rem; }
        .integ-ic { font-size: 1.1rem; width: 30px; height: 30px; background: #1A1A1A; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; }
        .integ-t { font-size: 0.88rem; font-weight: 700; color: white; margin-bottom: 0.25rem; }
        .integ-d { font-size: 0.78rem; color: #555; line-height: 1.6; }
        .integ-badge { display: inline-block; margin-top: 0.4rem; font-size: 0.62rem; font-weight: 600; color: #16A34A; background: rgba(22,163,74,0.1); padding: 0.12rem 0.45rem; border-radius: 3px; }

        /* FAQ */
        .faq-grid { display: flex; flex-direction: column; gap: 0.75rem; }
        .faq-item { border: 1px solid #F0F0F0; border-radius: 10px; padding: 1.1rem; }
        .faq-q { font-size: 0.9rem; font-weight: 600; color: #0F2540; margin-bottom: 0.4rem; }
        .faq-a { font-size: 0.82rem; color: #666; line-height: 1.65; }

        /* CTA FINAL */
        .cta-bg { background: #1E3A5F; padding: 4rem 0; text-align: center; }
        .cta-h2 { font-size: 1.9rem; font-weight: 800; color: white; letter-spacing: -0.04em; line-height: 1.15; margin-bottom: 0.75rem; }
        .cta-p { font-size: 0.9rem; color: #555; margin-bottom: 2rem; line-height: 1.7; }
        .cta-btns { display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.25rem; }
        .cta-note { font-size: 0.75rem; color: #444; }

        /* FOOTER */
        .footer { background: #1E3A5F; border-top: 1px solid #1A1A1A; padding: 2rem 0; }
        .footer-i { display: flex; flex-direction: column; gap: 1rem; }
        .footer-logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
        .footer-k { width: 20px; height: 20px; background: white; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
        .footer-n { font-size: 0.82rem; font-weight: 600; color: white; }
        .footer-links { display: flex; gap: 1.25rem; flex-wrap: wrap; }
        .footer-lk { font-size: 0.75rem; color: #555; text-decoration: none; }
        .footer-copy { font-size: 0.72rem; color: #444; }

        /* ── TABLET 640px+ ── */
        @media (min-width: 640px) {
          .hero-btns { flex-direction: row; justify-content: center; }
          .feat-grid { display: grid; grid-template-columns: repeat(2,1fr); }
          .roles-grid { display: grid; grid-template-columns: repeat(2,1fr); }
          .test-grid { display: grid; grid-template-columns: repeat(2,1fr); }
          .contact-grid { display: grid; grid-template-columns: repeat(3,1fr); }
          .integ-grid { display: grid; grid-template-columns: repeat(2,1fr); }
          .faq-grid { display: grid; grid-template-columns: repeat(2,1fr); }
          .cta-btns { flex-direction: row; justify-content: center; }
          .footer-i { flex-direction: row; align-items: center; justify-content: space-between; }
          .contact-links { flex-direction: row; justify-content: center; }
        }

        /* ── DESKTOP 1024px+ ── */
        @media (min-width: 1024px) {
          .nav-links { display: flex; align-items: center; gap: 2rem; }
          .nav-lk { font-size: 0.82rem; color: #666; text-decoration: none; transition: color 0.15s; }
          .nav-lk:hover { color: #0F2540; }
          .hero { padding: 7rem 0 4rem; }
          .hero-h1 { font-size: 3.6rem; }
          .hero-p { font-size: 1.05rem; }
          .feat-grid { grid-template-columns: repeat(3,1fr); }
          .test-grid { grid-template-columns: repeat(3,1fr); }
          .integ-grid { grid-template-columns: repeat(3,1fr); }
          .sec-h2 { font-size: 2.4rem; }
          .cta-h2 { font-size: 2.6rem; }
          .preview-scroll { justify-content: center; overflow-x: visible; padding: 0.5rem 0 1.25rem; }
          .preview-card { width: 320px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-i">
          <a href="/" className="nav-logo">
            <div className="nav-k">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <line x1="16" y1="8"  x2="7"  y2="24" stroke="#1A56DB" strokeWidth="1.8" strokeOpacity="0.35" strokeLinecap="round"/>
                <line x1="16" y1="8"  x2="25" y2="24" stroke="#1A56DB" strokeWidth="1.8" strokeOpacity="0.35" strokeLinecap="round"/>
                <line x1="9"  y1="24" x2="23" y2="24" stroke="#1A56DB" strokeWidth="1.8" strokeOpacity="0.35" strokeLinecap="round"/>
                <circle cx="7"  cy="24" r="3.2" fill="#1A56DB" fillOpacity="0.6"/>
                <circle cx="25" cy="24" r="3.2" fill="#1A56DB" fillOpacity="0.85"/>
                <circle cx="16" cy="7"  r="4"   fill="#1A56DB"/>
              </svg>
            </div>
            <span className="nav-n">Kiva360</span>
          </a>
          <div className="nav-links">
            <a href="#funcionalidades" className="nav-lk">Funcionalidades</a>
            <a href="#roles" className="nav-lk">Roles</a>
            <a href="#contacto" className="nav-lk">Contacto</a>
            <a href="#faq" className="nav-lk">FAQ</a>
          </div>
          <div className="nav-cta">
            <a href="/login" className="btn btn-ghost btn-sm">Ingresar</a>
            <a href="/register" className="btn btn-dark btn-sm">Probar gratis →</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-badge">
            <div className="hero-dot" />
            Hecho en Chile 🇨🇱 · Para colegios chilenos
          </div>
          <h1 className="hero-h1">
            La plataforma que<br />
            <em>tu colegio necesitaba</em><br />
            desde hace años
          </h1>
          <p className="hero-p">
            Libro de clases digital, evaluaciones, planificación curricular y comunicación con apoderados — todo en un solo lugar, sin doble digitación.
          </p>
          <div className="hero-btns">
            <a href="/register" className="btn btn-dark btn-lg">Comenzar gratis →</a>
            <a href="#funcionalidades" className="btn btn-outline btn-lg">Ver funcionalidades</a>
          </div>
          <div className="hero-social">
            <div className="hero-avs">
              {['JR','MP','CS','AV','TH'].map(i => <div key={i} className="hero-av">{i}</div>)}
            </div>
            <span>+50 directivos y profesores ya lo están usando</span>
          </div>
        </div>
      </section>

      {/* PREVIEW HORIZONTAL SCROLL */}
      <div className="preview-section">
        <div className="preview-label">Así se ve Kiva360 en producción</div>
        <div className="preview-scroll">

          {/* Card 1 — Director */}
          <div className="preview-card">
            <div className="preview-inner">
              <div className="preview-bar">
                {['#FF5F57','#FFBD2E','#28CA41'].map(c => <div key={c} className="preview-dot2" style={{ background: c }} />)}
                <div className="preview-url2">kiva360.cl/director</div>
              </div>
              <div className="preview-body">
                <div className="pv-title">Panel Director</div>
                <div className="pv-h">Buenos días, directora</div>
                <div className="pv-alert-r">🔴 Diego F. — asistencia anual 68%</div>
                <div className="pv-alert-r">🔴 3°A — promedio bajo 5,0 en Matemáticas</div>
                <div className="pv-alert-y">⚠ 2 planificaciones sin publicar</div>
                <div className="pv-kpis">
                  {[['287','Alumnos'],['94%','Asistencia'],['12','Eval.'],['3','Riesgo']].map(([v,n]) => (
                    <div key={n} className="pv-kpi"><div className="pv-kpi-v">{v}</div><div className="pv-kpi-n">{n}</div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 — Ficha alumno */}
          <div className="preview-card">
            <div className="preview-inner">
              <div className="preview-bar">
                {['#FF5F57','#FFBD2E','#28CA41'].map(c => <div key={c} className="preview-dot2" style={{ background: c }} />)}
                <div className="preview-url2">kiva360.cl/alumnos</div>
              </div>
              <div className="preview-body">
                <div className="pv-hero2">
                  <div className="pv-av">MC</div>
                  <div>
                    <div className="pv-nom">Cárdenas, Matías</div>
                    <div className="pv-meta">3°A · SEP · RUT 20.123.456-7</div>
                  </div>
                  <div className="pv-prom">4,7</div>
                </div>
                <div className="pv-tabs">
                  {['Notas','Asistencia','Anotaciones','Derivaciones'].map((t,i) => (
                    <div key={t} className={`pv-tab${i===0?' on':''}`}>{t}</div>
                  ))}
                </div>
                {[['Matemáticas','4,2','#DC2626'],['Lenguaje','5,8','#16A34A'],['Ciencias','4,8','#D97706']].map(([a,n,c]) => (
                  <div key={a} className="pv-nota-row">
                    <span className="pv-nota-asig">{a}</span>
                    <span className="pv-nota-v" style={{ color: c }}>{n}</span>
                  </div>
                ))}
                <div className="pv-alert-y" style={{ marginTop: '0.35rem' }}>⚠ En riesgo — promedio bajo 5,0</div>
              </div>
            </div>
          </div>

          {/* Card 3 — Admisión */}
          <div className="preview-card">
            <div className="preview-inner">
              <div className="preview-bar">
                {['#FF5F57','#FFBD2E','#28CA41'].map(c => <div key={c} className="preview-dot2" style={{ background: c }} />)}
                <div className="preview-url2">kiva360.cl/admision</div>
              </div>
              <div className="preview-body">
                <div className="pv-title">Admisión Escolar 2027</div>
                <div className="pv-h">Proceso propio — 45 vacantes</div>
                <div className="pv-adm-stats">
                  {[['8','Postulantes'],['3','Con entrevista'],['1','Aceptado']].map(([v,n]) => (
                    <div key={n} className="pv-adm-stat"><div className="pv-adm-v">{v}</div><div className="pv-adm-n">{n}</div></div>
                  ))}
                </div>
                {[
                  ['FE','Fernández, Isidora','1°B','✓ Entrevistada','pv-badge-g'],
                  ['GO','González, Mateo','1°B','📅 Pendiente','pv-badge-y'],
                  ['MU','Muñoz, Valentina','Kinder','○ Recibido','pv-badge-n'],
                  ['TO','Torres, Benjamín','1°B','★ Aceptado','pv-badge-b'],
                ].map(([av,nom,niv,est,cls]) => (
                  <div key={nom} className="pv-post-row">
                    <div className="pv-post-av">{av}</div>
                    <span className="pv-post-n">{nom}</span>
                    <span className="pv-post-niv">{niv}</span>
                    <span className={`pv-post-est ${cls}`}>{est}</span>
                  </div>
                ))}
                <div className="pv-sae-note">→ Proceso propio sin depender del SAE centralizado</div>
              </div>
            </div>
          </div>

        </div>
        <div className="preview-dots">
          <div className="preview-dot-i on" />
          <div className="preview-dot-i" />
          <div className="preview-dot-i" />
        </div>
      </div>

      {/* NORMATIVA */}
      <div className="norms">
        <div className="wrap">
          <div className="norms-lbl">Alineado con la normativa educativa chilena</div>
          <div className="norms-row">
            {['MINEDUC','LEY 20.370','PIE','SEP','PAE','OA CURRÍCULUM','LEY 19.628'].map(l => (
              <div key={l} className="norms-item">{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="sec feat-bg" id="funcionalidades">
        <div className="wrap">
          <div className="sec-badge">Funcionalidades</div>
          <h2 className="sec-h2">Todo lo que un colegio necesita, en un solo sistema</h2>
          <p className="sec-p">Sin papeles, sin Excel, sin doble digitación. Kiva360 centraliza la gestión escolar completa.</p>
          <div className="feat-grid">
            {[
              { ic:'▦', t:'Libro de clases digital', d:'Asistencia, notas y hoja de vida del alumno en un solo lugar. Cumple con la normativa MINEDUC.', tag:'Profesores' },
              { ic:'◫', t:'Planificador de clases', d:'Diseña tus clases con OA, estrategias didácticas y recursos. Banco de estrategias integrado.', tag:'Profesores' },
              { ic:'◈', t:'Biblioteca histórica', d:'Explora planificaciones de años anteriores, ve qué funcionó y clona las mejores clases.', tag:'Novedad' },
              { ic:'◉', t:'Ficha del estudiante', d:'Historial académico, anotaciones, derivaciones a profesionales y entrevistas con apoderados.', tag:'Integral' },
              { ic:'◧', t:'Panel UTP', d:'Supervisa planificaciones, cobertura curricular, alumnos en riesgo y co-docencia.', tag:'UTP' },
              { ic:'○', t:'Panel Director', d:'Vista ejecutiva con alertas tempranas, KPIs en tiempo real y acceso a todos los módulos.', tag:'Dirección' },
              { ic:'◎', t:'Cobranzas y aranceles', d:'Gestiona planes de pago, cuotas y registra pagos. Control financiero integrado.', tag:'Administración' },
              { ic:'◑', t:'Portal apoderado', d:'Los apoderados ven notas, asistencia y se comunican directamente con el colegio.', tag:'Familias' },
              { ic:'◐', t:'Admisión escolar propia', d:'Gestiona tu propio proceso de admisión con entrevistas y criterios de selección.', tag:'Nuevo 2026' },
            ].map(f => (
              <div key={f.t} className="feat-card">
                <div className="feat-ic">{f.ic}</div>
                <div className="feat-t">{f.t}</div>
                <div className="feat-d">{f.d}</div>
                <div className="feat-tag">{f.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="sec" id="roles">
        <div className="wrap">
          <div className="sec-badge">Por rol</div>
          <h2 className="sec-h2">Cada actor del colegio tiene su espacio</h2>
          <p className="sec-p">Kiva360 se adapta a cada rol — director, UTP, profesor y apoderado ven exactamente lo que necesitan.</p>
          <div className="roles-grid">
            {[
              { cls:'dir', ic:'◻', t:'Director/a', d:'Panorámica completa del establecimiento en tiempo real.', color:'white', items:['Alertas tempranas automáticas','KPIs académicos y financieros','Supervisión de todo el equipo','Reportes para el sostenedor'] },
              { cls:'utp', ic:'◧', t:'UTP', d:'Supervisión curricular y acompañamiento docente.', color:'#37352F', items:['Cobertura de OA por asignatura','Supervisión de planificaciones','Alumnos en riesgo académico','Coordinación de co-docencia'] },
              { cls:'prof', ic:'✦', t:'Profesor/a', d:'Todo el trabajo pedagógico en un solo lugar.', color:'#1E40AF', items:['Libro de clases digital','Planificador con estrategias','Ficha completa de cada alumno','Comunicación directa con familias'] },
              { cls:'apod', ic:'◈', t:'Apoderado/a', d:'Seguimiento del rendimiento de su hijo/a.', color:'#166534', items:['Notas y asistencia en tiempo real','Alertas automáticas','Agenda de entrevistas','Mensajes directos con el colegio'] },
            ].map(r => (
              <div key={r.t} className={`role-card ${r.cls}`}>
                <div className="role-ic" style={{ color: r.cls === 'dir' ? 'white' : r.color }}>{r.ic}</div>
                <div className="role-t" style={{ color: r.cls === 'dir' ? 'white' : '#0F2540' }}>{r.t}</div>
                <div className="role-d" style={{ color: r.cls === 'dir' ? 'rgba(255,255,255,0.6)' : '#666' }}>{r.d}</div>
                <ul className="role-items">
                  {r.items.map(i => <li key={i} className="role-item" style={{ color: r.cls === 'dir' ? 'rgba(255,255,255,0.7)' : '#444' }}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="sec test-bg">
        <div className="wrap">
          <div className="sec-badge">Testimonios</div>
          <h2 className="sec-h2">Lo que dicen quienes lo están usando</h2>
          <div className="test-grid">
            {[
              { txt:'Antes pasaba 2 horas semanales copiando notas entre sistemas. Con Kiva360 lo hago en 15 minutos y tengo todo en un solo lugar.', nom:'María González', cargo:'Profesora Jefe · 3°A Básico', ini:'MG' },
              { txt:'Como directora, finalmente tengo visibilidad en tiempo real de lo que pasa en el colegio. Las alertas tempranas me permiten actuar antes.', nom:'Carolina Silva', cargo:'Directora · Colegio San Patricio', ini:'CS' },
              { txt:'La biblioteca de planificaciones fue una sorpresa. Mis profesores ahora colaboran y aprovechan el trabajo de años anteriores.', nom:'Jorge Reyes', cargo:'Jefe de UTP · Colegio del Valle', ini:'JR' },
            ].map(t => (
              <div key={t.nom} className="test-card">
                <div className="test-stars">★★★★★</div>
                <p className="test-txt">"{t.txt}"</p>
                <div className="test-autor">
                  <div className="test-av2">{t.ini}</div>
                  <div>
                    <div className="test-nom">{t.nom}</div>
                    <div className="test-cargo">{t.cargo}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section className="sec" id="contacto">
        <div className="wrap">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="sec-badge">Para tu colegio</div>
            <h2 className="sec-h2">Un sistema a la medida de tu establecimiento</h2>
            <p className="sec-p" style={{ margin: '0 auto' }}>Cada colegio es distinto. Conversemos sobre tus necesidades.</p>
          </div>
          <div className="contact-grid">
            {[
              { dark: false, ic:'◎', t:'Demo personalizada', d:'Te mostramos el sistema en funcionamiento real, adaptado a tu realidad como colegio. Sin presentaciones genéricas.', cta:'Agendar demo', href:'mailto:contacto@kiva360.cl?subject=Demo%20Kiva360' },
              { dark: true,  ic:'→', t:'Prueba gratis 30 días', d:'Accede al sistema completo sin costo por 30 días. Sin tarjeta de crédito. Tu equipo completo puede probarlo.', cta:'Comenzar ahora →', href:'/register' },
              { dark: false, ic:'◻', t:'Red de colegios', d:'¿Eres sostenedor con varios establecimientos? Tenemos una propuesta para centralizar toda tu red.', cta:'Hablar con el equipo', href:'mailto:contacto@kiva360.cl?subject=Red%20de%20colegios' },
            ].map(c => (
              <div key={c.t} className={`contact-card${c.dark ? ' dark' : ''}`}>
                <div className="contact-ic" style={{ color: c.dark ? 'rgba(255,255,255,0.4)' : '#666' }}>{c.ic}</div>
                <div className="contact-t" style={{ color: c.dark ? 'white' : '#0F2540' }}>{c.t}</div>
                <div className="contact-d" style={{ color: c.dark ? '#666' : '#666' }}>{c.d}</div>
                <a href={c.href} className="btn btn-md" style={{ marginTop: 'auto', background: c.dark ? 'white' : '#1E3A5F', color: c.dark ? '#1E3A5F' : 'white' }}>{c.cta}</a>
              </div>
            ))}
          </div>
          <div className="contact-info">
            <div className="contact-info-t">¿Tienes preguntas antes de agendar? Escríbenos directamente</div>
            <div className="contact-links">
              {[['✉️','contacto@kiva360.cl','mailto:contacto@kiva360.cl'],['💬','Chat en la plataforma','/register'],['📞','Respuesta en 24 horas','mailto:contacto@kiva360.cl']].map(([ic,lbl,href]) => (
                <a key={lbl} href={href} className="contact-lk"><span>{ic}</span> {lbl}</a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRACIONES */}
      <section className="sec integ-bg">
        <div className="wrap">
          <div className="sec-badge" style={{ background: '#1A1A1A', color: '#555' }}>Integraciones</div>
          <h2 className="sec-h2 integ-h2">Pensado para la realidad educativa chilena</h2>
          <p className="sec-p integ-p" style={{ marginBottom: '2rem' }}>Kiva360 genera los documentos y archivos que el MINEDUC requiere, en el formato correcto.</p>
          <div className="integ-grid">
            {[
              { ic:'⬡', t:'Compatible con SIGE', d:'Genera reportes de asistencia y matrícula en el formato que SIGE requiere para importación.', badge:'Exportación' },
              { ic:'⬢', t:'Compatible con SAE', d:'Gestiona tu nómina de postulantes y matrícula preferente dentro de Kiva360.', badge:'Gestión interna' },
              { ic:'⬟', t:'Compatible con JUNAEB', d:'Registra beneficiarios PAE, SEP y TNE en la ficha del alumno centralizado.', badge:'Registro interno' },
              { ic:'◫', t:'Currículum MINEDUC', d:'OA actualizados por asignatura y nivel. Planificación 100% alineada al currículum nacional.', badge:'Integrado' },
              { ic:'◉', t:'Email con Resend', d:'Notificaciones automáticas por email a apoderados. Configurable con el dominio de tu colegio.', badge:'Integrado' },
              { ic:'◎', t:'API Gateway EdTech', d:'Próximamente: conecta Kiva360 con otras plataformas EdTech a través de nuestra API.', badge:'Próximamente' },
            ].map(i => (
              <div key={i.t} className="integ-card">
                <div className="integ-ic"><span style={{ fontSize: '0.85rem' }}>{i.ic}</span></div>
                <div className="integ-t">{i.t}</div>
                <div className="integ-d">{i.d}</div>
                <div className="integ-badge">{i.badge}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec" id="faq">
        <div className="wrap">
          <div className="sec-badge">FAQ</div>
          <h2 className="sec-h2">Preguntas frecuentes</h2>
          <div className="faq-grid" style={{ marginTop: '1.5rem' }}>
            {[
              { q:'¿Cuánto tiempo toma implementar Kiva360?', a:'El registro y configuración toma menos de 30 minutos. Importas la nómina de alumnos, creas los usuarios del equipo y ya está listo.' },
              { q:'¿Pueden acceder los apoderados?', a:'Sí. Los apoderados tienen su propio portal donde ven las notas, asistencia y pueden comunicarse directamente con el colegio.' },
              { q:'¿Es seguro? ¿Dónde están los datos?', a:'Los datos se almacenan con cifrado AES-256. Cumplimos con la Ley 19.628 de protección de datos personales de Chile.' },
              { q:'¿Funciona sin internet?', a:'La app móvil para pasar asistencia funciona offline y sincroniza cuando recuperas conexión. El resto requiere internet.' },
              { q:'¿Puedo usarlo si ya tengo otro sistema?', a:'Sí. Kiva360 puede coexistir con otros sistemas. Importa tus datos actuales y comienza a usar los módulos de a poco.' },
              { q:'¿Hay soporte en español?', a:'Todo el soporte es en español, con respuesta en menos de 24 horas hábiles. También ofrecemos capacitación para tu equipo.' },
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
      <section className="cta-bg">
        <div className="wrap">
          <h2 className="cta-h2">¿Listo para transformar la gestión de tu colegio?</h2>
          <p className="cta-p">Únete a los colegios chilenos que ya dejaron atrás el Excel y el papel.</p>
          <div className="cta-btns">
            <a href="/register" className="btn btn-white btn-lg">Comenzar gratis →</a>
            <a href="mailto:contacto@kiva360.cl" className="btn btn-lg" style={{ color: '#555', background: 'transparent', border: '1px solid #333' }}>Hablar con el equipo</a>
          </div>
          <p className="cta-note">30 días gratis · Sin tarjeta de crédito · Soporte en español</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-i">
            <a href="/" className="footer-logo">
              <div className="footer-k">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                <line x1="16" y1="8"  x2="7"  y2="24" stroke="#1A56DB" strokeWidth="2" strokeOpacity="0.35" strokeLinecap="round"/>
                <line x1="16" y1="8"  x2="25" y2="24" stroke="#1A56DB" strokeWidth="2" strokeOpacity="0.35" strokeLinecap="round"/>
                <line x1="9"  y1="24" x2="23" y2="24" stroke="#1A56DB" strokeWidth="2" strokeOpacity="0.35" strokeLinecap="round"/>
                <circle cx="7"  cy="24" r="3.2" fill="#1A56DB" fillOpacity="0.6"/>
                <circle cx="25" cy="24" r="3.2" fill="#1A56DB" fillOpacity="0.85"/>
                <circle cx="16" cy="7"  r="4"   fill="#1A56DB"/>
              </svg>
            </div>
              <span className="footer-n">Kiva360</span>
            </a>
            <div className="footer-links">
              <a href="/login" className="footer-lk">Iniciar sesión</a>
              <a href="/register" className="footer-lk">Registro</a>
              <a href="mailto:contacto@kiva360.cl" className="footer-lk">Contacto</a>
            </div>
            <div className="footer-copy">🇨🇱 Hecho en Chile · © 2026 Kiva360</div>
          </div>
        </div>
      </footer>
    </>
  )
}
