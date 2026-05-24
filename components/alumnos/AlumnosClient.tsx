'use client'

import { useState, useTransition } from 'react'
import { crearAnotacion, crearDerivacion, crearEntrevista, getFichaCompleta } from '@/lib/actions/ficha'

type Alumno = {
  id: string; nombre: string; apellido_paterno: string; apellido_materno: string
  rut: string; alumno_sep: boolean; pie: boolean
  cursos: { nombre: string; nivel: string } | null
}

interface Props { alumnos: Alumno[] }

// ── Directorio de alumnos ─────────────────────────────────────
export function AlumnosClient({ alumnos }: Props) {
  const [busqueda,   setBusqueda]   = useState('')
  const [filtroCurso, setFiltroCurso] = useState('todos')
  const [alumnoSel,  setAlumnoSel]  = useState<Alumno | null>(null)
  const [ficha,      setFicha]      = useState<any>(null)
  const [cargando,   setCargando]   = useState(false)

  const cursos = [...new Set(alumnos.map(a => a.cursos?.nombre).filter(Boolean))] as string[]

  const filtrados = alumnos.filter(a => {
    const q = busqueda.toLowerCase()
    const coincide = !q || `${a.apellido_paterno} ${a.nombre} ${a.rut}`.toLowerCase().includes(q)
    const cursoOk  = filtroCurso === 'todos' || a.cursos?.nombre === filtroCurso
    return coincide && cursoOk
  })

  const abrirFicha = async (a: Alumno) => {
    setAlumnoSel(a)
    setCargando(true)
    const data = await getFichaCompleta(a.id)
    setFicha(data)
    setCargando(false)
  }

  if (alumnoSel) {
    return (
      <FichaAlumnoClient
        alumno={alumnoSel}
        ficha={ficha}
        cargando={cargando}
        onVolver={() => { setAlumnoSel(null); setFicha(null) }}
      />
    )
  }

  return (
    <>
      <style>{`
        .al-toolbar { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .al-search { flex: 1; min-width: 200px; padding: 0.55rem 0.85rem; border: 1px solid #E8E8E5; border-radius: 8px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; }
        .al-search:focus { border-color: #37352F; }
        .al-select { padding: 0.55rem 0.85rem; border: 1px solid #E8E8E5; border-radius: 8px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; background: white; }

        .al-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem; }
        .al-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1rem; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 0.85rem; }
        .al-card:hover { border-color: #37352F; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .al-avatar { width: 38px; height: 38px; border-radius: 8px; background: #F0F0EE; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; color: #6B6B6B; flex-shrink: 0; }
        .al-nombre { font-size: 0.82rem; font-weight: 600; color: #37352F; margin-bottom: 0.15rem; }
        .al-meta { font-size: 0.7rem; color: #9B9A97; }
        .al-badges { display: flex; gap: 0.25rem; margin-top: 0.3rem; }
        .al-badge { font-size: 0.58rem; font-weight: 600; padding: 0.08rem 0.35rem; border-radius: 3px; background: #F0F0EE; color: #6B6B6B; }
        .al-badge-sep { background: #EDE9FE; color: #7C3AED; }
        .al-badge-pie { background: #FEF3C7; color: #D97706; }
      `}</style>

      <div className="al-toolbar">
        <input className="al-search" placeholder="🔍 Buscar por nombre o RUT..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        <select className="al-select" value={filtroCurso} onChange={e => setFiltroCurso(e.target.value)}>
          <option value="todos">Todos los cursos</option>
          {cursos.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="al-grid">
        {filtrados.map(a => (
          <div key={a.id} className="al-card" onClick={() => abrirFicha(a)}>
            <div className="al-avatar">{a.nombre[0]}{a.apellido_paterno[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="al-nombre">{a.apellido_paterno} {a.apellido_materno}, {a.nombre}</div>
              <div className="al-meta">{a.cursos?.nombre ?? '—'} · {a.rut}</div>
              <div className="al-badges">
                {a.alumno_sep && <span className="al-badge al-badge-sep">SEP</span>}
                {a.pie        && <span className="al-badge al-badge-pie">PIE</span>}
              </div>
            </div>
            <span style={{ color: '#C2C0BB', fontSize: '1rem' }}>›</span>
          </div>
        ))}
      </div>

      {filtrados.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9B9A97', fontSize: '0.82rem' }}>
          Sin resultados para "{busqueda}"
        </div>
      )}
    </>
  )
}

// ── Ficha completa del alumno ─────────────────────────────────
function FichaAlumnoClient({ alumno, ficha, cargando, onVolver }: {
  alumno: Alumno; ficha: any; cargando: boolean; onVolver: () => void
}) {
  const [tab, setTab] = useState<'resumen'|'notas'|'asistencia'|'anotaciones'|'derivaciones'|'entrevistas'>('resumen')
  const [modalAnot,   setModalAnot]   = useState(false)
  const [modalDeriv,  setModalDeriv]  = useState(false)
  const [modalEntrev, setModalEntrev] = useState(false)
  const [isPending,   startT]         = useTransition()
  const [msg, setMsg] = useState('')

  const notaColor = (n: number | null) => !n ? '#9B9A97' : n >= 6 ? '#16A34A' : n >= 4 ? '#D97706' : '#DC2626'
  const pctColor  = (p: number | null) => !p ? '#9B9A97' : p >= 90 ? '#16A34A' : p >= 75 ? '#D97706' : '#DC2626'
  const fmtNota   = (n: number | null) => n !== null ? n.toFixed(1).replace('.', ',') : '—'

  const TIPO_ANOT: Record<string, { label: string; color: string; bg: string }> = {
    positiva:   { label: '✓ Positiva',    color: '#16A34A', bg: '#F0FDF4' },
    negativa:   { label: '✗ Negativa',    color: '#DC2626', bg: '#FEF2F2' },
    academica:  { label: '📚 Académica',   color: '#2563EB', bg: '#EFF6FF' },
    conductual: { label: '⚡ Conductual',  color: '#D97706', bg: '#FFFBEB' },
    asistencia: { label: '📅 Asistencia',  color: '#7C3AED', bg: '#F5F3FF' },
    salud:      { label: '🏥 Salud',       color: '#0891B2', bg: '#ECFEFF' },
    familiar:   { label: '👨‍👩‍👧 Familiar',   color: '#9B9A97', bg: '#F5F5F3' },
    neutra:     { label: '○ Neutra',       color: '#9B9A97', bg: '#F5F5F3' },
  }

  const PROF_LABEL: Record<string, string> = {
    psicologo:        'Psicólogo/a',
    fonoaudiologo:    'Fonoaudiólogo/a',
    pie:              'Equipo PIE',
    asistente_social: 'Asistente Social',
    medico:           'Médico/a',
    otro:             'Otro profesional',
  }

  const TABS = [
    { id: 'resumen',      label: 'Resumen'      },
    { id: 'notas',        label: 'Notas'        },
    { id: 'asistencia',   label: 'Asistencia'   },
    { id: 'anotaciones',  label: `Anotaciones ${ficha?.anotaciones?.length ? `(${ficha.anotaciones.length})` : ''}` },
    { id: 'derivaciones', label: `Derivaciones ${ficha?.derivaciones?.length ? `(${ficha.derivaciones.length})` : ''}` },
    { id: 'entrevistas',  label: `Entrevistas ${ficha?.entrevistas?.length ? `(${ficha.entrevistas.length})` : ''}` },
  ]

  return (
    <>
      <style>{`
        .fc { width: 100%; font-family: 'Inter', system-ui, sans-serif; }
        .fc-back { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: #9B9A97; font-family: inherit; padding: 0; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.4rem; transition: color 0.12s; }
        .fc-back:hover { color: #37352F; }

        .fc-hero { background: #37352F; border-radius: 12px; padding: 1.25rem; display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1rem; }
        .fc-hero-av { width: 52px; height: 52px; border-radius: 10px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; color: white; flex-shrink: 0; }
        .fc-hero-nombre { font-size: 1.05rem; font-weight: 700; color: white; letter-spacing: -0.02em; margin-bottom: 0.2rem; }
        .fc-hero-meta { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 0.4rem; }
        .fc-hero-badges { display: flex; gap: 0.3rem; flex-wrap: wrap; }
        .fc-hero-badge { font-size: 0.6rem; font-weight: 600; padding: 0.12rem 0.45rem; border-radius: 3px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
        .fc-hero-stats { margin-left: auto; display: flex; gap: 1rem; }
        .fc-hero-stat { text-align: center; }
        .fc-hero-stat-v { font-size: 1.3rem; font-weight: 700; line-height: 1; }
        .fc-hero-stat-n { font-size: 0.62rem; color: rgba(255,255,255,0.4); margin-top: 0.2rem; }

        .fc-tabs { display: flex; border-bottom: 1px solid #E8E8E5; margin-bottom: 1rem; overflow-x: auto; gap: 0; }
        .fc-tab { font-size: 0.78rem; font-weight: 400; padding: 0.55rem 0.9rem; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; color: #9B9A97; white-space: nowrap; font-family: inherit; transition: all 0.12s; margin-bottom: -1px; }
        .fc-tab.active { color: #37352F; border-bottom-color: #37352F; font-weight: 600; }

        .fc-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; margin-bottom: 1rem; }
        .fc-card-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .fc-card-title { font-size: 0.78rem; font-weight: 600; color: #37352F; }
        .fc-add-btn { font-size: 0.72rem; font-weight: 600; color: white; background: #37352F; border: none; border-radius: 6px; padding: 0.3rem 0.75rem; cursor: pointer; font-family: inherit; }

        .fc-row { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid #F5F5F3; }
        .fc-row:last-child { border-bottom: none; }
        .fc-row-content { flex: 1; }
        .fc-row-title { font-size: 0.82rem; font-weight: 500; color: #37352F; margin-bottom: 0.2rem; }
        .fc-row-desc { font-size: 0.75rem; color: #6B6B6B; line-height: 1.5; }
        .fc-row-meta { font-size: 0.68rem; color: #9B9A97; margin-top: 0.3rem; }
        .fc-tipo-chip { font-size: 0.62rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 20px; }
        .fc-estado-chip { font-size: 0.62rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 20px; }

        .fc-data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
        .fc-data-item label { font-size: 0.65rem; font-weight: 600; color: #9B9A97; display: block; margin-bottom: 0.2rem; letter-spacing: 0.04em; text-transform: uppercase; }
        .fc-data-item span { font-size: 0.82rem; color: #37352F; }

        .fc-nota-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 0; border-bottom: 1px solid #F5F5F3; }
        .fc-nota-row:last-child { border-bottom: none; }
        .fc-nota-val { font-size: 0.95rem; font-weight: 700; font-variant-numeric: tabular-nums; }

        .fc-asig-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 0; border-bottom: 1px solid #F5F5F3; }
        .fc-asig-row:last-child { border-bottom: none; }
        .fc-bar-track { flex: 1; height: 5px; background: #F0F0EE; border-radius: 10px; overflow: hidden; }
        .fc-bar-fill { height: 100%; border-radius: 10px; }

        .fc-empty { padding: 2rem; text-align: center; color: #9B9A97; font-size: 0.82rem; }

        /* Modal */
        .fc-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .fc-modal { background: white; border-radius: 12px; width: 100%; max-width: 460px; box-shadow: 0 24px 64px rgba(0,0,0,0.12); overflow: hidden; }
        .fc-modal-head { padding: 1rem 1.25rem; border-bottom: 1px solid #E8E8E5; display: flex; align-items: center; justify-content: space-between; }
        .fc-modal-title { font-size: 0.88rem; font-weight: 700; color: #37352F; }
        .fc-modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: #9B9A97; }
        .fc-modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; }
        .fc-modal-label { display: block; font-size: 0.7rem; font-weight: 500; color: #9B9A97; margin-bottom: 0.35rem; text-transform: uppercase; }
        .fc-modal-input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; }
        .fc-modal-input:focus { border-color: #37352F; }
        .fc-modal-textarea { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; min-height: 80px; resize: vertical; }
        .fc-modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .fc-modal-foot { padding: 1rem 1.25rem; border-top: 1px solid #E8E8E5; display: flex; justify-content: flex-end; gap: 0.5rem; }
        .fc-modal-cancel { font-size: 0.78rem; font-weight: 500; color: #6B6B6B; background: white; border: 1px solid #E8E8E5; border-radius: 7px; padding: 0.5rem 1rem; cursor: pointer; font-family: inherit; }
        .fc-modal-ok { font-size: 0.78rem; font-weight: 600; color: white; background: #37352F; border: none; border-radius: 7px; padding: 0.5rem 1.1rem; cursor: pointer; font-family: inherit; }
        .fc-msg { padding: 0.6rem 0.85rem; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 7px; font-size: 0.78rem; color: #16A34A; }
      `}</style>

      <div className="fc">
        <button className="fc-back" onClick={onVolver}>← Volver al directorio</button>

        {/* Hero */}
        <div className="fc-hero">
          <div className="fc-hero-av">{alumno.nombre[0]}{alumno.apellido_paterno[0]}</div>
          <div style={{ flex: 1 }}>
            <div className="fc-hero-nombre">{alumno.apellido_paterno} {alumno.apellido_materno}, {alumno.nombre}</div>
            <div className="fc-hero-meta">{alumno.cursos?.nombre} · {alumno.rut}</div>
            <div className="fc-hero-badges">
              {alumno.alumno_sep && <span className="fc-hero-badge">SEP</span>}
              {alumno.pie        && <span className="fc-hero-badge">PIE</span>}
            </div>
          </div>
          {ficha && (
            <div className="fc-hero-stats">
              <div className="fc-hero-stat">
                <div className="fc-hero-stat-v" style={{ color: notaColor(ficha.rendimiento.promGeneral) }}>
                  {fmtNota(ficha.rendimiento.promGeneral)}
                </div>
                <div className="fc-hero-stat-n">Promedio</div>
              </div>
              <div className="fc-hero-stat">
                <div className="fc-hero-stat-v" style={{ color: pctColor(ficha.asistencia.anio.pct) }}>
                  {ficha.asistencia.anio.pct !== null ? `${ficha.asistencia.anio.pct}%` : '—'}
                </div>
                <div className="fc-hero-stat-n">Asistencia</div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="fc-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`fc-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id as any)}>
              {t.label}
            </button>
          ))}
        </div>

        {cargando && <div className="fc-empty">Cargando ficha...</div>}

        {!cargando && ficha && (
          <>
            {/* RESUMEN */}
            {tab === 'resumen' && (
              <>
                <div className="fc-card">
                  <div className="fc-card-title" style={{ marginBottom: '1rem' }}>Datos personales</div>
                  <div className="fc-data-grid">
                    {[
                      { l: 'Nombre apoderado', v: ficha.alumno.nombre_apoderado ?? '—' },
                      { l: 'Relación',         v: ficha.alumno.relacion_apoderado ?? '—' },
                      { l: 'Teléfono',         v: ficha.alumno.telefono_apoderado ?? '—' },
                      { l: 'Email',            v: ficha.alumno.email_apoderado ?? '—' },
                      { l: 'Fecha nacimiento', v: ficha.alumno.fecha_nacimiento ?? '—' },
                      { l: 'Grupo sanguíneo',  v: ficha.alumno.grupo_sanguineo ?? '—' },
                      { l: 'Alergias',         v: ficha.alumno.alergias ?? '—' },
                      { l: 'Medicamentos',     v: ficha.alumno.medicamentos ?? '—' },
                    ].map(d => (
                      <div key={d.l} className="fc-data-item">
                        <label>{d.l}</label>
                        <span>{d.v}</span>
                      </div>
                    ))}
                  </div>
                  {ficha.alumno.condicion_especial && (
                    <div style={{ marginTop: '0.75rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '7px', padding: '0.6rem 0.85rem', fontSize: '0.78rem', color: '#D97706' }}>
                      ⚠️ {ficha.alumno.condicion_especial}
                    </div>
                  )}
                  {ficha.alumno.pie && ficha.alumno.diagnostico_pie && (
                    <div style={{ marginTop: '0.5rem', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '7px', padding: '0.6rem 0.85rem', fontSize: '0.78rem', color: '#D97706' }}>
                      🎯 PIE: {ficha.alumno.diagnostico_pie}
                    </div>
                  )}
                </div>
                <div className="fc-card">
                  <div className="fc-card-title" style={{ marginBottom: '0.75rem' }}>Resumen del año</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#E8E8E5', borderRadius: '8px', overflow: 'hidden' }}>
                    {[
                      { n: 'Promedio general', v: fmtNota(ficha.rendimiento.promGeneral), color: notaColor(ficha.rendimiento.promGeneral) },
                      { n: 'Asistencia anual',  v: ficha.asistencia.anio.pct !== null ? `${ficha.asistencia.anio.pct}%` : '—', color: pctColor(ficha.asistencia.anio.pct) },
                      { n: 'Anotaciones',       v: String(ficha.anotaciones.length), color: '#37352F' },
                    ].map(s => (
                      <div key={s.n} style={{ background: 'white', padding: '0.85rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color, letterSpacing: '-0.03em' }}>{s.v}</div>
                        <div style={{ fontSize: '0.65rem', color: '#9B9A97', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.n}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* NOTAS */}
            {tab === 'notas' && (
              <div className="fc-card">
                <div className="fc-card-hd">
                  <span className="fc-card-title">Rendimiento por asignatura</span>
                </div>
                {Object.entries(ficha.rendimiento.porAsignatura).map(([asig, data]: any) => (
                  <div key={asig} className="fc-asig-row">
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#37352F', width: '120px', flexShrink: 0 }}>{asig}</span>
                    <div className="fc-bar-track">
                      <div className="fc-bar-fill" style={{ width: `${(data.prom ?? 0) / 7 * 100}%`, background: notaColor(data.prom) }} />
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: notaColor(data.prom), width: '36px', textAlign: 'right' }}>
                      {fmtNota(data.prom)}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#9B9A97', width: '60px', textAlign: 'right' }}>{data.notas.length} eval.</span>
                  </div>
                ))}
                {Object.keys(ficha.rendimiento.porAsignatura).length === 0 && (
                  <div className="fc-empty">Sin notas registradas</div>
                )}
              </div>
            )}

            {/* ASISTENCIA */}
            {tab === 'asistencia' && (
              <div className="fc-card">
                <div className="fc-card-hd">
                  <span className="fc-card-title">Asistencia del año</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  {[
                    { n: 'Asistencia anual', p: ficha.asistencia.anio.pct, d: ficha.asistencia.anio.dias, pr: ficha.asistencia.anio.presentes },
                    { n: 'Asistencia mensual', p: ficha.asistencia.mes.pct, d: ficha.asistencia.mes.dias, pr: ficha.asistencia.mes.presentes },
                  ].map(a => (
                    <div key={a.n} style={{ background: '#FAFAF8', borderRadius: '8px', padding: '0.85rem' }}>
                      <div style={{ fontSize: '0.65rem', color: '#9B9A97', marginBottom: '0.3rem', textTransform: 'uppercase' }}>{a.n}</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: pctColor(a.p), letterSpacing: '-0.03em' }}>{a.p !== null ? `${a.p}%` : '—'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#9B9A97' }}>{a.pr} de {a.d} días</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {ficha.asistencia.historial.slice(0, 20).map((a: any, i: number) => (
                    <div key={i} title={`${a.fecha} — ${a.estado}`} style={{
                      width: '28px', height: '28px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 700,
                      background: a.estado === 'P' ? '#F0FDF4' : a.estado === 'A' ? '#FEF2F2' : '#FFFBEB',
                      color: a.estado === 'P' ? '#16A34A' : a.estado === 'A' ? '#DC2626' : '#D97706',
                    }}>{a.estado}</div>
                  ))}
                </div>
              </div>
            )}

            {/* ANOTACIONES */}
            {tab === 'anotaciones' && (
              <div className="fc-card">
                <div className="fc-card-hd">
                  <span className="fc-card-title">Anotaciones y observaciones</span>
                  <button className="fc-add-btn" onClick={() => setModalAnot(true)}>+ Nueva anotación</button>
                </div>
                {msg && <div className="fc-msg" style={{ marginBottom: '0.75rem' }}>{msg}</div>}
                {ficha.anotaciones.length === 0 ? (
                  <div className="fc-empty">Sin anotaciones registradas</div>
                ) : ficha.anotaciones.map((a: any) => {
                  const tipo = TIPO_ANOT[a.tipo] ?? TIPO_ANOT.neutra
                  return (
                    <div key={a.id} className="fc-row">
                      <div>
                        <span className="fc-tipo-chip" style={{ background: tipo.bg, color: tipo.color }}>{tipo.label}</span>
                      </div>
                      <div className="fc-row-content">
                        <div className="fc-row-title">{a.titulo}</div>
                        <div className="fc-row-desc">{a.descripcion}</div>
                        <div className="fc-row-meta">
                          {new Date(a.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}
                          {a.privada && ' · 🔒 Privada'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* DERIVACIONES */}
            {tab === 'derivaciones' && (
              <div className="fc-card">
                <div className="fc-card-hd">
                  <span className="fc-card-title">Derivaciones a profesionales</span>
                  <button className="fc-add-btn" onClick={() => setModalDeriv(true)}>+ Nueva derivación</button>
                </div>
                {ficha.derivaciones.length === 0 ? (
                  <div className="fc-empty">Sin derivaciones registradas</div>
                ) : ficha.derivaciones.map((d: any) => (
                  <div key={d.id} className="fc-row">
                    <div>
                      <span className="fc-tipo-chip" style={{ background: '#EFF6FF', color: '#2563EB' }}>{PROF_LABEL[d.profesional]}</span>
                    </div>
                    <div className="fc-row-content">
                      <div className="fc-row-title">{d.motivo}</div>
                      {d.descripcion && <div className="fc-row-desc">{d.descripcion}</div>}
                      <div className="fc-row-meta">{new Date(d.fecha_solicitud + 'T12:00:00').toLocaleDateString('es-CL')}</div>
                    </div>
                    <span className="fc-estado-chip" style={{
                      background: d.estado === 'completada' ? '#F0FDF4' : d.estado === 'en_proceso' ? '#FFFBEB' : '#F5F5F3',
                      color:      d.estado === 'completada' ? '#16A34A' : d.estado === 'en_proceso' ? '#D97706' : '#9B9A97',
                    }}>
                      {d.estado === 'completada' ? '✓ Completada' : d.estado === 'en_proceso' ? '→ En proceso' : '○ Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ENTREVISTAS */}
            {tab === 'entrevistas' && (
              <div className="fc-card">
                <div className="fc-card-hd">
                  <span className="fc-card-title">Entrevistas con apoderados</span>
                  <button className="fc-add-btn" onClick={() => setModalEntrev(true)}>+ Registrar entrevista</button>
                </div>
                {ficha.entrevistas.length === 0 ? (
                  <div className="fc-empty">Sin entrevistas registradas</div>
                ) : ficha.entrevistas.map((e: any) => (
                  <div key={e.id} className="fc-row">
                    <div>
                      <span className="fc-tipo-chip" style={{ background: '#F5F5F3', color: '#6B6B6B' }}>
                        {e.tipo === 'presencial' ? '🤝' : e.tipo === 'telefonica' ? '📞' : e.tipo === 'virtual' ? '💻' : '📋'} {e.tipo}
                      </span>
                    </div>
                    <div className="fc-row-content">
                      <div className="fc-row-title">{e.motivo}</div>
                      {e.descripcion && <div className="fc-row-desc">{e.descripcion}</div>}
                      {e.acuerdos && <div className="fc-row-desc" style={{ marginTop: '0.3rem', fontStyle: 'italic' }}>Acuerdos: {e.acuerdos}</div>}
                      <div className="fc-row-meta">
                        {e.nombre_apoderado} · {new Date(e.fecha + 'T12:00:00').toLocaleDateString('es-CL')}
                        {e.hora && ` a las ${e.hora}`}
                      </div>
                    </div>
                    <span className="fc-estado-chip" style={{ background: e.realizada ? '#F0FDF4' : '#FEF3C7', color: e.realizada ? '#16A34A' : '#D97706' }}>
                      {e.realizada ? '✓ Realizada' : '○ Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal anotación */}
      {modalAnot && (
        <div className="fc-overlay" onClick={e => e.target === e.currentTarget && setModalAnot(false)}>
          <div className="fc-modal">
            <div className="fc-modal-head">
              <span className="fc-modal-title">Nueva anotación</span>
              <button className="fc-modal-close" onClick={() => setModalAnot(false)}>✕</button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              startT(async () => {
                const r = await crearAnotacion({
                  alumnoId:    alumno.id,
                  tipo:        fd.get('tipo') as string,
                  titulo:      fd.get('titulo') as string,
                  descripcion: fd.get('descripcion') as string,
                  privada:     fd.get('privada') === 'true',
                  fecha:       fd.get('fecha') as string,
                })
                if (r.success) { setModalAnot(false); setMsg('Anotación guardada ✓'); setTimeout(() => setMsg(''), 3000) }
              })
            }}>
              <div className="fc-modal-body">
                <div className="fc-modal-row">
                  <div>
                    <label className="fc-modal-label">Tipo *</label>
                    <select name="tipo" className="fc-modal-input" required>
                      {Object.entries(TIPO_ANOT).map(([v, t]) => <option key={v} value={v}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="fc-modal-label">Fecha *</label>
                    <input name="fecha" type="date" className="fc-modal-input" defaultValue={new Date().toISOString().split('T')[0]} required />
                  </div>
                </div>
                <div>
                  <label className="fc-modal-label">Título *</label>
                  <input name="titulo" className="fc-modal-input" placeholder="Resumen breve de la anotación" required />
                </div>
                <div>
                  <label className="fc-modal-label">Descripción *</label>
                  <textarea name="descripcion" className="fc-modal-textarea" placeholder="Descripción detallada..." required />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" name="privada" value="true" id="privada" />
                  <label htmlFor="privada" style={{ fontSize: '0.78rem', color: '#6B6B6B', cursor: 'pointer' }}>
                    🔒 Anotación privada (solo equipo directivo)
                  </label>
                </div>
              </div>
              <div className="fc-modal-foot">
                <button type="button" className="fc-modal-cancel" onClick={() => setModalAnot(false)}>Cancelar</button>
                <button type="submit" className="fc-modal-ok" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar anotación →'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal derivación */}
      {modalDeriv && (
        <div className="fc-overlay" onClick={e => e.target === e.currentTarget && setModalDeriv(false)}>
          <div className="fc-modal">
            <div className="fc-modal-head">
              <span className="fc-modal-title">Nueva derivación</span>
              <button className="fc-modal-close" onClick={() => setModalDeriv(false)}>✕</button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              startT(async () => {
                const r = await crearDerivacion({
                  alumnoId:    alumno.id,
                  profesional: fd.get('profesional') as string,
                  motivo:      fd.get('motivo') as string,
                  descripcion: fd.get('descripcion') as string,
                })
                if (r.success) { setModalDeriv(false); setMsg('Derivación registrada ✓'); setTimeout(() => setMsg(''), 3000) }
              })
            }}>
              <div className="fc-modal-body">
                <div>
                  <label className="fc-modal-label">Profesional *</label>
                  <select name="profesional" className="fc-modal-input" required>
                    {Object.entries(PROF_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fc-modal-label">Motivo de derivación *</label>
                  <input name="motivo" className="fc-modal-input" placeholder="Motivo principal" required />
                </div>
                <div>
                  <label className="fc-modal-label">Descripción</label>
                  <textarea name="descripcion" className="fc-modal-textarea" placeholder="Antecedentes relevantes para el profesional..." />
                </div>
              </div>
              <div className="fc-modal-foot">
                <button type="button" className="fc-modal-cancel" onClick={() => setModalDeriv(false)}>Cancelar</button>
                <button type="submit" className="fc-modal-ok" disabled={isPending}>{isPending ? 'Guardando...' : 'Registrar derivación →'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal entrevista */}
      {modalEntrev && (
        <div className="fc-overlay" onClick={e => e.target === e.currentTarget && setModalEntrev(false)}>
          <div className="fc-modal">
            <div className="fc-modal-head">
              <span className="fc-modal-title">Registrar entrevista</span>
              <button className="fc-modal-close" onClick={() => setModalEntrev(false)}>✕</button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              startT(async () => {
                const r = await crearEntrevista({
                  alumnoId:        alumno.id,
                  tipo:            fd.get('tipo') as string,
                  motivo:          fd.get('motivo') as string,
                  descripcion:     fd.get('descripcion') as string,
                  nombreApoderado: fd.get('nombre_apoderado') as string,
                  fecha:           fd.get('fecha') as string,
                  hora:            fd.get('hora') as string,
                })
                if (r.success) { setModalEntrev(false); setMsg('Entrevista registrada ✓'); setTimeout(() => setMsg(''), 3000) }
              })
            }}>
              <div className="fc-modal-body">
                <div className="fc-modal-row">
                  <div>
                    <label className="fc-modal-label">Tipo *</label>
                    <select name="tipo" className="fc-modal-input" required>
                      <option value="presencial">🤝 Presencial</option>
                      <option value="telefonica">📞 Telefónica</option>
                      <option value="virtual">💻 Virtual</option>
                      <option value="citacion">📋 Citación</option>
                    </select>
                  </div>
                  <div>
                    <label className="fc-modal-label">Fecha *</label>
                    <input name="fecha" type="date" className="fc-modal-input" defaultValue={new Date().toISOString().split('T')[0]} required />
                  </div>
                </div>
                <div className="fc-modal-row">
                  <div>
                    <label className="fc-modal-label">Nombre apoderado *</label>
                    <input name="nombre_apoderado" className="fc-modal-input" placeholder="Nombre completo" required />
                  </div>
                  <div>
                    <label className="fc-modal-label">Hora</label>
                    <input name="hora" type="time" className="fc-modal-input" />
                  </div>
                </div>
                <div>
                  <label className="fc-modal-label">Motivo *</label>
                  <input name="motivo" className="fc-modal-input" placeholder="Motivo de la entrevista" required />
                </div>
                <div>
                  <label className="fc-modal-label">Descripción / Acuerdos</label>
                  <textarea name="descripcion" className="fc-modal-textarea" placeholder="Descripción y acuerdos tomados..." />
                </div>
              </div>
              <div className="fc-modal-foot">
                <button type="button" className="fc-modal-cancel" onClick={() => setModalEntrev(false)}>Cancelar</button>
                <button type="submit" className="fc-modal-ok" disabled={isPending}>{isPending ? 'Guardando...' : 'Registrar entrevista →'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
