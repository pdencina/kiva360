export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DirectorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoy       = new Date().toISOString().split('T')[0]
  const inicioMes = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2,'0')}-01`

  const [alumnos, asistHoy, evals, sepAlumnos, notasData] = await Promise.all([
    supabase.from('alumnos').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('asistencia').select('estado').eq('fecha', hoy),
    supabase.from('evaluaciones').select('id', { count: 'exact', head: true }),
    supabase.from('alumnos').select('id', { count: 'exact', head: true }).eq('alumno_sep', true).eq('activo', true),
    supabase.from('notas').select('nota'),
  ])

  const totalAlumnos = alumnos.count ?? 0
  const registros    = asistHoy.data ?? []
  const presentes    = registros.filter(r => r.estado === 'P').length
  const ausentes     = registros.filter(r => r.estado === 'A').length
  const pctHoy       = registros.length > 0 ? Math.round((presentes / registros.length) * 100) : null
  const totalEvals   = evals.count ?? 0
  const totalSep     = sepAlumnos.count ?? 0
  const notasArr     = (notasData.data ?? []).map(n => n.nota).filter(Boolean) as number[]
  const promGeneral  = notasArr.length > 0 ? Math.round(notasArr.reduce((a,b) => a+b,0) / notasArr.length * 10) / 10 : null
  const pctAprueba   = notasArr.length > 0 ? Math.round(notasArr.filter(n => n >= 4).length / notasArr.length * 100) : null
  const pctReprueba  = pctAprueba !== null ? 100 - pctAprueba : null

  const pctColor = (p: number | null) => !p ? '#9B9A97' : p >= 90 ? '#16A34A' : p >= 75 ? '#D97706' : '#DC2626'
  const notaColor = (n: number | null) => !n ? '#9B9A97' : n >= 6 ? '#16A34A' : n >= 5 ? '#D97706' : '#DC2626'

  const ALERTAS = [
    pctHoy !== null && pctHoy < 85 && { nivel: 'warning', msg: `Asistencia hoy bajo el 85% — ${ausentes} alumnos ausentes` },
    promGeneral !== null && promGeneral < 5 && { nivel: 'danger', msg: `Promedio general bajo 5,0 — revisar con UTP` },
    pctReprueba !== null && pctReprueba > 20 && { nivel: 'warning', msg: `${pctReprueba}% de notas reprobadas — riesgo de repitencia` },
  ].filter(Boolean) as { nivel: string; msg: string }[]

  return (
    <>
      <style>{`
        .dir { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .dir-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .dir-sub { font-size: 0.8rem; color: #9B9A97; margin-bottom: 1.5rem; }

        .dir-alertas { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
        .dir-alerta { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 9px; font-size: 0.78rem; font-weight: 500; }
        .dir-alerta-w { background: #FFFBEB; border: 1px solid #FDE68A; color: #D97706; }
        .dir-alerta-d { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; }

        .dir-kpis { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .dir-kpi { background: white; padding: 1.1rem; }
        .dir-kpi-n { font-size: 0.62rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .dir-kpi-v { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.3rem; }
        .dir-kpi-t { font-size: 0.68rem; color: #9B9A97; }

        .dir-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .dir-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; }
        .dir-card-title { font-size: 0.78rem; font-weight: 600; color: #37352F; margin-bottom: 1rem; }

        .dir-metric { display: flex; align-items: center; justify-content: space-between; padding: 0.55rem 0; border-bottom: 1px solid #F5F5F3; }
        .dir-metric:last-child { border-bottom: none; }
        .dir-metric-lbl { font-size: 0.78rem; color: #37352F; }
        .dir-metric-val { font-size: 0.88rem; font-weight: 700; font-variant-numeric: tabular-nums; }

        .dir-bar-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem; }
        .dir-bar-lbl { font-size: 0.72rem; color: #6B6B6B; width: 80px; flex-shrink: 0; }
        .dir-bar-track { flex: 1; height: 5px; background: #F0F0EE; border-radius: 10px; overflow: hidden; }
        .dir-bar-fill { height: 100%; border-radius: 10px; }
        .dir-bar-val { font-size: 0.7rem; font-weight: 600; width: 32px; text-align: right; font-variant-numeric: tabular-nums; }

        .dir-acciones { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.75rem; margin-bottom: 1rem; }
        .dir-accion { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1rem; text-align: center; text-decoration: none; color: #37352F; transition: all 0.12s; display: block; }
        .dir-accion:hover { border-color: #37352F; background: #FAFAF8; }
        .dir-accion-icon { font-size: 1.3rem; display: block; margin-bottom: 0.4rem; }
        .dir-accion-lbl { font-size: 0.72rem; font-weight: 600; }
      `}</style>

      <div className="dir">
        <h1 className="dir-title">🏫 Panel Director</h1>
        <p className="dir-sub">Vista ejecutiva del establecimiento · {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

        {/* Alertas tempranas */}
        {ALERTAS.length > 0 && (
          <div className="dir-alertas">
            {ALERTAS.map((a, i) => (
              <div key={i} className={`dir-alerta ${a.nivel === 'danger' ? 'dir-alerta-d' : 'dir-alerta-w'}`}>
                {a.nivel === 'danger' ? '🔴' : '⚠️'} {a.msg}
              </div>
            ))}
          </div>
        )}

        {/* KPIs */}
        <div className="dir-kpis">
          {[
            { n: 'Alumnos',       v: String(totalAlumnos), t: `${totalSep} SEP`, color: '#37352F' },
            { n: 'Asistencia hoy',v: pctHoy !== null ? `${pctHoy}%` : '—', t: `${presentes} presentes`, color: pctColor(pctHoy) },
            { n: 'Prom. general', v: promGeneral ? promGeneral.toFixed(1).replace('.', ',') : '—', t: `${pctAprueba ?? '—'}% aprobación`, color: notaColor(promGeneral) },
            { n: 'Reprobación',   v: pctReprueba !== null ? `${pctReprueba}%` : '—', t: 'Notas bajo 4,0', color: pctReprueba && pctReprueba > 20 ? '#DC2626' : '#37352F' },
          ].map(k => (
            <div key={k.n} className="dir-kpi">
              <div className="dir-kpi-n">{k.n}</div>
              <div className="dir-kpi-v" style={{ color: k.color }}>{k.v}</div>
              <div className="dir-kpi-t">{k.t}</div>
            </div>
          ))}
        </div>

        {/* Métricas detalladas */}
        <div className="dir-grid">
          <div className="dir-card">
            <div className="dir-card-title">Rendimiento académico</div>
            {[
              { lbl: 'Promedio general', val: promGeneral ? promGeneral.toFixed(1).replace('.', ',') : '—', color: notaColor(promGeneral) },
              { lbl: 'Tasa aprobación',  val: pctAprueba !== null ? `${pctAprueba}%` : '—',  color: pctColor(pctAprueba) },
              { lbl: 'Tasa reprobación', val: pctReprueba !== null ? `${pctReprueba}%` : '—', color: pctReprueba && pctReprueba > 20 ? '#DC2626' : '#16A34A' },
              { lbl: 'Evaluaciones',     val: String(totalEvals), color: '#37352F' },
            ].map(m => (
              <div key={m.lbl} className="dir-metric">
                <span className="dir-metric-lbl">{m.lbl}</span>
                <span className="dir-metric-val" style={{ color: m.color }}>{m.val}</span>
              </div>
            ))}
          </div>

          <div className="dir-card">
            <div className="dir-card-title">Asistencia por estado</div>
            {[
              { lbl: 'Presentes', val: presentes, color: '#16A34A', pct: registros.length > 0 ? Math.round(presentes/registros.length*100) : 0 },
              { lbl: 'Ausentes',  val: ausentes,  color: '#DC2626', pct: registros.length > 0 ? Math.round(ausentes/registros.length*100) : 0 },
              { lbl: 'Sin datos', val: totalAlumnos - registros.length, color: '#9B9A97', pct: totalAlumnos > 0 ? Math.round((totalAlumnos-registros.length)/totalAlumnos*100) : 0 },
            ].map(b => (
              <div key={b.lbl} className="dir-bar-row">
                <span className="dir-bar-lbl">{b.lbl}</span>
                <div className="dir-bar-track">
                  <div className="dir-bar-fill" style={{ width: `${b.pct}%`, background: b.color }} />
                </div>
                <span className="dir-bar-val" style={{ color: b.color }}>{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones rápidas director */}
        <div className="dir-card" style={{ marginBottom: '1rem' }}>
          <div className="dir-card-title">Acciones del director</div>
          <div className="dir-acciones">
            {[
              { icon: '📊', lbl: 'Ver reportes',      href: '/reportes'           },
              { icon: '👥', lbl: 'Ver alumnos',        href: '/libro'              },
              { icon: '🔗', lbl: 'Declarar SIGE',      href: '/integraciones/sige' },
              { icon: '💰', lbl: 'Cobranzas',          href: '/cobranzas'          },
              { icon: '📋', lbl: 'Planificación UTP',  href: '/planificacion'      },
              { icon: '✉️', lbl: 'Comunicaciones',     href: '/comunicacion'       },
            ].map(a => (
              <a key={a.lbl} href={a.href} className="dir-accion">
                <span className="dir-accion-icon">{a.icon}</span>
                <span className="dir-accion-lbl">{a.lbl}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
