'use client'

import { useState, useTransition } from 'react'
import { registrarPago } from '@/lib/actions/cobranzas'

type Cuota = {
  id: string
  numero_cuota: number
  monto_total: number
  monto_interes: number
  fecha_vencimiento: string
  estado: string
  alumnos: { nombre: string; apellido_paterno: string; apellido_materno: string; cursos: { nombre: string } | null } | null
  pagos: { monto: number; fecha_pago: string }[]
}

type Plan = {
  id: string
  nombre: string
  monto_total: number
  num_cuotas: number
}

interface Props { cuotas: Cuota[]; planes: Plan[] }

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

const estadoStyle = (e: string): React.CSSProperties =>
  e === 'pagada'   ? { background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' } :
  e === 'vencida'  ? { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' } :
                     { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }

export function CobranzasClient({ cuotas: inicial, planes }: Props) {
  const [cuotas, setCuotas]     = useState(inicial)
  const [filtro, setFiltro]     = useState<'todos' | 'pendiente' | 'vencida' | 'pagada'>('pendiente')
  const [modalPago, setModalP]  = useState<Cuota | null>(null)
  const [modalPlan, setModalPl] = useState(false)
  const [isPending, startT]     = useTransition()
  const [exito, setExito]       = useState(false)

  const filtradas = filtro === 'todos' ? cuotas : cuotas.filter(c => c.estado === filtro)

  const handlePago = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!modalPago) return
    const fd = new FormData(e.currentTarget)

    const result = await registrarPago({
      cuotaId:   modalPago.id,
      alumnoId:  (modalPago as any).alumno_id ?? '',
      monto:     parseInt(fd.get('monto') as string),
      medioPago: fd.get('medio_pago') as string,
      referencia: fd.get('referencia') as string,
      fechaPago: fd.get('fecha_pago') as string,
    })

    if (result.success) {
      setCuotas(prev => prev.map(c => c.id === modalPago.id ? { ...c, estado: 'pagada' } : c))
      setExito(true)
      setTimeout(() => { setModalP(null); setExito(false) }, 1500)
    }
  }

  return (
    <>
      <style>{`
        .cbc { width: 100%; font-family: 'Inter', system-ui, sans-serif; }
        .cbc-toolbar { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .cbc-filter { font-size: 0.75rem; font-weight: 500; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; font-family: inherit; border: 1px solid #E8E8E5; background: white; color: #6B6B6B; transition: all 0.12s; }
        .cbc-filter.active { background: #37352F; color: white; border-color: #37352F; }
        .cbc-filter:hover:not(.active) { border-color: #37352F; color: #37352F; }
        .cbc-btn { margin-left: auto; font-size: 0.78rem; font-weight: 600; padding: 0.4rem 0.9rem; border-radius: 7px; cursor: pointer; font-family: inherit; background: #37352F; color: white; border: none; }
        .cbc-btn:hover { background: #1A1A1A; }

        .cbc-table-wrap { background: white; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; }
        .cbc-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
        .cbc-th { padding: 0.55rem 0.85rem; text-align: left; font-size: 0.62rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; background: #FAFAF8; border-bottom: 1px solid #E8E8E5; }
        .cbc-th-r { text-align: right; }
        .cbc-tr { border-bottom: 1px solid #F5F5F3; transition: background 0.1s; }
        .cbc-tr:last-child { border-bottom: none; }
        .cbc-tr:hover { background: #FAFAF8; }
        .cbc-td { padding: 0.65rem 0.85rem; color: #37352F; }
        .cbc-td-r { text-align: right; font-variant-numeric: tabular-nums; }
        .cbc-nombre { font-weight: 500; }
        .cbc-curso { font-size: 0.68rem; color: #9B9A97; }
        .cbc-estado { font-size: 0.62rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 20px; }
        .cbc-pagar { font-size: 0.72rem; font-weight: 500; color: #37352F; background: #F0F0EE; border: none; border-radius: 6px; padding: 0.28rem 0.65rem; cursor: pointer; font-family: inherit; transition: background 0.12s; }
        .cbc-pagar:hover { background: #E8E8E5; }
        .cbc-empty { padding: 3rem; text-align: center; color: #9B9A97; font-size: 0.82rem; }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .modal-box { background: white; border-radius: 12px; width: 100%; max-width: 440px; box-shadow: 0 24px 64px rgba(0,0,0,0.12); overflow: hidden; }
        .modal-head { padding: 1rem 1.25rem; border-bottom: 1px solid #E8E8E5; display: flex; align-items: center; justify-content: space-between; }
        .modal-title { font-size: 0.88rem; font-weight: 700; color: #37352F; letter-spacing: -0.02em; }
        .modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: #9B9A97; padding: 0; }
        .modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; }
        .modal-info { background: #FAFAF8; border: 1px solid #E8E8E5; border-radius: 8px; padding: 0.85rem; font-size: 0.78rem; color: #37352F; }
        .modal-info strong { display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 0.2rem; }
        .modal-label { display: block; font-size: 0.7rem; font-weight: 500; color: #9B9A97; margin-bottom: 0.35rem; letter-spacing: 0.04em; text-transform: uppercase; }
        .modal-input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; outline: none; font-family: inherit; }
        .modal-input:focus { border-color: #37352F; box-shadow: 0 0 0 2px rgba(55,53,47,0.06); }
        .modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .modal-foot { padding: 1rem 1.25rem; border-top: 1px solid #E8E8E5; display: flex; justify-content: flex-end; gap: 0.5rem; }
        .modal-cancel { font-size: 0.78rem; font-weight: 500; color: #6B6B6B; background: white; border: 1px solid #E8E8E5; border-radius: 7px; padding: 0.5rem 1rem; cursor: pointer; font-family: inherit; }
        .modal-ok { font-size: 0.78rem; font-weight: 600; color: white; background: #37352F; border: none; border-radius: 7px; padding: 0.5rem 1.1rem; cursor: pointer; font-family: inherit; }
        .modal-ok:hover { background: #1A1A1A; }
        .modal-exito { padding: 2rem; text-align: center; }
      `}</style>

      <div className="cbc">
        {/* Toolbar */}
        <div className="cbc-toolbar">
          {([
            { key: 'pendiente', label: 'Pendientes' },
            { key: 'vencida',   label: 'Vencidas'   },
            { key: 'pagada',    label: 'Pagadas'     },
            { key: 'todos',     label: 'Todas'       },
          ] as const).map(f => (
            <button key={f.key} className={`cbc-filter${filtro === f.key ? ' active' : ''}`} onClick={() => setFiltro(f.key)}>
              {f.label}
            </button>
          ))}
          <button className="cbc-btn" onClick={() => setModalPl(true)}>+ Nuevo plan</button>
        </div>

        {/* Tabla */}
        <div className="cbc-table-wrap">
          {filtradas.length === 0 ? (
            <div className="cbc-empty">
              {filtro === 'pendiente' ? '✅ Sin cuotas pendientes' :
               filtro === 'vencida'  ? '✅ Sin cuotas vencidas' :
               'Sin registros'}
            </div>
          ) : (
            <table className="cbc-table">
              <thead>
                <tr>
                  <th className="cbc-th">Alumno</th>
                  <th className="cbc-th">Cuota</th>
                  <th className="cbc-th">Vencimiento</th>
                  <th className="cbc-th cbc-th-r">Monto</th>
                  <th className="cbc-th">Estado</th>
                  <th className="cbc-th"></th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(c => {
                  const alumno   = c.alumnos
                  const nombre   = alumno ? `${alumno.apellido_paterno}, ${alumno.nombre}` : '—'
                  const curso    = alumno?.cursos?.nombre ?? '—'
                  const venc     = new Date(c.fecha_vencimiento + 'T12:00:00')
                  const hoy      = new Date()
                  const diasHoy  = Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

                  return (
                    <tr key={c.id} className="cbc-tr">
                      <td className="cbc-td">
                        <div className="cbc-nombre">{nombre}</div>
                        <div className="cbc-curso">{curso}</div>
                      </td>
                      <td className="cbc-td" style={{ color: '#9B9A97' }}>N° {c.numero_cuota}</td>
                      <td className="cbc-td">
                        <div>{venc.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}</div>
                        {c.estado === 'pendiente' && diasHoy <= 5 && diasHoy >= 0 && (
                          <div style={{ fontSize: '0.65rem', color: '#D97706' }}>Vence en {diasHoy}d</div>
                        )}
                        {c.estado === 'vencida' && (
                          <div style={{ fontSize: '0.65rem', color: '#DC2626' }}>Hace {Math.abs(diasHoy)}d</div>
                        )}
                      </td>
                      <td className="cbc-td cbc-td-r" style={{ fontWeight: 600 }}>{fmt(c.monto_total)}</td>
                      <td className="cbc-td">
                        <span className="cbc-estado" style={estadoStyle(c.estado)}>
                          {c.estado === 'pagada' ? '✓ Pagada' : c.estado === 'vencida' ? '⚠ Vencida' : '○ Pendiente'}
                        </span>
                      </td>
                      <td className="cbc-td">
                        {c.estado !== 'pagada' && (
                          <button className="cbc-pagar" onClick={() => setModalP(c)}>
                            Registrar pago →
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal registrar pago */}
      {modalPago && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalP(null)}>
          <div className="modal-box">
            <div className="modal-head">
              <span className="modal-title">Registrar pago</span>
              <button className="modal-close" onClick={() => setModalP(null)}>✕</button>
            </div>

            {exito ? (
              <div className="modal-exito">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#16A34A' }}>Pago registrado correctamente</p>
              </div>
            ) : (
              <form onSubmit={handlePago}>
                <div className="modal-body">
                  <div className="modal-info">
                    <strong>
                      {modalPago.alumnos ? `${modalPago.alumnos.apellido_paterno}, ${modalPago.alumnos.nombre}` : '—'}
                    </strong>
                    Cuota N° {modalPago.numero_cuota} · Vence {new Date(modalPago.fecha_vencimiento + 'T12:00:00').toLocaleDateString('es-CL')}
                  </div>

                  <div>
                    <label className="modal-label">Monto a pagar (CLP)</label>
                    <input name="monto" type="number" className="modal-input"
                      defaultValue={modalPago.monto_total} required min="1" />
                  </div>

                  <div className="modal-row">
                    <div>
                      <label className="modal-label">Medio de pago</label>
                      <select name="medio_pago" className="modal-input" required>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="webpay">Webpay</option>
                        <option value="cheque">Cheque</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="modal-label">Fecha de pago</label>
                      <input name="fecha_pago" type="date" className="modal-input"
                        defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>
                  </div>

                  <div>
                    <label className="modal-label">N° referencia / comprobante (opcional)</label>
                    <input name="referencia" type="text" className="modal-input" placeholder="Ej: 123456789" />
                  </div>
                </div>
                <div className="modal-foot">
                  <button type="button" className="modal-cancel" onClick={() => setModalP(null)}>Cancelar</button>
                  <button type="submit" className="modal-ok" disabled={isPending}>
                    {isPending ? 'Guardando...' : 'Registrar pago →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal nuevo plan */}
      {modalPlan && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalPl(false)}>
          <div className="modal-box">
            <div className="modal-head">
              <span className="modal-title">Nuevo plan de pago</span>
              <button className="modal-close" onClick={() => setModalPl(false)}>✕</button>
            </div>
            <form action={async (fd: FormData) => {
              const { crearPlanPago } = await import('@/lib/actions/cobranzas')
              const result = await crearPlanPago(fd)
              if (result.success) { setModalPl(false); window.location.reload() }
            }}>
              <div className="modal-body">
                <div>
                  <label className="modal-label">Nombre del plan *</label>
                  <input name="nombre" className="modal-input" placeholder="Ej: Arancel Básica 2026" required />
                </div>
                <div>
                  <label className="modal-label">Descripción</label>
                  <input name="descripcion" className="modal-input" placeholder="Descripción opcional" />
                </div>
                <div className="modal-row">
                  <div>
                    <label className="modal-label">Monto total anual (CLP) *</label>
                    <input name="monto_total" type="number" className="modal-input" placeholder="850000" required min="1" />
                  </div>
                  <div>
                    <label className="modal-label">N° de cuotas *</label>
                    <input name="num_cuotas" type="number" className="modal-input" defaultValue="10" required min="1" max="12" />
                  </div>
                </div>
                <div className="modal-row">
                  <div>
                    <label className="modal-label">Día de vencimiento *</label>
                    <input name="dia_vencimiento" type="number" className="modal-input" defaultValue="5" required min="1" max="28" />
                  </div>
                  <div>
                    <label className="modal-label">Interés por mora (%)</label>
                    <input name="pct_interes" type="number" className="modal-input" defaultValue="0" step="0.1" min="0" max="10" />
                  </div>
                </div>
                <input type="hidden" name="aplica_interes" value="true" />
              </div>
              <div className="modal-foot">
                <button type="button" className="modal-cancel" onClick={() => setModalPl(false)}>Cancelar</button>
                <button type="submit" className="modal-ok">Crear plan →</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
