export const dynamic = 'force-dynamic'

import { getDocentes, getResumenPersonal } from '@/lib/actions/personal'
import { getCursosPlanificacion } from '@/lib/actions/planificacion'
import { PersonalClient } from '@/components/personal/PersonalClient'

export default async function PersonalPage() {
  const [docentes, resumen, cursos] = await Promise.all([
    getDocentes(),
    getResumenPersonal(),
    getCursosPlanificacion(),
  ])

  return (
    <>
      <style>{`
        .per { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .per-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .per-sub { font-size: 0.8rem; color: #9B9A97; margin-bottom: 1.5rem; }
        .per-stats { display: grid; grid-template-columns: repeat(5,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .per-stat { background: white; padding: 1rem; }
        .per-stat-n { font-size: 0.62rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .per-stat-v { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.2rem; }
        .per-stat-t { font-size: 0.68rem; color: #9B9A97; }
      `}</style>

      <div className="per">
        <h1 className="per-title">👩‍🏫 Gestión de Personal</h1>
        <p className="per-sub">Docentes, horarios y asignación de cursos · {new Date().getFullYear()}</p>

        <div className="per-stats">
          {[
            { n: 'Total docentes',  v: String(resumen.total),       t: 'Activos' },
            { n: 'Planta',          v: String(resumen.planta),       t: 'Contrato planta' },
            { n: 'Contrata',        v: String(resumen.contrata),     t: 'Contrato a contrata' },
            { n: 'Honorarios',      v: String(resumen.honorarios),   t: 'Por honorarios' },
            { n: 'Horas totales',   v: String(resumen.totalHoras),   t: 'Horas semanales contratadas' },
          ].map(s => (
            <div key={s.n} className="per-stat">
              <div className="per-stat-n">{s.n}</div>
              <div className="per-stat-v">{s.v}</div>
              <div className="per-stat-t">{s.t}</div>
            </div>
          ))}
        </div>

        <PersonalClient docentes={docentes as any} cursos={cursos as any} />
      </div>
    </>
  )
}
