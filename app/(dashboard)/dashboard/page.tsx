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
  const presentes    = registros.filter((r: any) => r.estado === 'P').length
  const pctAsist     = registros.length > 0 ? Math.round((presentes / registros.length) * 100) : null
  const totalEval    = evaluaciones.status === 'fulfilled' ? (evaluaciones.value.count ?? 0) : 0

  const nombre   = user.email?.split('@')[0] ?? 'Admin'
  const hoyLabel = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      <style>{`
        .d { font-family: 'Inter', -apple-system, sans-serif; }
        .d-header { margin-bottom: 1.75rem; }
        .d-eyebrow { font-size: 0.72rem; color: #999; margin-bottom: 0.3rem; text-transform: capitalize; }
        .d-title { font-size: 1.5rem; font-weight: 700; color: #1E3A5F; letter-spacing: -0.04em; }

        .d-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #EBEBEB; border: 1px solid #EBEBEB; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .d-stat { background: white; padding: 1.25rem; }
        .d-stat:hover { background: #FAFAFA; }
        .d-stat-n { font-size: 0.68rem; font-weight: 500; color: #999; letter-spacing: 0.04em; margin-bottom: 0.6rem; text-transform: uppercase; }
        .d-stat-v { font-size: 1.75rem; font-weight: 700; color: #1E3A5F; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.4rem; }
        .d-stat-t { font-size: 0.72rem; color: #BBB; }

        .d-banner { background: linear-gradient(135deg, #1E3A5F 0%, #1A56DB 100%); border-radius: 10px; padding: 1.1rem 1.3rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
        .d-banner-title { font-size: 0.88rem; font-weight: 600; color: white; letter-spacing: -0.02em; margin-bottom: 0.2rem; }
        .d-banner-sub { font-size: 0.75rem; color: rgba(255,255,255,0.7); }
        .d-banner-btn { font-size: 0.75rem; font-weight: 500; color: white; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 7px; padding: 0.4rem 0.9rem; text-decoration: none; white-space: nowrap; transition: all 0.12s; }
        .d-banner-btn:hover { background: rgba(255,255,255,0.25); }

        .d-sec-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
        .d-sec-title { font-size: 0.75rem; font-weight: 600; color: #1E3A5F; letter-spacing: -0.01em; }
        .d-sec-link { font-size: 0.72rem; color: #999; text-decoration: none; }
        .d-sec-link:hover { color: #1E3A5F; }

        .d-qa { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #EBEBEB; border: 1px solid #EBEBEB; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .d-qa-a { background: white; padding: 1rem; text-align: center; text-decoration: none; color: #444; font-size: 0.75rem; font-weight: 500; transition: background 0.12s, color 0.12s; display: block; }
        .d-qa-a:hover { background: #FAFAFA; color: #1E3A5F; }
        .d-qa-icon { font-size: 1.1rem; display: block; margin-bottom: 0.4rem; }

        .d-bottom { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
        .d-card { background: white; border: 1px solid #EBEBEB; border-radius: 10px; padding: 1.1rem; }

        .d-act { padding: 0.55rem 0; border-bottom: 1px solid #F5F5F5; display: flex; gap: 0.75rem; align-items: flex-start; }
        .d-act:last-child { border-bottom: none; }
        .d-act-dot { width: 6px; height: 6px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
        .d-act-txt { font-size: 0.75rem; color: #555; flex: 1; line-height: 1.5; }
        .d-act-time { font-size: 0.65rem; color: #CCC; white-space: nowrap; }

        .d-integ { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0; border-bottom: 1px solid #F5F5F5; }
        .d-integ:last-child { border-bottom: none; }
        .d-integ-name { font-size: 0.78rem; font-weight: 600; color: #1E3A5F; flex: 1; }
        .d-integ-desc { font-size: 0.68rem; color: #BBB; }
        .d-integ-ok { font-size: 0.62rem; font-weight: 600; color: #1A56DB; }
      `}</style>

      <div className="d">
        <div className="d-header">
          <div className="d-eyebrow">{hoyLabel}</div>
          <h1 className="d-title">Hola, {nombre} 👋</h1>
        </div>

        <div className="d-stats">
          {[
            { n: 'Estudiantes',     v: totalAlumnos.toString(),                  t: 'Activos este año' },
            { n: 'Asistencia hoy',  v: pctAsist !== null ? `${pctAsist}%` : '—', t: `${presentes} presentes hoy` },
            { n: 'Evaluaciones',    v: totalEval.toString(),                     t: '3 pendientes de calificar' },
            { n: 'Planificaciones', v: '9',                                      t: '4 este año · 5 archivadas' },
          ].map(s => (
            <div key={s.n} className="d-stat">
              <div className="d-stat-n">{s.n}</div>
              <div className="d-stat-v">{s.v}</div>
              <div className="d-stat-t">{s.t}</div>
            </div>
          ))}
        </div>

        <div className="d-banner">
          <div>
            <div className="d-banner-title">Kiva360 — Gestión centralizada</div>
            <div className="d-banner-sub">Libro de clases, evaluaciones y planificación en un solo lugar. Sin doble digitación.</div>
          </div>
          <a href="/planificacion" className="d-banner-btn">Ir a planificación →</a>
        </div>

        <div className="d-sec-hd"><span className="d-sec-title">Acciones rápidas</span></div>
        <div className="d-qa">
          {[
            { icon: '✅', label: 'Pasar asistencia', href: '/libro'         },
            { icon: '📝', label: 'Nueva evaluación', href: '/evaluaciones'   },
            { icon: '✉️', label: 'Enviar aviso',     href: '/comunicacion'   },
            { icon: '📚', label: 'Planificar',       href: '/planificacion'  },
          ].map(a => (
            <a key={a.label} href={a.href} className="d-qa-a">
              <span className="d-qa-icon">{a.icon}</span>
              {a.label}
            </a>
          ))}
        </div>

        <div className="d-bottom">
          <div className="d-card">
            <div className="d-sec-hd">
              <span className="d-sec-title">Actividad reciente</span>
              <a href="/comunicacion" className="d-sec-link">Ver todo →</a>
            </div>
            {[
              { color: '#22C55E', text: 'Sofía Alarcón — nota 6,8 en Control Fracciones', time: 'Hace 5 min' },
              { color: '#F59E0B', text: 'Matías Cárdenas acumula 2 inasistencias esta semana', time: 'Hoy 08:30' },
              { color: '#6366F1', text: 'Jorge Soto respondió tu mensaje sobre la planificación', time: 'Ayer 18:42' },
              { color: '#EF4444', text: 'Prueba de Lenguaje 3°A — 3 sin calificar', time: 'Ayer 14:15' },
              { color: '#22C55E', text: 'Planificación de Matemáticas 3°A publicada', time: 'Hace 5 días' },
            ].map((a, i) => (
              <div key={i} className="d-act">
                <div className="d-act-dot" style={{ background: a.color }} />
                <div className="d-act-txt">{a.text}</div>
                <div className="d-act-time">{a.time}</div>
              </div>
            ))}
          </div>
          <div className="d-card">
            <div className="d-sec-hd"><span className="d-sec-title">Por hacer esta semana</span></div>
            {[
              { icon: '📝', name: 'Calificar evaluaciones', desc: '3 pruebas pendientes' },
              { icon: '📚', name: 'Publicar planificación', desc: 'Ciencias 3°A en borrador' },
              { icon: '⚠️', name: 'Alumnos en riesgo',      desc: '3 requieren atención' },
            ].map(i => (
              <div key={i.name} className="d-integ">
                <span style={{ fontSize: '1rem' }}>{i.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="d-integ-name">{i.name}</div>
                  <div className="d-integ-desc">{i.desc}</div>
                </div>
                <span className="d-integ-ok">→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
