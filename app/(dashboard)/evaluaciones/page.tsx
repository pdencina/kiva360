import { Suspense } from 'react'
import { getEvaluaciones, getStatsEvaluaciones } from '@/lib/actions/evaluaciones'
import { EvaluacionesClient } from '@/components/evaluaciones/EvaluacionesClient'

export default async function EvaluacionesPage() {
  const [evaluaciones, stats] = await Promise.all([
    getEvaluaciones(),
    getStatsEvaluaciones(),
  ])

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
            📝 Evaluaciones
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
            Crea, aplica y califica pruebas alineadas al currículum MINEDUC
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: '📋', value: stats.total,         label: 'Total evaluaciones', color: '#1976D2' },
          { icon: '📅', value: stats.proximas,       label: 'Próximas',           color: '#00897B' },
          { icon: '⏳', value: stats.sin_calificar,  label: 'Por calificar',      color: '#E65100' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: '14px',
            border: `1.5px solid ${s.color}22`,
            borderTop: `4px solid ${s.color}`,
            padding: '1.1rem 1.2rem',
          }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{s.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Suspense fallback={<div style={{ background: 'white', borderRadius: '14px', padding: '2rem', border: '1px solid #E2E8F0', textAlign: 'center', color: '#94A3B8' }}>Cargando evaluaciones...</div>}>
        <EvaluacionesClient evaluaciones={evaluaciones} />
      </Suspense>
    </div>
  )
}
