export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function UTPPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Alumnos con sus notas para detectar riesgo
  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, nombre, apellido_paterno, alumno_sep, cursos(nombre)')
    .eq('activo', true)
    .order('apellido_paterno')

  const { data: notas } = await supabase
    .from('notas')
    .select('alumno_id, nota, evaluaciones(asignatura, ponderacion)')

  const { data: evaluaciones } = await supabase
    .from('evaluaciones')
    .select('id, titulo, asignatura, fecha, ponderacion, cursos(nombre)')
    .order('fecha', { ascending: false })

  // Calcular promedio por alumno
  const alumnosConRiesgo = (alumnos ?? []).map(a => {
    const notasAlumno = (notas ?? []).filter(n => n.alumno_id === a.id)
    const vals = notasAlumno.map(n => n.nota).filter(Boolean) as number[]
    const prom = vals.length > 0 ? Math.round(vals.reduce((x,y) => x+y,0) / vals.length * 10) / 10 : null
    const reprobadas = vals.filter(n => n < 4).length
    return {
      ...a,
      promedio: prom,
      reprobadas,
      enRiesgo: prom !== null && prom < 5,
      critico:  prom !== null && prom < 4,
    }
  }).sort((a,b) => (a.promedio ?? 9) - (b.promedio ?? 9))

  const enRiesgo = alumnosConRiesgo.filter(a => a.enRiesgo)
  const criticos = alumnosConRiesgo.filter(a => a.critico)

  // Asignaturas con mayor reprobación
  const asigStats: Record<string, { total: number; reprobados: number }> = {}
  ;(notas ?? []).forEach((n: any) => {
    const asig = n.evaluaciones?.asignatura
    if (!asig) return
    if (!asigStats[asig]) asigStats[asig] = { total: 0, reprobados: 0 }
    asigStats[asig].total++
    if (n.nota < 4) asigStats[asig].reprobados++
  })

  const asigRanking = Object.entries(asigStats)
    .map(([asig, s]) => ({ asig, ...s, pct: Math.round(s.reprobados / s.total * 100) }))
    .sort((a,b) => b.pct - a.pct)

  const notaColor = (n: number | null) => !n ? '#9B9A97' : n >= 6 ? '#16A34A' : n >= 5 ? '#D97706' : n >= 4 ? '#F59E0B' : '#DC2626'

  return (
    <>
      <style>{`
        .utp { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .utp-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .utp-sub { font-size: 0.8rem; color: #9B9A97; margin-bottom: 1.5rem; }

        .utp-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .utp-stat { background: white; padding: 1.1rem; }
        .utp-stat-n { font-size: 0.62rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .utp-stat-v { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.3rem; }
        .utp-stat-t { font-size: 0.68rem; color: #9B9A97; }

        .utp-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1rem; margin-bottom: 1rem; }
        .utp-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; margin-bottom: 1rem; }
        .utp-card-title { font-size: 0.78rem; font-weight: 600; color: #37352F; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; }
        .utp-card-count { font-size: 0.7rem; color: #9B9A97; font-weight: 400; }

        .utp-alumno { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0; border-bottom: 1px solid #F5F5F3; }
        .utp-alumno:last-child { border-bottom: none; }
        .utp-alumno-nombre { flex: 1; font-size: 0.8rem; font-weight: 500; color: #37352F; }
        .utp-alumno-curso { font-size: 0.68rem; color: #9B9A97; }
        .utp-alumno-sep { font-size: 0.58rem; font-weight: 600; background: #F0F0EE; color: #6B6B6B; padding: 0.08rem 0.35rem; border-radius: 3px; margin-left: 0.3rem; }
        .utp-prom { font-size: 0.9rem; font-weight: 700; font-variant-numeric: tabular-nums; }
        .utp-reprob { font-size: 0.65rem; color: #DC2626; }

        .utp-asig-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 0; border-bottom: 1px solid #F5F5F3; }
        .utp-asig-row:last-child { border-bottom: none; }
        .utp-asig-name { font-size: 0.78rem; font-weight: 500; color: #37352F; flex: 1; }
        .utp-asig-bar-track { width: 80px; height: 5px; background: #F0F0EE; border-radius: 10px; overflow: hidden; }
        .utp-asig-bar-fill { height: 100%; border-radius: 10px; }
        .utp-asig-pct { font-size: 0.72rem; font-weight: 700; width: 36px; text-align: right; font-variant-numeric: tabular-nums; }

        .utp-accion-btn { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; font-weight: 500; color: #6B6B6B; background: #F0F0EE; border: none; border-radius: 6px; padding: 0.3rem 0.7rem; cursor: pointer; font-family: inherit; text-decoration: none; }
        .utp-accion-btn:hover { background: #E8E8E5; color: #37352F; }
      `}</style>

      <div className="utp">
        <h1 className="utp-title">📋 Panel UTP</h1>
        <p className="utp-sub">Seguimiento académico y curricular · {new Date().getFullYear()}</p>

        {/* Stats */}
        <div className="utp-stats">
          {[
            { n: 'Total alumnos',    v: String(alumnos?.length ?? 0),  t: 'Activos' },
            { n: 'En riesgo',        v: String(enRiesgo.length),        t: 'Promedio bajo 5,0', color: enRiesgo.length > 0 ? '#D97706' : '#37352F' },
            { n: 'Críticos',         v: String(criticos.length),        t: 'Promedio bajo 4,0', color: criticos.length > 0 ? '#DC2626' : '#37352F' },
            { n: 'Asignaturas',      v: String(asigRanking.length),     t: 'Con evaluaciones' },
          ].map(s => (
            <div key={s.n} className="utp-stat">
              <div className="utp-stat-n">{s.n}</div>
              <div className="utp-stat-v" style={{ color: s.color ?? '#37352F' }}>{s.v}</div>
              <div className="utp-stat-t">{s.t}</div>
            </div>
          ))}
        </div>

        <div className="utp-grid">
          {/* Alumnos en riesgo */}
          <div className="utp-card">
            <div className="utp-card-title">
              Alumnos en riesgo académico
              <span className="utp-card-count">{enRiesgo.length} alumnos</span>
            </div>
            {enRiesgo.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: '#9B9A97' }}>✅ Sin alumnos en riesgo</p>
            ) : enRiesgo.slice(0, 8).map(a => (
              <div key={a.id} className="utp-alumno">
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.critico ? '#DC2626' : '#D97706', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="utp-alumno-nombre">
                    {a.apellido_paterno}, {a.nombre}
                    {a.alumno_sep && <span className="utp-alumno-sep">SEP</span>}
                  </div>
                  <div className="utp-alumno-curso">{(a as any).cursos?.nombre ?? '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="utp-prom" style={{ color: notaColor(a.promedio) }}>
                    {a.promedio ? a.promedio.toFixed(1).replace('.', ',') : '—'}
                  </div>
                  {a.reprobadas > 0 && <div className="utp-reprob">{a.reprobadas} reprobadas</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Reprobación por asignatura */}
          <div className="utp-card">
            <div className="utp-card-title">Reprobación por asignatura</div>
            {asigRanking.slice(0, 6).map(a => (
              <div key={a.asig} className="utp-asig-row">
                <span className="utp-asig-name">{a.asig}</span>
                <div className="utp-asig-bar-track">
                  <div className="utp-asig-bar-fill" style={{ width: `${a.pct}%`, background: a.pct > 30 ? '#DC2626' : a.pct > 15 ? '#D97706' : '#16A34A' }} />
                </div>
                <span className="utp-asig-pct" style={{ color: a.pct > 30 ? '#DC2626' : a.pct > 15 ? '#D97706' : '#16A34A' }}>{a.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluaciones recientes */}
        <div className="utp-card">
          <div className="utp-card-title">
            Evaluaciones recientes
            <a href="/evaluaciones" className="utp-accion-btn">Ver todas →</a>
          </div>
          {(evaluaciones ?? []).slice(0, 5).map(ev => (
            <div key={ev.id} className="utp-alumno">
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C2C0BB', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#37352F' }}>{ev.titulo}</div>
                <div style={{ fontSize: '0.68rem', color: '#9B9A97' }}>{(ev as any).cursos?.nombre} · {ev.asignatura} · {ev.ponderacion}%</div>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9B9A97' }}>
                {ev.fecha ? new Date(ev.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
