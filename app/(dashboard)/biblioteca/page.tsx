export const dynamic = 'force-dynamic'

import { getPlanesHistoricos, getAniosDisponibles } from '@/lib/actions/biblioteca'
import { BibliotecaClient } from '@/components/biblioteca/BibliotecaClient'

export default async function BibliotecaPage() {
  const [planes, anios] = await Promise.all([
    getPlanesHistoricos(),
    getAniosDisponibles(),
  ])

  const anioActual = new Date().getFullYear()
  const planesAnteriores = planes.filter(p => p.anio < anioActual)
  const planesActual     = planes.filter(p => p.anio === anioActual)

  // Estadísticas
  const asignaturas = [...new Set(planes.map(p => p.asignatura).filter(Boolean))]
  const conReflexion = planes.filter(p => (p.reflexiones_clase as any[])?.length > 0).length

  return (
    <>
      <style>{`
        .bib { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .bib-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .bib-sub { font-size: 0.8rem; color: #9B9A97; margin-bottom: 1.5rem; }
        .bib-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .bib-stat { background: white; padding: 1rem; }
        .bib-stat-n { font-size: 0.62rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .bib-stat-v { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.2rem; }
        .bib-stat-t { font-size: 0.68rem; color: #9B9A97; }
        .bib-banner { background: #37352F; border-radius: 10px; padding: 1.1rem 1.3rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
        .bib-banner-title { font-size: 0.88rem; font-weight: 600; color: white; margin-bottom: 0.2rem; }
        .bib-banner-sub { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
      `}</style>

      <div className="bib">
        <h1 className="bib-title">📚 Biblioteca de Planificaciones</h1>
        <p className="bib-sub">Explora clases realizadas, aprende de la experiencia del equipo y adapta lo que funcionó</p>

        <div className="bib-stats">
          {[
            { n: 'Clases documentadas', v: String(planes.length),         t: 'Realizadas y guardadas' },
            { n: 'Años disponibles',    v: String(anios.length),          t: `Desde ${Math.min(...anios) || anioActual}` },
            { n: 'Asignaturas',         v: String(asignaturas.length),    t: 'Con planificaciones' },
            { n: 'Con reflexión',       v: String(conReflexion),          t: 'Incluyen consejo docente' },
          ].map(s => (
            <div key={s.n} className="bib-stat">
              <div className="bib-stat-n">{s.n}</div>
              <div className="bib-stat-v">{s.v}</div>
              <div className="bib-stat-t">{s.t}</div>
            </div>
          ))}
        </div>

        <div className="bib-banner">
          <div>
            <div className="bib-banner-title">💡 Usa la experiencia de tu equipo</div>
            <div className="bib-banner-sub">Encuentra una clase que funcionó, léela, y usa "Clonar" para adaptarla a tu curso este año.</div>
          </div>
        </div>

        <BibliotecaClient
          planes={planes as any}
          anios={anios}
          anioActual={anioActual}
        />
      </div>
    </>
  )
}
