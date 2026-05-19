// ═══════════════════════════════════════════════════════════════
// app/(dashboard)/integraciones/sae/page.tsx
// ═══════════════════════════════════════════════════════════════
import { getSaeEstado, getSaePostulantes } from '@/lib/actions/sae'
import { SaeClient } from '@/components/sae/SaeClient'

export default async function SaePage() {
  const [estado, postulantes] = await Promise.all([
    getSaeEstado(),
    getSaePostulantes(),
  ])

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>🎓 Integración SAE</h1>
          <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Sistema de Admisión Escolar · Ley Inclusión N°20.845 · Proceso {estado.proceso_anio}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: '20px', padding: '0.4rem 1rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2E7D32' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2E7D32' }}>SAE Conectado</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: '👨‍🎓', value: estado.total,        label: 'Postulantes asignados', color: '#1976D2' },
          { icon: '✅',   value: estado.matriculados, label: 'Matriculados',           color: '#00897B' },
          { icon: '⏳',   value: estado.pendientes,   label: 'Pendientes',             color: '#E65100' },
          { icon: '📊',   value: `${estado.tasa_matricula}%`, label: 'Tasa matrícula', color: '#7B1FA2' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '14px', border: `1.5px solid ${s.color}22`, borderTop: `4px solid ${s.color}`, padding: '1.1rem 1.2rem' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{s.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <SaeClient postulantes={postulantes} estado={estado} />
    </div>
  )
}
