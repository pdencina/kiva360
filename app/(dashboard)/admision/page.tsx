export const dynamic = 'force-dynamic'

import { getResumenAdmision, getPostulantes } from '@/lib/actions/admision'
import { AdmisionClient } from '@/components/admision/AdmisionClient'

export default async function AdmisionPage() {
  const [resumen, postulantes] = await Promise.all([
    getResumenAdmision(),
    getPostulantes(),
  ])

  if (!resumen) {
    return (
      <div style={{ fontFamily: 'Inter, system-ui', width: '100%' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#37352F', marginBottom: '0.5rem' }}>
          🎓 Admisión Escolar
        </h1>
        <div style={{ background: 'white', border: '1px solid #E8E8E5', borderRadius: '10px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#37352F', marginBottom: '0.5rem' }}>
            Sin proceso de admisión activo
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#9B9A97', marginBottom: '1.5rem' }}>
            Crea un proceso de admisión para comenzar a recibir postulantes.
          </p>
          <a href="#" style={{ display: 'inline-block', padding: '0.65rem 1.5rem', background: '#37352F', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
            + Crear proceso de admisión
          </a>
        </div>
      </div>
    )
  }

  const fmtFecha = (f: string | null) => f
    ? new Date(f + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })
    : '—'

  return (
    <>
      <style>{`
        .adm { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .adm-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .adm-sub { font-size: 0.8rem; color: #9B9A97; margin-bottom: 1.5rem; }
        .adm-banner { background: #37352F; border-radius: 10px; padding: 1.1rem 1.3rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .adm-banner-title { font-size: 0.9rem; font-weight: 700; color: white; margin-bottom: 0.2rem; }
        .adm-banner-meta { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
        .adm-banner-chips { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.5rem; }
        .adm-banner-chip { font-size: 0.62rem; font-weight: 600; padding: 0.12rem 0.45rem; border-radius: 3px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
        .adm-vacantes { text-align: right; flex-shrink: 0; }
        .adm-vacantes-v { font-size: 2rem; font-weight: 800; color: white; line-height: 1; }
        .adm-vacantes-n { font-size: 0.68rem; color: rgba(255,255,255,0.4); text-transform: uppercase; }
        .adm-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .adm-stat { background: white; padding: 1rem; }
        .adm-stat-n { font-size: 0.62rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .adm-stat-v { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.2rem; }
        .adm-stat-t { font-size: 0.68rem; color: #9B9A97; }
        .adm-criterios { background: #FAFAF8; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; }
        .adm-criterios-title { font-size: 0.75rem; font-weight: 600; color: #37352F; margin-bottom: 0.75rem; }
        .adm-criterios-list { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .adm-criterio { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: #37352F; }
        .adm-criterio-peso { font-size: 0.88rem; font-weight: 700; color: #37352F; }
        .adm-criterio-nombre { color: #6B6B6B; }
      `}</style>

      <div className="adm">
        <h1 className="adm-title">🎓 Admisión Escolar</h1>
        <p className="adm-sub">
          Proceso propio · {resumen.proceso.nombre} · {fmtFecha(resumen.proceso.fecha_inicio)} al {fmtFecha(resumen.proceso.fecha_cierre)}
        </p>

        {/* Banner proceso */}
        <div className="adm-banner">
          <div>
            <div className="adm-banner-title">{resumen.proceso.nombre}</div>
            <div className="adm-banner-meta">Proceso de admisión propio — alineado con cambios SAE 2026</div>
            <div className="adm-banner-chips">
              {(resumen.proceso.niveles ?? []).map((n: string) => (
                <span key={n} className="adm-banner-chip">{n}</span>
              ))}
              <span className="adm-banner-chip" style={{ background: 'rgba(22,163,74,0.2)', color: '#86EFAC' }}>
                ● Abierto
              </span>
            </div>
          </div>
          <div className="adm-vacantes">
            <div className="adm-vacantes-v">{resumen.vacantesDisponibles}</div>
            <div className="adm-vacantes-n">vacantes disponibles</div>
          </div>
        </div>

        {/* Stats */}
        <div className="adm-stats">
          {[
            { n: 'Total postulantes', v: String(resumen.total),              t: 'Recibidos al proceso',      color: '#37352F' },
            { n: 'Pendientes',        v: String(resumen.recibidos + resumen.enEvaluacion), t: 'En revisión',  color: '#37352F' },
            { n: 'Con entrevista',    v: String(resumen.entrevistaPendiente + resumen.entrevistaRealizada), t: 'Agendada o realizada', color: '#2563EB' },
            { n: 'Aceptados',         v: String(resumen.aceptados),          t: `de ${resumen.vacantesTotal} vacantes`, color: '#16A34A' },
          ].map(s => (
            <div key={s.n} className="adm-stat">
              <div className="adm-stat-n">{s.n}</div>
              <div className="adm-stat-v" style={{ color: s.color }}>{s.v}</div>
              <div className="adm-stat-t">{s.t}</div>
            </div>
          ))}
        </div>

        {/* Criterios de selección */}
        {resumen.proceso.criterios?.length > 0 && (
          <div className="adm-criterios">
            <div className="adm-criterios-title">Criterios de selección configurados</div>
            <div className="adm-criterios-list">
              {resumen.proceso.criterios.map((c: any) => (
                <div key={c.nombre} className="adm-criterio">
                  <span className="adm-criterio-peso">{c.peso}%</span>
                  <span className="adm-criterio-nombre">{c.nombre}</span>
                  {c !== resumen.proceso.criterios[resumen.proceso.criterios.length - 1] && (
                    <span style={{ color: '#E8E8E5' }}>·</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <AdmisionClient postulantes={postulantes as any} resumen={resumen} />
      </div>
    </>
  )
}
