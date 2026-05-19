'use client'

//
import { useTransition } from 'react'
...
const [isPending, startTransition] = useTransition()
startTransition(() => { completarOnboarding() })

interface StepExitoProps { nombreUsuario: string }

export function StepExito({ nombreUsuario }: StepExitoProps) {
  const [isPending, startT] = useT()

  const handleIr = () => {
    startT(() => { completarOnboarding() })
  }

  const LOGROS = [
    'Colegio registrado y verificado',
    'SIGE · SAE · JUNAEB conectados',
    'Alumnos sincronizados automáticamente',
    'Dashboard listo para usar hoy',
  ]

  return (
    <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      {/* Ícono animado */}
      <div style={{
        width: '64px', height: '64px', background: '#F0FDF4', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.8rem', marginBottom: '1.2rem',
      }}>
        🎉
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
        ¡Kiva360 está listo, {nombreUsuario.split(' ')[0]}!
      </h2>
      <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1.5rem', maxWidth: '380px', lineHeight: 1.6 }}>
        Tu colegio quedó configurado correctamente. Todo está conectado y listo para usar.
      </p>

      {/* Logros */}
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.8rem' }}>
        {LOGROS.map((logro, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            borderRadius: '10px', padding: '0.6rem 1rem',
            fontSize: '0.8rem', color: '#166534',
          }}>
            <span style={{ color: '#10B981', fontWeight: 700, fontSize: '1rem' }}>✓</span>
            {logro}
          </div>
        ))}
      </div>

      <button onClick={handleIr} disabled={isPending} style={{
        padding: '0.75rem 2.5rem',
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        color: 'white', border: 'none', borderRadius: '10px',
        fontSize: '1rem', fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.6 : 1,
        boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
        transition: 'all 0.2s',
      }}>
        {isPending ? 'Entrando...' : 'Ir al Dashboard →'}
      </button>

      <p style={{ fontSize: '0.7rem', color: '#CBD5E1', marginTop: '1rem' }}>
        Puedes configurar las integraciones en detalle desde Ajustes
      </p>
    </div>
  )
}
