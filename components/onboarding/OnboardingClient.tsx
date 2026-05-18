'use client'

import { useState } from 'react'
import { StepIndicator   } from './StepIndicator'
import { StepColegio     } from './StepColegio'
import { StepRol         } from './StepRol'
import { StepIntegraciones } from './StepIntegraciones'
import { StepExito       } from './StepExito'

interface Props {
  stepInicial:    number
  nombreUsuario:  string
}

export type StepId = 1 | 2 | 3 | 4

const STEPS = [
  { id: 1, label: 'Tu colegio'     },
  { id: 2, label: 'Tu rol'         },
  { id: 3, label: 'Integraciones'  },
  { id: 4, label: 'Listo'          },
] as const

export function OnboardingClient({ stepInicial, nombreUsuario }: Props) {
  const [step, setStep] = useState<StepId>(stepInicial as StepId)

  const next = () => setStep(s => Math.min(s + 1, 4) as StepId)
  const prev = () => setStep(s => Math.max(s - 1, 1) as StepId)

  return (
    <div className="w-full max-w-2xl">
      {/* Header con logo + stepper */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center text-lg">
            📚
          </div>
          <span className="font-serif text-xl text-white">Kiva360</span>
        </div>
        <StepIndicator steps={STEPS} current={step} />
      </div>

      {/* Panel principal */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

        {step === 1 && (
          <StepColegio onSuccess={next} />
        )}

        {step === 2 && (
          <StepRol onSuccess={next} onBack={prev} />
        )}

        {step === 3 && (
          <StepIntegraciones onSuccess={next} onBack={prev} />
        )}

        {step === 4 && (
          <StepExito nombreUsuario={nombreUsuario} />
        )}

      </div>
    </div>
  )
}
