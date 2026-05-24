export const dynamic = 'force-dynamic'

import { getPlanesClasei, getResumenPlanificacion, getEstrategias, getCursosPlanificacion } from '@/lib/actions/planificacion'
import { PlanificacionClient } from '@/components/planificacion/PlanificacionClient'

export default async function PlanificacionPage() {
  const [planes, resumen, estrategias, cursos] = await Promise.all([
    getPlanesClasei(),
    getResumenPlanificacion(),
    getEstrategias(),
    getCursosPlanificacion(),
  ])

  return (
    <>
      <style>{`
        .pl { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .pl-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .pl-sub { font-size: 0.8rem; color: #9B9A97; margin-bottom: 1.5rem; }
        .pl-stats { display: grid; grid-template-columns: repeat(5,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .pl-stat { background: white; padding: 1rem; }
        .pl-stat-n { font-size: 0.62rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .pl-stat-v { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.04em; line-height: 1; }
      `}</style>

      <div className="pl">
        <h1 className="pl-title">🗓️ Planificador de Clases</h1>
        <p className="pl-sub">Diseña tus clases con OA, estrategias didácticas y recursos · {new Date().getFullYear()}</p>

        <div className="pl-stats">
          {[
            { n: 'Total planes',  v: String(resumen.total)      },
            { n: 'Realizados',    v: String(resumen.realizados)  },
            { n: 'Próximas',      v: String(resumen.proximos)    },
            { n: 'Borradores',    v: String(resumen.borradores)  },
            { n: 'Asignaturas',   v: String(resumen.asigs)       },
          ].map(s => (
            <div key={s.n} className="pl-stat">
              <div className="pl-stat-n">{s.n}</div>
              <div className="pl-stat-v">{s.v}</div>
            </div>
          ))}
        </div>

        <PlanificacionClient
          planes={planes as any}
          estrategias={estrategias as any}
          cursos={cursos as any}
        />
      </div>
    </>
  )
}
