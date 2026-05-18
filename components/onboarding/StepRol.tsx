'use client'

import { useState, useActionState, useTransition } from 'react'
import { guardarRol } from '@/lib/actions/onboarding'
import type { OnboardingState } from '@/lib/actions/onboarding'
import { cn } from '@/lib/utils'
import type { Rol } from '@/types'

interface Props {
  onSuccess: () => void
  onBack:    () => void
}

const ROLES: { value: Rol; icon: string; nombre: string; desc: string }[] = [
  { value: 'director',    icon: '🏫', nombre: 'Director/a',    desc: 'Visión completa del establecimiento' },
  { value: 'utp',         icon: '📋', nombre: 'UTP',           desc: 'Gestión curricular y pedagógica' },
  { value: 'profesor',    icon: '👩‍🏫', nombre: 'Profesor/a',    desc: 'Clases, notas y comunicación' },
  { value: 'apoderado',   icon: '👨‍👩‍👧', nombre: 'Apoderado/a',  desc: 'Notas y comunicación familiar' },
]

const initialState: OnboardingState = { error: null, success: false }

export function StepRol({ onSuccess, onBack }: Props) {
  const [rolSeleccionado, setRol] = useState<Rol>('director')
  const [, startTransition] = useTransition()

  const [state, action, isPending] = useActionState(
    async (prev: OnboardingState, formData: FormData) => {
      const result = await guardarRol(prev, formData)
      if (result.success) startTransition(() => onSuccess())
      return result
    },
    initialState
  )

  return (
    <form action={action} className="p-8">
      <input type="hidden" name="rol" value={rolSeleccionado} />

      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
          <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">2</span>
          Paso 2 de 4
        </div>
        <h2 className="font-serif text-2xl text-gray-900 mb-1">
          ¿Cuál es tu rol en el colegio?
        </h2>
        <p className="text-sm text-gray-500">
          Esto personaliza el dashboard y los módulos que verás al ingresar.
        </p>
      </div>

      {state.error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-8">
        {ROLES.map(rol => (
          <button
            key={rol.value}
            type="button"
            onClick={() => setRol(rol.value)}
            className={cn(
              'text-left border rounded-xl p-4 transition-all cursor-pointer group',
              rolSeleccionado === rol.value
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            <div className="text-2xl mb-2">{rol.icon}</div>
            <div className={cn(
              'font-semibold text-sm mb-0.5',
              rolSeleccionado === rol.value ? 'text-blue-700' : 'text-gray-800'
            )}>
              {rol.nombre}
            </div>
            <div className="text-xs text-gray-400">{rol.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button type="button" onClick={onBack} className="btn btn-outline">
          ← Anterior
        </button>
        <div className="text-xs text-gray-400">Paso 2 de 4</div>
        <button
          type="submit"
          disabled={isPending}
          className={cn('btn btn-primary px-8', isPending && 'opacity-60 cursor-not-allowed')}
        >
          {isPending ? 'Guardando...' : 'Siguiente →'}
        </button>
      </div>
    </form>
  )
}
