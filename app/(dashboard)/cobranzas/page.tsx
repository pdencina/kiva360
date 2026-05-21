export const dynamic = 'force-dynamic'

import { getResumenCobranzas, getCuotasPendientes, getPlanesPago } from '@/lib/actions/cobranzas'
import { CobranzasClient } from '@/components/cobranzas/CobranzasClient'

export default async function CobranzasPage() {
  const [resumen, cuotas, planes] = await Promise.all([
    getResumenCobranzas(),
    getCuotasPendientes(),
    getPlanesPago(),
  ])

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

  const pctCobrado = resumen.totalCuotas > 0
    ? Math.round((resumen.totalCobrado / resumen.totalCuotas) * 100)
    : 0

  return (
    <>
      <style>{`
        .cb { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .cb-header { margin-bottom: 1.5rem; }
        .cb-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .cb-sub { font-size: 0.8rem; color: #9B9A97; }

        .cb-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .cb-stat { background: white; padding: 1.1rem; }
        .cb-stat-n { font-size: 0.65rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .cb-stat-v { font-size: 1.3rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; line-height: 1; margin-bottom: 0.3rem; }
        .cb-stat-t { font-size: 0.7rem; color: #9B9A97; }

        .cb-progress { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; margin-bottom: 1.5rem; }
        .cb-progress-hd { display: flex; justify-content: space-between; margin-bottom: 0.6rem; }
        .cb-progress-lbl { font-size: 0.75rem; font-weight: 600; color: #37352F; }
        .cb-progress-pct { font-size: 0.75rem; color: #9B9A97; }
        .cb-track { height: 6px; background: #F0F0EE; border-radius: 10px; overflow: hidden; }
        .cb-fill { height: 100%; border-radius: 10px; background: #37352F; transition: width 0.8s ease; }
      `}</style>

      <div className="cb">
        <div className="cb-header">
          <h1 className="cb-title">💰 Cobranzas</h1>
          <p className="cb-sub">Gestión de aranceles, cuotas y pagos · Año 2026</p>
        </div>

        {/* Stats */}
        <div className="cb-stats">
          {[
            { n: 'Total facturado',  v: fmt(resumen.totalCuotas),    t: 'Suma de cuotas generadas' },
            { n: 'Total cobrado',    v: fmt(resumen.totalCobrado),    t: `${pctCobrado}% de recaudación` },
            { n: 'Por cobrar',       v: fmt(resumen.totalPendiente),  t: 'Cuotas pendientes' },
            { n: 'Cuotas vencidas',  v: String(resumen.totalVencidas), t: 'Requieren seguimiento' },
          ].map(s => (
            <div key={s.n} className="cb-stat">
              <div className="cb-stat-n">{s.n}</div>
              <div className="cb-stat-v" style={{ color: s.n === 'Cuotas vencidas' && resumen.totalVencidas > 0 ? '#DC2626' : '#37352F' }}>
                {s.v}
              </div>
              <div className="cb-stat-t">{s.t}</div>
            </div>
          ))}
        </div>

        {/* Barra de progreso */}
        <div className="cb-progress">
          <div className="cb-progress-hd">
            <span className="cb-progress-lbl">Recaudación 2026</span>
            <span className="cb-progress-pct">{fmt(resumen.totalCobrado)} de {fmt(resumen.totalCuotas)}</span>
          </div>
          <div className="cb-track">
            <div className="cb-fill" style={{ width: `${pctCobrado}%` }} />
          </div>
        </div>

        {/* Componente cliente con tabla y modales */}
        <CobranzasClient cuotas={cuotas as any} planes={planes as any} />
      </div>
    </>
  )
}
