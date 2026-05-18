'use client'

import { useActionState, useTransition } from 'react'
import { guardarColegio } from '@/lib/actions/onboarding'
import type { OnboardingState } from '@/lib/actions/onboarding'
import { cn } from '@/lib/utils'

interface Props {
  onSuccess: () => void
}

const TIPOS = [
  { value: 'municipal',                label: 'Municipal' },
  { value: 'particular_subvencionado', label: 'Particular subvencionado' },
  { value: 'particular_pagado',        label: 'Particular pagado' },
]

const REGIONES = [
  'Metropolitana', 'Valparaíso', 'Biobío', 'Araucanía', 'Los Lagos',
  'O\'Higgins', 'Maule', 'Antofagasta', 'Coquimbo', 'Atacama',
  'Tarapacá', 'Arica y Parinacota', 'Los Ríos', 'Aysén', 'Magallanes',
  'Ñuble',
]

const initialState: OnboardingState = { error: null, success: false }

export function StepColegio({ onSuccess }: Props) {
  const [, startTransition] = useTransition()

  const [state, action, isPending] = useActionState(
    async (prev: OnboardingState, formData: FormData) => {
      const result = await guardarColegio(prev, formData)
      if (result.success) {
        startTransition(() => onSuccess())
      }
      return result
    },
    initialState
  )

  return (
    <form action={action} className="p-8">
      {/* Header del paso */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
          <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">1</span>
          Paso 1 de 4
        </div>
        <h2 className="font-serif text-2xl text-gray-900 mb-1">
          Cuéntanos sobre tu colegio
        </h2>
        <p className="text-sm text-gray-500">
          Esta información se usa para conectar con SIGE, SAE y JUNAEB automáticamente.
        </p>
      </div>

      {/* Error general */}
      {state.error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Campos */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            RBD <span className="text-red-400">*</span>
          </label>
          <input
            name="rbd"
            className={cn(
              'input',
              state.field === 'rbd' && 'border-red-400 focus:border-red-400'
            )}
            placeholder="12345-6"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Código MINEDUC del establecimiento</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Tipo de establecimiento <span className="text-red-400">*</span>
          </label>
          <select name="tipo" className="input" required defaultValue="particular_subvencionado">
            {TIPOS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Nombre del establecimiento <span className="text-red-400">*</span>
        </label>
        <input
          name="nombre"
          className="input"
          placeholder="Ej: Colegio San Patricio de Santiago"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Región <span className="text-red-400">*</span>
          </label>
          <select name="region" className="input" required defaultValue="Metropolitana">
            {REGIONES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Comuna <span className="text-red-400">*</span>
          </label>
          <input name="comuna" className="input" placeholder="Providencia" required />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Nombre del director/a <span className="text-red-400">*</span>
        </label>
        <input name="director" className="input" placeholder="Juan Pérez Soto" required />
      </div>

      {/* Acciones */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'btn btn-primary px-8',
            isPending && 'opacity-60 cursor-not-allowed'
          )}
        >
          {isPending ? 'Guardando...' : 'Siguiente →'}
        </button>
      </div>
    </form>
  )
}
