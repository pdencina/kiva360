import { cn } from '@/lib/utils'
import type { StepId } from './OnboardingClient'

interface Step {
  id:    number
  label: string
}

interface Props {
  steps:   readonly Step[]
  current: StepId
}

export function StepIndicator({ steps, current }: Props) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done   = step.id < current
        const active = step.id === current

        return (
          <div key={step.id} className="flex items-center gap-0">
            <div className="flex items-center gap-1.5">
              {/* Dot */}
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  done   && 'bg-teal-600 text-white',
                  active && 'bg-blue-600 text-white ring-2 ring-blue-400/30',
                  !done && !active && 'bg-blue-950 text-blue-800'
                )}
              >
                {done ? '✓' : step.id}
              </div>
              {/* Label */}
              <span
                className={cn(
                  'text-xs font-medium transition-colors',
                  done   && 'text-teal-400',
                  active && 'text-white',
                  !done && !active && 'text-blue-900'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Separador */}
            {i < steps.length - 1 && (
              <div className="w-5 h-px bg-blue-900 mx-1.5" />
            )}
          </div>
        )
      })}
    </div>
  )
}
