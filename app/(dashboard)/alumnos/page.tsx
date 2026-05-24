export const dynamic = 'force-dynamic'

import { getAlumnosColegio } from '@/lib/actions/ficha'
import { AlumnosClient } from '@/components/alumnos/AlumnosClient'

export default async function AlumnosPage() {
  const alumnos = await getAlumnosColegio()

  return (
    <>
      <style>{`
        .al { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .al-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .al-sub { font-size: 0.8rem; color: #9B9A97; margin-bottom: 1.5rem; }
        .al-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .al-stat { background: white; padding: 1.1rem; }
        .al-stat-n { font-size: 0.65rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .al-stat-v { font-size: 1.6rem; font-weight: 700; color: #37352F; letter-spacing: -0.04em; line-height: 1; }
      `}</style>

      <div className="al">
        <h1 className="al-title">👥 Alumnos</h1>
        <p className="al-sub">Ficha completa de cada estudiante · {alumnos.length} alumnos activos</p>

        <div className="al-stats">
          {[
            { n: 'Total alumnos', v: String(alumnos.length) },
            { n: 'Alumnos SEP',   v: String(alumnos.filter((a: any) => a.alumno_sep).length) },
            { n: 'Alumnos PIE',   v: String(alumnos.filter((a: any) => a.pie).length) },
            { n: 'Cursos',        v: String([...new Set(alumnos.map((a: any) => a.cursos?.nombre))].filter(Boolean).length) },
          ].map(s => (
            <div key={s.n} className="al-stat">
              <div className="al-stat-n">{s.n}</div>
              <div className="al-stat-v">{s.v}</div>
            </div>
          ))}
        </div>

        <AlumnosClient alumnos={alumnos as any} />
      </div>
    </>
  )
}
