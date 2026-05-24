export const dynamic = 'force-dynamic'

import { getRecursos, getCodocencia } from '@/lib/actions/colaborativo'
import { getCursosPlanificacion } from '@/lib/actions/planificacion'
import { ColaborativoClient } from '@/components/colaborativo/ColaborativoClient'

export default async function ColaborativoPage() {
  const [recursos, codocencia, cursos] = await Promise.all([
    getRecursos(),
    getCodocencia(),
    getCursosPlanificacion(),
  ])

  const proximas  = codocencia.filter(c => c.estado === 'programada')
  const realizadas = codocencia.filter(c => c.estado === 'realizada')

  return (
    <>
      <style>{`
        .col { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .col-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .col-sub { font-size: 0.8rem; color: #9B9A97; margin-bottom: 1.5rem; }
        .col-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .col-stat { background: white; padding: 1rem; }
        .col-stat-n { font-size: 0.62rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .col-stat-v { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.04em; line-height: 1; }
      `}</style>

      <div className="col">
        <h1 className="col-title">🤝 Espacio Colaborativo</h1>
        <p className="col-sub">Recursos compartidos, co-docencia y trabajo en equipo docente</p>

        <div className="col-stats">
          {[
            { n: 'Recursos compartidos', v: String(recursos.length)    },
            { n: 'Co-docencias próximas', v: String(proximas.length)   },
            { n: 'Co-docencias realizadas', v: String(realizadas.length) },
            { n: 'Asignaturas',           v: String([...new Set(recursos.map(r => r.asignatura).filter(Boolean))].length) },
          ].map(s => (
            <div key={s.n} className="col-stat">
              <div className="col-stat-n">{s.n}</div>
              <div className="col-stat-v">{s.v}</div>
            </div>
          ))}
        </div>

        <ColaborativoClient
          recursos={recursos as any}
          codocencia={codocencia as any}
          cursos={cursos as any}
        />
      </div>
    </>
  )
}
