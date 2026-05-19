import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Cargar stats en paralelo
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

  const nombre = user.email?.split('@')[0] ?? 'Admin'
  const hoyLabel = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <style>{`
        .dash-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
        .dash-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .dash-grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
        .dash-grid-qa { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }

        .card { background: white; border-radius: 12px; border: 1px solid #E2E8F0; }
        .card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

        .stat-card { background: white; border-radius: 12px; border: 1px solid #E2E8F0; padding: 1.1rem; position: relative; overflow: hidden; transition: all 0.2s; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
        .stat-blue::before { background: linear-gradient(90deg, #6366F1, #8B5CF6); }
        .stat-green::before { background: linear-gradient(90deg, #10B981, #34D399); }
        .stat-purple::before { background: linear-gradient(90deg, #8B5CF6, #A78BFA); }
        .stat-red::before { background: linear-gradient(90deg, #EF4444, #F87171); }

        .stat-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 1rem; margin-bottom: 0.7rem; }
        .icon-blue   { background: #EEF2FF; }
        .icon-green  { background: #ECFDF5; }
        .icon-purple { background: #F5F3FF; }
        .icon-red    { background: #FEF2F2; }

        .stat-val { font-size: 1.9rem; font-weight: 800; color: #0F172A; line-height: 1; margin-bottom: 0.2rem; letter-spacing: -0.03em; }
        .stat-lbl { font-size: 0.72rem; color: #94A3B8; font-weight: 500; }
        .stat-tag { display: inline-flex; align-items: center; gap: 0.2rem; margin-top: 0.5rem; font-size: 0.65rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 20px; }
        .tag-green  { background: #ECFDF5; color: #059669; }
        .tag-yellow { background: #FFFBEB; color: #D97706; }

        .qa-card { background: white; border: 1px solid #E2E8F0; border-radius: 10px; padding: 0.9rem 0.75rem; text-align: center; text-decoration: none; color: #475569; display: block; transition: all 0.2s; }
        .qa-card:hover { border-color: #6366F1; background: #EEF2FF; color: #4F46E5; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99,102,241,0.15); }
        .qa-icon { font-size: 1.4rem; margin-bottom: 0.35rem; display: block; }
        .qa-label { font-size: 0.72rem; font-weight: 600; }

        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.9rem; }
        .section-title { font-size: 0.82rem; font-weight: 700; color: #1E293B; }
        .section-link { font-size: 0.72rem; color: #6366F1; font-weight: 600; text-decoration: none; }
        .section-link:hover { text-decoration: underline; }

        .banner { background: linear-gradient(135deg, #0B1120 0%, #1E1B4B 50%, #312E81 100%); border-radius: 14px; padding: 1.3rem 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.2rem; position: relative; overflow: hidden; }
        .banner::before { content: ''; position: absolute; top: -40px; right: -40px; width: 180px; height: 180px; background: rgba(99,102,241,0.15); border-radius: 50%; }
        .banner::after  { content: ''; position: absolute; bottom: -50px; right: 80px; width: 120px; height: 120px; background: rgba(139,92,246,0.1); border-radius: 50%; }
        .banner-title { font-size: 0.95rem; font-weight: 700; color: white; margin-bottom: 0.25rem; }
        .banner-desc  { font-size: 0.75rem; color: rgba(165,180,252,0.8); line-height: 1.5; }
        .banner-btn   { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.45rem 1rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; position: relative; z-index: 1; text-decoration: none; display: inline-block; transition: all 0.15s; }
        .banner-btn:hover { background: rgba(255,255,255,0.2); }

        .integ-card { background: white; border: 1px solid #E2E8F0; border-radius: 10px; padding: 0.9rem 1rem; display: flex; align-items: center; gap: 0.8rem; transition: all 0.15s; }
        .integ-card:hover { border-color: #C7D2FE; box-shadow: 0 2px 8px rgba(99,102,241,0.1); }
        .integ-icon { font-size: 1.2rem; flex-shrink: 0; }
        .integ-name { font-size: 0.82rem; font-weight: 700; color: #1E293B; }
        .integ-desc { font-size: 0.68rem; color: #94A3B8; }
        .integ-badge-ok { font-size: 0.62rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 20px; background: #ECFDF5; color: #059669; margin-left: auto; white-space: nowrap; }

        .act-item { display: flex; gap: 0.7rem; padding: 0.6rem 0; border-bottom: 1px solid #F8FAFC; }
        .act-item:last-child { border-bottom: none; }
        .act-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
        .act-text { font-size: 0.75rem; color: #475569; line-height: 1.5; flex: 1; }
        .act-time { font-size: 0.65rem; color: #CBD5E1; }
      `}</style>

      {/* Saludo */}
      <div style={{ marginBottom: '1.2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '0.2rem' }}>
          Hola, {nombre} 👋
        </h1>
        <p style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'capitalize' }}>{hoyLabel}</p>
      </div>

      {/* Banner */}
      <div className="banner">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="banner-title">🎓 Kiva360 — Sistema operativo</div>
          <div className="banner-desc">SIGE · SAE · JUNAEB integrados. Sin doble digitación, sin errores.</div>
        </div>
        <Link href="/integraciones/sige" className="banner-btn">Ver integraciones →</Link>
      </div>

      {/* Stats */}
      <div className="dash-grid-4" style={{ marginBottom: '1.2rem' }}>
        <div className="stat-card stat-blue">
          <div className="stat-icon icon-blue">👥</div>
          <div className="stat-val">{totalAlumnos}</div>
          <div className="stat-lbl">Estudiantes activos</div>
          <span className="stat-tag tag-green">↑ Activos</span>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon icon-green">✅</div>
          <div className="stat-val">{pctAsist !== null ? `${pctAsist}%` : '—'}</div>
          <div className="stat-lbl">Asistencia hoy</div>
          {pctAsist !== null && (
            <span className={`stat-tag ${pctAsist >= 85 ? 'tag-green' : 'tag-yellow'}`}>
              {pctAsist >= 85 ? '↑ Sobre meta' : '↓ Bajo meta'}
            </span>
          )}
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon icon-purple">📝</div>
          <div className="stat-val">{totalEval}</div>
          <div className="stat-lbl">Evaluaciones creadas</div>
          <span className="stat-tag tag-yellow">3 pendientes</span>
        </div>
        <div className="stat-card stat-red">
          <div className="stat-icon icon-red">🔗</div>
          <div className="stat-val">3</div>
          <div className="stat-lbl">Integraciones activas</div>
          <span className="stat-tag tag-green">● En línea</span>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div style={{ marginBottom: '1.2rem' }}>
        <div className="section-header">
          <span className="section-title">Acciones rápidas</span>
        </div>
        <div className="dash-grid-qa">
          {[
            { icon: '✅', label: 'Pasar asistencia', href: '/libro'               },
            { icon: '📝', label: 'Nueva evaluación', href: '/evaluaciones'         },
            { icon: '✉️', label: 'Enviar aviso',     href: '/comunicacion'         },
            { icon: '🔗', label: 'SIGE',             href: '/integraciones/sige'  },
          ].map(a => (
            <Link key={a.label} href={a.href} className="qa-card">
              <span className="qa-icon">{a.icon}</span>
              <span className="qa-label">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Fila inferior */}
      <div className="dash-grid-2">
        {/* Actividad reciente */}
        <div className="card" style={{ padding: '1rem 1.1rem' }}>
          <div className="section-header">
            <span className="section-title">Actividad reciente</span>
            <Link href="/comunicacion" className="section-link">Ver todo →</Link>
          </div>
          {[
            { color: '#10B981', text: 'Sofía Alarcón subió tarea de Matemáticas', time: 'Hace 5 min' },
            { color: '#EF4444', text: 'Diego Fuentes acumula 3 inasistencias seguidas', time: 'Hoy 08:30' },
            { color: '#6366F1', text: 'Apoderado de Valentina González envió mensaje', time: 'Ayer 18:42' },
            { color: '#F59E0B', text: 'Prueba de Lenguaje 3°A lista para revisar', time: 'Ayer 14:15' },
            { color: '#10B981', text: 'Declaración SIGE mayo 1–15 enviada', time: 'Hace 2 días' },
          ].map((a, i) => (
            <div key={i} className="act-item">
              <div className="act-dot" style={{ background: a.color }} />
              <div className="act-text">{a.text}</div>
              <div className="act-time">{a.time}</div>
            </div>
          ))}
        </div>

        {/* Integraciones */}
        <div>
          <div className="section-header">
            <span className="section-title">Estado integraciones</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { icon: '🔗', name: 'SIGE',   desc: 'Declaración mayo 16–31 pendiente' },
              { icon: '🎓', name: 'SAE',    desc: 'Proceso 2027 en curso'            },
              { icon: '🍽️', name: 'JUNAEB', desc: '847 raciones PAE hoy'             },
            ].map(integ => (
              <div key={integ.name} className="integ-card">
                <span className="integ-icon">{integ.icon}</span>
                <div>
                  <div className="integ-name">{integ.name}</div>
                  <div className="integ-desc">{integ.desc}</div>
                </div>
                <span className="integ-badge-ok">● Activo</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
