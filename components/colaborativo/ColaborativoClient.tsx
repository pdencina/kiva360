'use client'

import { useState, useTransition } from 'react'
import { crearRecurso, crearCodocencia, darLike } from '@/lib/actions/colaborativo'

type Recurso = {
  id: string; titulo: string; descripcion: string | null; tipo: string
  asignatura: string | null; nivel: string | null; url: string | null
  tags: string[]; likes: number; creado_en: string
  perfiles: { nombre: string } | null
}
type Codocencia = {
  id: string; asignatura: string; fecha: string
  hora_inicio: string | null; hora_fin: string | null
  objetivo: string | null; estado: string
  cursos: { nombre: string } | null
}
type Curso = { id: string; nombre: string; nivel: string }

interface Props { recursos: Recurso[]; codocencia: Codocencia[]; cursos: Curso[] }

const TIPOS = ['guia','evaluacion','presentacion','video','libro','otro']
const ASIGS = ['Matemáticas','Lenguaje','Ciencias','Historia','Inglés','Ed. Física','Artes','Música','Tecnología','Religión']

const tipoLabel = (t: string) => ({
  guia: '📄 Guía', evaluacion: '📝 Evaluación', presentacion: '📊 Presentación',
  video: '🎬 Video', libro: '📚 Libro', otro: '📎 Otro'
}[t] ?? t)

const tipoColor = (t: string): React.CSSProperties => ({
  guia:          { background: '#EFF6FF', color: '#2563EB' },
  evaluacion:    { background: '#F0FDF4', color: '#16A34A' },
  presentacion:  { background: '#FFF7ED', color: '#EA580C' },
  video:         { background: '#FDF4FF', color: '#9333EA' },
  libro:         { background: '#FFFBEB', color: '#D97706' },
  otro:          { background: '#F5F5F3', color: '#6B6B6B' },
}[t] ?? { background: '#F5F5F3', color: '#6B6B6B' })

const estadoStyle = (e: string) =>
  e === 'realizada'  ? { bg: '#F0F0EE', color: '#6B6B6B', label: '✓ Realizada' } :
  e === 'programada' ? { bg: '#EFF6FF', color: '#2563EB', label: '→ Programada' } :
                       { bg: '#FEF2F2', color: '#DC2626', label: '✗ Cancelada'  }

export function ColaborativoClient({ recursos: inicial, codocencia, cursos }: Props) {
  const [tab,         setTab]        = useState<'recursos'|'codocencia'>('recursos')
  const [recursos,    setRecursos]   = useState(inicial)
  const [filtroTipo,  setFiltroTipo] = useState('todos')
  const [filtroAsig,  setFiltroAsig] = useState('todos')
  const [busqueda,    setBusqueda]   = useState('')
  const [modalRec,    setModalRec]   = useState(false)
  const [modalCod,    setModalCod]   = useState(false)
  const [isPending,   startT]        = useTransition()
  const [msg,         setMsg]        = useState('')

  const filtrados = recursos.filter(r => {
    const tipoOk  = filtroTipo === 'todos' || r.tipo === filtroTipo
    const asigOk  = filtroAsig === 'todos' || r.asignatura === filtroAsig
    const busqOk  = !busqueda  || `${r.titulo} ${r.descripcion ?? ''} ${r.tags.join(' ')}`.toLowerCase().includes(busqueda.toLowerCase())
    return tipoOk && asigOk && busqOk
  })

  const handleLike = async (id: string) => {
    setRecursos(prev => prev.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r))
    await darLike(id)
  }

  const proximas   = codocencia.filter(c => c.estado === 'programada')
  const realizadas = codocencia.filter(c => c.estado === 'realizada')

  return (
    <>
      <style>{`
        .clb { width: 100%; font-family: 'Inter', system-ui, sans-serif; }

        .clb-tabs { display: flex; border-bottom: 1px solid #E8E8E5; margin-bottom: 1.25rem; }
        .clb-tab { font-size: 0.78rem; font-weight: 400; padding: 0.55rem 0.9rem; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; color: #9B9A97; font-family: inherit; transition: all 0.12s; margin-bottom: -1px; }
        .clb-tab.active { color: #37352F; border-bottom-color: #37352F; font-weight: 600; }

        .clb-toolbar { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; align-items: center; }
        .clb-search { flex: 1; min-width: 180px; padding: 0.5rem 0.85rem; border: 1px solid #E8E8E5; border-radius: 8px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; }
        .clb-search:focus { border-color: #37352F; }
        .clb-select { padding: 0.5rem 0.75rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.78rem; color: #37352F; outline: none; font-family: inherit; background: white; }
        .clb-new-btn { font-size: 0.78rem; font-weight: 600; padding: 0.4rem 0.9rem; border-radius: 7px; cursor: pointer; font-family: inherit; background: #37352F; color: white; border: none; white-space: nowrap; }

        .clb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.75rem; }
        .clb-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; display: flex; flex-direction: column; gap: 0.6rem; transition: all 0.15s; }
        .clb-card:hover { border-color: #C2C0BB; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .clb-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
        .clb-tipo { font-size: 0.62rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 4px; flex-shrink: 0; }
        .clb-titulo { font-size: 0.85rem; font-weight: 600; color: #37352F; line-height: 1.4; flex: 1; }
        .clb-desc { font-size: 0.75rem; color: #6B6B6B; line-height: 1.5; }
        .clb-tags { display: flex; gap: 0.25rem; flex-wrap: wrap; }
        .clb-tag { font-size: 0.6rem; font-weight: 500; padding: 0.12rem 0.4rem; border-radius: 3px; background: #F0F0EE; color: #9B9A97; }
        .clb-card-foot { display: flex; align-items: center; justify-content: space-between; }
        .clb-meta { font-size: 0.68rem; color: #9B9A97; }
        .clb-actions { display: flex; gap: 0.4rem; align-items: center; }
        .clb-like-btn { display: flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; font-weight: 600; color: #6B6B6B; background: #F0F0EE; border: none; border-radius: 6px; padding: 0.25rem 0.6rem; cursor: pointer; font-family: inherit; transition: all 0.12s; }
        .clb-like-btn:hover { background: #FEF2F2; color: #DC2626; }
        .clb-link-btn { font-size: 0.72rem; font-weight: 500; color: #2563EB; background: #EFF6FF; border: none; border-radius: 6px; padding: 0.25rem 0.6rem; cursor: pointer; font-family: inherit; text-decoration: none; }

        .clb-empty { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 3rem; text-align: center; color: #9B9A97; font-size: 0.82rem; }

        .clb-cod-section { font-size: 0.72rem; font-weight: 600; color: #9B9A97; text-transform: uppercase; letter-spacing: 0.06em; margin: 1rem 0 0.5rem; }
        .clb-cod-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
        .clb-cod-fecha { width: 48px; text-align: center; flex-shrink: 0; }
        .clb-cod-fecha-d { font-size: 1.2rem; font-weight: 700; color: #37352F; line-height: 1; }
        .clb-cod-fecha-m { font-size: 0.6rem; color: #9B9A97; text-transform: uppercase; }
        .clb-cod-div { width: 1px; height: 40px; background: #E8E8E5; flex-shrink: 0; }
        .clb-cod-info { flex: 1; }
        .clb-cod-asig { font-size: 0.85rem; font-weight: 600; color: #37352F; margin-bottom: 0.15rem; }
        .clb-cod-meta { font-size: 0.72rem; color: #9B9A97; }
        .clb-cod-obj { font-size: 0.75rem; color: #6B6B6B; line-height: 1.5; margin-top: 0.3rem; }
        .clb-cod-estado { font-size: 0.62rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 20px; flex-shrink: 0; }

        /* Modal */
        .clb-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .clb-modal { background: white; border-radius: 12px; width: 100%; max-width: 480px; max-height: 85vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.12); }
        .clb-modal-head { padding: 1rem 1.25rem; border-bottom: 1px solid #E8E8E5; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: white; }
        .clb-modal-title { font-size: 0.88rem; font-weight: 700; color: #37352F; }
        .clb-modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: #9B9A97; }
        .clb-modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; }
        .clb-label { display: block; font-size: 0.7rem; font-weight: 500; color: #9B9A97; margin-bottom: 0.35rem; text-transform: uppercase; }
        .clb-input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; }
        .clb-input:focus { border-color: #37352F; }
        .clb-textarea { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; min-height: 70px; resize: vertical; }
        .clb-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .clb-modal-foot { padding: 1rem 1.25rem; border-top: 1px solid #E8E8E5; display: flex; justify-content: flex-end; gap: 0.5rem; position: sticky; bottom: 0; background: white; }
        .clb-cancel { font-size: 0.78rem; font-weight: 500; color: #6B6B6B; background: white; border: 1px solid #E8E8E5; border-radius: 7px; padding: 0.5rem 1rem; cursor: pointer; font-family: inherit; }
        .clb-submit { font-size: 0.78rem; font-weight: 600; color: white; background: #37352F; border: none; border-radius: 7px; padding: 0.5rem 1.1rem; cursor: pointer; font-family: inherit; }
        .clb-msg { padding: 0.6rem 0.85rem; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 7px; font-size: 0.78rem; color: #16A34A; margin-bottom: 0.75rem; }
      `}</style>

      <div className="clb">
        {msg && <div className="clb-msg">{msg}</div>}

        <div className="clb-tabs">
          <button className={`clb-tab${tab === 'recursos' ? ' active' : ''}`} onClick={() => setTab('recursos')}>
            📚 Banco de recursos ({recursos.length})
          </button>
          <button className={`clb-tab${tab === 'codocencia' ? ' active' : ''}`} onClick={() => setTab('codocencia')}>
            🤝 Co-docencia ({codocencia.length})
          </button>
        </div>

        {/* ── RECURSOS ── */}
        {tab === 'recursos' && (
          <>
            <div className="clb-toolbar">
              <input className="clb-search" placeholder="🔍 Buscar recursos..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              <select className="clb-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                <option value="todos">Todos los tipos</option>
                {TIPOS.map(t => <option key={t} value={t}>{tipoLabel(t)}</option>)}
              </select>
              <select className="clb-select" value={filtroAsig} onChange={e => setFiltroAsig(e.target.value)}>
                <option value="todos">Todas las asignaturas</option>
                {ASIGS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <button className="clb-new-btn" onClick={() => setModalRec(true)}>+ Compartir recurso</button>
            </div>

            {filtrados.length === 0 ? (
              <div className="clb-empty">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                <p>Sin recursos. Sé el primero en compartir.</p>
              </div>
            ) : (
              <div className="clb-grid">
                {filtrados.map(r => (
                  <div key={r.id} className="clb-card">
                    <div className="clb-card-head">
                      <div>
                        <span className="clb-tipo" style={tipoColor(r.tipo)}>{tipoLabel(r.tipo)}</span>
                      </div>
                    </div>
                    <div className="clb-titulo">{r.titulo}</div>
                    {r.descripcion && <div className="clb-desc">{r.descripcion}</div>}
                    {r.tags.length > 0 && (
                      <div className="clb-tags">
                        {r.tags.map(t => <span key={t} className="clb-tag">#{t}</span>)}
                      </div>
                    )}
                    <div className="clb-card-foot">
                      <div className="clb-meta">
                        {r.asignatura && <span>{r.asignatura}</span>}
                        {r.nivel && <span> · {r.nivel}</span>}
                      </div>
                      <div className="clb-actions">
                        <button className="clb-like-btn" onClick={() => handleLike(r.id)}>
                          ♥ {r.likes}
                        </button>
                        {r.url && (
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="clb-link-btn">
                            Abrir →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── CO-DOCENCIA ── */}
        {tab === 'codocencia' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="clb-new-btn" onClick={() => setModalCod(true)}>+ Programar co-docencia</button>
            </div>

            {proximas.length > 0 && (
              <>
                <div className="clb-cod-section">📅 Próximas</div>
                {proximas.map(c => {
                  const fecha = new Date(c.fecha + 'T12:00:00')
                  const est   = estadoStyle(c.estado)
                  return (
                    <div key={c.id} className="clb-cod-card">
                      <div className="clb-cod-fecha">
                        <div className="clb-cod-fecha-d">{fecha.getDate()}</div>
                        <div className="clb-cod-fecha-m">{fecha.toLocaleDateString('es-CL', { month: 'short' })}</div>
                      </div>
                      <div className="clb-cod-div" />
                      <div className="clb-cod-info">
                        <div className="clb-cod-asig">{c.asignatura}</div>
                        <div className="clb-cod-meta">
                          {c.cursos?.nombre ?? '—'}
                          {c.hora_inicio && ` · ${c.hora_inicio.slice(0,5)} - ${c.hora_fin?.slice(0,5) ?? ''}`}
                        </div>
                        {c.objetivo && <div className="clb-cod-obj">{c.objetivo}</div>}
                      </div>
                      <span className="clb-cod-estado" style={{ background: est.bg, color: est.color }}>{est.label}</span>
                    </div>
                  )
                })}
              </>
            )}

            {realizadas.length > 0 && (
              <>
                <div className="clb-cod-section">✓ Realizadas</div>
                {realizadas.map(c => {
                  const fecha = new Date(c.fecha + 'T12:00:00')
                  const est   = estadoStyle(c.estado)
                  return (
                    <div key={c.id} className="clb-cod-card" style={{ opacity: 0.7 }}>
                      <div className="clb-cod-fecha">
                        <div className="clb-cod-fecha-d">{fecha.getDate()}</div>
                        <div className="clb-cod-fecha-m">{fecha.toLocaleDateString('es-CL', { month: 'short' })}</div>
                      </div>
                      <div className="clb-cod-div" />
                      <div className="clb-cod-info">
                        <div className="clb-cod-asig">{c.asignatura}</div>
                        <div className="clb-cod-meta">{c.cursos?.nombre ?? '—'}</div>
                        {c.objetivo && <div className="clb-cod-obj">{c.objetivo}</div>}
                      </div>
                      <span className="clb-cod-estado" style={{ background: est.bg, color: est.color }}>{est.label}</span>
                    </div>
                  )
                })}
              </>
            )}

            {codocencia.length === 0 && (
              <div className="clb-empty">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤝</div>
                <p>No hay sesiones de co-docencia. Programa la primera.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal compartir recurso */}
      {modalRec && (
        <div className="clb-overlay" onClick={e => e.target === e.currentTarget && setModalRec(false)}>
          <div className="clb-modal">
            <div className="clb-modal-head">
              <span className="clb-modal-title">Compartir recurso</span>
              <button className="clb-modal-close" onClick={() => setModalRec(false)}>✕</button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              startT(async () => {
                const r = await crearRecurso({
                  titulo:       fd.get('titulo') as string,
                  descripcion:  fd.get('descripcion') as string,
                  tipo:         fd.get('tipo') as string,
                  asignatura:   fd.get('asignatura') as string,
                  nivel:        fd.get('nivel') as string,
                  url:          fd.get('url') as string,
                  tags:         (fd.get('tags') as string).split(',').map(s => s.trim()).filter(Boolean),
                })
                if (r.success) {
                  setModalRec(false)
                  setMsg('Recurso compartido ✓')
                  setTimeout(() => setMsg(''), 3000)
                  window.location.reload()
                }
              })
            }}>
              <div className="clb-modal-body">
                <div>
                  <label className="clb-label">Título *</label>
                  <input name="titulo" className="clb-input" placeholder="Nombre del recurso" required />
                </div>
                <div className="clb-row2">
                  <div>
                    <label className="clb-label">Tipo *</label>
                    <select name="tipo" className="clb-input" required>
                      {TIPOS.map(t => <option key={t} value={t}>{tipoLabel(t)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="clb-label">Asignatura</label>
                    <select name="asignatura" className="clb-input">
                      <option value="">Todas</option>
                      {ASIGS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="clb-label">Descripción</label>
                  <textarea name="descripcion" className="clb-textarea" placeholder="¿De qué trata este recurso? ¿Cómo se usa?" />
                </div>
                <div className="clb-row2">
                  <div>
                    <label className="clb-label">Nivel / Curso</label>
                    <input name="nivel" className="clb-input" placeholder="Ej: 3°-4° Básico" />
                  </div>
                  <div>
                    <label className="clb-label">Enlace (URL)</label>
                    <input name="url" className="clb-input" placeholder="https://drive.google.com/..." />
                  </div>
                </div>
                <div>
                  <label className="clb-label">Tags (separados por coma)</label>
                  <input name="tags" className="clb-input" placeholder="Ej: fracciones, material concreto, ABP" />
                </div>
              </div>
              <div className="clb-modal-foot">
                <button type="button" className="clb-cancel" onClick={() => setModalRec(false)}>Cancelar</button>
                <button type="submit" className="clb-submit" disabled={isPending}>
                  {isPending ? 'Compartiendo...' : 'Compartir recurso →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal programar co-docencia */}
      {modalCod && (
        <div className="clb-overlay" onClick={e => e.target === e.currentTarget && setModalCod(false)}>
          <div className="clb-modal">
            <div className="clb-modal-head">
              <span className="clb-modal-title">Programar co-docencia</span>
              <button className="clb-modal-close" onClick={() => setModalCod(false)}>✕</button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              startT(async () => {
                const r = await crearCodocencia({
                  cursoId:    fd.get('curso_id') as string || undefined,
                  asignatura: fd.get('asignatura') as string,
                  fecha:      fd.get('fecha') as string,
                  horaInicio: fd.get('hora_inicio') as string || undefined,
                  horaFin:    fd.get('hora_fin') as string || undefined,
                  objetivo:   fd.get('objetivo') as string || undefined,
                })
                if (r.success) {
                  setModalCod(false)
                  setMsg('Co-docencia programada ✓')
                  setTimeout(() => setMsg(''), 3000)
                  window.location.reload()
                }
              })
            }}>
              <div className="clb-modal-body">
                <div className="clb-row2">
                  <div>
                    <label className="clb-label">Asignatura *</label>
                    <select name="asignatura" className="clb-input" required>
                      {ASIGS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="clb-label">Curso</label>
                    <select name="curso_id" className="clb-input">
                      <option value="">Sin asignar</option>
                      {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="clb-label">Fecha *</label>
                  <input name="fecha" type="date" className="clb-input" defaultValue={new Date().toISOString().split('T')[0]} required />
                </div>
                <div className="clb-row2">
                  <div>
                    <label className="clb-label">Hora inicio</label>
                    <input name="hora_inicio" type="time" className="clb-input" />
                  </div>
                  <div>
                    <label className="clb-label">Hora fin</label>
                    <input name="hora_fin" type="time" className="clb-input" />
                  </div>
                </div>
                <div>
                  <label className="clb-label">Objetivo de la sesión</label>
                  <textarea name="objetivo" className="clb-textarea" placeholder="¿Qué se busca lograr con esta co-docencia?" />
                </div>
              </div>
              <div className="clb-modal-foot">
                <button type="button" className="clb-cancel" onClick={() => setModalCod(false)}>Cancelar</button>
                <button type="submit" className="clb-submit" disabled={isPending}>
                  {isPending ? 'Guardando...' : 'Programar →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
