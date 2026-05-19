'use client'

// ═══════════════════════════════════════════════════════
// StepRol
// ═══════════════════════════════════════════════════════
import { useState, useActionState, useTransition } from 'react'
import { guardarRol } from '@/lib/actions/onboarding'
import type { OnboardingState } from '@/lib/actions/onboarding'

const ROLES = [
  { value: 'director',  icon: '🏫', nombre: 'Director/a',   desc: 'Visión completa del establecimiento' },
  { value: 'utp',       icon: '📋', nombre: 'UTP',          desc: 'Gestión curricular y pedagógica' },
  { value: 'profesor',  icon: '👩‍🏫', nombre: 'Profesor/a',   desc: 'Clases, notas y comunicación' },
  { value: 'apoderado', icon: '👨‍👩‍👧', nombre: 'Apoderado/a', desc: 'Notas y comunicación familiar' },
]

interface StepRolProps { onSuccess: () => void; onBack: () => void }

export function StepRol({ onSuccess, onBack }: StepRolProps) {
  const [rolSeleccionado, setRol] = useState('director')
  const [, startTransition] = useTransition()

  const [state, action, isPending] = useActionState(
    async (prev: OnboardingState, formData: FormData) => {
      const result = await guardarRol(prev, formData)
      if (result.success) startTransition(() => onSuccess())
      return result
    },
    { error: null, success: false }
  )

  return (
    <form action={action} style={{ padding: '2rem' }}>
      <input type="hidden" name="rol" value={rolSeleccionado} />

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{ width: '22px', height: '22px', background: '#EEF2FF', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#6366F1' }}>2</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6366F1' }}>Paso 2 de 4</span>
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
          ¿Cuál es tu rol en el colegio?
        </h2>
        <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Personaliza el dashboard según tu función.</p>
      </div>

      {state.error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '9px', padding: '0.7rem 1rem', fontSize: '0.78rem', color: '#DC2626', marginBottom: '1rem' }}>
          ⚠️ {state.error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {ROLES.map(rol => (
          <button key={rol.value} type="button" onClick={() => setRol(rol.value)} style={{
            textAlign: 'left', padding: '1rem', border: `2px solid ${rolSeleccionado === rol.value ? '#6366F1' : '#E5E7EB'}`,
            borderRadius: '12px', background: rolSeleccionado === rol.value ? '#EEF2FF' : 'white',
            cursor: 'pointer', transition: 'all 0.15s',
            boxShadow: rolSeleccionado === rol.value ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{rol.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: rolSeleccionado === rol.value ? '#4F46E5' : '#0F172A', marginBottom: '0.2rem' }}>
              {rol.nombre}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{rol.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.2rem', borderTop: '1px solid #F1F5F9' }}>
        <button type="button" onClick={onBack} style={{ padding: '0.6rem 1.1rem', background: 'white', color: '#475569', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
          ← Anterior
        </button>
        <span style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>Paso 2 de 4</span>
        <button type="submit" disabled={isPending} style={{ padding: '0.6rem 1.6rem', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none', borderRadius: '9px', fontSize: '0.875rem', fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.6 : 1 }}>
          {isPending ? 'Guardando...' : 'Siguiente →'}
        </button>
      </div>
    </form>
  )
}