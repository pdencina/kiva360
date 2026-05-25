'use client'

import { useState, useTransition } from 'react'
import { crearPostulante, actualizarEstadoPostulante, agendarEntrevista } from '@/lib/actions/admision'

type Entrevista = { id: string; fecha: string; hora: string | null; puntaje: number | null; impresion: string | null; notas: string | null; realizada: boolean }
type Postulante = {
  id: string; nombre: string; apellido_paterno: string; apellido_materno: string | null
  rut: string | null; nivel_postula: string; colegio_anterior: string | null
  promedio_anterior: number | null; nombre_apoderado: string; telefono: string | null
  email: string | null; estado: string; puntaje_total: number | null
  numero_postulacion: string; observaciones: string | null; creado_en: string
  entrevistas_admision: Entrevista[]
}

const ESTADOS: Record<string, { label: string; bg: string; color: string }> = {
  recibido:             { label: '○ Recibido',           bg: '#F5F5F3', color: '#9B9A97' },
  en_evaluacion:        { label: '→ En evaluación',      bg: '#EFF6FF', color: '#2563EB' },
  entrevista_pendiente: { label: '📅 Entrevista pendiente', bg: '#FFFBEB', color: '#D97706' },
  entrevista_realizada: { label: '✓ Entrevistado',       bg: '#F0FDF4', color: '#16A34A' },
  aceptado:             { label: '★ Aceptado',           bg: '#F0FDF4', color: '#16A34A' },
  en_lista_espera:      { label: '⏳ Lista de espera',   bg: '#FFF7ED', color: '#EA580C' },
  rechazado:            { label: '✗ Rechazado',          bg: '#FEF2F2', color: '#DC2626' },
}

const NIVELES = ['Pre-Kinder','Kinder','1° Básico','2° Básico','3° Básico','4° Básico','5° Básico','6° Básico','7° Básico','8° Básico']

interface Props { postulantes: Postulante[]; resumen: any }

export function AdmisionClient({ postulantes: inicial, resumen }: Props) {
  const [postulantes,  setPostulantes]  = useState(inicial)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroNivel,  setFiltroNivel]  = useState('todos')
  const [busqueda,     setBusqueda]     = useState('')
  const [seleccionado, setSeleccionado] = useState<Postulante | null>(null)
  const [modalNuevo,   setModalNuevo]   = useState(false)
  const [modalEntrev,  setModalEntrev]  = useState(false)
  const [isPending,    startT]          = useTransition()
  const [msg,          setMsg]          = useState('')

  const niveles = [...new Set(postulantes.map(p => p.nivel_postula))]

  const filtrados = postulantes.filter(p => {
    const estOk  = filtroEstado === 'todos' || p.estado === filtroEstado
    const nivOk  = filtroNivel  === 'todos' || p.nivel_postula === filtroNivel
    const busqOk = !busqueda || `${p.apellido_paterno} ${p.nombre} ${p.rut ?? ''} ${p.numero_postulacion}`.toLowerCase().includes(busqueda.toLowerCase())
    return estOk && nivOk && busqOk
  })

  // Vista detalle postulante
  if (seleccionado) return (
    <>
      <style>{`
        .pd2 { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .pd2-back { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: #9B9A97; font-family: inherit; padding: 0; margin-bottom: 1rem; }
        .pd2-hero { background: #37352F; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; display: flex; gap: 1rem; align-items: flex-start; flex-wrap: wrap; }
        .pd2-av { width: 48px; height: 48px; border-radius: 10px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; color: white; flex-shrink: 0; }
        .pd2-nombre { font-size: 1rem; font-weight: 700; color: white; margin-bottom: 0.2rem; }
        .pd2-meta { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 0.5rem; }
        .pd2-chips { display: flex; gap: 0.3rem; flex-wrap: wrap; }
        .pd2-chip { font-size: 0.62rem; font-weight: 600; padding: 0.12rem 0.45rem; border-radius: 3px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
        .pd2-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .pd2-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; }
        .pd2-card-hd { font-size: 0.75rem; font-weight: 600; color: #37352F; margin-bottom: 0.85rem; display: flex; align-items: center; justify-content: space-between; }
        .pd2-row { display: flex; padding: 0.5rem 0; border-bottom: 1px solid #F5F5F3; gap: 0.75rem; }
        .pd2-row:last-child { border-bottom: none; }
        .pd2-lbl { font-size: 0.7rem; font-weight: 500; color: #9B9A97; width: 130px; flex-shrink: 0; }
        .pd2-val { font-size: 0.8rem; color: #37352F; flex: 1; }
        .pd2-estado-sel { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; font-family: inherit; outline: none; }
        .pd2-btn { font-size: 0.75rem; font-weight: 600; padding: 0.4rem 0.85rem; border-radius: 7px; border: none; cursor: pointer; font-family: inherit; transition: all 0.12s; }
        .pd2-btn-dark { background: #37352F; color: white; }
        .pd2-btn-ghost { background: #F0F0EE; color: #37352F; }
        .pd2-entrev { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 0.85rem; margin-top: 0.5rem; }
        .pd2-entrev-title { font-size: 0.72rem; font-weight: 600; color: #16A34A; margin-bottom: 0.4rem; }
        .pd2-entrev-txt { font-size: 0.78rem; color: #166534; line-height: 1.5; }
        .pd2-msg { padding: 0.6rem 0.85rem; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 7px; font-size: 0.78rem; color: #16A34A; margin-bottom: 0.75rem; }
        .pd2-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .pd2-modal { background: white; border-radius: 12px; width: 100%; max-width: 440px; box-shadow: 0 24px 64px rgba(0,0,0,0.12); overflow: hidden; }
        .pd2-modal-hd { padding: 1rem 1.25rem; border-bottom: 1px solid #E8E8E5; display: flex; align-items: center; justify-content: space-between; }
        .pd2-modal-title { font-size: 0.88rem; font-weight: 700; color: #37352F; }
        .pd2-modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: #9B9A97; }
        .pd2-modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; }
        .pd2-modal-lbl { display: block; font-size: 0.7rem; font-weight: 500; color: #9B9A97; margin-bottom: 0.35rem; text-transform: uppercase; }
        .pd2-modal-input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; }
        .pd2-modal-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .pd2-modal-foot { padding: 1rem 1.25rem; border-top: 1px solid #E8E8E5; display: flex; justify-content: flex-end; gap: 0.5rem; }
        .pd2-cancel { font-size: 0.78rem; font-weight: 500; color: #6B6B6B; background: white; border: 1px solid #E8E8E5; border-radius: 7px; padding: 0.5rem 1rem; cursor: pointer; font-family: inherit; }
        .pd2-submit { font-size: 0.78rem; font-weight: 600; color: white; background: #37352F; border: none; border-radius: 7px; padding: 0.5rem 1.1rem; cursor: pointer; font-family: inherit; }
      `}</style>

      <div className="pd2">
        <button className="pd2-back" onClick={() => setSeleccionado(null)}>← Volver al listado</button>
        {msg && <div className="pd2-msg">{msg}</div>}

        <div className="pd2-hero">
          <div className="pd2-av">{seleccionado.nombre[0]}{seleccionado.apellido_paterno[0]}</div>
          <div style={{ flex: 1 }}>
            <div className="pd2-nombre">{seleccionado.apellido_paterno} {seleccionado.apellido_materno}, {seleccionado.nombre}</div>
            <div className="pd2-meta">{seleccionado.nivel_postula} · {seleccionado.numero_postulacion}</div>
            <div className="pd2-chips">
              <span className="pd2-chip" style={{ background: ESTADOS[seleccionado.estado]?.bg, color: ESTADOS[seleccionado.estado]?.color }}>
                {ESTADOS[seleccionado.estado]?.label}
              </span>
              {seleccionado.puntaje_total && <span className="pd2-chip">{seleccionado.puntaje_total} pts</span>}
            </div>
          </div>
        </div>

        <div className="pd2-grid">
          {/* Datos estudiante */}
          <div className="pd2-card">
            <div className="pd2-card-hd">Datos del estudiante</div>
            {[
              { l: 'RUT', v: seleccionado.rut ?? '—' },
              { l: 'Nivel que postula', v: seleccionado.nivel_postula },
              { l: 'Colegio anterior', v: seleccionado.colegio_anterior ?? '—' },
              { l: 'Promedio anterior', v: seleccionado.promedio_anterior ? seleccionado.promedio_anterior.toFixed(1).replace('.', ',') : '—' },
            ].map(d => (
              <div key={d.l} className="pd2-row">
                <span className="pd2-lbl">{d.l}</span>
                <span className="pd2-val">{d.v}</span>
              </div>
            ))}
          </div>

          {/* Datos apoderado */}
          <div className="pd2-card">
            <div className="pd2-card-hd">Datos del apoderado</div>
            {[
              { l: 'Nombre', v: seleccionado.nombre_apoderado },
              { l: 'Teléfono', v: seleccionado.telefono ?? '—' },
              { l: 'Email', v: seleccionado.email ?? '—' },
            ].map(d => (
              <div key={d.l} className="pd2-row">
                <span className="pd2-lbl">{d.l}</span>
                <span className="pd2-val">{d.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Entrevista */}
        <div className="pd2-card" style={{ marginBottom: '1rem' }}>
          <div className="pd2-card-hd">
            Entrevista
            {seleccionado.estado === 'en_evaluacion' || seleccionado.estado === 'recibido' ? (
              <button className="pd2-btn pd2-btn-dark" onClick={() => setModalEntrev(true)}>
                + Agendar entrevista
              </button>
            ) : null}
          </div>
          {(seleccionado.entrevistas_admision ?? []).length === 0 ? (
            <div style={{ fontSize: '0.78rem', color: '#9B9A97', padding: '0.5rem 0' }}>Sin entrevista registrada</div>
          ) : seleccionado.entrevistas_admision.map(e => (
            <div key={e.id} className="pd2-entrev">
              <div className="pd2-entrev-title">
                {e.realizada ? '✓ Entrevista realizada' : '📅 Entrevista agendada'} —{' '}
                {new Date(e.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}
                {e.hora && ` a las ${e.hora.slice(0,5)}`}
              </div>
              {e.puntaje && <div className="pd2-entrev-txt">Puntaje: <strong>{e.puntaje}/100</strong> · Impresión: {e.impresion}</div>}
              {e.notas && <div className="pd2-entrev-txt" style={{ marginTop: '0.3rem' }}>{e.notas}</div>}
            </div>
          ))}
        </div>

        {/* Cambiar estado */}
        <div className="pd2-card">
          <div className="pd2-card-hd">Actualizar estado</div>
          <form onSubmit={async e => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            startT(async () => {
              const r = await actualizarEstadoPostulante(
                seleccionado.id,
                fd.get('estado') as string,
                fd.get('puntaje') ? parseFloat(fd.get('puntaje') as string) : undefined,
                fd.get('observaciones') as string || undefined,
              )
              if (r.success) {
                setMsg('Estado actualizado ✓')
                setTimeout(() => setMsg(''), 3000)
              }
            })
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 2, minWidth: '160px' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#9B9A97', marginBottom: '0.3rem' }}>Estado</label>
                <select name="estado" className="pd2-estado-sel" defaultValue={seleccionado.estado}>
                  {Object.entries(ESTADOS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '100px' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#9B9A97', marginBottom: '0.3rem' }}>Puntaje (0-100)</label>
                <input name="puntaje" type="number" className="pd2-estado-sel" min="0" max="100" step="0.1" defaultValue={seleccionado.puntaje_total ?? ''} placeholder="—" />
              </div>
              <button type="submit" className="pd2-btn pd2-btn-dark" disabled={isPending} style={{ marginBottom: '0' }}>
                {isPending ? 'Guardando...' : 'Guardar →'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal agendar entrevista */}
      {modalEntrev && (
        <div className="pd2-overlay" onClick={e => e.target === e.currentTarget && setModalEntrev(false)}>
          <div className="pd2-modal">
            <div className="pd2-modal-hd">
              <span className="pd2-modal-title">Agendar entrevista</span>
              <button className="pd2-modal-close" onClick={() => setModalEntrev(false)}>✕</button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              startT(async () => {
                const r = await agendarEntrevista({
                  postulanteId: seleccionado.id,
                  fecha:        fd.get('fecha') as string,
                  hora:         fd.get('hora') as string || undefined,
                  tipo:         fd.get('tipo') as string,
                })
                if (r.success) {
                  setModalEntrev(false)
                  setMsg('Entrevista agendada ✓')
                  setTimeout(() => setMsg(''), 3000)
                }
              })
            }}>
              <div className="pd2-modal-body">
                <div className="pd2-modal-row2">
                  <div>
                    <label className="pd2-modal-lbl">Fecha *</label>
                    <input name="fecha" type="date" className="pd2-modal-input" required defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className="pd2-modal-lbl">Hora</label>
                    <input name="hora" type="time" className="pd2-modal-input" />
                  </div>
                </div>
                <div>
                  <label className="pd2-modal-lbl">Modalidad *</label>
                  <select name="tipo" className="pd2-modal-input" required>
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="telefonica">Telefónica</option>
                  </select>
                </div>
              </div>
              <div className="pd2-modal-foot">
                <button type="button" className="pd2-cancel" onClick={() => setModalEntrev(false)}>Cancelar</button>
                <button type="submit" className="pd2-submit" disabled={isPending}>Agendar →</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )

  // ── Lista de postulantes ──────────────────────────────────────
  return (
    <>
      <style>{`
        .adc { width: 100%; font-family: 'Inter', system-ui, sans-serif; }
        .adc-toolbar { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; align-items: center; }
        .adc-search { flex: 1; min-width: 180px; padding: 0.5rem 0.85rem; border: 1px solid #E8E8E5; border-radius: 8px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; }
        .adc-search:focus { border-color: #37352F; }
        .adc-select { padding: 0.5rem 0.75rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.78rem; color: #37352F; outline: none; font-family: inherit; background: white; }
        .adc-filter { font-size: 0.75rem; font-weight: 500; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; font-family: inherit; border: 1px solid #E8E8E5; background: white; color: #6B6B6B; transition: all 0.12s; }
        .adc-filter.active { background: #37352F; color: white; border-color: #37352F; }
        .adc-new-btn { margin-left: auto; font-size: 0.78rem; font-weight: 600; padding: 0.4rem 0.9rem; border-radius: 7px; cursor: pointer; font-family: inherit; background: #37352F; color: white; border: none; }

        .adc-table { background: white; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; }
        .adc-tr { display: flex; align-items: center; border-bottom: 1px solid #F5F5F3; cursor: pointer; transition: background 0.1s; }
        .adc-tr:last-child { border-bottom: none; }
        .adc-tr:hover { background: #FAFAF8; }
        .adc-th { display: flex; background: #FAFAF8; border-bottom: 1px solid #E8E8E5; }
        .adc-td { padding: 0.7rem 0.85rem; font-size: 0.78rem; color: #37352F; }
        .adc-th-cell { padding: 0.5rem 0.85rem; font-size: 0.62rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; }
        .adc-numero { width: 90px; flex-shrink: 0; color: #9B9A97; }
        .adc-nombre-col { flex: 3; }
        .adc-nombre { font-weight: 500; }
        .adc-apoderado { font-size: 0.68rem; color: #9B9A97; }
        .adc-nivel { flex: 1.5; }
        .adc-prom { flex: 1; text-align: center; font-weight: 600; }
        .adc-estado-col { flex: 2; }
        .adc-estado-chip { font-size: 0.62rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 20px; }
        .adc-puntaje { flex: 1; text-align: right; font-weight: 600; color: #37352F; font-variant-numeric: tabular-nums; }
        .adc-arrow { width: 24px; flex-shrink: 0; color: #C2C0BB; text-align: center; }
        .adc-empty { padding: 3rem; text-align: center; color: #9B9A97; font-size: 0.82rem; }
        .adc-msg { padding: 0.6rem 0.85rem; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 7px; font-size: 0.78rem; color: #16A34A; margin-bottom: 0.75rem; }

        /* Modal */
        .adc-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .adc-modal { background: white; border-radius: 12px; width: 100%; max-width: 520px; max-height: 85vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.12); }
        .adc-modal-hd { padding: 1rem 1.25rem; border-bottom: 1px solid #E8E8E5; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: white; }
        .adc-modal-title { font-size: 0.88rem; font-weight: 700; color: #37352F; }
        .adc-modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: #9B9A97; }
        .adc-modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; }
        .adc-modal-section { font-size: 0.68rem; font-weight: 600; color: #9B9A97; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: -0.25rem; }
        .adc-lbl { display: block; font-size: 0.7rem; font-weight: 500; color: #9B9A97; margin-bottom: 0.35rem; text-transform: uppercase; }
        .adc-input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; }
        .adc-input:focus { border-color: #37352F; }
        .adc-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .adc-modal-foot { padding: 1rem 1.25rem; border-top: 1px solid #E8E8E5; display: flex; justify-content: flex-end; gap: 0.5rem; position: sticky; bottom: 0; background: white; }
        .adc-cancel { font-size: 0.78rem; font-weight: 500; color: #6B6B6B; background: white; border: 1px solid #E8E8E5; border-radius: 7px; padding: 0.5rem 1rem; cursor: pointer; font-family: inherit; }
        .adc-submit { font-size: 0.78rem; font-weight: 600; color: white; background: #37352F; border: none; border-radius: 7px; padding: 0.5rem 1.1rem; cursor: pointer; font-family: inherit; }
      `}</style>

      <div className="adc">
        {msg && <div className="adc-msg">{msg}</div>}

        <div className="adc-toolbar">
          <input className="adc-search" placeholder="🔍 Buscar por nombre, RUT o N° postulación..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <select className="adc-select" value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)}>
            <option value="todos">Todos los niveles</option>
            {niveles.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          {(['todos','recibido','entrevista_pendiente','aceptado','en_lista_espera'] as const).map(e => (
            <button key={e} className={`adc-filter${filtroEstado === e ? ' active' : ''}`}
              onClick={() => setFiltroEstado(e)}>
              {e === 'todos' ? 'Todos' : ESTADOS[e]?.label ?? e}
            </button>
          ))}
          <button className="adc-new-btn" onClick={() => setModalNuevo(true)}>+ Registrar postulante</button>
        </div>

        <div className="adc-table">
          <div className="adc-th">
            <span className="adc-th-cell adc-numero">N°</span>
            <span className="adc-th-cell" style={{ flex: 3 }}>Postulante</span>
            <span className="adc-th-cell" style={{ flex: 1.5 }}>Nivel</span>
            <span className="adc-th-cell" style={{ flex: 1, textAlign: 'center' }}>Prom.</span>
            <span className="adc-th-cell" style={{ flex: 2 }}>Estado</span>
            <span className="adc-th-cell" style={{ flex: 1, textAlign: 'right' }}>Puntaje</span>
            <span className="adc-th-cell" style={{ width: '24px' }}></span>
          </div>

          {filtrados.length === 0 ? (
            <div className="adc-empty">Sin postulantes para los filtros seleccionados</div>
          ) : filtrados.map(p => {
            const est = ESTADOS[p.estado]
            return (
              <div key={p.id} className="adc-tr" onClick={() => setSeleccionado(p)}>
                <div className="adc-td adc-numero">{p.numero_postulacion}</div>
                <div className="adc-td" style={{ flex: 3 }}>
                  <div className="adc-nombre">{p.apellido_paterno} {p.apellido_materno}, {p.nombre}</div>
                  <div className="adc-apoderado">Apoderado: {p.nombre_apoderado}</div>
                </div>
                <div className="adc-td adc-nivel" style={{ color: '#6B6B6B' }}>{p.nivel_postula}</div>
                <div className="adc-td adc-prom" style={{ color: p.promedio_anterior && p.promedio_anterior >= 6 ? '#16A34A' : p.promedio_anterior && p.promedio_anterior >= 5 ? '#D97706' : '#9B9A97' }}>
                  {p.promedio_anterior ? p.promedio_anterior.toFixed(1).replace('.', ',') : '—'}
                </div>
                <div className="adc-td adc-estado-col">
                  <span className="adc-estado-chip" style={{ background: est?.bg, color: est?.color }}>
                    {est?.label}
                  </span>
                </div>
                <div className="adc-td adc-puntaje">
                  {p.puntaje_total ? `${p.puntaje_total}` : '—'}
                </div>
                <div className="adc-td adc-arrow">›</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal nuevo postulante */}
      {modalNuevo && (
        <div className="adc-overlay" onClick={e => e.target === e.currentTarget && setModalNuevo(false)}>
          <div className="adc-modal">
            <div className="adc-modal-hd">
              <span className="adc-modal-title">Registrar postulante</span>
              <button className="adc-modal-close" onClick={() => setModalNuevo(false)}>✕</button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              startT(async () => {
                const r = await crearPostulante({
                  nombre:            fd.get('nombre') as string,
                  apellidoPaterno:   fd.get('apellido_paterno') as string,
                  apellidoMaterno:   fd.get('apellido_materno') as string || undefined,
                  rut:               fd.get('rut') as string || undefined,
                  fechaNacimiento:   fd.get('fecha_nacimiento') as string || undefined,
                  nivelPostula:      fd.get('nivel_postula') as string,
                  colegioAnterior:   fd.get('colegio_anterior') as string || undefined,
                  promedioAnterior:  fd.get('promedio_anterior') ? parseFloat(fd.get('promedio_anterior') as string) : undefined,
                  nombreApoderado:   fd.get('nombre_apoderado') as string,
                  telefono:          fd.get('telefono') as string || undefined,
                  email:             fd.get('email') as string || undefined,
                })
                if (r.success) {
                  setModalNuevo(false)
                  setMsg(`Postulante registrado ✓ — ${r.numero}`)
                  setTimeout(() => setMsg(''), 4000)
                  window.location.reload()
                }
              })
            }}>
              <div className="adc-modal-body">
                <div className="adc-modal-section">Datos del estudiante</div>
                <div className="adc-row2">
                  <div>
                    <label className="adc-lbl">Nombre *</label>
                    <input name="nombre" className="adc-input" required placeholder="Nombre" />
                  </div>
                  <div>
                    <label className="adc-lbl">Apellido paterno *</label>
                    <input name="apellido_paterno" className="adc-input" required placeholder="Apellido" />
                  </div>
                </div>
                <div className="adc-row2">
                  <div>
                    <label className="adc-lbl">Apellido materno</label>
                    <input name="apellido_materno" className="adc-input" placeholder="Apellido" />
                  </div>
                  <div>
                    <label className="adc-lbl">RUT</label>
                    <input name="rut" className="adc-input" placeholder="12.345.678-9" />
                  </div>
                </div>
                <div className="adc-row2">
                  <div>
                    <label className="adc-lbl">Nivel que postula *</label>
                    <select name="nivel_postula" className="adc-input" required>
                      {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="adc-lbl">Promedio año anterior</label>
                    <input name="promedio_anterior" type="number" className="adc-input" step="0.1" min="1" max="7" placeholder="6,5" />
                  </div>
                </div>
                <div>
                  <label className="adc-lbl">Colegio anterior</label>
                  <input name="colegio_anterior" className="adc-input" placeholder="Nombre del establecimiento anterior" />
                </div>

                <div className="adc-modal-section" style={{ marginTop: '0.5rem' }}>Datos del apoderado</div>
                <div>
                  <label className="adc-lbl">Nombre del apoderado *</label>
                  <input name="nombre_apoderado" className="adc-input" required placeholder="Nombre completo" />
                </div>
                <div className="adc-row2">
                  <div>
                    <label className="adc-lbl">Teléfono</label>
                    <input name="telefono" className="adc-input" placeholder="+56 9 ..." />
                  </div>
                  <div>
                    <label className="adc-lbl">Email</label>
                    <input name="email" type="email" className="adc-input" placeholder="email@gmail.com" />
                  </div>
                </div>
              </div>
              <div className="adc-modal-foot">
                <button type="button" className="adc-cancel" onClick={() => setModalNuevo(false)}>Cancelar</button>
                <button type="submit" className="adc-submit" disabled={isPending}>
                  {isPending ? 'Registrando...' : 'Registrar postulante →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
