'use client'

import { useState, useTransition } from 'react'
import { clonarPlan, votarPlan, agregarReflexion } from '@/lib/actions/biblioteca'

type Reflexion = {
  que_funciono: string | null; que_cambiaria: string | null
  nivel_logro: number | null; recomendacion: string | null
}
type Plan = {
  id: string; titulo: string; asignatura: string; fecha: string
  anio: number; nivel: string | null; oas: string[]; estrategias: string[]
  objetivo_clase: string | null; inicio: string | null
  desarrollo: string | null; cierre: string | null
  recursos: string[]; evaluacion_tipo: string | null
  cursos: { nombre: string; nivel: string } | null
  perfiles: { nombre: string } | null
  reflexiones_clase: Reflexion[]
  plan_votos: any[]
}
interface Props { planes: Plan[]; anios: number[]; anioActual: number }

const ASIGS = ['Matemáticas','Lenguaje','Ciencias','Historia','Inglés','Ed. Física','Artes','Música']
const fmtEstrellas = (n: number | null) => n ? '★'.repeat(n) + '☆'.repeat(5 - n) : '☆☆☆☆☆'

export function BibliotecaClient({ planes: inicial, anios, anioActual }: Props) {
  const [planes,      setPlanes]     = useState(inicial)
  const [filtroAnio,  setFiltroAnio] = useState<number | 'todos'>('todos')
  const [filtroAsig,  setFiltroAsig] = useState('todos')
  const [busqueda,    setBusqueda]   = useState('')
  const [planSel,     setPlanSel]    = useState<Plan | null>(null)
  const [modalRef,    setModalRef]   = useState(false)
  const [clonando,    setClonando]   = useState<string | null>(null)
  const [msg,         setMsg]        = useState('')
  const [estrellasRef, setEstrellasRef] = useState(0)
  const [isPending,   startT]        = useTransition()

  const filtrados = planes.filter(p => {
    const anioOk = filtroAnio === 'todos' || p.anio === filtroAnio
    const asigOk = filtroAsig === 'todos' || p.asignatura === filtroAsig
    const busqOk = !busqueda || `${p.titulo} ${p.objetivo_clase ?? ''} ${p.oas?.join(' ')}`.toLowerCase().includes(busqueda.toLowerCase())
    return anioOk && asigOk && busqOk
  })

  const porAnio: Record<number, Plan[]> = {}
  filtrados.forEach(p => {
    if (!porAnio[p.anio]) porAnio[p.anio] = []
    porAnio[p.anio].push(p)
  })
  const aniosOrdenados = Object.keys(porAnio).map(Number).sort((a,b) => b - a)

  const handleClonar = async (plan: Plan) => {
    setClonando(plan.id)
    const r = await clonarPlan(plan.id)
    setClonando(null)
    if (r.success) {
      setMsg('Plan clonado a tus borradores ✓ Ve a Planificación para editarlo.')
      setTimeout(() => setMsg(''), 5000)
    }
  }

  const handleVotar = async (planId: string) => {
    await votarPlan(planId)
    setPlanes(prev => prev.map(p => {
      if (p.id !== planId) return p
      const yaVoto = (p.plan_votos?.length ?? 0) > 0
      return { ...p, plan_votos: yaVoto ? [] : [{}] }
    }))
  }

  // ── Vista detalle ─────────────────────────────────────────────
  if (planSel) return (
    <>
      <style>{`
        .bd { width: 100%; font-family: 'Inter', system-ui, sans-serif; }
        .bd-back { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: #9B9A97; font-family: inherit; padding: 0; margin-bottom: 1rem; }
        .bd-hero { background: #37352F; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
        .bd-hero-anio { font-size: 0.65rem; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.4rem; }
        .bd-hero-titulo { font-size: 1.1rem; font-weight: 700; color: white; letter-spacing: -0.02em; margin-bottom: 0.35rem; }
        .bd-hero-meta { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 0.75rem; }
        .bd-hero-chips { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.85rem; }
        .bd-chip { font-size: 0.62rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 3px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
        .bd-hero-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .bd-btn-clonar { font-size: 0.8rem; font-weight: 600; padding: 0.5rem 1.1rem; border-radius: 7px; cursor: pointer; font-family: inherit; background: white; color: #37352F; border: none; }
        .bd-btn-ghost { font-size: 0.8rem; font-weight: 500; padding: 0.5rem 0.9rem; border-radius: 7px; cursor: pointer; font-family: inherit; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
        .bd-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; margin-bottom: 0.75rem; }
        .bd-card-title { font-size: 0.72rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.75rem; }
        .bd-etapas { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
        .bd-etapa { background: #FAFAF8; border-radius: 8px; padding: 0.85rem; }
        .bd-etapa-t { font-size: 0.65rem; font-weight: 600; color: #9B9A97; text-transform: uppercase; margin-bottom: 0.4rem; }
        .bd-etapa-c { font-size: 0.78rem; color: #37352F; line-height: 1.6; }
        .bd-chips { display: flex; gap: 0.3rem; flex-wrap: wrap; }
        .bd-tag { font-size: 0.7rem; font-weight: 500; padding: 0.2rem 0.55rem; border-radius: 5px; background: #F0F0EE; color: #6B6B6B; }
        .bd-reflexion { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 1.1rem; margin-bottom: 0.75rem; }
        .bd-ref-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; }
        .bd-ref-title { font-size: 0.78rem; font-weight: 600; color: #D97706; }
        .bd-ref-stars { font-size: 1rem; color: #F59E0B; }
        .bd-ref-s { margin-bottom: 0.6rem; }
        .bd-ref-lbl { font-size: 0.65rem; font-weight: 600; color: #D97706; text-transform: uppercase; margin-bottom: 0.2rem; }
        .bd-ref-txt { font-size: 0.78rem; color: #92400E; line-height: 1.6; }
        .bd-recom { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 0.75rem; margin-top: 0.65rem; }
        .bd-recom-lbl { font-size: 0.65rem; font-weight: 600; color: #16A34A; text-transform: uppercase; margin-bottom: 0.2rem; }
        .bd-recom-txt { font-size: 0.78rem; color: #166534; line-height: 1.6; }
        .bd-msg { padding: 0.6rem 0.85rem; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 7px; font-size: 0.78rem; color: #16A34A; margin-bottom: 0.75rem; }
        .bd-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .bd-modal { background: white; border-radius: 12px; width: 100%; max-width: 500px; max-height: 85vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.12); }
        .bd-modal-hd { padding: 1rem 1.25rem; border-bottom: 1px solid #E8E8E5; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: white; }
        .bd-modal-title { font-size: 0.88rem; font-weight: 700; color: #37352F; }
        .bd-modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: #9B9A97; }
        .bd-modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; }
        .bd-lbl { display: block; font-size: 0.7rem; font-weight: 500; color: #9B9A97; margin-bottom: 0.35rem; text-transform: uppercase; }
        .bd-textarea { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; min-height: 75px; resize: vertical; }
        .bd-modal-foot { padding: 1rem 1.25rem; border-top: 1px solid #E8E8E5; display: flex; justify-content: flex-end; position: sticky; bottom: 0; background: white; }
        .bd-submit { font-size: 0.78rem; font-weight: 600; color: white; background: #37352F; border: none; border-radius: 7px; padding: 0.5rem 1.1rem; cursor: pointer; font-family: inherit; }
      `}</style>

      <div className="bd">
        <button className="bd-back" onClick={() => setPlanSel(null)}>← Volver a la biblioteca</button>
        {msg && <div className="bd-msg">{msg}</div>}

        <div className="bd-hero">
          <div className="bd-hero-anio">Año {planSel.anio} · {planSel.asignatura}</div>
          <div className="bd-hero-titulo">{planSel.titulo}</div>
          <div className="bd-hero-meta">
            {planSel.cursos?.nombre ?? '—'} · {planSel.nivel ?? '—'}
            {planSel.perfiles?.nombre && ` · Por ${planSel.perfiles.nombre}`}
          </div>
          <div className="bd-hero-chips">
            {(planSel.oas ?? []).map(oa => <span key={oa} className="bd-chip">{oa}</span>)}
            {(planSel.estrategias ?? []).slice(0,3).map(e => <span key={e} className="bd-chip">{e}</span>)}
          </div>
          <div className="bd-hero-actions">
            <button className="bd-btn-clonar" onClick={() => handleClonar(planSel)} disabled={clonando === planSel.id}>
              {clonando === planSel.id ? 'Clonando...' : '📋 Usar como base para mi clase →'}
            </button>
            <button className="bd-btn-ghost" onClick={() => handleVotar(planSel.id)}>
              {(planSel.plan_votos?.length ?? 0) > 0 ? '♥ Me sirvió' : '♡ Me sirvió'}
            </button>
            <button className="bd-btn-ghost" onClick={() => setModalRef(true)}>
              ✏️ Mi reflexión
            </button>
          </div>
        </div>

        {/* Reflexión */}
        {(planSel.reflexiones_clase?.length ?? 0) > 0 && (
          <div className="bd-reflexion">
            <div className="bd-ref-hd">
              <span className="bd-ref-title">💬 Reflexión del docente</span>
              <span className="bd-ref-stars">{fmtEstrellas(planSel.reflexiones_clase[0].nivel_logro)}</span>
            </div>
            {planSel.reflexiones_clase[0].que_funciono && (
              <div className="bd-ref-s">
                <div className="bd-ref-lbl">✓ ¿Qué funcionó?</div>
                <div className="bd-ref-txt">{planSel.reflexiones_clase[0].que_funciono}</div>
              </div>
            )}
            {planSel.reflexiones_clase[0].que_cambiaria && (
              <div className="bd-ref-s">
                <div className="bd-ref-lbl">↻ ¿Qué cambiarías?</div>
                <div className="bd-ref-txt">{planSel.reflexiones_clase[0].que_cambiaria}</div>
              </div>
            )}
            {planSel.reflexiones_clase[0].recomendacion && (
              <div className="bd-recom">
                <div className="bd-recom-lbl">💡 Consejo para el próximo docente</div>
                <div className="bd-recom-txt">{planSel.reflexiones_clase[0].recomendacion}</div>
              </div>
            )}
          </div>
        )}

        {planSel.objetivo_clase && (
          <div className="bd-card">
            <div className="bd-card-title">Objetivo de la clase</div>
            <p style={{ fontSize: '0.82rem', color: '#37352F', lineHeight: 1.7 }}>{planSel.objetivo_clase}</p>
          </div>
        )}

        {(planSel.inicio || planSel.desarrollo || planSel.cierre) && (
          <div className="bd-card">
            <div className="bd-card-title">Desarrollo de la clase</div>
            <div className="bd-etapas">
              {[['🟡 Inicio', planSel.inicio], ['🔵 Desarrollo', planSel.desarrollo], ['🟢 Cierre', planSel.cierre]].map(([t, c]) => (
                <div key={t as string} className="bd-etapa">
                  <div className="bd-etapa-t">{t}</div>
                  <div className="bd-etapa-c">{c ?? '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(planSel.estrategias?.length > 0 || planSel.recursos?.length > 0) && (
          <div className="bd-card">
            <div className="bd-card-title">Estrategias y recursos</div>
            <div className="bd-chips" style={{ marginBottom: '0.5rem' }}>
              {planSel.estrategias?.map(e => <span key={e} className="bd-tag">{e}</span>)}
            </div>
            <div className="bd-chips">
              {planSel.recursos?.map(r => <span key={r} className="bd-tag">📦 {r}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Modal reflexión */}
      {modalRef && (
        <div className="bd-overlay" onClick={e => e.target === e.currentTarget && setModalRef(false)}>
          <div className="bd-modal">
            <div className="bd-modal-hd">
              <span className="bd-modal-title">Mi reflexión sobre esta clase</span>
              <button className="bd-modal-close" onClick={() => setModalRef(false)}>✕</button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              startT(async () => {
                const r = await agregarReflexion({
                  planId:        planSel.id,
                  queFunciono:   fd.get('que_funciono') as string,
                  queCambiaria:  fd.get('que_cambiaria') as string,
                  nivelLogro:    estrellasRef,
                  recomendacion: fd.get('recomendacion') as string,
                })
                if (r.success) {
                  setModalRef(false)
                  setMsg('Reflexión guardada ✓ Gracias por ayudar a tu equipo.')
                  setTimeout(() => setMsg(''), 4000)
                }
              })
            }}>
              <div className="bd-modal-body">
                <div>
                  <label className="bd-lbl">¿Qué tan bien resultó? *</label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setEstrellasRef(n)}
                        style={{ fontSize: '1.4rem', background: 'none', border: 'none', cursor: 'pointer', opacity: n <= estrellasRef ? 1 : 0.25, transition: 'opacity 0.12s' }}>★</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="bd-lbl">✓ ¿Qué funcionó bien? *</label>
                  <textarea name="que_funciono" className="bd-textarea" required placeholder="Describe qué aspectos resultaron bien..." />
                </div>
                <div>
                  <label className="bd-lbl">↻ ¿Qué cambiarías? *</label>
                  <textarea name="que_cambiaria" className="bd-textarea" required placeholder="¿Qué ajustes harías si la repites?" />
                </div>
                <div>
                  <label className="bd-lbl">💡 Consejo para el próximo docente</label>
                  <textarea name="recomendacion" className="bd-textarea" placeholder="¿Qué le dirías a un colega que quiere usar esta clase?" />
                </div>
              </div>
              <div className="bd-modal-foot">
                <button type="submit" className="bd-submit" disabled={isPending || estrellasRef === 0}
                  style={{ opacity: estrellasRef === 0 ? 0.4 : 1 }}>
                  {isPending ? 'Guardando...' : 'Guardar reflexión →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )

  // ── Lista de planes ───────────────────────────────────────────
  return (
    <>
      <style>{`
        .bl { width: 100%; font-family: 'Inter', system-ui, sans-serif; }
        .bl-toolbar { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
        .bl-search { flex: 1; min-width: 200px; padding: 0.5rem 0.85rem; border: 1px solid #E8E8E5; border-radius: 8px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; }
        .bl-search:focus { border-color: #37352F; }
        .bl-select { padding: 0.5rem 0.75rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.78rem; color: #37352F; outline: none; font-family: inherit; background: white; }
        .bl-filter { font-size: 0.75rem; font-weight: 500; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; font-family: inherit; border: 1px solid #E8E8E5; background: white; color: #6B6B6B; transition: all 0.12s; }
        .bl-filter.active { background: #37352F; color: white; border-color: #37352F; }
        .bl-section { margin-bottom: 1.5rem; }
        .bl-section-hd { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
        .bl-anio { font-size: 1rem; font-weight: 700; color: #37352F; }
        .bl-badge { font-size: 0.65rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 20px; }
        .bl-badge-actual { background: #EFF6FF; color: #2563EB; }
        .bl-badge-pasado { background: #F5F5F3; color: #9B9A97; }
        .bl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 0.75rem; }
        .bl-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; cursor: pointer; transition: all 0.15s; }
        .bl-card:hover { border-color: #37352F; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .bl-card-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
        .bl-asig { font-size: 0.62rem; font-weight: 600; padding: 0.12rem 0.45rem; border-radius: 3px; background: #EFF6FF; color: #2563EB; }
        .bl-votos { font-size: 0.7rem; color: #9B9A97; }
        .bl-titulo { font-size: 0.85rem; font-weight: 600; color: #37352F; line-height: 1.4; margin-bottom: 0.4rem; }
        .bl-objetivo { font-size: 0.75rem; color: #6B6B6B; line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-bottom: 0.5rem; }
        .bl-oas { display: flex; gap: 0.2rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
        .bl-oa { font-size: 0.6rem; font-weight: 600; padding: 0.1rem 0.35rem; border-radius: 3px; background: #F0F0EE; color: #9B9A97; }
        .bl-card-ft { display: flex; align-items: center; justify-content: space-between; }
        .bl-meta { font-size: 0.68rem; color: #9B9A97; }
        .bl-ref-badge { font-size: 0.62rem; font-weight: 600; padding: 0.12rem 0.45rem; border-radius: 3px; background: #FFFBEB; color: #D97706; }
        .bl-empty { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 3rem; text-align: center; color: #9B9A97; font-size: 0.82rem; }
        .bl-msg { padding: 0.6rem 0.85rem; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 7px; font-size: 0.78rem; color: #16A34A; margin-bottom: 1rem; }
      `}</style>

      <div className="bl">
        {msg && <div className="bl-msg">{msg}</div>}

        <div className="bl-toolbar">
          <input className="bl-search" placeholder="🔍 Buscar por título, OA o descripción..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <select className="bl-select" value={filtroAsig} onChange={e => setFiltroAsig(e.target.value)}>
            <option value="todos">Todas las asignaturas</option>
            {ASIGS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button className={`bl-filter${filtroAnio === 'todos' ? ' active' : ''}`} onClick={() => setFiltroAnio('todos')}>Todos los años</button>
          {anios.map(a => (
            <button key={a} className={`bl-filter${filtroAnio === a ? ' active' : ''}`} onClick={() => setFiltroAnio(a)}>{a}</button>
          ))}
        </div>

        {filtrados.length === 0 ? (
          <div className="bl-empty">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
            <p>Sin planificaciones para los filtros seleccionados.</p>
          </div>
        ) : aniosOrdenados.map(anio => (
          <div key={anio} className="bl-section">
            <div className="bl-section-hd">
              <span className="bl-anio">{anio}</span>
              <span className={`bl-badge ${anio === anioActual ? 'bl-badge-actual' : 'bl-badge-pasado'}`}>
                {anio === anioActual ? '→ Año actual' : `${anioActual - anio} año${anioActual - anio > 1 ? 's' : ''} atrás`}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#9B9A97' }}>{porAnio[anio].length} clases</span>
            </div>
            <div className="bl-grid">
              {porAnio[anio].map(p => (
                <div key={p.id} className="bl-card" onClick={() => setPlanSel(p)}>
                  <div className="bl-card-hd">
                    <span className="bl-asig">{p.asignatura}</span>
                    <span className="bl-votos">{(p.plan_votos?.length ?? 0) > 0 ? '♥' : '♡'} {p.plan_votos?.length ?? 0}</span>
                  </div>
                  <div className="bl-titulo">{p.titulo}</div>
                  {p.objetivo_clase && <div className="bl-objetivo">{p.objetivo_clase}</div>}
                  {(p.oas ?? []).length > 0 && (
                    <div className="bl-oas">{p.oas.map(oa => <span key={oa} className="bl-oa">{oa}</span>)}</div>
                  )}
                  <div className="bl-card-ft">
                    <span className="bl-meta">{p.cursos?.nombre ?? '—'} · {p.estrategias?.length ?? 0} estrategias</span>
                    {(p.reflexiones_clase?.length ?? 0) > 0 && <span className="bl-ref-badge">💬 Con reflexión</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
