'use client'

import { useState, useTransition } from 'react'
import { crearEvaluacion } from '@/lib/actions/evaluaciones'

type Evaluacion = {
  id: string
  titulo: string
  asignatura: string
  tipo: string
  fecha: string
  ponderacion: number
  estado: string
  curso_nombre?: string
  oa_asociados?: string[]
}

interface Props { evaluaciones: Evaluacion[] }

const ASIGNATURAS = ['Matemáticas', 'Lenguaje', 'Ciencias', 'Historia', 'Inglés', 'Ed. Física', 'Artes', 'Música', 'Tecnología', 'Religión']
const TIPOS       = ['prueba', 'control', 'tarea', 'proyecto', 'presentacion', 'disertacion']

const tipoLabel = (t: string) => ({ prueba: 'Prueba', control: 'Control', tarea: 'Tarea', proyecto: 'Proyecto', presentacion: 'Presentación', disertacion: 'Disertación' }[t] ?? t)

const estadoStyle = (e: string): React.CSSProperties =>
  e === 'proxima' ? { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' } :
  e === 'pasada'  ? { background: '#F0F0EE', color: '#9B9A97', border: '1px solid #E8E8E5' } :
                    { background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }

export function EvaluacionesClient({ evaluaciones: inicial }: Props) {
  const [evaluaciones, setEvals]  = useState(inicial)
  const [filtro,       setFiltro] = useState('todas')
  const [modalNueva,   setModalN] = useState(false)
  const [modalCal,     setModalC] = useState<Evaluacion | null>(null)
  const [, startT] = useTransition()

  const ASIG_UNICAS = [...new Set(evaluaciones.map(e => e.asignatura))]

  const filtradas = filtro === 'todas' ? evaluaciones
    : evaluaciones.filter(e => e.asignatura === filtro)

  return (
    <>
      <style>{`
        .ev-wrap { width: 100%; font-family: 'Inter', system-ui, sans-serif; }

        .ev-toolbar { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .ev-filter-btn { font-size: 0.75rem; font-weight: 500; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; font-family: inherit; transition: all 0.12s; border: 1px solid #E8E8E5; background: white; color: #6B6B6B; }
        .ev-filter-btn.active { background: #37352F; color: white; border-color: #37352F; }
        .ev-filter-btn:hover:not(.active) { border-color: #37352F; color: #37352F; }
        .ev-new-btn { margin-left: auto; font-size: 0.78rem; font-weight: 600; padding: 0.4rem 0.9rem; border-radius: 7px; cursor: pointer; font-family: inherit; background: #37352F; color: white; border: none; transition: background 0.12s; }
        .ev-new-btn:hover { background: #1A1A1A; }

        .ev-list { display: flex; flex-direction: column; gap: 0; background: white; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; }
        .ev-item { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1.25rem; border-bottom: 1px solid #F5F5F3; transition: background 0.1s; }
        .ev-item:last-child { border-bottom: none; }
        .ev-item:hover { background: #FAFAF8; }
        .ev-dot { width: 7px; height: 7px; border-radius: 50%; background: #C2C0BB; flex-shrink: 0; }
        .ev-info { flex: 1; min-width: 0; }
        .ev-titulo { font-size: 0.82rem; font-weight: 600; color: #37352F; margin-bottom: 0.15rem; }
        .ev-meta { font-size: 0.7rem; color: #9B9A97; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
        .ev-tipo-chip { font-size: 0.6rem; font-weight: 600; padding: 0.1rem 0.4rem; border-radius: 3px; background: #F0F0EE; color: #6B6B6B; }
        .ev-fecha { font-size: 0.72rem; color: #9B9A97; flex-shrink: 0; }
        .ev-estado { font-size: 0.62rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 20px; flex-shrink: 0; }
        .ev-cal-btn { font-size: 0.72rem; font-weight: 500; color: #37352F; background: #F0F0EE; border: none; border-radius: 6px; padding: 0.3rem 0.7rem; cursor: pointer; font-family: inherit; flex-shrink: 0; transition: background 0.12s; }
        .ev-cal-btn:hover { background: #E8E8E5; }

        .ev-empty { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 3rem; text-align: center; }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .modal-box { background: white; border-radius: 12px; width: 100%; max-width: 480px; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.15); }
        .modal-head { padding: 1.1rem 1.25rem; border-bottom: 1px solid #E8E8E5; display: flex; align-items: center; justify-content: space-between; }
        .modal-title { font-size: 0.88rem; font-weight: 700; color: #37352F; letter-spacing: -0.02em; }
        .modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: #9B9A97; padding: 0; transition: color 0.12s; }
        .modal-close:hover { color: #37352F; }
        .modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; }
        .modal-label { display: block; font-size: 0.72rem; font-weight: 500; color: #6B6B6B; margin-bottom: 0.35rem; }
        .modal-input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; transition: border-color 0.15s; }
        .modal-input:focus { border-color: #37352F; box-shadow: 0 0 0 2px rgba(55,53,47,0.06); }
        .modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .modal-foot { padding: 1rem 1.25rem; border-top: 1px solid #E8E8E5; display: flex; justify-content: flex-end; gap: 0.5rem; }
        .modal-btn-cancel { font-size: 0.78rem; font-weight: 500; color: #6B6B6B; background: white; border: 1px solid #E8E8E5; border-radius: 7px; padding: 0.5rem 1rem; cursor: pointer; font-family: inherit; }
        .modal-btn-ok { font-size: 0.78rem; font-weight: 600; color: white; background: #37352F; border: none; border-radius: 7px; padding: 0.5rem 1.1rem; cursor: pointer; font-family: inherit; transition: background 0.12s; }
        .modal-btn-ok:hover { background: #1A1A1A; }
        .modal-btn-ok:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="ev-wrap">
        {/* Toolbar */}
        <div className="ev-toolbar">
          <button className={`ev-filter-btn${filtro === 'todas' ? ' active' : ''}`} onClick={() => setFiltro('todas')}>
            Todas
          </button>
          {ASIG_UNICAS.map(a => (
            <button key={a} className={`ev-filter-btn${filtro === a ? ' active' : ''}`} onClick={() => setFiltro(a)}>
              {a}
            </button>
          ))}
          <button className="ev-new-btn" onClick={() => setModalN(true)}>+ Nueva evaluación</button>
        </div>

        {/* Lista */}
        {filtradas.length === 0 ? (
          <div className="ev-empty">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
            <p style={{ fontSize: '0.82rem', color: '#9B9A97' }}>No hay evaluaciones. Crea la primera.</p>
          </div>
        ) : (
          <div className="ev-list">
            {filtradas.map(ev => (
              <div key={ev.id} className="ev-item">
                <div className="ev-dot" />
                <div className="ev-info">
                  <div className="ev-titulo">{ev.titulo}</div>
                  <div className="ev-meta">
                    <span>{ev.curso_nombre ?? '—'}</span>
                    <span>·</span>
                    <span>{ev.asignatura}</span>
                    <span className="ev-tipo-chip">{tipoLabel(ev.tipo)}</span>
                    <span>{ev.ponderacion}%</span>
                  </div>
                </div>
                <div className="ev-fecha">{ev.fecha ? new Date(ev.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : '—'}</div>
                <span className="ev-estado" style={estadoStyle(ev.estado)}>
                  {ev.estado === 'proxima' ? 'Próxima' : ev.estado === 'pasada' ? 'Pasada' : 'Activa'}
                </span>
                <button className="ev-cal-btn" onClick={() => setModalC(ev)}>Calificar →</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal nueva evaluación */}
      {modalNueva && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalN(false)}>
          <div className="modal-box">
            <div className="modal-head">
              <span className="modal-title">Nueva evaluación</span>
              <button className="modal-close" onClick={() => setModalN(false)}>✕</button>
            </div>
            <form action={async (fd: FormData) => {
              const result = await crearEvaluacion(fd)
              if (result?.success) {
                startT(() => { setModalN(false) })
                window.location.reload()
              }
            }}>
              <div className="modal-body">
                <div>
                  <label className="modal-label">Título *</label>
                  <input name="titulo" className="modal-input" placeholder="Ej: Prueba Fracciones" required />
                </div>
                <div className="modal-row">
                  <div>
                    <label className="modal-label">Asignatura *</label>
                    <select name="asignatura" className="modal-input" required>
                      {ASIGNATURAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="modal-label">Tipo *</label>
                    <select name="tipo" className="modal-input" required>
                      {TIPOS.map(t => <option key={t} value={t}>{tipoLabel(t)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-row">
                  <div>
                    <label className="modal-label">Fecha *</label>
                    <input name="fecha" type="date" className="modal-input" required defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className="modal-label">Ponderación (%) *</label>
                    <input name="ponderacion" type="number" className="modal-input" min="1" max="100" defaultValue="20" required />
                  </div>
                </div>
                <div>
                  <label className="modal-label">OA asociados (opcional)</label>
                  <input name="oa_asociados" className="modal-input" placeholder="Ej: OA3, OA5" />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="modal-btn-cancel" onClick={() => setModalN(false)}>Cancelar</button>
                <button type="submit" className="modal-btn-ok">Crear evaluación →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal calificar */}
      {modalCal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalC(null)}>
          <div className="modal-box">
            <div className="modal-head">
              <span className="modal-title">Calificar — {modalCal.titulo}</span>
              <button className="modal-close" onClick={() => setModalC(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.8rem', color: '#9B9A97' }}>
                Para calificar esta evaluación, ve al Libro de Clases → Notas → {modalCal.curso_nombre}.
              </p>
              <div style={{ background: '#FAFAF8', borderRadius: '8px', padding: '0.85rem', fontSize: '0.78rem', color: '#37352F' }}>
                <strong>{modalCal.titulo}</strong><br />
                {modalCal.asignatura} · {tipoLabel(modalCal.tipo)} · {modalCal.ponderacion}%
              </div>
            </div>
            <div className="modal-foot">
              <button className="modal-btn-cancel" onClick={() => setModalC(null)}>Cerrar</button>
              <a href="/libro" className="modal-btn-ok" style={{ textDecoration: 'none', display: 'inline-block' }}>
                Ir al Libro →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
