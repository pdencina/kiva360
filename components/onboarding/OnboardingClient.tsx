'use client'

import { useState } from 'react'
import { StepColegio      } from './StepColegio'
import { StepRol          } from './StepRol'
import { StepIntegraciones } from './StepIntegraciones'
import { StepExito        } from './StepExito'

export type StepId = 1 | 2 | 3 | 4

const STEPS = [
  { id: 1, label: 'Tu colegio'    },
  { id: 2, label: 'Tu rol'        },
  { id: 3, label: 'Integraciones' },
  { id: 4, label: 'Listo'         },
] as const

interface Props {
  stepInicial:   number
  nombreUsuario: string
}

export function OnboardingClient({ stepInicial, nombreUsuario }: Props) {
  const [step, setStep] = useState<StepId>(stepInicial as StepId)

  const next = () => setStep(s => Math.min(s + 1, 4) as StepId)
  const prev = () => setStep(s => Math.max(s - 1, 1) as StepId)

  return (
    <div style={{ width: '100%', maxWidth: '600px' }}>

      {/* Header — logo + stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0 0.25rem' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '1rem', color: 'white',
          }}>K</div>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
            Kiva360
          </span>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          {STEPS.map((s, i) => {
            const done   = s.id < step
            const active = s.id === step
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700,
                    background: done ? '#10B981' : active ? '#6366F1' : 'rgba(255,255,255,0.1)',
                    color: done || active ? 'white' : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.2s',
                  }}>
                    {done ? '✓' : s.id}
                  </div>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: active ? 600 : 400,
                    color: done ? '#10B981' : active ? 'white' : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.2s',
                  }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Panel principal */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}>
        {step === 1 && <StepColegio      onSuccess={next} />}
        {step === 2 && <StepRol          onSuccess={next} onBack={prev} />}
        {step === 3 && <StepIntegraciones onSuccess={next} onBack={prev} />}
        {step === 4 && <StepExito        nombreUsuario={nombreUsuario} />}
      </div>
    </div>
  )
}
