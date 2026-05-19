// ═══════════════════════════════════════════════════════════════
// app/(dashboard)/integraciones/junaeb/page.tsx
// ═══════════════════════════════════════════════════════════════
import { getJunaebEstado, getHistorialPae, getAlumnosSep } from '@/lib/actions/junaeb'
import { JunaebClient } from '@/components/junaeb/JunaebClient'

export default async function JunaebPage() {
  const [estado, historial, alumnosSep] = await Promise.all([
    getJunaebEstado(),
    getHistorialPae(),
    getAlumnosSep(),
  ])

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>🍽️ Integración JUNAEB</h1>
          <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>PAE · IVE-SINAE · Alumnos SEP · TNE · Encuesta Vulnerabilidad · +30 programas</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: '20px', padding: '0.4rem 1rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2E7D32' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2E7D32' }}>JUNAEB Conectado</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: '🍽️', value: estado.alumnos_pae.toString(),     label: 'Alumnos PAE',        color: '#E53935' },
          { icon: '📊', value: `${estado.ive_porcentaje}%`,       label: 'IVE-SINAE 2025',     color: '#1976D2' },
          { icon: '⭐', value: estado.alumnos_sep.toString(),     label: 'Alumnos SEP',        color: '#7B1FA2' },
          { icon: '💳', value: estado.alumnos_tne.toString(),     label: 'TNE vigentes',       color: '#00897B' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '14px', border: `1.5px solid ${s.color}22`, borderTop: `4px solid ${s.color}`, padding: '1.1rem 1.2rem' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{s.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <JunaebClient estado={estado} historial={historial} alumnosSep={alumnosSep} />
    </div>
  )
}
