'use client'

import { useState, useTransition } from 'react'
import { crearDocente, asignarDocente, getHorarioDocente } from '@/lib/actions/personal'

type Asignacion = { asignatura: string; es_jefe: boolean; cursos: { nombre: string } | null }
type Docente = {
  id: string; rut: string | null; nombre: string; apellido_paterno: string
  apellido_materno: string | null; email: string | null; telefono: string | null
  especialidad: string[]; nivel: string[]; tipo_contrato: string
  horas_contrato: number; titulo: string | null; mencion: string | null
  fecha_ingreso: string | null; activo: boolean
  asignaciones_docente: Asignacion[]
}
type Curso = { id: string; nombre: string; nivel: string }

interface Props { docentes: Docente[]; cursos: Curso[] }

const ASIGS = ['Matemáticas','Lenguaje','Ciencias','Historia','Inglés','Ed. Física','Artes','Música','Tecnología','Religión']
const NIVELES = ['párvulos','básica','media']
const CONTRATOS = ['planta','contrata','honorarios','reemplazo']
const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes']

const contratoStyle = (t: string): React.CSSProperties =>
  t === 'planta'     ? { background: '#F0FDF4', color: '#16A34A' } :
  t === 'contrata'   ? { background: '#EFF6FF', color: '#2563EB' } :
  t === 'honorarios' ? { background: '#FFFBEB', color: '#D97706' } :
                       { background: '#FEF2F2', color: '#DC2626' }

export function PersonalClient({ docentes: inicial, cursos }: Props) {
  const [docentes,    setDocentes]   = useState(inicial)
  const [busqueda,    setBusqueda]   = useState('')
  const [docenteSel,  setDocenteSel] = useState<Docente | null>(null)
  const [horario,     setHorario]    = useState<any[]>([])
  const [cargandoH,   setCargandoH]  = useState(false)
  const [modalNew,    setModalNew]   = useState(false)
  const [modalAsig,   setModalAsig]  = useState(false)
  const [isPending,   startT]        = useTransition()
  const [msg,         setMsg]        = useState('')

  const filtrados = docentes.filter(d => {
    const q = busqueda.toLowerCase()
    return !q || `${d.apellido_paterno} ${d.nombre} ${d.email ?? ''}`.toLowerCase().includes(q)
  })

  const abrirFicha = async (d: Docente) => {
    setDocenteSel(d)
    setCargandoH(true)
    const h = await getHorarioDocente(d.id)
    setHorario(h)
    setCargandoH(false)
  }

  // Organizar horario por día
  const horarioPorDia: Record<number, any[]> = {}
  horario.forEach(h => {
    if (!horarioPorDia[h.dia]) horarioPorDia[h.dia] = []
    horarioPorDia[h.dia].push(h)
  })

  if (docenteSel) return (
    <>
      <style>{`
        .pf-back { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: #9B9A97; font-family: inherit; padding: 0; margin-bottom: 1rem; }
        .pf-back:hover { color: #37352F; }
        .pf-hero { background: #37352F; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; display: flex; gap: 1rem; align-items: flex-start; flex-wrap: wrap; }
        .pf-av { width: 52px; height: 52px; border-radius: 10px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; color: white; flex-shrink: 0; }
        .pf-nombre { font-size: 1.05rem; font-weight: 700; color: white; margin-bottom: 0.2rem; }
        .pf-meta { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 0.4rem; }
        .pf-badges { display: flex; gap: 0.3rem; flex-wrap: wrap; }
        .pf-badge { font-size: 0.6rem; font-weight: 600; padding: 0.12rem 0.45rem; border-radius: 3px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
        .pf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .pf-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; margin-bottom: 1rem; }
        .pf-card-title { font-size: 0.75rem; font-weight: 600; color: #37352F; margin-bottom: 0.85rem; display: flex; align-items: center; justify-content: space-between; }
        .pf-data-item { padding: 0.5rem 0; border-bottom: 1px solid #F5F5F3; display: flex; gap: 0.75rem; }
        .pf-data-item:last-child { border-bottom: none; }
        .pf-data-label { font-size: 0.7rem; font-weight: 500; color: #9B9A97; width: 130px; flex-shrink: 0; }
        .pf-data-val { font-size: 0.78rem; color: #37352F; flex: 1; }
        .pf-asig-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 0; border-bottom: 1px solid #F5F5F3; }
        .pf-asig-row:last-child { border-bottom: none; }
        .pf-asig-chip { font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 4px; background: #EFF6FF; color: #2563EB; }
        .pf-jefe-chip { font-size: 0.6rem; font-weight: 600; padding: 0.1rem 0.4rem; border-radius: 3px; background: #FFFBEB; color: #D97706; }
        .pf-hor-dia { margin-bottom: 0.75rem; }
        .pf-hor-dia-nombre { font-size: 0.7rem; font-weight: 600; color: #9B9A97; text-transform: uppercase; margin-bottom: 0.35rem; }
        .pf-hor-bloque { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; background: #FAFAF8; border-radius: 7px; margin-bottom: 0.3rem; font-size: 0.78rem; }
        .pf-hor-hora { color: #9B9A97; width: 100px; flex-shrink: 0; font-variant-numeric: tabular-nums; }
        .pf-hor-asig { font-weight: 600; color: #37352F; flex: 1; }
        .pf-hor-sala { font-size: 0.7rem; color: #9B9A97; }
        .pf-add-btn { font-size: 0.72rem; font-weight: 600; color: white; background: #37352F; border: none; border-radius: 6px; padding: 0.3rem 0.75rem; cursor: pointer; font-family: inherit; }
        .pf-msg { padding: 0.6rem 0.85rem; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 7px; font-size: 0.78rem; color: #16A34A; margin-bottom: 0.75rem; }
        .pf-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .pf-modal { background: white; border-radius: 12px; width: 100%; max-width: 440px; box-shadow: 0 24px 64px rgba(0,0,0,0.12); overflow: hidden; }
        .pf-modal-head { padding: 1rem 1.25rem; border-bottom: 1px solid #E8E8E5; display: flex; align-items: center; justify-content: space-between; }
        .pf-modal-title { font-size: 0.88rem; font-weight: 700; color: #37352F; }
        .pf-modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: #9B9A97; }
        .pf-modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; }
        .pf-label { display: block; font-size: 0.7rem; font-weight: 500; color: #9B9A97; margin-bottom: 0.35rem; text-transform: uppercase; }
        .pf-input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; }
        .pf-input:focus { border-color: #37352F; }
        .pf-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .pf-modal-foot { padding: 1rem 1.25rem; border-top: 1px solid #E8E8E5; display: flex; justify-content: flex-end; gap: 0.5rem; }
        .pf-cancel { font-size: 0.78rem; font-weight: 500; color: #6B6B6B; background: white; border: 1px solid #E8E8E5; border-radius: 7px; padding: 0.5rem 1rem; cursor: pointer; font-family: inherit; }
        .pf-submit { font-size: 0.78rem; font-weight: 600; color: white; background: #37352F; border: none; border-radius: 7px; padding: 0.5rem 1.1rem; cursor: pointer; font-family: inherit; }
      `}</style>

      <button className="pf-back" onClick={() => setDocenteSel(null)}>← Volver al directorio</button>
      {msg && <div className="pf-msg">{msg}</div>}

      {/* Hero */}
      <div className="pf-hero">
        <div className="pf-av">{docenteSel.nombre[0]}{docenteSel.apellido_paterno[0]}</div>
        <div style={{ flex: 1 }}>
          <div className="pf-nombre">{docenteSel.apellido_paterno} {docenteSel.apellido_materno}, {docenteSel.nombre}</div>
          <div className="pf-meta">{docenteSel.titulo ?? 'Sin título registrado'}{docenteSel.mencion ? ` · ${docenteSel.mencion}` : ''}</div>
          <div className="pf-badges">
            <span className="pf-badge" style={contratoStyle(docenteSel.tipo_contrato)}>{docenteSel.tipo_contrato}</span>
            <span className="pf-badge">{docenteSel.horas_contrato}h semanales</span>
            {docenteSel.nivel.map(n => <span key={n} className="pf-badge">{n}</span>)}
          </div>
        </div>
      </div>

      <div className="pf-grid">
        {/* Datos personales */}
        <div className="pf-card">
          <div className="pf-card-title">Datos de contacto</div>
          {[
            { l: 'RUT',        v: docenteSel.rut ?? '—' },
            { l: 'Email',      v: docenteSel.email ?? '—' },
            { l: 'Teléfono',   v: docenteSel.telefono ?? '—' },
            { l: 'Ingreso',    v: docenteSel.fecha_ingreso ? new Date(docenteSel.fecha_ingreso + 'T12:00:00').toLocaleDateString('es-CL') : '—' },
            { l: 'Contrato',   v: docenteSel.tipo_contrato },
            { l: 'Horas',      v: `${docenteSel.horas_contrato}h semanales` },
          ].map(d => (
            <div key={d.l} className="pf-data-item">
              <span className="pf-data-label">{d.l}</span>
              <span className="pf-data-val">{d.v}</span>
            </div>
          ))}
        </div>

        {/* Asignaciones */}
        <div className="pf-card">
          <div className="pf-card-title">
            Cursos asignados
            <button className="pf-add-btn" onClick={() => setModalAsig(true)}>+ Asignar</button>
          </div>
          {docenteSel.asignaciones_docente.length === 0 ? (
            <div style={{ fontSize: '0.78rem', color: '#9B9A97', padding: '1rem 0' }}>Sin cursos asignados</div>
          ) : docenteSel.asignaciones_docente.map((a, i) => (
            <div key={i} className="pf-asig-row">
              <span className="pf-asig-chip">{a.asignatura}</span>
              <span style={{ fontSize: '0.78rem', color: '#37352F', flex: 1 }}>{a.cursos?.nombre ?? '—'}</span>
              {a.es_jefe && <span className="pf-jefe-chip">Jefe</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Horario */}
      <div className="pf-card">
        <div className="pf-card-title">Horario semanal</div>
        {cargandoH ? (
          <div style={{ fontSize: '0.78rem', color: '#9B9A97' }}>Cargando horario...</div>
        ) : horario.length === 0 ? (
          <div style={{ fontSize: '0.78rem', color: '#9B9A97' }}>Sin horario registrado</div>
        ) : (
          [1,2,3,4,5].map(dia => {
            const bloques = horarioPorDia[dia] ?? []
            if (bloques.length === 0) return null
            return (
              <div key={dia} className="pf-hor-dia">
                <div className="pf-hor-dia-nombre">{DIAS[dia-1]}</div>
                {bloques.map((b: any, i: number) => (
                  <div key={i} className="pf-hor-bloque">
                    <span className="pf-hor-hora">{b.hora_inicio.slice(0,5)} – {b.hora_fin.slice(0,5)}</span>
                    <span className="pf-hor-asig">{b.asignatura}</span>
                    <span style={{ fontSize: '0.72rem', color: '#9B9A97' }}>{b.cursos?.nombre}</span>
                    {b.sala && <span className="pf-hor-sala">· {b.sala}</span>}
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>

      {/* Modal asignar curso */}
      {modalAsig && (
        <div className="pf-overlay" onClick={e => e.target === e.currentTarget && setModalAsig(false)}>
          <div className="pf-modal">
            <div className="pf-modal-head">
              <span className="pf-modal-title">Asignar curso</span>
              <button className="pf-modal-close" onClick={() => setModalAsig(false)}>✕</button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              startT(async () => {
                const r = await asignarDocente({
                  docenteId:  docenteSel.id,
                  cursoId:    fd.get('curso_id') as string,
                  asignatura: fd.get('asignatura') as string,
                  horasSem:   parseInt(fd.get('horas_sem') as string),
                  esJefe:     fd.get('es_jefe') === 'true',
                })
                if (r.success) {
                  setModalAsig(false)
                  setMsg('Asignación guardada ✓')
                  setTimeout(() => setMsg(''), 3000)
                }
              })
            }}>
              <div className="pf-modal-body">
                <div>
                  <label className="pf-label">Curso *</label>
                  <select name="curso_id" className="pf-input" required>
                    {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="pf-row2">
                  <div>
                    <label className="pf-label">Asignatura *</label>
                    <select name="asignatura" className="pf-input" required>
                      {ASIGS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="pf-label">Horas semanales</label>
                    <input name="horas_sem" type="number" className="pf-input" defaultValue="4" min="1" max="20" />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" name="es_jefe" value="true" id="es_jefe" />
                  <label htmlFor="es_jefe" style={{ fontSize: '0.78rem', color: '#6B6B6B', cursor: 'pointer' }}>
                    Es profesor/a jefe de este curso
                  </label>
                </div>
              </div>
              <div className="pf-modal-foot">
                <button type="button" className="pf-cancel" onClick={() => setModalAsig(false)}>Cancelar</button>
                <button type="submit" className="pf-submit" disabled={isPending}>
                  {isPending ? 'Guardando...' : 'Guardar asignación →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )

  // ── Directorio docentes ───────────────────────────────────────
  return (
    <>
      <style>{`
        .prd { width: 100%; font-family: 'Inter', system-ui, sans-serif; }
        .prd-toolbar { display: flex; gap: 0.75rem; margin-bottom: 1rem; align-items: center; }
        .prd-search { flex: 1; padding: 0.55rem 0.85rem; border: 1px solid #E8E8E5; border-radius: 8px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; }
        .prd-search:focus { border-color: #37352F; }
        .prd-new-btn { font-size: 0.78rem; font-weight: 600; padding: 0.4rem 0.9rem; border-radius: 7px; cursor: pointer; font-family: inherit; background: #37352F; color: white; border: none; white-space: nowrap; }

        .prd-table { background: white; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; }
        .prd-th { padding: 0.55rem 0.85rem; text-align: left; font-size: 0.62rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; background: #FAFAF8; border-bottom: 1px solid #E8E8E5; }
        .prd-tr { display: flex; align-items: center; gap: 0; border-bottom: 1px solid #F5F5F3; transition: background 0.1s; cursor: pointer; }
        .prd-tr:last-child { border-bottom: none; }
        .prd-tr:hover { background: #FAFAF8; }
        .prd-td { padding: 0.75rem 0.85rem; font-size: 0.78rem; color: #37352F; }
        .prd-av { width: 28px; height: 28px; border-radius: 5px; background: #F0F0EE; display: flex; align-items: center; justify-content: center; font-size: 0.62rem; font-weight: 700; color: #6B6B6B; flex-shrink: 0; }
        .prd-nombre { font-weight: 600; }
        .prd-email { font-size: 0.7rem; color: #9B9A97; }
        .prd-contrato { font-size: 0.62rem; font-weight: 600; padding: 0.12rem 0.45rem; border-radius: 20px; }
        .prd-asig { display: flex; gap: 0.2rem; flex-wrap: wrap; }
        .prd-asig-tag { font-size: 0.6rem; font-weight: 500; padding: 0.1rem 0.35rem; border-radius: 3px; background: #F0F0EE; color: #6B6B6B; }
        .prd-jefe { font-size: 0.6rem; font-weight: 600; padding: 0.1rem 0.35rem; border-radius: 3px; background: #FFFBEB; color: #D97706; }
        .prd-empty { padding: 3rem; text-align: center; color: #9B9A97; font-size: 0.82rem; }

        .prd-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .prd-modal { background: white; border-radius: 12px; width: 100%; max-width: 520px; max-height: 85vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.12); }
        .prd-modal-head { padding: 1rem 1.25rem; border-bottom: 1px solid #E8E8E5; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: white; }
        .prd-modal-title { font-size: 0.88rem; font-weight: 700; color: #37352F; }
        .prd-modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: #9B9A97; }
        .prd-modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; }
        .prd-label { display: block; font-size: 0.7rem; font-weight: 500; color: #9B9A97; margin-bottom: 0.35rem; text-transform: uppercase; }
        .prd-input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; }
        .prd-input:focus { border-color: #37352F; }
        .prd-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .prd-modal-foot { padding: 1rem 1.25rem; border-top: 1px solid #E8E8E5; display: flex; justify-content: flex-end; gap: 0.5rem; position: sticky; bottom: 0; background: white; }
        .prd-cancel { font-size: 0.78rem; font-weight: 500; color: #6B6B6B; background: white; border: 1px solid #E8E8E5; border-radius: 7px; padding: 0.5rem 1rem; cursor: pointer; font-family: inherit; }
        .prd-submit { font-size: 0.78rem; font-weight: 600; color: white; background: #37352F; border: none; border-radius: 7px; padding: 0.5rem 1.1rem; cursor: pointer; font-family: inherit; }
        .prd-msg { padding: 0.6rem 0.85rem; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 7px; font-size: 0.78rem; color: #16A34A; margin-bottom: 0.75rem; }
      `}</style>

      <div className="prd">
        {msg && <div className="prd-msg">{msg}</div>}

        <div className="prd-toolbar">
          <input className="prd-search" placeholder="🔍 Buscar por nombre o email..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <button className="prd-new-btn" onClick={() => setModalNew(true)}>+ Agregar docente</button>
        </div>

        <div className="prd-table">
          <div style={{ display: 'flex', background: '#FAFAF8', borderBottom: '1px solid #E8E8E5' }}>
            {['Docente','Especialidad','Contrato','Cursos asignados','Horas',''].map(h => (
              <div key={h} className="prd-th" style={{ flex: h === 'Docente' ? 3 : h === 'Especialidad' ? 2 : h === 'Cursos asignados' ? 2 : 1 }}>{h}</div>
            ))}
          </div>

          {filtrados.length === 0 ? (
            <div className="prd-empty">Sin docentes registrados</div>
          ) : filtrados.map(d => {
            const jefaturas = d.asignaciones_docente.filter(a => a.es_jefe)
            return (
              <div key={d.id} className="prd-tr" onClick={() => abrirFicha(d)}>
                <div className="prd-td" style={{ flex: 3, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="prd-av">{d.nombre[0]}{d.apellido_paterno[0]}</div>
                  <div>
                    <div className="prd-nombre">{d.apellido_paterno}, {d.nombre}</div>
                    <div className="prd-email">{d.email ?? '—'}</div>
                  </div>
                </div>
                <div className="prd-td" style={{ flex: 2 }}>
                  <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                    {d.especialidad.map(e => <span key={e} className="prd-asig-tag">{e}</span>)}
                  </div>
                </div>
                <div className="prd-td" style={{ flex: 1 }}>
                  <span className="prd-contrato" style={contratoStyle(d.tipo_contrato)}>{d.tipo_contrato}</span>
                </div>
                <div className="prd-td" style={{ flex: 2 }}>
                  <div className="prd-asig">
                    {jefaturas.map((a, i) => (
                      <span key={i} className="prd-jefe">Jefe {a.cursos?.nombre}</span>
                    ))}
                    {d.asignaciones_docente.filter(a => !a.es_jefe).slice(0,2).map((a, i) => (
                      <span key={i} className="prd-asig-tag">{a.cursos?.nombre}</span>
                    ))}
                  </div>
                </div>
                <div className="prd-td" style={{ flex: 1, color: '#9B9A97' }}>{d.horas_contrato}h</div>
                <div className="prd-td" style={{ flex: 1, color: '#C2C0BB' }}>›</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal nuevo docente */}
      {modalNew && (
        <div className="prd-overlay" onClick={e => e.target === e.currentTarget && setModalNew(false)}>
          <div className="prd-modal">
            <div className="prd-modal-head">
              <span className="prd-modal-title">Agregar docente</span>
              <button className="prd-modal-close" onClick={() => setModalNew(false)}>✕</button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              startT(async () => {
                const r = await crearDocente({
                  rut:            fd.get('rut') as string,
                  nombre:         fd.get('nombre') as string,
                  apellidoPaterno: fd.get('apellido_paterno') as string,
                  apellidoMaterno: fd.get('apellido_materno') as string,
                  email:          fd.get('email') as string,
                  telefono:       fd.get('telefono') as string,
                  especialidad:   (fd.get('especialidad') as string).split(',').map(s => s.trim()).filter(Boolean),
                  nivel:          [fd.get('nivel') as string],
                  tipoContrato:   fd.get('tipo_contrato') as string,
                  horasContrato:  parseInt(fd.get('horas_contrato') as string),
                  titulo:         fd.get('titulo') as string,
                  fechaIngreso:   fd.get('fecha_ingreso') as string,
                })
                if (r.success) {
                  setModalNew(false)
                  setMsg('Docente agregado ✓')
                  setTimeout(() => setMsg(''), 3000)
                  window.location.reload()
                }
              })
            }}>
              <div className="prd-modal-body">
                <div className="prd-row2">
                  <div>
                    <label className="prd-label">Nombre *</label>
                    <input name="nombre" className="prd-input" required placeholder="Nombre" />
                  </div>
                  <div>
                    <label className="prd-label">Apellido paterno *</label>
                    <input name="apellido_paterno" className="prd-input" required placeholder="Apellido" />
                  </div>
                </div>
                <div className="prd-row2">
                  <div>
                    <label className="prd-label">Apellido materno</label>
                    <input name="apellido_materno" className="prd-input" placeholder="Apellido" />
                  </div>
                  <div>
                    <label className="prd-label">RUT</label>
                    <input name="rut" className="prd-input" placeholder="12.345.678-9" />
                  </div>
                </div>
                <div className="prd-row2">
                  <div>
                    <label className="prd-label">Email</label>
                    <input name="email" type="email" className="prd-input" placeholder="email@colegio.cl" />
                  </div>
                  <div>
                    <label className="prd-label">Teléfono</label>
                    <input name="telefono" className="prd-input" placeholder="+56 9 ..." />
                  </div>
                </div>
                <div>
                  <label className="prd-label">Especialidades (separadas por coma)</label>
                  <input name="especialidad" className="prd-input" placeholder="Ej: Matemáticas, Ciencias" />
                </div>
                <div className="prd-row2">
                  <div>
                    <label className="prd-label">Nivel que imparte</label>
                    <select name="nivel" className="prd-input">
                      {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="prd-label">Tipo de contrato</label>
                    <select name="tipo_contrato" className="prd-input">
                      {CONTRATOS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="prd-row2">
                  <div>
                    <label className="prd-label">Horas contrato</label>
                    <input name="horas_contrato" type="number" className="prd-input" defaultValue="44" min="1" max="44" />
                  </div>
                  <div>
                    <label className="prd-label">Fecha de ingreso</label>
                    <input name="fecha_ingreso" type="date" className="prd-input" />
                  </div>
                </div>
                <div>
                  <label className="prd-label">Título profesional</label>
                  <input name="titulo" className="prd-input" placeholder="Ej: Profesor de Educación Básica" />
                </div>
              </div>
              <div className="prd-modal-foot">
                <button type="button" className="prd-cancel" onClick={() => setModalNew(false)}>Cancelar</button>
                <button type="submit" className="prd-submit" disabled={isPending}>
                  {isPending ? 'Guardando...' : 'Agregar docente →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
