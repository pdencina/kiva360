import { getResumenColegio, getAsistenciaPorCurso, getRendimientoPorAsignatura, getAlumnosEnRiesgo } from '@/lib/actions/reportes'

export const dynamic = 'force-dynamic'

export default async function ReportesPage() {
  const [resumen, asistCurso, rendAsig, riesgo] = await Promise.all([
    getResumenColegio(),
    getAsistenciaPorCurso(),
    getRendimientoPorAsignatura(),
    getAlumnosEnRiesgo(),
  ])

  const pctColor = (p: number) => p >= 90 ? '#16A34A' : p >= 75 ? '#D97706' : '#DC2626'
  const notaColor = (n: number | null) => !n ? '#9B9A97' : n >= 6 ? '#16A34A' : n >= 4 ? '#D97706' : '#DC2626'

  return (
    <>
      <style>{`
        .r { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .r-header { margin-bottom: 1.5rem; }
        .r-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .r-sub { font-size: 0.8rem; color: #9B9A97; }

        .r-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .r-stat { background: white; padding: 1.1rem; }
        .r-stat-n { font-size: 0.65rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .r-stat-v { font-size: 1.6rem; font-weight: 700; color: #37352F; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.3rem; }
        .r-stat-t { font-size: 0.7rem; color: #9B9A97; }

        .r-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .r-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; }
        .r-card-title { font-size: 0.78rem; font-weight: 600; color: #37352F; margin-bottom: 1rem; letter-spacing: -0.01em; }

        .bar-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.65rem; }
        .bar-label { font-size: 0.75rem; color: #37352F; width: 60px; flex-shrink: 0; font-weight: 500; }
        .bar-track { flex: 1; height: 6px; background: #F0F0EE; border-radius: 10px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 10px; transition: width 0.6s ease; }
        .bar-val { font-size: 0.72rem; color: #6B6B6B; width: 36px; text-align: right; flex-shrink: 0; font-variant-numeric: tabular-nums; }

        .asig-row { display: flex; align-items: center; justify-content: space-between; padding: 0.55rem 0; border-bottom: 1px solid #F5F5F3; }
        .asig-row:last-child { border-bottom: none; }
        .asig-name { font-size: 0.78rem; color: #37352F; font-weight: 500; flex: 1; }
        .asig-stats { display: flex; gap: 1rem; align-items: center; }
        .asig-prom { font-size: 0.88rem; font-weight: 700; font-variant-numeric: tabular-nums; }
        .asig-meta { font-size: 0.68rem; color: #9B9A97; }

        .riesgo-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
        .riesgo-th { padding: 0.5rem 0.75rem; text-align: left; font-size: 0.65rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; background: #FAFAF8; border-bottom: 1px solid #E8E8E5; }
        .riesgo-td { padding: 0.6rem 0.75rem; border-bottom: 1px solid #F5F5F3; color: #37352F; }
        .riesgo-tr:last-child td { border-bottom: none; }
        .riesgo-pct { font-weight: 700; font-variant-numeric: tabular-nums; }
        .sep-badge { font-size: 0.6rem; font-weight: 600; background: #F0F0EE; color: #6B6B6B; padding: 0.1rem 0.4rem; border-radius: 3px; }

        .export-row { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .export-btn { font-size: 0.75rem; font-weight: 500; color: #6B6B6B; background: white; border: 1px solid #E8E8E5; border-radius: 7px; padding: 0.45rem 0.9rem; cursor: pointer; transition: all 0.12s; font-family: inherit; }
        .export-btn:hover { border-color: #37352F; color: #37352F; }
      `}</style>

      <div className="r">
        <div className="r-header">
          <h1 className="r-title">📊 Reportes</h1>
          <p className="r-sub">Analítica del establecimiento · {new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Exportar */}
        <div className="export-row">
          {['📄 Exportar PDF', '📊 Exportar Excel', '🔗 Reporte MINEDUC', '📧 Enviar por email'].map(btn => (
            <button key={btn} className="export-btn">{btn}</button>
          ))}
        </div>

        {/* Stats */}
        <div className="r-stats">
          {[
            { n: 'Alumnos',       v: resumen.totalAlumnos.toString(),                              t: `${resumen.totalSep} alumnos SEP` },
            { n: 'Asistencia hoy',v: resumen.pctAsistHoy !== null ? `${resumen.pctAsistHoy}%` : '—', t: `${resumen.presentesHoy} presentes` },
            { n: 'Prom. notas',   v: resumen.promedioNotas !== null ? resumen.promedioNotas.toFixed(1).replace('.', ',') : '—', t: `${resumen.pctAprobacion ?? '—'}% aprobación` },
            { n: 'Evaluaciones',  v: resumen.totalEval.toString(),                                 t: `${resumen.totalCursos} cursos activos` },
          ].map(s => (
            <div key={s.n} className="r-stat">
              <div className="r-stat-n">{s.n}</div>
              <div className="r-stat-v">{s.v}</div>
              <div className="r-stat-t">{s.t}</div>
            </div>
          ))}
        </div>

        <div className="r-grid">
          {/* Asistencia por curso */}
          <div className="r-card">
            <div className="r-card-title">Asistencia por curso — mes actual</div>
            {asistCurso.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: '#9B9A97' }}>Sin datos de asistencia</p>
            ) : asistCurso.map(c => (
              <div key={c.curso} className="bar-row">
                <span className="bar-label">{c.curso}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${c.pct}%`, background: pctColor(c.pct) }} />
                </div>
                <span className="bar-val" style={{ color: pctColor(c.pct) }}>{c.pct}%</span>
              </div>
            ))}
          </div>

          {/* Rendimiento por asignatura */}
          <div className="r-card">
            <div className="r-card-title">Rendimiento por asignatura</div>
            {rendAsig.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: '#9B9A97' }}>Sin datos de notas</p>
            ) : rendAsig.map(a => (
              <div key={a.asignatura} className="asig-row">
                <span className="asig-name">{a.asignatura}</span>
                <div className="asig-stats">
                  <span className="asig-meta">{a.aprobados}/{a.total} aprob.</span>
                  <span className="asig-prom" style={{ color: notaColor(a.promedio) }}>
                    {a.promedio.toFixed(1).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alumnos en riesgo */}
        <div className="r-card">
          <div className="r-card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Alumnos en riesgo — asistencia bajo 75%</span>
            <span style={{ fontSize: '0.7rem', color: '#9B9A97', fontWeight: 400 }}>{riesgo.length} alumnos</span>
          </div>
          {riesgo.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9B9A97', fontSize: '0.82rem' }}>
              ✅ Ningún alumno en riesgo este mes
            </div>
          ) : (
            <table className="riesgo-table">
              <thead>
                <tr>
                  <th className="riesgo-th">Alumno</th>
                  <th className="riesgo-th">Curso</th>
                  <th className="riesgo-th">% Asistencia</th>
                  <th className="riesgo-th">Días ausente</th>
                  <th className="riesgo-th">Acción</th>
                </tr>
              </thead>
              <tbody>
                {riesgo.map(a => (
                  <tr key={a.id} className="riesgo-tr">
                    <td className="riesgo-td">
                      {a.nombre}
                      {a.sep && <span className="sep-badge" style={{ marginLeft: '0.4rem' }}>SEP</span>}
                    </td>
                    <td className="riesgo-td" style={{ color: '#6B6B6B' }}>{a.curso}</td>
                    <td className="riesgo-td">
                      <span className="riesgo-pct" style={{ color: pctColor(a.pct_asistencia) }}>
                        {a.pct_asistencia}% ⚠️
                      </span>
                    </td>
                    <td className="riesgo-td" style={{ color: '#6B6B6B' }}>{a.dias_ausente} días</td>
                    <td className="riesgo-td">
                      <button style={{ fontSize: '0.72rem', color: '#37352F', background: '#F0F0EE', border: 'none', borderRadius: '5px', padding: '0.25rem 0.6rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Avisar apoderado
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
