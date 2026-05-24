'use client'

import { useState } from 'react'

type Hijo = {
  id: string; nombre: string; apellido_paterno: string; apellido_materno: string
  rut: string; alumno_sep: boolean; beneficio_pae: boolean; pie: boolean
  diagnostico_pie: string | null; condicion_especial: string | null
  nombre_apoderado: string | null; telefono_apoderado: string | null
  cursos: { nombre: string; nivel: string } | null
}
type Nota = { nota: number; evaluaciones: { titulo: string; asignatura: string; fecha: string; ponderacion: number; tipo: string } | null }
type AsistInfo = { pct: number | null; total: number; ausencias: number; historial?: any[] }
type EntrevistaItem = { id: string; tipo: string; motivo: string; descripcion: string | null; acuerdos: string | null; nombre_apoderado: string | null; fecha: string; hora: string | null; realizada: boolean }
type AnotacionItem  = { id: string; tipo: string; titulo: string; descripcion: string; fecha: string }

interface Props {
  hijo: Hijo
  notas: Nota[]
  asistencia: { anio: AsistInfo & { historial: any[] }; mes: AsistInfo }
  rendimiento: { promGeneral: number | null; porAsignatura: { asig: string; prom: number; total: number }[] }
  entrevistas: { proximas: EntrevistaItem[]; historial: EntrevistaItem[] }
  anotaciones: AnotacionItem[]
  alumnoId: string
}

const notaColor = (n: number | null) => !n ? '#9B9A97' : n >= 6 ? '#16A34A' : n >= 5 ? '#D97706' : n >= 4 ? '#F59E0B' : '#DC2626'
const pctColor  = (p: number | null) => !p ? '#9B9A97' : p >= 90 ? '#16A34A' : p >= 75 ? '#D97706' : '#DC2626'
const fmtNota   = (n: number | null) => n !== null ? n.toFixed(1).replace('.', ',') : '—'
const fmtFecha  = (f: string) => new Date(f + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

const TIPO_ENTREV: Record<string, string> = {
  presencial: '🤝 Presencial', telefonica: '📞 Telefónica',
  virtual: '💻 Virtual', citacion: '📋 Citación'
}

const TIPO_ANOT: Record<string, { label: string; color: string; bg: string }> = {
  positiva:   { label: '✓ Positiva',   color: '#16A34A', bg: '#F0FDF4' },
  academica:  { label: '📚 Académica',  color: '#2563EB', bg: '#EFF6FF' },
  conductual: { label: '⚡ Conductual', color: '#D97706', bg: '#FFFBEB' },
  asistencia: { label: '📅 Asistencia', color: '#7C3AED', bg: '#F5F3FF' },
  salud:      { label: '🏥 Salud',      color: '#0891B2', bg: '#ECFEFF' },
  familiar:   { label: '👨‍👩‍👧 Familiar',  color: '#9B9A97', bg: '#F5F5F3' },
  neutra:     { label: '○ Neutra',      color: '#9B9A97', bg: '#F5F5F3' },
  negativa:   { label: '✗ Negativa',    color: '#DC2626', bg: '#FEF2F2' },
}

export function ApoderadoClient({ hijo, notas, asistencia, rendimiento, entrevistas, anotaciones }: Props) {
  const [tab, setTab] = useState<'resumen'|'notas'|'asistencia'|'entrevistas'|'comunicacion'>('resumen')

  const TABS = [
    { id: 'resumen',      label: 'Resumen'         },
    { id: 'notas',        label: `Notas (${notas.length})` },
    { id: 'asistencia',   label: 'Asistencia'      },
    { id: 'entrevistas',  label: `Entrevistas (${entrevistas.proximas.length + entrevistas.historial.length})` },
    { id: 'comunicacion', label: 'Comunicación'    },
  ]

  return (
    <>
      <style>{`
        .ap2 { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .ap2-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .ap2-sub { font-size: 0.8rem; color: #9B9A97; margin-bottom: 1.5rem; }

        .ap2-hero { background: #37352F; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; display: flex; gap: 1rem; align-items: flex-start; flex-wrap: wrap; }
        .ap2-av { width: 54px; height: 54px; border-radius: 10px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; color: white; flex-shrink: 0; }
        .ap2-hero-info { flex: 1; }
        .ap2-hero-nombre { font-size: 1.05rem; font-weight: 700; color: white; letter-spacing: -0.02em; margin-bottom: 0.2rem; }
        .ap2-hero-meta { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 0.5rem; }
        .ap2-hero-badges { display: flex; gap: 0.3rem; flex-wrap: wrap; }
        .ap2-badge { font-size: 0.6rem; font-weight: 600; padding: 0.12rem 0.45rem; border-radius: 3px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
        .ap2-hero-kpis { display: flex; gap: 1.5rem; flex-shrink: 0; }
        .ap2-hero-kpi { text-align: center; }
        .ap2-hero-kpi-v { font-size: 1.4rem; font-weight: 700; line-height: 1; margin-bottom: 0.15rem; }
        .ap2-hero-kpi-n { font-size: 0.62rem; color: rgba(255,255,255,0.4); text-transform: uppercase; }

        .ap2-alertas { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
        .ap2-alerta { display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 1rem; border-radius: 9px; font-size: 0.78rem; font-weight: 500; }
        .ap2-alerta-w { background: #FFFBEB; border: 1px solid #FDE68A; color: #D97706; }
        .ap2-alerta-d { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; }
        .ap2-alerta-ok { background: #F0FDF4; border: 1px solid #BBF7D0; color: #16A34A; }
        .ap2-alerta-info { background: #EFF6FF; border: 1px solid #BFDBFE; color: #2563EB; }

        .ap2-tabs { display: flex; border-bottom: 1px solid #E8E8E5; margin-bottom: 1.25rem; overflow-x: auto; }
        .ap2-tab { font-size: 0.78rem; font-weight: 400; padding: 0.55rem 0.85rem; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; color: #9B9A97; white-space: nowrap; font-family: inherit; transition: all 0.12s; margin-bottom: -1px; }
        .ap2-tab.active { color: #37352F; border-bottom-color: #37352F; font-weight: 600; }

        .ap2-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .ap2-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; margin-bottom: 1rem; }
        .ap2-card-title { font-size: 0.78rem; font-weight: 600; color: #37352F; margin-bottom: 1rem; }

        .ap2-stat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1rem; }
        .ap2-stat { background: white; padding: 1rem; text-align: center; }
        .ap2-stat-v { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.2rem; }
        .ap2-stat-n { font-size: 0.62rem; color: #9B9A97; text-transform: uppercase; letter-spacing: 0.04em; }

        .ap2-nota-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0; border-bottom: 1px solid #F5F5F3; }
        .ap2-nota-row:last-child { border-bottom: none; }
        .ap2-nota-info { flex: 1; }
        .ap2-nota-titulo { font-size: 0.8rem; font-weight: 500; color: #37352F; }
        .ap2-nota-meta { font-size: 0.68rem; color: #9B9A97; margin-top: 0.1rem; }
        .ap2-nota-val { font-size: 1rem; font-weight: 700; font-variant-numeric: tabular-nums; }

        .ap2-asig-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 0; border-bottom: 1px solid #F5F5F3; }
        .ap2-asig-row:last-child { border-bottom: none; }
        .ap2-asig-name { font-size: 0.8rem; font-weight: 500; color: #37352F; width: 120px; flex-shrink: 0; }
        .ap2-bar-track { flex: 1; height: 6px; background: #F0F0EE; border-radius: 10px; overflow: hidden; }
        .ap2-bar-fill { height: 100%; border-radius: 10px; }
        .ap2-asig-prom { font-size: 0.88rem; font-weight: 700; width: 36px; text-align: right; }

        .ap2-asist-dots { display: flex; flex-wrap: wrap; gap: 0.3rem; }
        .ap2-asist-dot { width: 28px; height: 28px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; }

        .ap2-entrev-row { padding: 0.85rem 0; border-bottom: 1px solid #F5F5F3; }
        .ap2-entrev-row:last-child { border-bottom: none; }
        .ap2-entrev-head { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.3rem; }
        .ap2-entrev-tipo { font-size: 0.7rem; font-weight: 600; background: #F0F0EE; color: #6B6B6B; padding: 0.15rem 0.5rem; border-radius: 4px; flex-shrink: 0; }
        .ap2-entrev-motivo { font-size: 0.82rem; font-weight: 500; color: #37352F; flex: 1; }
        .ap2-entrev-fecha { font-size: 0.7rem; color: #9B9A97; flex-shrink: 0; }
        .ap2-entrev-acuerdos { font-size: 0.75rem; color: #6B6B6B; line-height: 1.5; margin-top: 0.3rem; padding-left: 0.5rem; border-left: 2px solid #E8E8E5; }
        .ap2-entrev-pendiente { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 0.85rem; margin-bottom: 0.75rem; }
        .ap2-entrev-pendiente-titulo { font-size: 0.78rem; font-weight: 600; color: #2563EB; margin-bottom: 0.2rem; }
        .ap2-entrev-pendiente-meta { font-size: 0.72rem; color: #60A5FA; }

        .ap2-anot-row { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid #F5F5F3; }
        .ap2-anot-row:last-child { border-bottom: none; }
        .ap2-anot-tipo { font-size: 0.62rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 20px; flex-shrink: 0; }
        .ap2-anot-content { flex: 1; }
        .ap2-anot-titulo { font-size: 0.8rem; font-weight: 500; color: #37352F; margin-bottom: 0.2rem; }
        .ap2-anot-desc { font-size: 0.75rem; color: #6B6B6B; line-height: 1.5; }
        .ap2-anot-fecha { font-size: 0.68rem; color: #9B9A97; margin-top: 0.2rem; }

        .ap2-comm-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.5rem; text-align: center; margin-bottom: 1rem; }
        .ap2-comm-icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .ap2-comm-title { font-size: 0.9rem; font-weight: 600; color: #37352F; margin-bottom: 0.3rem; }
        .ap2-comm-sub { font-size: 0.78rem; color: #9B9A97; margin-bottom: 1rem; }
        .ap2-comm-btn { display: inline-block; padding: 0.65rem 1.5rem; background: #37352F; color: white; border-radius: 9px; text-decoration: none; font-size: 0.82rem; font-weight: 600; transition: background 0.12s; }
        .ap2-comm-btn:hover { background: #1A1A1A; }

        .ap2-empty { padding: 2rem; text-align: center; color: #9B9A97; font-size: 0.82rem; }
        .ap2-prog-bar { height: 8px; background: #F0F0EE; border-radius: 10px; overflow: hidden; margin: 0.5rem 0; }
        .ap2-prog-fill { height: 100%; border-radius: 10px; transition: width 0.8s; }
      `}</style>

      <div className="ap2">
        <h1 className="ap2-title">👨‍👩‍👧 Portal Apoderado</h1>
        <p className="ap2-sub">Seguimiento escolar de tu hijo/a · {new Date().getFullYear()}</p>

        {/* Hero alumno */}
        <div className="ap2-hero">
          <div className="ap2-av">{hijo.nombre[0]}{hijo.apellido_paterno[0]}</div>
          <div className="ap2-hero-info">
            <div className="ap2-hero-nombre">{hijo.apellido_paterno} {hijo.apellido_materno}, {hijo.nombre}</div>
            <div className="ap2-hero-meta">{hijo.cursos?.nombre} · {hijo.cursos?.nivel} · RUT {hijo.rut}</div>
            <div className="ap2-hero-badges">
              {hijo.alumno_sep    && <span className="ap2-badge">SEP</span>}
              {hijo.beneficio_pae && <span className="ap2-badge">PAE</span>}
              {hijo.pie           && <span className="ap2-badge">PIE</span>}
            </div>
          </div>
          <div className="ap2-hero-kpis">
            <div className="ap2-hero-kpi">
              <div className="ap2-hero-kpi-v" style={{ color: notaColor(rendimiento.promGeneral) }}>
                {fmtNota(rendimiento.promGeneral)}
              </div>
              <div className="ap2-hero-kpi-n">Promedio</div>
            </div>
            <div className="ap2-hero-kpi">
              <div className="ap2-hero-kpi-v" style={{ color: pctColor(asistencia.anio.pct) }}>
                {asistencia.anio.pct !== null ? `${asistencia.anio.pct}%` : '—'}
              </div>
              <div className="ap2-hero-kpi-n">Asistencia</div>
            </div>
            <div className="ap2-hero-kpi">
              <div className="ap2-hero-kpi-v" style={{ color: asistencia.anio.ausencias > 5 ? '#DC2626' : '#9B9A97' }}>
                {asistencia.anio.ausencias}
              </div>
              <div className="ap2-hero-kpi-n">Ausencias</div>
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div className="ap2-alertas">
          {asistencia.anio.pct !== null && asistencia.anio.pct < 75 && (
            <div className="ap2-alerta ap2-alerta-d">
              🔴 La asistencia anual está bajo el 75% reglamentario ({asistencia.anio.pct}%). Por favor contacte al colegio con urgencia.
            </div>
          )}
          {asistencia.mes.ausencias >= 3 && (
            <div className="ap2-alerta ap2-alerta-w">
              ⚠️ {asistencia.mes.ausencias} ausencias este mes — se recomienda hablar con el profesor jefe.
            </div>
          )}
          {entrevistas.proximas.length > 0 && (
            <div className="ap2-alerta ap2-alerta-info">
              📅 Tienes {entrevistas.proximas.length} entrevista{entrevistas.proximas.length > 1 ? 's' : ''} pendiente{entrevistas.proximas.length > 1 ? 's' : ''} con el colegio.
            </div>
          )}
          {rendimiento.promGeneral !== null && rendimiento.promGeneral < 4 && (
            <div className="ap2-alerta ap2-alerta-d">
              🔴 El promedio general ({fmtNota(rendimiento.promGeneral)}) está bajo el mínimo de aprobación.
            </div>
          )}
          {asistencia.anio.pct !== null && asistencia.anio.pct >= 90 && rendimiento.promGeneral !== null && rendimiento.promGeneral >= 5.5 && (
            <div className="ap2-alerta ap2-alerta-ok">
              ✓ Tu hijo/a tiene excelente asistencia y buen rendimiento académico. ¡Sigan así!
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="ap2-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`ap2-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id as any)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── RESUMEN ── */}
        {tab === 'resumen' && (
          <>
            <div className="ap2-stat-grid">
              {[
                { n: 'Promedio general', v: fmtNota(rendimiento.promGeneral), color: notaColor(rendimiento.promGeneral) },
                { n: 'Asistencia anual',  v: asistencia.anio.pct !== null ? `${asistencia.anio.pct}%` : '—', color: pctColor(asistencia.anio.pct) },
                { n: 'Ausencias año',     v: String(asistencia.anio.ausencias), color: asistencia.anio.ausencias > 5 ? '#DC2626' : '#37352F' },
              ].map(s => (
                <div key={s.n} className="ap2-stat">
                  <div className="ap2-stat-v" style={{ color: s.color }}>{s.v}</div>
                  <div className="ap2-stat-n">{s.n}</div>
                </div>
              ))}
            </div>

            {/* Próximas entrevistas */}
            {entrevistas.proximas.length > 0 && (
              <div className="ap2-card">
                <div className="ap2-card-title">📅 Entrevistas pendientes</div>
                {entrevistas.proximas.map(e => (
                  <div key={e.id} className="ap2-entrev-pendiente">
                    <div className="ap2-entrev-pendiente-titulo">{e.motivo}</div>
                    <div className="ap2-entrev-pendiente-meta">
                      {TIPO_ENTREV[e.tipo]} · {fmtFecha(e.fecha)}{e.hora ? ` a las ${e.hora.slice(0,5)}` : ''}
                    </div>
                    {e.nombre_apoderado && <div style={{ fontSize: '0.7rem', color: '#60A5FA', marginTop: '0.2rem' }}>Apoderado: {e.nombre_apoderado}</div>}
                  </div>
                ))}
              </div>
            )}

            <div className="ap2-grid">
              {/* Rendimiento por asignatura */}
              <div className="ap2-card">
                <div className="ap2-card-title">Rendimiento por asignatura</div>
                {rendimiento.porAsignatura.length === 0 ? (
                  <div className="ap2-empty">Sin notas registradas</div>
                ) : rendimiento.porAsignatura.map(a => (
                  <div key={a.asig} className="ap2-asig-row">
                    <span className="ap2-asig-name">{a.asig}</span>
                    <div className="ap2-bar-track">
                      <div className="ap2-bar-fill" style={{ width: `${(a.prom/7)*100}%`, background: notaColor(a.prom) }} />
                    </div>
                    <span className="ap2-asig-prom" style={{ color: notaColor(a.prom) }}>{fmtNota(a.prom)}</span>
                  </div>
                ))}
              </div>

              {/* Asistencia este mes */}
              <div className="ap2-card">
                <div className="ap2-card-title">Asistencia este mes</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: pctColor(asistencia.mes.pct) }}>
                    {asistencia.mes.pct !== null ? `${asistencia.mes.pct}%` : '—'}
                  </span>
                  <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#9B9A97' }}>
                    <div>{asistencia.mes.total - asistencia.mes.ausencias} presentes</div>
                    <div style={{ color: asistencia.mes.ausencias > 0 ? '#DC2626' : '#9B9A97' }}>{asistencia.mes.ausencias} ausencias</div>
                  </div>
                </div>
                <div className="ap2-prog-bar">
                  <div className="ap2-prog-fill" style={{ width: `${asistencia.mes.pct ?? 0}%`, background: pctColor(asistencia.mes.pct) }} />
                </div>
                {hijo.condicion_especial && (
                  <div style={{ marginTop: '0.75rem', background: '#FFFBEB', borderRadius: '7px', padding: '0.55rem 0.75rem', fontSize: '0.75rem', color: '#D97706' }}>
                    ⚠️ {hijo.condicion_especial}
                  </div>
                )}
              </div>
            </div>

            {/* Últimas anotaciones visibles */}
            {anotaciones.length > 0 && (
              <div className="ap2-card">
                <div className="ap2-card-title">Observaciones recientes</div>
                {anotaciones.slice(0,3).map(a => {
                  const tipo = TIPO_ANOT[a.tipo] ?? TIPO_ANOT.neutra
                  return (
                    <div key={a.id} className="ap2-anot-row">
                      <span className="ap2-anot-tipo" style={{ background: tipo.bg, color: tipo.color }}>{tipo.label}</span>
                      <div className="ap2-anot-content">
                        <div className="ap2-anot-titulo">{a.titulo}</div>
                        <div className="ap2-anot-desc">{a.descripcion}</div>
                        <div className="ap2-anot-fecha">{fmtFecha(a.fecha)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── NOTAS ── */}
        {tab === 'notas' && (
          <>
            <div className="ap2-card">
              <div className="ap2-card-title">Promedio por asignatura</div>
              {rendimiento.porAsignatura.map(a => (
                <div key={a.asig} className="ap2-asig-row">
                  <span className="ap2-asig-name">{a.asig}</span>
                  <div className="ap2-bar-track">
                    <div className="ap2-bar-fill" style={{ width: `${(a.prom/7)*100}%`, background: notaColor(a.prom) }} />
                  </div>
                  <span className="ap2-asig-prom" style={{ color: notaColor(a.prom) }}>{fmtNota(a.prom)}</span>
                  <span style={{ fontSize: '0.68rem', color: '#9B9A97', width: '50px', textAlign: 'right' }}>{a.total} eval.</span>
                </div>
              ))}
            </div>

            <div className="ap2-card">
              <div className="ap2-card-title">Historial de notas</div>
              {notas.length === 0 ? (
                <div className="ap2-empty">Sin notas registradas</div>
              ) : notas.map((n, i) => (
                <div key={i} className="ap2-nota-row">
                  <div className="ap2-nota-info">
                    <div className="ap2-nota-titulo">{n.evaluaciones?.titulo ?? '—'}</div>
                    <div className="ap2-nota-meta">
                      {n.evaluaciones?.asignatura} · {n.evaluaciones?.tipo} · {n.evaluaciones?.ponderacion}%
                      {n.evaluaciones?.fecha && ` · ${fmtFecha(n.evaluaciones.fecha)}`}
                    </div>
                  </div>
                  <div className="ap2-nota-val" style={{ color: notaColor(n.nota) }}>{fmtNota(n.nota)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── ASISTENCIA ── */}
        {tab === 'asistencia' && (
          <>
            <div className="ap2-stat-grid">
              {[
                { n: 'Asistencia anual',  v: asistencia.anio.pct !== null ? `${asistencia.anio.pct}%` : '—', color: pctColor(asistencia.anio.pct) },
                { n: 'Asistencia mensual',v: asistencia.mes.pct  !== null ? `${asistencia.mes.pct}%`  : '—', color: pctColor(asistencia.mes.pct)  },
                { n: 'Ausencias año',     v: String(asistencia.anio.ausencias), color: asistencia.anio.ausencias > 5 ? '#DC2626' : '#37352F' },
              ].map(s => (
                <div key={s.n} className="ap2-stat">
                  <div className="ap2-stat-v" style={{ color: s.color }}>{s.v}</div>
                  <div className="ap2-stat-n">{s.n}</div>
                </div>
              ))}
            </div>

            <div className="ap2-card">
              <div className="ap2-card-title">Historial de asistencia — últimos 30 días</div>
              <div className="ap2-asist-dots">
                {asistencia.anio.historial.map((a: any, i: number) => (
                  <div key={i} title={`${a.fecha} — ${a.estado === 'P' ? 'Presente' : a.estado === 'A' ? 'Ausente' : 'Justificado'}`}
                    className="ap2-asist-dot"
                    style={{
                      background: a.estado === 'P' ? '#F0FDF4' : a.estado === 'A' ? '#FEF2F2' : '#FFFBEB',
                      color: a.estado === 'P' ? '#16A34A' : a.estado === 'A' ? '#DC2626' : '#D97706',
                    }}>
                    {a.estado}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.72rem', color: '#9B9A97' }}>
                <span style={{ color: '#16A34A' }}>■ P = Presente</span>
                <span style={{ color: '#DC2626' }}>■ A = Ausente</span>
                <span style={{ color: '#D97706' }}>■ J = Justificado</span>
              </div>
            </div>

            {asistencia.anio.pct !== null && asistencia.anio.pct < 85 && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '1rem', fontSize: '0.82rem', color: '#D97706', lineHeight: 1.6 }}>
                <strong>⚠️ Atención:</strong> La normativa MINEDUC exige un mínimo del 85% de asistencia para ser promovido. Actualmente tu hijo/a tiene {asistencia.anio.pct}%. Se recomienda regularizar la asistencia a la brevedad.
              </div>
            )}
          </>
        )}

        {/* ── ENTREVISTAS ── */}
        {tab === 'entrevistas' && (
          <>
            {entrevistas.proximas.length > 0 && (
              <div className="ap2-card">
                <div className="ap2-card-title">📅 Entrevistas programadas</div>
                {entrevistas.proximas.map(e => (
                  <div key={e.id} className="ap2-entrev-pendiente" style={{ marginBottom: '0.5rem' }}>
                    <div className="ap2-entrev-pendiente-titulo">{e.motivo}</div>
                    <div className="ap2-entrev-pendiente-meta">
                      {TIPO_ENTREV[e.tipo]} · {fmtFecha(e.fecha)}{e.hora ? ` · ${e.hora.slice(0,5)} hrs` : ''}
                    </div>
                    {e.descripcion && <div style={{ fontSize: '0.75rem', color: '#60A5FA', marginTop: '0.3rem' }}>{e.descripcion}</div>}
                  </div>
                ))}
              </div>
            )}

            <div className="ap2-card">
              <div className="ap2-card-title">Historial de entrevistas</div>
              {entrevistas.historial.length === 0 ? (
                <div className="ap2-empty">Sin entrevistas anteriores</div>
              ) : entrevistas.historial.map(e => (
                <div key={e.id} className="ap2-entrev-row">
                  <div className="ap2-entrev-head">
                    <span className="ap2-entrev-tipo">{TIPO_ENTREV[e.tipo] ?? e.tipo}</span>
                    <span className="ap2-entrev-motivo">{e.motivo}</span>
                    <span className="ap2-entrev-fecha">{fmtFecha(e.fecha)}</span>
                  </div>
                  {e.acuerdos && (
                    <div className="ap2-entrev-acuerdos">
                      <strong>Acuerdos:</strong> {e.acuerdos}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── COMUNICACIÓN ── */}
        {tab === 'comunicacion' && (
          <>
            <div className="ap2-comm-card">
              <div className="ap2-comm-icon">✉️</div>
              <div className="ap2-comm-title">Mensajes con el colegio</div>
              <div className="ap2-comm-sub">Comunícate directamente con el profesor jefe y el equipo directivo</div>
              <a href="/comunicacion" className="ap2-comm-btn">Ir a mensajes →</a>
            </div>

            <div className="ap2-comm-card">
              <div className="ap2-comm-icon">📋</div>
              <div className="ap2-comm-title">Observaciones del profesor</div>
              <div className="ap2-comm-sub">Anotaciones registradas por el equipo docente</div>
            </div>

            {anotaciones.length === 0 ? (
              <div className="ap2-card"><div className="ap2-empty">Sin observaciones registradas</div></div>
            ) : (
              <div className="ap2-card">
                <div className="ap2-card-title">Observaciones recientes</div>
                {anotaciones.map(a => {
                  const tipo = TIPO_ANOT[a.tipo] ?? TIPO_ANOT.neutra
                  return (
                    <div key={a.id} className="ap2-anot-row">
                      <span className="ap2-anot-tipo" style={{ background: tipo.bg, color: tipo.color }}>{tipo.label}</span>
                      <div className="ap2-anot-content">
                        <div className="ap2-anot-titulo">{a.titulo}</div>
                        <div className="ap2-anot-desc">{a.descripcion}</div>
                        <div className="ap2-anot-fecha">{fmtFecha(a.fecha)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
