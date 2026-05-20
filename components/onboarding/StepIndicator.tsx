// components/onboarding/StepIndicator.tsx — sin Tailwind
// Ya no se usa directamente (el stepper está en OnboardingClient)
// Exportamos para no romper imports existentes

import type { StepId } from './OnboardingClient'

interface Step { id: number; label: string }
interface Props { steps: readonly Step[]; current: StepId }

export function StepIndicator({ steps, current }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
      {steps.map((step, i) => {
        const done   = step.id < current
        const active = step.id === current
        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700,
                background: done ? '#37352F' : active ? '#37352F' : '#F0F0EE',
                color: done || active ? 'white' : '#9B9A97',
                transition: 'all 0.2s',
              }}>
                {done ? '✓' : step.id}
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: active ? 600 : 400,
                color: done ? '#37352F' : active ? '#37352F' : '#9B9A97',
                transition: 'all 0.2s',
              }}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: '20px', height: '1px', background: '#E8E8E5', margin: '0 0.5rem' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
