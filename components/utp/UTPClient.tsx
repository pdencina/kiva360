'use client'

import { useState } from 'react'

type AlumnoRiesgo = {
  id: string; nombre: string; apellido_paterno: string
  alumno_sep: boolean; pie: boolean
  cursos: { id: string; nombre: string } | null
  promedio: number | null; reprobadas: number
  enRiesgo: boolean; critico: boolean
}
type AsigStat = { asig: string; total: number; reprobados: number; pct: number; prom: number }
type CoberturaOA = { asig: string; oas: string[]; total: number }
type Plan = {
  id: string; titulo: string; asignatura: string; fecha: string
  estado: string; oas: string[]; estrategias: string[]
  cursos: { nombre: string } | null; perfiles: { nombre: string } | null
}
type Curso = { id: string; nombre: string; nivel: string }
type Stats = {
  totalAlumnos: number; enRiesgo: number; criticos: number
  totalPlanes: number; realizados: number; publicados: number
  borradores: number; pctRealizados: number; asignaturas: number
}

interface Props {
  alumnosRiesgo: AlumnoRiesgo[]; asigRanking: AsigStat[]
  coberturaOA: CoberturaOA[]; planes: Plan[]
  cursos: Curso[]; stats: Stats
}

const notaColor = (n: number | null) => !n ? '#9B9A97' : n >= 6 ? '#16A34A' : n >= 5 ? '#D97706' : n >= 4 ? '#F59E0B' : '#DC2626'
const pctColor  = (p: number) => p > 30 ? '#DC2626' : p > 15 ? '#D97706' : '#16A34A'
const estadoStyle = (e: string) =>
  e === 'realizado' ? { bg: '#F0F0EE', color: '#6B6B6B', label: '✓ Realizado' } :
  e === 'publicado' ? { bg: '#EFF6FF', color: '#2563EB', label: '→ Publicado' } :
                      { bg: '#FFFBEB', color: '#D97706', label: '✎ Borrador'  }

export function UTPClient({ alumnosRiesgo, asigRanking, coberturaOA, planes, cursos, stats }: Props) {
  const [tab,        setTab]        = useState<'resumen'|'riesgo'|'cobertura'|'planificaciones'>('resumen')
  const [filtroCurso, setFiltroCurso] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const planesFiltrados = planes.filter(p => {
    const cursoOk  = filtroCurso  === 'todos' || p.cursos?.nombre === filtroCurso
    const estadoOk = filtroEstado === 'todos' || p.estado === filtroEstado
    return cursoOk && estadoOk
  })

  const TABS = [
    { id: 'resumen',         label: 'Resumen ejecutivo' },
    { id: 'riesgo',          label: `Alumnos en riesgo (${stats.enRiesgo})` },
    { id: 'cobertura',       label: 'Cobertura curricular' },
    { id: 'planificaciones', label: `Planificaciones (${stats.totalPlanes})` },
  ]

  return (
    <>
      <style>{`
        .utp2 { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .utp2-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .utp2-sub { font-size: 0.8rem; color: #9B9A97; margin-bottom: 1.5rem; }

        .utp2-kpis { display: grid; grid-template-columns: repeat(5,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .utp2-kpi { background: white; padding: 1rem; }
        .utp2-kpi-n { font-size: 0.62rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .utp2-kpi-v { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.2rem; }
        .utp2-kpi-t { font-size: 0.68rem; color: #9B9A97; }

        .utp2-tabs { display: flex; border-bottom: 1px solid #E8E8E5; margin-bottom: 1.25rem; overflow-x: auto; }
        .utp2-tab { font-size: 0.78rem; font-weight: 400; padding: 0.55rem 0.9rem; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; color: #9B9A97; white-space: nowrap; font-family: inherit; transition: all 0.12s; margin-bottom: -1px; }
        .utp2-tab.active { color: #37352F; border-bottom-color: #37352F; font-weight: 600; }

        .utp2-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .utp2-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; margin-bottom: 1rem; }
        .utp2-card-title { font-size: 0.78rem; font-weight: 600; color: #37352F; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; }
        .utp2-card-count { font-size: 0.7rem; color: #9B9A97; font-weight: 400; }

        .utp2-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0; border-bottom: 1px solid #F5F5F3; }
        .utp2-row:last-child { border-bottom: none; }
        .utp2-nombre { flex: 1; font-size: 0.8rem; font-weight: 500; color: #37352F; }
        .utp2-curso { font-size: 0.68rem; color: #9B9A97; }
        .utp2-sep { font-size: 0.58rem; font-weight: 600; background: #EDE9FE; color: #7C3AED; padding: 0.08rem 0.35rem; border-radius: 3px; margin-left: 0.3rem; }
        .utp2-pie { font-size: 0.58rem; font-weight: 600; background: #FEF3C7; color: #D97706; padding: 0.08rem 0.35rem; border-radius: 3px; margin-left: 0.2rem; }
        .utp2-prom { font-size: 0.9rem; font-weight: 700; font-variant-numeric: tabular-nums; }
        .utp2-reprob { font-size: 0.65rem; color: #DC2626; }

        .utp2-bar-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 0; border-bottom: 1px solid #F5F5F3; }
        .utp2-bar-row:last-child { border-bottom: none; }
        .utp2-bar-lbl { font-size: 0.78rem; font-weight: 500; color: #37352F; width: 120px; flex-shrink: 0; }
        .utp2-bar-track { flex: 1; height: 6px; background: #F0F0EE; border-radius: 10px; overflow: hidden; }
        .utp2-bar-fill { height: 100%; border-radius: 10px; transition: width 0.6s; }
        .utp2-bar-val { font-size: 0.72rem; font-weight: 700; width: 36px; text-align: right; font-variant-numeric: tabular-nums; }
        .utp2-prom-val { font-size: 0.78rem; font-weight: 600; width: 32px; text-align: right; }

        .utp2-oa-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1rem; margin-bottom: 0.75rem; }
        .utp2-oa-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
        .utp2-oa-asig { font-size: 0.82rem; font-weight: 600; color: #37352F; }
        .utp2-oa-count { font-size: 0.72rem; font-weight: 600; color: #9B9A97; }
        .utp2-oa-chips { display: flex; gap: 0.3rem; flex-wrap: wrap; }
        .utp2-oa-chip { font-size: 0.65rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 4px; background: #EFF6FF; color: #2563EB; }

        .utp2-toolbar { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .utp2-select { padding: 0.45rem 0.75rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.78rem; color: #37352F; outline: none; font-family: inherit; background: white; }
        .utp2-filter { font-size: 0.75rem; font-weight: 500; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; font-family: inherit; border: 1px solid #E8E8E5; background: white; color: #6B6B6B; transition: all 0.12s; }
        .utp2-filter.active { background: #37352F; color: white; border-color: #37352F; }

        .utp2-plan-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid #F5F5F3; }
        .utp2-plan-row:last-child { border-bottom: none; }
        .utp2-plan-fecha { width: 42px; text-align: center; flex-shrink: 0; }
        .utp2-plan-fecha-d { font-size: 1.1rem; font-weight: 700; color: #37352F; line-height: 1; }
        .utp2-plan-fecha-m { font-size: 0.6rem; color: #9B9A97; text-transform: uppercase; }
        .utp2-plan-div { width: 1px; height: 36px; background: #E8E8E5; flex-shrink: 0; }
        .utp2-plan-info { flex: 1; min-width: 0; }
        .utp2-plan-titulo { font-size: 0.8rem; font-weight: 500; color: #37352F; }
        .utp2-plan-meta { font-size: 0.68rem; color: #9B9A97; margin-top: 0.1rem; }
        .utp2-plan-oas { display: flex; gap: 0.2rem; flex-wrap: wrap; }
        .utp2-plan-oa { font-size: 0.58rem; font-weight: 600; padding: 0.1rem 0.3rem; border-radius: 3px; background: #EFF6FF; color: #2563EB; }
        .utp2-plan-estado { font-size: 0.62rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 20px; flex-shrink: 0; }

        .utp2-empty { text-align: center; padding: 2.5rem; color: #9B9A97; font-size: 0.82rem; }

        .utp2-progress { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; margin-bottom: 1rem; }
        .utp2-progress-hd { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .utp2-progress-lbl { font-size: 0.75rem; font-weight: 600; color: #37352F; }
        .utp2-progress-val { font-size: 0.75rem; color: #9B9A97; }
        .utp2-track { height: 8px; background: #F0F0EE; border-radius: 10px; overflow: hidden; }
        .utp2-fill { height: 100%; background: #37352F; border-radius: 10px; transition: width 0.8s; }

        .utp2-alerta { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 9px; font-size: 0.78rem; font-weight: 500; margin-bottom: 0.5rem; }
        .utp2-alerta-w { background: #FFFBEB; border: 1px solid #FDE68A; color: #D97706; }
        .utp2-alerta-d { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; }
        .utp2-alerta-ok { background: #F0FDF4; border: 1px solid #BBF7D0; color: #16A34A; }
      `}</style>

      <div className="utp2">
        <h1 className="utp2-title">📋 Panel UTP</h1>
        <p className="utp2-sub">Supervisión curricular y académica · {new Date().getFullYear()}</p>

        {/* KPIs */}
        <div className="utp2-kpis">
          {[
            { n: 'Total alumnos',    v: String(stats.totalAlumnos), t: 'Activos',          color: '#37352F' },
            { n: 'En riesgo',        v: String(stats.enRiesgo),     t: 'Promedio bajo 5,0', color: stats.enRiesgo > 0 ? '#D97706' : '#37352F' },
            { n: 'Críticos',         v: String(stats.criticos),     t: 'Promedio bajo 4,0', color: stats.criticos > 0 ? '#DC2626' : '#37352F' },
            { n: 'Planes de clase',  v: String(stats.totalPlanes),  t: `${stats.pctRealizados}% realizados`, color: '#37352F' },
            { n: 'Asignaturas',      v: String(stats.asignaturas),  t: 'Con evaluaciones',  color: '#37352F' },
          ].map(k => (
            <div key={k.n} className="utp2-kpi">
              <div className="utp2-kpi-n">{k.n}</div>
              <div className="utp2-kpi-v" style={{ color: k.color }}>{k.v}</div>
              <div className="utp2-kpi-t">{k.t}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="utp2-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`utp2-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id as any)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── RESUMEN ── */}
        {tab === 'resumen' && (
          <>
            {/* Alertas */}
            {stats.criticos > 0 && (
              <div className="utp2-alerta utp2-alerta-d">
                🔴 {stats.criticos} alumno{stats.criticos > 1 ? 's' : ''} con promedio crítico bajo 4,0 — requiere intervención urgente
              </div>
            )}
            {stats.enRiesgo > 0 && (
              <div className="utp2-alerta utp2-alerta-w">
                ⚠️ {stats.enRiesgo} alumno{stats.enRiesgo > 1 ? 's' : ''} con promedio bajo 5,0 — monitoreo necesario
              </div>
            )}
            {stats.borradores > 0 && (
              <div className="utp2-alerta utp2-alerta-w">
                ✎ {stats.borradores} plan{stats.borradores > 1 ? 'es' : ''} de clase en borrador sin publicar
              </div>
            )}
            {stats.criticos === 0 && stats.enRiesgo === 0 && (
              <div className="utp2-alerta utp2-alerta-ok">
                ✓ Sin alertas críticas — el establecimiento está en buen estado académico
              </div>
            )}

            {/* Barra progreso planificaciones */}
            <div className="utp2-progress">
              <div className="utp2-progress-hd">
                <span className="utp2-progress-lbl">Avance de planificaciones {new Date().getFullYear()}</span>
                <span className="utp2-progress-val">{stats.realizados} de {stats.totalPlanes} clases realizadas</span>
              </div>
              <div className="utp2-track">
                <div className="utp2-fill" style={{ width: `${stats.pctRealizados}%` }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.6rem', fontSize: '0.72rem', color: '#9B9A97' }}>
                <span>✓ {stats.realizados} realizadas</span>
                <span>→ {stats.publicados} publicadas</span>
                <span>✎ {stats.borradores} borradores</span>
              </div>
            </div>

            <div className="utp2-grid">
              {/* Top 5 alumnos en riesgo */}
              <div className="utp2-card">
                <div className="utp2-card-title">
                  Alumnos prioritarios
                  <span className="utp2-card-count">{alumnosRiesgo.filter(a => a.enRiesgo).length} en riesgo</span>
                </div>
                {alumnosRiesgo.filter(a => a.enRiesgo).slice(0, 5).map(a => (
                  <div key={a.id} className="utp2-row">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.critico ? '#DC2626' : '#D97706', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="utp2-nombre">
                        {a.apellido_paterno}, {a.nombre}
                        {a.alumno_sep && <span className="utp2-sep">SEP</span>}
                        {a.pie        && <span className="utp2-pie">PIE</span>}
                      </div>
                      <div className="utp2-curso">{(a as any).cursos?.nombre ?? '—'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="utp2-prom" style={{ color: notaColor(a.promedio) }}>
                        {a.promedio ? a.promedio.toFixed(1).replace('.', ',') : '—'}
                      </div>
                      {a.reprobadas > 0 && <div className="utp2-reprob">{a.reprobadas} reprobadas</div>}
                    </div>
                  </div>
                ))}
                {alumnosRiesgo.filter(a => a.enRiesgo).length === 0 && (
                  <div className="utp2-empty">✅ Sin alumnos en riesgo</div>
                )}
              </div>

              {/* Reprobación por asignatura */}
              <div className="utp2-card">
                <div className="utp2-card-title">Reprobación por asignatura</div>
                {asigRanking.slice(0, 6).map(a => (
                  <div key={a.asig} className="utp2-bar-row">
                    <span className="utp2-bar-lbl">{a.asig}</span>
                    <div className="utp2-bar-track">
                      <div className="utp2-bar-fill" style={{ width: `${a.pct}%`, background: pctColor(a.pct) }} />
                    </div>
                    <span className="utp2-bar-val" style={{ color: pctColor(a.pct) }}>{a.pct}%</span>
                    <span className="utp2-prom-val" style={{ color: notaColor(a.prom) }}>{a.prom.toFixed(1).replace('.', ',')}</span>
                  </div>
                ))}
                {asigRanking.length === 0 && <div className="utp2-empty">Sin datos de notas</div>}
              </div>
            </div>
          </>
        )}

        {/* ── ALUMNOS EN RIESGO ── */}
        {tab === 'riesgo' && (
          <div className="utp2-card">
            <div className="utp2-card-title">
              Alumnos en riesgo académico
              <span className="utp2-card-count">{alumnosRiesgo.filter(a => a.enRiesgo).length} alumnos</span>
            </div>
            {alumnosRiesgo.filter(a => a.enRiesgo).length === 0 ? (
              <div className="utp2-empty">✅ Ningún alumno en riesgo este año</div>
            ) : alumnosRiesgo.filter(a => a.enRiesgo).map(a => (
              <div key={a.id} className="utp2-row">
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: a.critico ? '#DC2626' : '#D97706', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#37352F' }}>
                    {a.apellido_paterno}, {a.nombre}
                    {a.alumno_sep && <span className="utp2-sep">SEP</span>}
                    {a.pie        && <span className="utp2-pie">PIE</span>}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9B9A97' }}>{(a as any).cursos?.nombre ?? '—'}</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: notaColor(a.promedio) }}>
                    {a.promedio ? a.promedio.toFixed(1).replace('.', ',') : '—'}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#9B9A97' }}>promedio</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: a.reprobadas > 0 ? '#DC2626' : '#9B9A97' }}>
                    {a.reprobadas}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#9B9A97' }}>reprobadas</div>
                </div>
                <div>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '20px',
                    background: a.critico ? '#FEF2F2' : '#FFFBEB',
                    color: a.critico ? '#DC2626' : '#D97706',
                  }}>
                    {a.critico ? '🔴 Crítico' : '⚠️ En riesgo'}
                  </span>
                </div>
                <a href={`/alumnos`} style={{ fontSize: '0.72rem', color: '#9B9A97', textDecoration: 'none', background: '#F0F0EE', padding: '0.28rem 0.65rem', borderRadius: '6px' }}>
                  Ver ficha →
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ── COBERTURA CURRICULAR ── */}
        {tab === 'cobertura' && (
          <>
            <div className="utp2-card">
              <div className="utp2-card-title">Rendimiento por asignatura</div>
              {asigRanking.map(a => (
                <div key={a.asig} className="utp2-bar-row">
                  <span className="utp2-bar-lbl">{a.asig}</span>
                  <div className="utp2-bar-track">
                    <div className="utp2-bar-fill" style={{ width: `${a.pct}%`, background: pctColor(a.pct) }} />
                  </div>
                  <span className="utp2-bar-val" style={{ color: pctColor(a.pct) }}>{a.pct}% reprob.</span>
                  <span className="utp2-prom-val" style={{ color: notaColor(a.prom), width: '60px', textAlign: 'right', fontSize: '0.82rem', fontWeight: 700 }}>
                    {a.prom.toFixed(1).replace('.', ',')} prom.
                  </span>
                </div>
              ))}
              {asigRanking.length === 0 && <div className="utp2-empty">Sin datos de evaluaciones</div>}
            </div>

            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#37352F', marginBottom: '0.75rem' }}>
              OA cubiertos por asignatura
            </div>
            {coberturaOA.length === 0 ? (
              <div className="utp2-card"><div className="utp2-empty">Sin OA registrados en planes de clase</div></div>
            ) : coberturaOA.sort((a,b) => b.total - a.total).map(c => (
              <div key={c.asig} className="utp2-oa-card">
                <div className="utp2-oa-header">
                  <span className="utp2-oa-asig">{c.asig}</span>
                  <span className="utp2-oa-count">{c.total} OA cubiertos en planificaciones</span>
                </div>
                <div className="utp2-oa-chips">
                  {c.oas.sort().map(oa => <span key={oa} className="utp2-oa-chip">{oa}</span>)}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── PLANIFICACIONES ── */}
        {tab === 'planificaciones' && (
          <>
            <div className="utp2-toolbar">
              <select className="utp2-select" value={filtroCurso} onChange={e => setFiltroCurso(e.target.value)}>
                <option value="todos">Todos los cursos</option>
                {cursos.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select>
              {(['todos','realizado','publicado','borrador'] as const).map(e => (
                <button key={e} className={`utp2-filter${filtroEstado === e ? ' active' : ''}`}
                  onClick={() => setFiltroEstado(e)}>
                  {e === 'todos' ? 'Todos' : estadoStyle(e).label}
                </button>
              ))}
            </div>

            <div className="utp2-card">
              <div className="utp2-card-title">
                Planes de clase
                <span className="utp2-card-count">{planesFiltrados.length} planes</span>
              </div>
              {planesFiltrados.length === 0 ? (
                <div className="utp2-empty">Sin planes para los filtros seleccionados</div>
              ) : planesFiltrados.map(p => {
                const fecha = new Date(p.fecha + 'T12:00:00')
                const est   = estadoStyle(p.estado)
                return (
                  <div key={p.id} className="utp2-plan-row">
                    <div className="utp2-plan-fecha">
                      <div className="utp2-plan-fecha-d">{fecha.getDate()}</div>
                      <div className="utp2-plan-fecha-m">{fecha.toLocaleDateString('es-CL', { month: 'short' })}</div>
                    </div>
                    <div className="utp2-plan-div" />
                    <div className="utp2-plan-info">
                      <div className="utp2-plan-titulo">{p.titulo}</div>
                      <div className="utp2-plan-meta">
                        {p.asignatura}
                        {p.cursos && ` · ${p.cursos.nombre}`}
                        {p.estrategias?.length > 0 && ` · ${p.estrategias.length} estrategias`}
                      </div>
                    </div>
                    {p.oas?.length > 0 && (
                      <div className="utp2-plan-oas">
                        {p.oas.slice(0,3).map(oa => <span key={oa} className="utp2-plan-oa">{oa}</span>)}
                      </div>
                    )}
                    <span className="utp2-plan-estado" style={{ background: est.bg, color: est.color }}>
                      {est.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </>
  )
}
