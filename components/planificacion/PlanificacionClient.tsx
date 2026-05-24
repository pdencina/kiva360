'use client'

import { useState, useTransition } from 'react'
import { crearPlanClase, actualizarEstadoPlan } from '@/lib/actions/planificacion'

type Plan = {
  id: string; titulo: string; asignatura: string; fecha: string
  hora_inicio: string | null; hora_fin: string | null
  oas: string[]; objetivo_clase: string | null
  estrategias: string[]; inicio: string | null
  desarrollo: string | null; cierre: string | null
  recursos: string[]; evaluacion_tipo: string | null
  tarea: string | null; observaciones: string | null
  estado: string; cursos: { nombre: string; nivel: string } | null
}
type Estrategia = { id: string; nombre: string; descripcion: string | null; tipo: string }
type Curso      = { id: string; nombre: string; nivel: string }

interface Props { planes: Plan[]; estrategias: Estrategia[]; cursos: Curso[] }

const ASIGNATURAS = ['Matemáticas','Lenguaje','Ciencias','Historia','Inglés','Ed. Física','Artes','Música','Tecnología','Religión']

const estadoStyle = (e: string) =>
  e === 'realizado' ? { bg: '#F0F0EE', color: '#6B6B6B', label: '✓ Realizado' } :
  e === 'publicado' ? { bg: '#EFF6FF', color: '#2563EB', label: '→ Publicado' } :
                      { bg: '#FFFBEB', color: '#D97706', label: '✎ Borrador'  }

export function PlanificacionClient({ planes: inicial, estrategias, cursos }: Props) {
  const [planes,    setPlanes]   = useState(inicial)
  const [filtro,    setFiltro]   = useState('todos')
  const [planSel,   setPlanSel]  = useState<Plan | null>(null)
  const [modalNew,  setModalNew] = useState(false)
  const [paso,      setPaso]     = useState(1) // wizard 1-3
  const [form,      setForm]     = useState<any>({
    asignatura: 'Matemáticas', titulo: '', fecha: new Date().toISOString().split('T')[0],
    cursoId: '', horaInicio: '', horaFin: '', oas: '',
    objetivoClase: '', estrategiasSelec: [] as string[],
    inicio: '', desarrollo: '', cierre: '',
    recursos: '', evaluacionTipo: 'formativa', tarea: '', observaciones: '',
  })
  const [isPending, startT]     = useTransition()
  const [msg,       setMsg]     = useState('')

  const asigs = ['todos', ...new Set(planes.map(p => p.asignatura))]
  const filtrados = filtro === 'todos' ? planes : planes.filter(p => p.asignatura === filtro)

  const estrategiasPorTipo = (tipo: string) => estrategias.filter(e => e.tipo === tipo)

  const toggleEstrategia = (nombre: string) => {
    setForm((prev: any) => ({
      ...prev,
      estrategiasSelec: prev.estrategiasSelec.includes(nombre)
        ? prev.estrategiasSelec.filter((e: string) => e !== nombre)
        : [...prev.estrategiasSelec, nombre]
    }))
  }

  const guardarPlan = async () => {
    startT(async () => {
      const r = await crearPlanClase({
        cursoId:       form.cursoId || undefined,
        asignatura:    form.asignatura,
        titulo:        form.titulo,
        fecha:         form.fecha,
        horaInicio:    form.horaInicio || undefined,
        horaFin:       form.horaFin || undefined,
        oas:           form.oas.split(',').map((s: string) => s.trim()).filter(Boolean),
        objetivoClase: form.objetivoClase || undefined,
        estrategias:   form.estrategiasSelec,
        inicio:        form.inicio || undefined,
        desarrollo:    form.desarrollo || undefined,
        cierre:        form.cierre || undefined,
        recursos:      form.recursos.split(',').map((s: string) => s.trim()).filter(Boolean),
        evaluacionTipo: form.evaluacionTipo,
        tarea:         form.tarea || undefined,
        observaciones: form.observaciones || undefined,
      })
      if (r.success) {
        setModalNew(false)
        setPaso(1)
        setMsg('Plan de clase creado ✓')
        setTimeout(() => setMsg(''), 3000)
        window.location.reload()
      }
    })
  }

  const cambiarEstado = async (id: string, estado: any) => {
    await actualizarEstadoPlan(id, estado)
    setPlanes(prev => prev.map(p => p.id === id ? { ...p, estado } : p))
    if (planSel?.id === id) setPlanSel(prev => prev ? { ...prev, estado } : null)
  }

  // ── Vista detalle plan ────────────────────────────────────────
  if (planSel) return (
    <>
      <style>{`
        .pd-back { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: #9B9A97; font-family: inherit; padding: 0; margin-bottom: 1rem; }
        .pd-back:hover { color: #37352F; }
        .pd-hero { background: #37352F; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
        .pd-hero-titulo { font-size: 1.1rem; font-weight: 700; color: white; letter-spacing: -0.02em; margin-bottom: 0.3rem; }
        .pd-hero-meta { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 0.75rem; }
        .pd-hero-chips { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .pd-chip { font-size: 0.62rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 3px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
        .pd-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; margin-bottom: 0.75rem; }
        .pd-card-title { font-size: 0.72rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.75rem; }
        .pd-text { font-size: 0.82rem; color: #37352F; line-height: 1.7; }
        .pd-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
        .pd-etapa { background: #FAFAF8; border-radius: 8px; padding: 0.85rem; }
        .pd-etapa-title { font-size: 0.68rem; font-weight: 600; color: #9B9A97; text-transform: uppercase; margin-bottom: 0.5rem; }
        .pd-chips { display: flex; gap: 0.3rem; flex-wrap: wrap; }
        .pd-tag { font-size: 0.7rem; font-weight: 500; padding: 0.2rem 0.55rem; border-radius: 5px; background: #F0F0EE; color: #6B6B6B; }
        .pd-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
        .pd-btn { font-size: 0.75rem; font-weight: 500; padding: 0.4rem 0.85rem; border-radius: 7px; border: none; cursor: pointer; font-family: inherit; transition: all 0.12s; }
        .pd-btn-dark { background: #37352F; color: white; }
        .pd-btn-ghost { background: #F0F0EE; color: #37352F; }
      `}</style>

      <button className="pd-back" onClick={() => setPlanSel(null)}>← Volver a planes</button>

      <div className="pd-hero">
        <div className="pd-hero-titulo">{planSel.titulo}</div>
        <div className="pd-hero-meta">
          {planSel.asignatura} · {planSel.cursos?.nombre ?? '—'} ·{' '}
          {new Date(planSel.fecha + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
          {planSel.hora_inicio && ` · ${planSel.hora_inicio.slice(0,5)} - ${planSel.hora_fin?.slice(0,5) ?? ''}`}
        </div>
        <div className="pd-hero-chips">
          {planSel.oas.map(oa => <span key={oa} className="pd-chip">{oa}</span>)}
          <span className="pd-chip" style={(() => { const s = estadoStyle(planSel.estado); return { background: s.bg, color: s.color } })()}>
            {estadoStyle(planSel.estado).label}
          </span>
        </div>
        <div className="pd-actions">
          {planSel.estado === 'borrador'   && <button className="pd-btn pd-btn-dark" onClick={() => cambiarEstado(planSel.id, 'publicado')}>Publicar →</button>}
          {planSel.estado === 'publicado'  && <button className="pd-btn pd-btn-dark" onClick={() => cambiarEstado(planSel.id, 'realizado')}>Marcar como realizado ✓</button>}
          {planSel.estado === 'realizado'  && <button className="pd-btn pd-btn-ghost" onClick={() => cambiarEstado(planSel.id, 'borrador')}>Volver a borrador</button>}
        </div>
      </div>

      {planSel.objetivo_clase && (
        <div className="pd-card">
          <div className="pd-card-title">Objetivo de la clase</div>
          <div className="pd-text">{planSel.objetivo_clase}</div>
        </div>
      )}

      <div className="pd-card">
        <div className="pd-card-title">Estrategias didácticas</div>
        <div className="pd-chips">
          {planSel.estrategias.map(e => <span key={e} className="pd-tag">{e}</span>)}
          {planSel.estrategias.length === 0 && <span style={{ fontSize: '0.78rem', color: '#9B9A97' }}>Sin estrategias definidas</span>}
        </div>
      </div>

      {(planSel.inicio || planSel.desarrollo || planSel.cierre) && (
        <div className="pd-card">
          <div className="pd-card-title">Desarrollo de la clase</div>
          <div className="pd-grid">
            {[
              { t: '🟡 Inicio', c: planSel.inicio },
              { t: '🔵 Desarrollo', c: planSel.desarrollo },
              { t: '🟢 Cierre', c: planSel.cierre },
            ].map(e => (
              <div key={e.t} className="pd-etapa">
                <div className="pd-etapa-title">{e.t}</div>
                <div style={{ fontSize: '0.78rem', color: '#37352F', lineHeight: 1.6 }}>{e.c ?? '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {planSel.recursos.length > 0 && (
        <div className="pd-card">
          <div className="pd-card-title">Recursos necesarios</div>
          <div className="pd-chips">
            {planSel.recursos.map(r => <span key={r} className="pd-tag">📦 {r}</span>)}
          </div>
        </div>
      )}

      {(planSel.tarea || planSel.evaluacion_tipo !== 'ninguna') && (
        <div className="pd-card">
          <div className="pd-card-title">Evaluación y tarea</div>
          {planSel.evaluacion_tipo && planSel.evaluacion_tipo !== 'ninguna' && (
            <div style={{ fontSize: '0.78rem', color: '#37352F', marginBottom: '0.5rem' }}>
              📋 Evaluación: <strong>{planSel.evaluacion_tipo}</strong>
            </div>
          )}
          {planSel.tarea && (
            <div style={{ fontSize: '0.78rem', color: '#37352F' }}>📝 Tarea: {planSel.tarea}</div>
          )}
        </div>
      )}
    </>
  )

  // ── Lista de planes ───────────────────────────────────────────
  return (
    <>
      <style>{`
        .plc { width: 100%; font-family: 'Inter', system-ui, sans-serif; }
        .plc-toolbar { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; align-items: center; }
        .plc-filter { font-size: 0.75rem; font-weight: 500; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; font-family: inherit; border: 1px solid #E8E8E5; background: white; color: #6B6B6B; transition: all 0.12s; }
        .plc-filter.active { background: #37352F; color: white; border-color: #37352F; }
        .plc-new-btn { margin-left: auto; font-size: 0.78rem; font-weight: 600; padding: 0.4rem 0.9rem; border-radius: 7px; cursor: pointer; font-family: inherit; background: #37352F; color: white; border: none; }

        .plc-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .plc-item { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1rem 1.25rem; cursor: pointer; display: flex; align-items: center; gap: 1rem; transition: all 0.12s; }
        .plc-item:hover { border-color: #37352F; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .plc-fecha { width: 50px; text-align: center; flex-shrink: 0; }
        .plc-fecha-dia { font-size: 1.3rem; font-weight: 700; color: #37352F; line-height: 1; }
        .plc-fecha-mes { font-size: 0.62rem; color: #9B9A97; text-transform: uppercase; }
        .plc-divider { width: 1px; height: 40px; background: #E8E8E5; flex-shrink: 0; }
        .plc-info { flex: 1; min-width: 0; }
        .plc-titulo { font-size: 0.85rem; font-weight: 600; color: #37352F; margin-bottom: 0.2rem; }
        .plc-meta { font-size: 0.72rem; color: #9B9A97; display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .plc-oas { display: flex; gap: 0.25rem; }
        .plc-oa { font-size: 0.6rem; font-weight: 600; padding: 0.1rem 0.35rem; border-radius: 3px; background: #EFF6FF; color: #2563EB; }
        .plc-estado { font-size: 0.62rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 20px; flex-shrink: 0; }
        .plc-empty { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 3rem; text-align: center; color: #9B9A97; font-size: 0.82rem; }

        /* Modal wizard */
        .plc-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .plc-modal { background: white; border-radius: 14px; width: 100%; max-width: 580px; max-height: 85vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(0,0,0,0.15); }
        .plc-modal-head { padding: 1.1rem 1.25rem; border-bottom: 1px solid #E8E8E5; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .plc-modal-title { font-size: 0.88rem; font-weight: 700; color: #37352F; }
        .plc-modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: #9B9A97; }
        .plc-wizard-steps { display: flex; gap: 0; padding: 0 1.25rem; border-bottom: 1px solid #E8E8E5; flex-shrink: 0; }
        .plc-wstep { font-size: 0.72rem; font-weight: 500; padding: 0.55rem 0.75rem; border-bottom: 2px solid transparent; color: #9B9A97; cursor: pointer; transition: all 0.12s; }
        .plc-wstep.active { color: #37352F; border-bottom-color: #37352F; font-weight: 600; }
        .plc-wstep.done { color: #16A34A; }
        .plc-modal-body { padding: 1.25rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 0.85rem; }
        .plc-label { display: block; font-size: 0.7rem; font-weight: 500; color: #9B9A97; margin-bottom: 0.35rem; text-transform: uppercase; }
        .plc-input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; }
        .plc-input:focus { border-color: #37352F; }
        .plc-textarea { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; min-height: 70px; resize: vertical; }
        .plc-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .plc-estrategia-chip { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; font-weight: 500; padding: 0.3rem 0.65rem; border-radius: 6px; cursor: pointer; border: 1px solid #E8E8E5; background: white; color: #6B6B6B; font-family: inherit; margin: 0.2rem; transition: all 0.12s; }
        .plc-estrategia-chip.selected { background: #37352F; color: white; border-color: #37352F; }
        .plc-estrategia-grupo { margin-bottom: 0.75rem; }
        .plc-estrategia-tipo { font-size: 0.65rem; font-weight: 600; color: #9B9A97; text-transform: uppercase; margin-bottom: 0.4rem; }
        .plc-modal-foot { padding: 1rem 1.25rem; border-top: 1px solid #E8E8E5; display: flex; justify-content: space-between; gap: 0.5rem; flex-shrink: 0; }
        .plc-btn-back { font-size: 0.78rem; font-weight: 500; color: #6B6B6B; background: white; border: 1px solid #E8E8E5; border-radius: 7px; padding: 0.5rem 1rem; cursor: pointer; font-family: inherit; }
        .plc-btn-next { font-size: 0.78rem; font-weight: 600; color: white; background: #37352F; border: none; border-radius: 7px; padding: 0.5rem 1.25rem; cursor: pointer; font-family: inherit; }
        .plc-btn-next:disabled { opacity: 0.4; }
        .plc-msg { padding: 0.6rem 0.85rem; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 7px; font-size: 0.78rem; color: #16A34A; margin-bottom: 0.75rem; }
      `}</style>

      <div className="plc">
        {msg && <div className="plc-msg">{msg}</div>}

        <div className="plc-toolbar">
          {asigs.map(a => (
            <button key={a} className={`plc-filter${filtro === a ? ' active' : ''}`} onClick={() => setFiltro(a)}>
              {a === 'todos' ? 'Todos' : a}
            </button>
          ))}
          <button className="plc-new-btn" onClick={() => { setModalNew(true); setPaso(1) }}>
            + Nuevo plan de clase
          </button>
        </div>

        {filtrados.length === 0 ? (
          <div className="plc-empty">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗓️</div>
            <p>No hay planes de clase. Crea el primero.</p>
          </div>
        ) : (
          <div className="plc-list">
            {filtrados.map(p => {
              const fecha = new Date(p.fecha + 'T12:00:00')
              const est   = estadoStyle(p.estado)
              return (
                <div key={p.id} className="plc-item" onClick={() => setPlanSel(p)}>
                  <div className="plc-fecha">
                    <div className="plc-fecha-dia">{fecha.getDate()}</div>
                    <div className="plc-fecha-mes">{fecha.toLocaleDateString('es-CL', { month: 'short' })}</div>
                  </div>
                  <div className="plc-divider" />
                  <div className="plc-info">
                    <div className="plc-titulo">{p.titulo}</div>
                    <div className="plc-meta">
                      <span>{p.asignatura}</span>
                      {p.cursos && <><span>·</span><span>{p.cursos.nombre}</span></>}
                      {p.hora_inicio && <><span>·</span><span>{p.hora_inicio.slice(0,5)}</span></>}
                      {p.estrategias.length > 0 && <><span>·</span><span>{p.estrategias.length} estrategias</span></>}
                    </div>
                  </div>
                  {p.oas.length > 0 && (
                    <div className="plc-oas">
                      {p.oas.slice(0,3).map(oa => <span key={oa} className="plc-oa">{oa}</span>)}
                    </div>
                  )}
                  <span className="plc-estado" style={{ background: est.bg, color: est.color }}>{est.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal wizard nuevo plan */}
      {modalNew && (
        <div className="plc-overlay" onClick={e => e.target === e.currentTarget && setModalNew(false)}>
          <div className="plc-modal">
            <div className="plc-modal-head">
              <span className="plc-modal-title">Nuevo plan de clase</span>
              <button className="plc-modal-close" onClick={() => setModalNew(false)}>✕</button>
            </div>

            <div className="plc-wizard-steps">
              {['Datos básicos', 'Estrategias', 'Desarrollo'].map((s, i) => (
                <div key={s} className={`plc-wstep${paso === i+1 ? ' active' : paso > i+1 ? ' done' : ''}`}>
                  {paso > i+1 ? '✓ ' : `${i+1}. `}{s}
                </div>
              ))}
            </div>

            <div className="plc-modal-body">

              {/* PASO 1 — Datos básicos */}
              {paso === 1 && (
                <>
                  <div>
                    <label className="plc-label">Título de la clase *</label>
                    <input className="plc-input" placeholder="Ej: Introducción a las fracciones"
                      value={form.titulo} onChange={e => setForm((p: any) => ({ ...p, titulo: e.target.value }))} />
                  </div>
                  <div className="plc-grid2">
                    <div>
                      <label className="plc-label">Asignatura *</label>
                      <select className="plc-input" value={form.asignatura} onChange={e => setForm((p: any) => ({ ...p, asignatura: e.target.value }))}>
                        {ASIGNATURAS.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="plc-label">Curso</label>
                      <select className="plc-input" value={form.cursoId} onChange={e => setForm((p: any) => ({ ...p, cursoId: e.target.value }))}>
                        <option value="">Sin asignar</option>
                        {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="plc-grid2">
                    <div>
                      <label className="plc-label">Fecha *</label>
                      <input type="date" className="plc-input" value={form.fecha}
                        onChange={e => setForm((p: any) => ({ ...p, fecha: e.target.value }))} />
                    </div>
                    <div>
                      <label className="plc-label">Horario</label>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <input type="time" className="plc-input" value={form.horaInicio}
                          onChange={e => setForm((p: any) => ({ ...p, horaInicio: e.target.value }))} />
                        <span style={{ color: '#9B9A97' }}>–</span>
                        <input type="time" className="plc-input" value={form.horaFin}
                          onChange={e => setForm((p: any) => ({ ...p, horaFin: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="plc-label">OA asociados (separados por coma)</label>
                    <input className="plc-input" placeholder="Ej: OA3, OA5" value={form.oas}
                      onChange={e => setForm((p: any) => ({ ...p, oas: e.target.value }))} />
                  </div>
                  <div>
                    <label className="plc-label">Objetivo de la clase</label>
                    <textarea className="plc-textarea" placeholder="¿Qué aprenderán los estudiantes al finalizar esta clase?"
                      value={form.objetivoClase} onChange={e => setForm((p: any) => ({ ...p, objetivoClase: e.target.value }))} />
                  </div>
                </>
              )}

              {/* PASO 2 — Estrategias */}
              {paso === 2 && (
                <>
                  <p style={{ fontSize: '0.78rem', color: '#9B9A97' }}>
                    Selecciona las estrategias que usarás en esta clase. Puedes combinar varias.
                  </p>
                  {['inicio','desarrollo','cierre'].map(tipo => (
                    <div key={tipo} className="plc-estrategia-grupo">
                      <div className="plc-estrategia-tipo">
                        {tipo === 'inicio' ? '🟡 Actividad de inicio' : tipo === 'desarrollo' ? '🔵 Desarrollo' : '🟢 Cierre'}
                      </div>
                      <div>
                        {estrategiasPorTipo(tipo).map(e => (
                          <button key={e.nombre}
                            className={`plc-estrategia-chip${form.estrategiasSelec.includes(e.nombre) ? ' selected' : ''}`}
                            onClick={() => toggleEstrategia(e.nombre)}
                            title={e.descripcion ?? ''}
                          >
                            {e.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {form.estrategiasSelec.length > 0 && (
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.75rem', color: '#16A34A' }}>
                      ✓ {form.estrategiasSelec.length} estrategia{form.estrategiasSelec.length > 1 ? 's' : ''} seleccionada{form.estrategiasSelec.length > 1 ? 's' : ''}: {form.estrategiasSelec.join(', ')}
                    </div>
                  )}
                </>
              )}

              {/* PASO 3 — Desarrollo */}
              {paso === 3 && (
                <>
                  <div>
                    <label className="plc-label">🟡 Actividad de inicio</label>
                    <textarea className="plc-textarea" placeholder="¿Cómo motivarás a los estudiantes? ¿Qué pregunta detonante usarás?"
                      value={form.inicio} onChange={e => setForm((p: any) => ({ ...p, inicio: e.target.value }))} />
                  </div>
                  <div>
                    <label className="plc-label">🔵 Desarrollo</label>
                    <textarea className="plc-textarea" placeholder="¿Qué actividades realizarán? ¿Cómo se organizará el tiempo?"
                      value={form.desarrollo} onChange={e => setForm((p: any) => ({ ...p, desarrollo: e.target.value }))} />
                  </div>
                  <div>
                    <label className="plc-label">🟢 Cierre</label>
                    <textarea className="plc-textarea" placeholder="¿Cómo cerrarás la clase? ¿Qué evaluación formativa usarás?"
                      value={form.cierre} onChange={e => setForm((p: any) => ({ ...p, cierre: e.target.value }))} />
                  </div>
                  <div className="plc-grid2">
                    <div>
                      <label className="plc-label">Recursos necesarios</label>
                      <input className="plc-input" placeholder="Ej: Pizarra, fichas, tijeras"
                        value={form.recursos} onChange={e => setForm((p: any) => ({ ...p, recursos: e.target.value }))} />
                    </div>
                    <div>
                      <label className="plc-label">Tipo de evaluación</label>
                      <select className="plc-input" value={form.evaluacionTipo}
                        onChange={e => setForm((p: any) => ({ ...p, evaluacionTipo: e.target.value }))}>
                        <option value="formativa">Formativa</option>
                        <option value="sumativa">Sumativa</option>
                        <option value="ninguna">Ninguna</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="plc-label">Tarea para la casa (opcional)</label>
                    <input className="plc-input" placeholder="Describe la tarea si corresponde"
                      value={form.tarea} onChange={e => setForm((p: any) => ({ ...p, tarea: e.target.value }))} />
                  </div>
                </>
              )}
            </div>

            <div className="plc-modal-foot">
              <button className="plc-btn-back" onClick={() => paso > 1 ? setPaso(p => p - 1) : setModalNew(false)}>
                {paso > 1 ? '← Atrás' : 'Cancelar'}
              </button>
              {paso < 3 ? (
                <button className="plc-btn-next"
                  onClick={() => setPaso(p => p + 1)}
                  disabled={paso === 1 && !form.titulo}>
                  Siguiente →
                </button>
              ) : (
                <button className="plc-btn-next" onClick={guardarPlan} disabled={isPending}>
                  {isPending ? 'Guardando...' : '✓ Guardar plan de clase'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
