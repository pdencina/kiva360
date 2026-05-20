import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoy = new Date().toISOString().split('T')[0]
  const [alumnos, asistenciaHoy, evaluaciones] = await Promise.allSettled([
    supabase.from('alumnos').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('asistencia').select('estado').eq('fecha', hoy),
    supabase.from('evaluaciones').select('id', { count: 'exact', head: true }),
  ])

  const totalAlumnos = alumnos.status === 'fulfilled' ? (alumnos.value.count ?? 0) : 0
  const registros    = asistenciaHoy.status === 'fulfilled' ? (asistenciaHoy.value.data ?? []) : []
  const presentes    = registros.filter(r => r.estado === 'P').length
  const pctAsist     = registros.length > 0 ? Math.round((presentes / registros.length) * 100) : null
  const totalEval    = evaluaciones.status === 'fulfilled' ? (evaluaciones.value.count ?? 0) : 0

  const nombre   = user.email?.split('@')[0] ?? 'Admin'
  const hoyLabel = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        .dash { font-family: 'DM Sans', sans-serif; }

        /* ── Header ── */
        .dash-header { margin-bottom: 1.5rem; }
        .dash-eyebrow {
          font-size: 0.7rem;
          color: #94A3B8;
          font-weight: 400;
          text-transform: capitalize;
          margin-bottom: 0.3rem;
        }
        .dash-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .dash-title .wave { font-family: 'DM Sans', sans-serif; font-size: 1.4rem; }

        /* ── Banner ── */
        .dash-banner {
          background: #0D1117;
          border-radius: 14px;
          padding: 1.3rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.4rem;
          position: relative;
          overflow: hidden;
        }
        .dash-banner::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 200px; height: 200px;
          background: radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .dash-banner::after {
          content: '';
          position: absolute;
          bottom: -30px; left: 30%;
          width: 150px; height: 150px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .dash-banner-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.62rem;
          font-weight: 600;
          color: rgba(245,158,11,0.8);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 0.4rem;
        }
        .dash-banner-dot {
          width: 5px; height: 5px;
          background: #F59E0B;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(245,158,11,0.9);
        }
        .dash-banner-title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: white;
          letter-spacing: -0.02em;
          margin-bottom: 0.2rem;
        }
        .dash-banner-sub {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.35);
          font-weight: 300;
        }
        .dash-banner-btn {
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.25);
          color: #F59E0B;
          padding: 0.45rem 1rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .dash-banner-btn:hover {
          background: rgba(245,158,11,0.18);
          border-color: rgba(245,158,11,0.4);
        }

        /* ── Stats ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.85rem;
          margin-bottom: 1.4rem;
        }
        .stat-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #E8ECF0;
          padding: 1.1rem;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }

        /* Línea superior de color */
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
        }
        .sc-amber::before { background: linear-gradient(90deg, #F59E0B, #EF4444); }
        .sc-green::before { background: linear-gradient(90deg, #10B981, #34D399); }
        .sc-blue::before  { background: linear-gradient(90deg, #6366F1, #8B5CF6); }
        .sc-rose::before  { background: linear-gradient(90deg, #F43F5E, #FB7185); }

        .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.05em;
          line-height: 1;
          margin-bottom: 0.25rem;
        }
        .stat-lbl { font-size: 0.72rem; color: #94A3B8; font-weight: 400; margin-bottom: 0.5rem; }
        .stat-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.62rem;
          font-weight: 600;
          padding: 0.15rem 0.5rem;
          border-radius: 20px;
        }
        .tag-amber { background: rgba(245,158,11,0.1); color: #D97706; }
        .tag-green { background: rgba(16,185,129,0.1); color: #059669; }
        .tag-blue  { background: rgba(99,102,241,0.1); color: #4F46E5; }

        /* ── Section header ── */
        .sec-hd {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.8rem;
        }
        .sec-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.01em;
        }
        .sec-link {
          font-size: 0.7rem;
          color: #F59E0B;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .sec-link:hover { opacity: 0.7; }

        /* ── Acciones rápidas ── */
        .qa-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.7rem;
          margin-bottom: 1.4rem;
        }
        .qa-card {
          background: white;
          border: 1px solid #E8ECF0;
          border-radius: 11px;
          padding: 1rem 0.75rem;
          text-align: center;
          text-decoration: none;
          color: #475569;
          transition: all 0.2s;
          display: block;
        }
        .qa-card:hover {
          border-color: #F59E0B;
          background: rgba(245,158,11,0.03);
          color: #D97706;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245,158,11,0.1);
        }
        .qa-icon { font-size: 1.3rem; margin-bottom: 0.4rem; display: block; }
        .qa-lbl  { font-size: 0.7rem; font-weight: 600; }

        /* ── Bottom grid ── */
        .bottom-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 0.85rem;
        }
        .card {
          background: white;
          border: 1px solid #E8ECF0;
          border-radius: 12px;
          padding: 1.1rem;
        }

        /* Actividad */
        .act-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.6rem 0;
          border-bottom: 1px solid #F8FAFC;
          align-items: flex-start;
        }
        .act-item:last-child { border-bottom: none; }
        .act-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }
        .act-text { font-size: 0.75rem; color: #475569; flex: 1; line-height: 1.5; }
        .act-time { font-size: 0.65rem; color: #CBD5E1; white-space: nowrap; }

        /* Integraciones */
        .integ-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.8rem;
          background: #FAFAFA;
          border: 1px solid #F1F5F9;
          border-radius: 9px;
          margin-bottom: 0.5rem;
          transition: all 0.15s;
        }
        .integ-card:last-child { margin-bottom: 0; }
        .integ-card:hover { background: #F8FAFC; }
        .integ-icon { font-size: 1rem; flex-shrink: 0; }
        .integ-name { font-size: 0.78rem; font-weight: 600; color: #0F172A; }
        .integ-desc { font-size: 0.65rem; color: #94A3B8; }
        .integ-ok {
          margin-left: auto;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 20px;
          background: rgba(245,158,11,0.08);
          color: #D97706;
          white-space: nowrap;
          border: 1px solid rgba(245,158,11,0.15);
        }
      `}</style>

      <div className="dash">
        {/* Header */}
        <div className="dash-header">
          <div className="dash-eyebrow" style={{ textTransform: 'capitalize' }}>{hoyLabel}</div>
          <h1 className="dash-title">
            Hola, {nombre} <span className="wave">👋</span>
          </h1>
        </div>

        {/* Banner */}
        <div className="dash-banner">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="dash-banner-tag">
              <span className="dash-banner-dot" />
              Sistema operativo
            </div>
            <div className="dash-banner-title">Kiva360 — Todo conectado</div>
            <div className="dash-banner-sub">SIGE · SAE · JUNAEB integrados. Sin doble digitación.</div>
          </div>
          <a href="/integraciones/sige" className="dash-banner-btn">
            Ver integraciones →
          </a>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card sc-amber">
            <div className="stat-num">{totalAlumnos}</div>
            <div className="stat-lbl">Estudiantes activos</div>
            <span className="stat-tag tag-amber">↑ Matriculados</span>
          </div>
          <div className="stat-card sc-green">
            <div className="stat-num">{pctAsist !== null ? `${pctAsist}%` : '—'}</div>
            <div className="stat-lbl">Asistencia hoy</div>
            <span className="stat-tag tag-green">
              {pctAsist !== null ? (pctAsist >= 85 ? '↑ Sobre meta' : '↓ Bajo meta') : 'Sin datos'}
            </span>
          </div>
          <div className="stat-card sc-blue">
            <div className="stat-num">{totalEval}</div>
            <div className="stat-lbl">Evaluaciones</div>
            <span className="stat-tag tag-blue">3 pendientes</span>
          </div>
          <div className="stat-card sc-rose">
            <div className="stat-num">3</div>
            <div className="stat-lbl">Integraciones</div>
            <span className="stat-tag" style={{ background: 'rgba(244,63,94,0.08)', color: '#E11D48' }}>● En línea</span>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="sec-hd">
          <span className="sec-title">Acciones rápidas</span>
        </div>
        <div className="qa-grid">
          {[
            { icon: '✅', label: 'Pasar asistencia', href: '/libro' },
            { icon: '📝', label: 'Nueva evaluación', href: '/evaluaciones' },
            { icon: '✉️', label: 'Enviar aviso',     href: '/comunicacion' },
            { icon: '🔗', label: 'SIGE',             href: '/integraciones/sige' },
          ].map(a => (
            <a key={a.label} href={a.href} className="qa-card">
              <span className="qa-icon">{a.icon}</span>
              <span className="qa-lbl">{a.label}</span>
            </a>
          ))}
        </div>

        {/* Bottom */}
        <div className="bottom-grid">
          <div className="card">
            <div className="sec-hd">
              <span className="sec-title">Actividad reciente</span>
              <a href="/comunicacion" className="sec-link">Ver todo →</a>
            </div>
            {[
              { color: '#10B981', text: 'Sofía Alarcón — nota 6,8 en Control Fracciones', time: 'Hace 5 min' },
              { color: '#F59E0B', text: 'Matías Cárdenas acumula 2 inasistencias esta semana', time: 'Hoy 08:30' },
              { color: '#6366F1', text: 'Jorge Soto respondió tu mensaje sobre el SAE', time: 'Ayer 18:42' },
              { color: '#F43F5E', text: 'Prueba de Lenguaje 3°A — 3 sin calificar', time: 'Ayer 14:15' },
              { color: '#10B981', text: 'Declaración SIGE mayo 1–15 enviada correctamente', time: 'Hace 5 días' },
            ].map((a, i) => (
              <div key={i} className="act-item">
                <div className="act-dot" style={{ background: a.color }} />
                <div className="act-text">{a.text}</div>
                <div className="act-time">{a.time}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="sec-hd">
              <span className="sec-title">Integraciones</span>
            </div>
            {[
              { icon: '🔗', name: 'SIGE',   desc: 'Declaración may 16–31 pendiente' },
              { icon: '🎓', name: 'SAE',    desc: 'Proceso 2027 · 4 pendientes'     },
              { icon: '🍽️', name: 'JUNAEB', desc: '141 desayunos · 200 almuerzos'  },
            ].map(i => (
              <div key={i.name} className="integ-card">
                <span className="integ-icon">{i.icon}</span>
                <div>
                  <div className="integ-name">{i.name}</div>
                  <div className="integ-desc">{i.desc}</div>
                </div>
                <span className="integ-ok">● Activo</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
