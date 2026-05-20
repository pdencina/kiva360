import { Suspense } from 'react'
import { getEvaluaciones, getStatsEvaluaciones } from '@/lib/actions/evaluaciones'
import { EvaluacionesClient } from '@/components/evaluaciones/EvaluacionesClient'

export default async function EvaluacionesPage() {
  const [evaluaciones, stats] = await Promise.all([
    getEvaluaciones(),
    getStatsEvaluaciones(),
  ])

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#37352F', letterSpacing: '-0.03em', marginBottom: '0.2rem' }}>
          ✎ Evaluaciones
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#9B9A97' }}>
          Crea, aplica y califica pruebas alineadas al currículum MINEDUC
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#E8E8E5', border: '1px solid #E8E8E5', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        {[
          { value: String(stats.total),        label: 'Total evaluaciones' },
          { value: String(stats.proximas),      label: 'Próximas'           },
          { value: String(stats.sin_calificar), label: 'Por calificar'      },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', padding: '1.1rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#9B9A97', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{s.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#37352F', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <Suspense fallback={
        <div style={{ background: 'white', borderRadius: '10px', padding: '2rem', border: '1px solid #E8E8E5', textAlign: 'center', color: '#9B9A97', fontSize: '0.82rem' }}>
          Cargando evaluaciones...
        </div>
      }>
        <EvaluacionesClient evaluaciones={evaluaciones} />
      </Suspense>
    </div>
  )
}
