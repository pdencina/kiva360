import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kiva360 — Gestión escolar para colegios chilenos',
  description: 'SIGE · SAE · JUNAEB integrados. Libro de clases digital, sin doble digitación. Hecho en Chile.',
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: #fff; color: #0A0A0A; }

        /* ── UTILS ── */
        .c  { max-width: 1080px; margin: 0 auto; padding: 0 1.5rem; }
        .c--sm { max-width: 680px; margin: 0 auto; padding: 0 1.5rem; }

        /* ── NAV ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 56px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #F0F0F0;
        }
        .nav-i {
          height: 100%;
          display: flex; align-items: center; justify-content: space-between;
          max-width: 1080px; margin: 0 auto; padding: 0 1.5rem;
        }
        .nav-logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
        .nav-logo-k {
          width: 28px; height: 28px; background: #0A0A0A; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700; color: white; letter-spacing: -0.05em;
        }
        .nav-logo-n { font-size: 0.9rem; font-weight: 600; color: #0A0A0A; letter-spacing: -0.02em; }
        .nav-links { display: flex; align-items: center; gap: 1.75rem; }
        .nav-lk { font-size: 0.82rem; color: #666; text-decoration: none; font-weight: 400; transition: color 0.15s; }
        .nav-lk:hover { color: #0A0A0A; }
        .nav-actions { display: flex; align-items: center; gap: 0.75rem; }
        .btn-sm {
          font-size: 0.82rem; font-weight: 500; padding: 0.45rem 1rem; border-radius: 7px;
          text-decoration: none; transition: all 0.15s; cursor: pointer; border: none; font-family: inherit;
        }
        .btn-ghost-sm { color: #444; background: transparent; }
        .btn-ghost-sm:hover { color: #0A0A0A; background: #F5F5F5; }
        .btn-dark-sm { color: white; background: #0A0A0A; }
        .btn-dark-sm:hover { background: #222; }

        /* ── HERO ── */
        .hero {
          padding: 10rem 0 7rem;
          text-align: center;
          background: white;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, #F5F5F5 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.72rem; font-weight: 500; color: #444;
          border: 1px solid #E5E5E5; border-radius: 20px;
          padding: 0.3rem 0.8rem; margin-bottom: 2rem;
          background: white;
        }
        .hero-badge-dot { width: 5px; height: 5px; background: #22C55E; border-radius: 50%; }
        .hero-h1 {
          font-size: clamp(2.4rem, 5.5vw, 4.2rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.08;
          color: #0A0A0A;
          margin-bottom: 1.4rem;
          max-width: 760px;
          margin-left: auto; margin-right: auto;
        }
        .hero-sub {
          font-size: 1rem; color: #666; font-weight: 400;
          line-height: 1.7; max-width: 480px;
          margin: 0 auto 2.5rem; letter-spacing: -0.01em;
        }
        .hero-btns {
          display: flex; align-items: center; justify-content: center;
          gap: 0.75rem; margin-bottom: 4rem;
        }
        .btn-lg {
          font-size: 0.88rem; font-weight: 500; padding: 0.7rem 1.5rem; border-radius: 8px;
          text-decoration: none; transition: all 0.2s; display: inline-block;
        }
        .btn-dark { color: white; background: #0A0A0A; }
        .btn-dark:hover { background: #222; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .btn-outline { color: #444; background: white; border: 1px solid #E0E0E0; }
        .btn-outline:hover { border-color: #999; color: #0A0A0A; }

        .hero-stats {
          display: flex; align-items: center; justify-content: center; gap: 2.5rem;
          font-size: 0.78rem; color: #999;
        }
        .hero-stat strong { color: #0A0A0A; font-weight: 600; display: block; font-size: 1rem; letter-spacing: -0.02em; }

        /* ── DIVIDER ── */
        .divider { height: 1px; background: #F0F0F0; }

        /* ── LOGOS ── */
        .logos { padding: 2.5rem 0; }
        .logos-inner { display: flex; align-items: center; justify-content: center; gap: 2.5rem; flex-wrap: wrap; }
        .logos-lbl { font-size: 0.72rem; color: #BBB; font-weight: 500; margin-right: 0.5rem; }
        .logo-chip {
          font-size: 0.78rem; color: #999; font-weight: 500;
          display: flex; align-items: center; gap: 0.4rem;
        }

        /* ── SECTIONS ── */
        .sec { padding: 6rem 0; }
        .sec-gray { background: #FAFAFA; }

        .sec-eyebrow {
          font-size: 0.72rem; font-weight: 600; color: #999;
          letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.75rem;
        }
        .sec-h2 {
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 700; letter-spacing: -0.04em;
          line-height: 1.15; color: #0A0A0A; margin-bottom: 0.75rem;
        }
        .sec-sub {
          font-size: 0.9rem; color: #666; font-weight: 400;
          line-height: 1.7; max-width: 440px; letter-spacing: -0.01em;
        }

        /* ── PROBLEMA ── */
        .pain-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: #F0F0F0; margin-top: 3rem; border: 1px solid #F0F0F0; border-radius: 12px; overflow: hidden; }
        .pain-cell { background: white; padding: 1.75rem; }
        .pain-n { font-size: 0.68rem; font-weight: 600; color: #CCC; letter-spacing: 0.05em; margin-bottom: 1rem; }
        .pain-t { font-size: 0.92rem; font-weight: 600; color: #0A0A0A; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
        .pain-d { font-size: 0.78rem; color: #777; line-height: 1.65; font-weight: 400; }

        /* ── FEATURES ── */
        .feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: #F0F0F0; border: 1px solid #F0F0F0; border-radius: 12px; overflow: hidden; margin-top: 3rem; }
        .feat-cell { background: #FAFAFA; padding: 1.75rem; transition: background 0.15s; }
        .feat-cell:hover { background: white; }
        .feat-ico { font-size: 1.1rem; margin-bottom: 1rem; display: block; }
        .feat-t { font-size: 0.88rem; font-weight: 600; color: #0A0A0A; letter-spacing: -0.02em; margin-bottom: 0.4rem; }
        .feat-d { font-size: 0.76rem; color: #777; line-height: 1.65; font-weight: 400; }

        /* ── INTEGRACIONES ── */
        .integ-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; margin-top: 3rem; }
        .integ-card {
          border: 1px solid #EBEBEB; border-radius: 12px; padding: 1.75rem;
          background: white; transition: all 0.2s;
        }
        .integ-card:hover { border-color: #CCC; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
        .integ-label {
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; color: #999; margin-bottom: 0.5rem;
        }
        .integ-name { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.04em; color: #0A0A0A; margin-bottom: 0.3rem; }
        .integ-full { font-size: 0.75rem; color: #999; margin-bottom: 1.25rem; line-height: 1.5; }
        .integ-list { list-style: none; }
        .integ-li {
          font-size: 0.76rem; color: #666; padding: 0.35rem 0;
          border-bottom: 1px solid #F5F5F5; display: flex; gap: 0.5rem;
          align-items: flex-start;
        }
        .integ-li:last-child { border-bottom: none; }
        .integ-li-dot { color: #CCC; flex-shrink: 0; margin-top: 1px; }

        /* ── STEPS ── */
        .steps-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem; margin-top: 3rem; }
        .step-card { padding: 0; }
        .step-n { font-size: 0.7rem; font-weight: 600; color: #CCC; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
        .step-t { font-size: 0.88rem; font-weight: 600; color: #0A0A0A; letter-spacing: -0.02em; margin-bottom: 0.4rem; }
        .step-d { font-size: 0.76rem; color: #777; line-height: 1.65; }
        .step-line { height: 1px; background: #F0F0F0; margin-bottom: 1.5rem; position: relative; }
        .step-line::before { content: ''; position: absolute; left: 0; top: -2px; width: 5px; height: 5px; border-radius: 50%; background: #0A0A0A; }

        /* ── TESTIMONIOS ── */
        .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; margin-top: 3rem; }
        .testi-card {
          border: 1px solid #EBEBEB; border-radius: 12px; padding: 1.5rem;
          background: white;
        }
        .testi-q { font-size: 0.82rem; color: #333; line-height: 1.75; margin-bottom: 1.25rem; font-weight: 400; letter-spacing: -0.01em; }
        .testi-author { font-size: 0.75rem; color: #999; }
        .testi-author strong { color: #0A0A0A; font-weight: 600; display: block; font-size: 0.8rem; margin-bottom: 0.1rem; }

        /* ── PRECIOS ── */
        .pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; margin-top: 3rem; }
        .plan-card {
          border: 1px solid #EBEBEB; border-radius: 12px; padding: 1.75rem;
          background: white; position: relative;
        }
        .plan-card--feat { border-color: #0A0A0A; }
        .plan-feat-lbl {
          position: absolute; top: -11px; left: 50%; transform: translateX(-50%);
          font-size: 0.62rem; font-weight: 600; color: white;
          background: #0A0A0A; padding: 0.2rem 0.7rem; border-radius: 20px;
          letter-spacing: 0.05em; white-space: nowrap;
        }
        .plan-n { font-size: 0.72rem; font-weight: 600; color: #999; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.75rem; }
        .plan-p { font-size: 2rem; font-weight: 700; letter-spacing: -0.04em; color: #0A0A0A; margin-bottom: 0.25rem; }
        .plan-p span { font-size: 0.85rem; color: #999; font-weight: 400; }
        .plan-desc { font-size: 0.76rem; color: #999; margin-bottom: 1.5rem; line-height: 1.5; }
        .plan-feats { list-style: none; margin-bottom: 1.5rem; }
        .plan-feat-li {
          font-size: 0.78rem; color: #555; padding: 0.38rem 0;
          border-bottom: 1px solid #F5F5F5; display: flex; gap: 0.6rem; align-items: flex-start;
        }
        .plan-feat-li:last-child { border-bottom: none; }
        .plan-feat-ok { color: #0A0A0A; font-weight: 700; flex-shrink: 0; }
        .plan-btn-d {
          display: block; width: 100%; padding: 0.65rem; border-radius: 8px;
          text-align: center; font-size: 0.82rem; font-weight: 500;
          text-decoration: none; background: #0A0A0A; color: white;
          border: none; cursor: pointer; font-family: inherit; transition: background 0.15s;
        }
        .plan-btn-d:hover { background: #222; }
        .plan-btn-o {
          display: block; width: 100%; padding: 0.65rem; border-radius: 8px;
          text-align: center; font-size: 0.82rem; font-weight: 500;
          text-decoration: none; background: white; color: #0A0A0A;
          border: 1px solid #E0E0E0; cursor: pointer; font-family: inherit; transition: all 0.15s;
        }
        .plan-btn-o:hover { border-color: #999; }

        /* ── FAQ ── */
        .faq-list { margin-top: 3rem; }
        .faq-item { padding: 1.25rem 0; border-bottom: 1px solid #F0F0F0; }
        .faq-q { font-size: 0.88rem; font-weight: 600; color: #0A0A0A; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
        .faq-a { font-size: 0.78rem; color: #666; line-height: 1.7; font-weight: 400; }

        /* ── CTA FINAL ── */
        .cta-sec {
          padding: 8rem 0; text-align: center;
          background: #0A0A0A;
        }
        .cta-eyebrow { font-size: 0.72rem; color: #555; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1.5rem; }
        .cta-h2 {
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 700; letter-spacing: -0.04em;
          line-height: 1.1; color: white;
          margin-bottom: 1rem; max-width: 600px; margin-left: auto; margin-right: auto;
        }
        .cta-sub { font-size: 0.9rem; color: #666; margin-bottom: 2.5rem; line-height: 1.7; }
        .cta-btns { display: flex; align-items: center; justify-content: center; gap: 0.75rem; flex-wrap: wrap; }
        .btn-white { color: #0A0A0A; background: white; }
        .btn-white:hover { background: #F5F5F5; }
        .btn-outline-w { color: #555; background: transparent; border: 1px solid #333; }
        .btn-outline-w:hover { border-color: #666; color: #999; }
        .cta-note { margin-top: 2rem; font-size: 0.72rem; color: #444; }

        /* ── FOOTER ── */
        .footer { background: #0A0A0A; border-top: 1px solid #1A1A1A; padding: 3rem 0; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem; }
        .footer-desc { font-size: 0.76rem; color: #555; line-height: 1.7; margin-top: 0.75rem; max-width: 240px; }
        .footer-col-t { font-size: 0.7rem; font-weight: 600; color: #444; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.75rem; }
        .footer-lk { display: block; font-size: 0.76rem; color: #555; text-decoration: none; margin-bottom: 0.45rem; transition: color 0.15s; }
        .footer-lk:hover { color: #999; }
        .footer-bottom { border-top: 1px solid #1A1A1A; padding-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-size: 0.72rem; color: #444; }

        @media (max-width: 768px) {
          .pain-grid, .feat-grid, .integ-grid, .steps-grid, .testi-grid, .pricing-grid, .footer-grid { grid-template-columns: 1fr; }
          .nav-links { display: none; }
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
            <a href="#features"      className="nav-lk">Funciones</a>
            <a href="#integraciones" className="nav-lk">Integraciones</a>
            <a href="#precios"       className="nav-lk">Precios</a>
            <a href="#faq"           className="nav-lk">FAQ</a>
          </div>
          <div className="nav-actions">
            <a href="/login"   className="btn-sm btn-ghost-sm">Ingresar</a>
            <a href="#precios" className="btn-sm btn-dark-sm">Solicitar demo</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="c">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Nuevo 2026 · Hecho en Chile para colegios chilenos
          </div>
          <h1 className="hero-h1">
            Gestión escolar sin papel,<br />sin doble digitación,<br />sin complicaciones
          </h1>
          <p className="hero-sub">
            SIGE · SAE · JUNAEB integrados en un solo lugar.
            Libro de clases digital conforme MINEDUC.
            El 70% menos de trabajo administrativo — desde el primer día.
          </p>
          <div className="hero-btns">
            <a href="/login"   className="btn-lg btn-dark">Comenzar gratis →</a>
            <a href="#features" className="btn-lg btn-outline">Ver funciones</a>
          </div>
          <div className="hero-stats">
            <div><strong>-70%</strong> trabajo administrativo</div>
            <div style={{ width: '1px', height: '28px', background: '#EEE' }} />
            <div><strong>10 min</strong> para configurar el colegio</div>
            <div style={{ width: '1px', height: '28px', background: '#EEE' }} />
            <div><strong>30 días</strong> gratis sin tarjeta</div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* LOGOS */}
      <div className="logos">
        <div className="c">
          <div className="logos-inner">
            <span className="logos-lbl">Compatible con</span>
            {['🔗 SIGE', '🎓 SAE', '🍽️ JUNAEB', '📊 IVE-SINAE', '💳 TNE', '📒 Libro Digital MINEDUC'].map(l => (
              <span key={l} className="logo-chip">{l}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* PROBLEMA */}
      <section className="sec">
        <div className="c">
          <p className="sec-eyebrow">El problema</p>
          <h2 className="sec-h2">¿Cuántas horas pierde<br />tu equipo cada semana?</h2>
          <div className="pain-grid">
            {[
              { n: '01', t: 'Libro de clases en papel', d: 'Ilegible, difícil de auditar, se pierde. El MINEDUC exige digitalización y los colegios siguen con carpetas.' },
              { n: '02', t: 'Doble digitación constante', d: 'Los mismos datos se ingresan en el libro, en SIGE, en Excel y en el sistema de notas. Cada digitación es un error potencial.' },
              { n: '03', t: 'Plazos SIGE que estresan', d: 'Cada 15 días hay que declarar asistencia. Si hay un error, el MINEDUC devuelve el archivo y empieza todo de nuevo.' },
            ].map(p => (
              <div key={p.n} className="pain-cell">
                <div className="pain-n">{p.n}</div>
                <div className="pain-t">{p.t}</div>
                <div className="pain-d">{p.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="sec sec-gray" id="features">
        <div className="c">
          <p className="sec-eyebrow">Funciones</p>
          <h2 className="sec-h2">Todo lo que necesita<br />tu colegio, integrado</h2>
          <p className="sec-sub">Diseñado para la realidad de los colegios chilenos. Normativa MINEDUC incorporada desde el primer día.</p>
          <div className="feat-grid">
            {[
              { i: '📒', t: 'Libro de Clases Digital', d: 'Asistencia con un clic. Notas con promedio ponderado automático. Hoja de vida del alumno. Conforme normativa MINEDUC.' },
              { i: '🔗', t: 'SIGE Integrado', d: 'Declara asistencia al MINEDUC en un botón. Validador detecta errores antes de enviar. Historial completo de declaraciones.' },
              { i: '🎓', t: 'SAE — Admisión Escolar', d: 'Importa nómina del MINEDUC directamente. Matricula con un clic. Envía recordatorios a apoderados pendientes.' },
              { i: '🍽️', t: 'JUNAEB Completa', d: 'PAE diario. IVE-SINAE automático. Alumnos SEP con prioridades. Encuesta de vulnerabilidad. Más de 30 programas.' },
              { i: '💬', t: 'Comunicación', d: 'Chat directo con apoderados y equipo docente. Todo registrado. Sin WhatsApp del profesor ni grupos que se descontrolan.' },
              { i: '📊', t: 'Dashboard de gestión', d: 'El director ve en tiempo real asistencia, notas y alertas de alumnos en riesgo. Estado de integraciones MINEDUC.' },
            ].map(f => (
              <div key={f.t} className="feat-cell">
                <span className="feat-ico">{f.i}</span>
                <div className="feat-t">{f.t}</div>
                <div className="feat-d">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRACIONES */}
      <section className="sec" id="integraciones">
        <div className="c">
          <p className="sec-eyebrow">Integraciones MINEDUC</p>
          <h2 className="sec-h2">Conectado con los sistemas<br />del Ministerio de Educación</h2>
          <p className="sec-sub">Sin intermediarios, sin exportar archivos. Kiva360 habla directamente con SIGE, SAE y JUNAEB.</p>
          <div className="integ-grid">
            {[
              { lbl: 'Integración 01', name: 'SIGE', full: 'Sistema de Información General de Estudiantes', items: ['Declaración de asistencia cada 15 días', 'Matrícula y movimientos de alumnos', 'Actas de rendimiento y calificaciones', 'Validador automático pre-envío'] },
              { lbl: 'Integración 02', name: 'SAE', full: 'Sistema de Admisión Escolar · Ley Inclusión N°20.845', items: ['Importación de nómina MINEDUC', 'Gestión de vacantes por nivel', 'Matriculación con un clic', 'Recordatorios automáticos a apoderados'] },
              { lbl: 'Integración 03', name: 'JUNAEB', full: 'Junta Nacional de Auxilio Escolar y Becas', items: ['PAE — Registro diario de raciones', 'IVE-SINAE actualización automática', 'Alumnos SEP con prioridades P1/P2/P3', 'Encuesta Vulnerabilidad · TNE · +25 más'] },
            ].map(i => (
              <div key={i.name} className="integ-card">
                <div className="integ-label">{i.lbl}</div>
                <div className="integ-name">{i.name}</div>
                <div className="integ-full">{i.full}</div>
                <ul className="integ-list">
                  {i.items.map(item => (
                    <li key={item} className="integ-li">
                      <span className="integ-li-dot">–</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="sec sec-gray">
        <div className="c">
          <p className="sec-eyebrow">Cómo funciona</p>
          <h2 className="sec-h2">Configura tu colegio<br />en menos de 10 minutos</h2>
          <div className="steps-grid">
            {[
              { n: '01', t: 'Registra tu colegio', d: 'Ingresa el RBD y nombre del establecimiento. Kiva360 se conecta con los sistemas del MINEDUC automáticamente.' },
              { n: '02', t: 'Importa tus datos', d: 'Sube la nómina de alumnos o impórtalos desde SIGE. Cursos y asignaturas quedan configurados.' },
              { n: '03', t: 'Activa integraciones', d: 'Con un clic activas SIGE, SAE y JUNAEB. Kiva360 establece la conexión y valida las credenciales.' },
              { n: '04', t: 'Empieza hoy', d: 'El libro de clases digital está listo. El profesor pasa asistencia, el director ve el reporte en tiempo real.' },
            ].map(s => (
              <div key={s.n} className="step-card">
                <div className="step-line" />
                <div className="step-n">{s.n}</div>
                <div className="step-t">{s.t}</div>
                <div className="step-d">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="sec">
        <div className="c">
          <p className="sec-eyebrow">Testimonios</p>
          <h2 className="sec-h2">Lo que dicen<br />los directores</h2>
          <div className="testi-grid">
            {[
              { q: '"Antes tardábamos 3 horas cada 15 días en declarar asistencia al SIGE. Con Kiva360 son 5 minutos. No exagero."', name: 'Patricio Rojas', role: 'Director · Colegio San José, Maipú' },
              { q: '"El libro de clases digital tuvo resistencia al principio. A la semana ya no querían volver al papel."', name: 'Carmen Fuentes', role: 'UTP · Escuela República de Francia' },
              { q: '"El módulo SAE nos ahorró semanas de trabajo. La nómina del MINEDUC llega directo y matriculamos desde Kiva360."', name: 'Jorge Valdés', role: 'Sostenedor · Red Colegios del Maule' },
            ].map(t => (
              <div key={t.name} className="testi-card">
                <div className="testi-q">{t.q}</div>
                <div className="testi-author">
                  <strong>{t.name}</strong>
                  {t.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="sec sec-gray" id="precios">
        <div className="c">
          <p className="sec-eyebrow">Precios</p>
          <h2 className="sec-h2">Simple y transparente</h2>
          <p className="sec-sub">Sin letra chica. Menos de lo que cuesta una secretaria un día al mes.</p>
          <div className="pricing-grid">
            {[
              { n: 'Básico', p: '$49.990', per: '/mes', desc: 'Para colegios hasta 300 alumnos', feats: ['Libro de clases digital', 'Hasta 300 alumnos', 'SIGE integrado', 'Dashboard básico', 'Soporte por email'], featured: false },
              { n: 'Completo', p: '$89.990', per: '/mes', desc: 'El más popular · Hasta 800 alumnos', feats: ['Todo lo del plan Básico', 'Hasta 800 alumnos', 'SAE + JUNAEB integrados', 'Comunicación con apoderados', 'Soporte WhatsApp directo', 'Reportes MINEDUC'], featured: true },
              { n: 'Enterprise', p: 'A convenir', per: '', desc: 'Redes de colegios y sostenedores', feats: ['Alumnos ilimitados', 'Múltiples establecimientos', 'API para integraciones propias', 'Onboarding personalizado', 'SLA garantizado', 'Gerente de cuenta'], featured: false },
            ].map(plan => (
              <div key={plan.n} className={`plan-card${plan.featured ? ' plan-card--feat' : ''}`}>
                {plan.featured && <div className="plan-feat-lbl">MÁS POPULAR</div>}
                <div className="plan-n">{plan.n}</div>
                <div className="plan-p">{plan.p}<span> {plan.per}</span></div>
                <div className="plan-desc">{plan.desc}</div>
                <ul className="plan-feats">
                  {plan.feats.map(f => (
                    <li key={f} className="plan-feat-li">
                      <span className="plan-feat-ok">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="/login" className={plan.featured ? 'plan-btn-d' : 'plan-btn-o'}>
                  {plan.featured ? 'Solicitar demo →' : 'Comenzar →'}
                </a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#999' }}>
            30 días gratis sin tarjeta de crédito · Precios en CLP + IVA · Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec" id="faq">
        <div className="c--sm">
          <p className="sec-eyebrow">FAQ</p>
          <h2 className="sec-h2">Preguntas frecuentes</h2>
          <div className="faq-list">
            {[
              { q: '¿Es oficial? ¿Lo acepta el MINEDUC?', a: 'Sí. El libro de clases digital cumple con el Decreto 67 y las circulares MINEDUC sobre digitalización. Las integraciones usan las APIs oficiales de SIGE, SAE y JUNAEB.' },
              { q: '¿Qué pasa con los datos de los alumnos?', a: 'Los datos se almacenan en servidores en Chile, encriptados. Son 100% del colegio. Kiva360 no accede ni vende datos de alumnos a terceros.' },
              { q: '¿Cuánto tiempo toma implementar Kiva360?', a: 'Un colegio promedio está operativo en menos de 10 minutos. El onboarding guiado configura el RBD, importa alumnos y activa las integraciones paso a paso.' },
              { q: '¿Necesitamos capacitación?', a: 'No. El diseño es tan simple que la mayoría de los usuarios no necesita manual. Si en una demo de 15 minutos lo entiendes, cualquier profesor lo entiende.' },
              { q: '¿Qué soporte tienen?', a: 'Soporte directo por WhatsApp con Pablo y Carlos, los fundadores. Sin call centers, sin tickets que tardan días. Respuesta en menos de 2 horas en horario hábil.' },
              { q: '¿Pueden migrar datos desde Lirmi u otro sistema?', a: 'Sí. El equipo migra los datos sin costo adicional para planes anuales. Incluye alumnos, cursos, historial de asistencia y notas.' },
            ].map(item => (
              <div key={item.q} className="faq-item">
                <div className="faq-q">{item.q}</div>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-sec">
        <div className="c--sm">
          <p className="cta-eyebrow">Piloto gratuito</p>
          <h2 className="cta-h2">¿Listo para eliminar el trabajo administrativo de tu colegio?</h2>
          <p className="cta-sub">30 días gratis. Sin tarjeta de crédito. Sin compromisos.<br />Si no te convence, no pagas nada.</p>
          <div className="cta-btns">
            <a href="/login" className="btn-lg btn-white">Comenzar gratis →</a>
            <a href="mailto:contacto@kiva360.cl" className="btn-lg btn-outline-w">Hablar con el equipo</a>
          </div>
          <p className="cta-note">contacto@kiva360.cl · Respuesta en menos de 2 horas</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="c">
          <div className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '24px', height: '24px', background: 'white', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#0A0A0A' }}>K</div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'white', letterSpacing: '-0.02em' }}>Kiva360</span>
              </div>
              <p className="footer-desc">La plataforma de gestión escolar hecha en Chile para colegios chilenos.</p>
            </div>
            {[
              { title: 'Producto', links: ['Libro de Clases', 'Evaluaciones', 'Comunicación', 'SIGE', 'SAE', 'JUNAEB'] },
              { title: 'Empresa',  links: ['Nosotros', 'Blog', 'Precios', 'Contacto'] },
              { title: 'Legal',    links: ['Términos', 'Privacidad', 'Datos personales'] },
            ].map(col => (
              <div key={col.title}>
                <div className="footer-col-t">{col.title}</div>
                {col.links.map(l => <a key={l} href="#" className="footer-lk">{l}</a>)}
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2026 Kiva360 · Hecho en Chile 🇨🇱</span>
            <span className="footer-copy">contacto@kiva360.cl</span>
          </div>
        </div>
      </footer>
    </>
  )
}
