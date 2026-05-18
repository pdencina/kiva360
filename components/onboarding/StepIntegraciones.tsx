'use client'

import { useState, useActionState, useTransition } from 'react'
import { guardarIntegraciones } from '@/lib/actions/onboarding'
import type { OnboardingState } from '@/lib/actions/onboarding'
import { cn } from '@/lib/utils'

interface Props {
  onSuccess: () => void
  onBack:    () => void
}

const INTEGRACIONES = [
  {
    id:    'sige',
    icon:  '🔗',
    nombre: 'SIGE',
    sub:   'MINEDUC',
    desc:  'Matrícula, declaración de asistencia y actas de rendimiento.',
    items: ['Sincronización automática de alumnos', 'Validador de errores pre-envío', 'Declaraciones automáticas'],
  },
  {
    id:    'sae',
    icon:  '🎓',
    nombre: 'SAE',
    sub:   'Admisión Escolar',
    desc:  'Vacantes, nómina de postulantes asignados y gestión de matrícula.',
    items: ['Importación automática de nóminas', 'Avisos a apoderados por SMS/email', 'Historial por proceso'],
  },
  {
    id:    'junaeb',
    icon:  '🍽️',
    nombre: 'JUNAEB',
    sub:   '+30 programas',
    desc:  'PAE diario, IVE-SINAE, alumnos SEP y encuesta de vulnerabilidad.',
    items: ['Control de raciones PAE', 'IVE automático', 'Encuesta vulnerabilidad'],
  },
] as const

const initialState: OnboardingState = { error: null, success: false }

export function StepIntegraciones({ onSuccess, onBack }: Props) {
  const [activas, setActivas] = useState({ sige: true, sae: true, junaeb: true })
  const [, startTransition] = useTransition()

  const [state, action, isPending] = useActionState(
    async (prev: OnboardingState, formData: FormData) => {
      const result = await guardarIntegraciones(prev, formData)
      if (result.success) startTransition(() => onSuccess())
      return result
    },
    initialState
  )

  const toggle = (id: keyof typeof activas) =>
    setActivas(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <form action={action} className="p-8">
      {/* Hidden fields para los toggles */}
      {activas.sige   && <input type="hidden" name="sige"   value="on" />}
      {activas.sae    && <input type="hidden" name="sae"    value="on" />}
      {activas.junaeb && <input type="hidden" name="junaeb" value="on" />}

      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
          <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">3</span>
          Paso 3 de 4
        </div>
        <h2 className="font-serif text-2xl text-gray-900 mb-1">
          Conecta con MINEDUC y JUNAEB
        </h2>
        <p className="text-sm text-gray-500">
          Activa las integraciones que necesitas. Puedes cambiarlas en Configuración.
        </p>
      </div>

      {state.error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-3 mb-5">
        {INTEGRACIONES.map(integ => {
          const isOn = activas[integ.id as keyof typeof activas]
          return (
            <div
              key={integ.id}
              className={cn(
                'border rounded-xl p-4 transition-all',
                isOn
                  ? 'border-teal-300 bg-teal-50'
                  : 'border-gray-200 bg-white opacity-70'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{integ.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">{integ.nombre}</span>
                      <span className="text-xs text-gray-400">{integ.sub}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 mb-2">{integ.desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {integ.items.map(item => (
                        <span key={item} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggle(integ.id as keyof typeof activas)}
                  className={cn(
                    'relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5',
                    isOn ? 'bg-teal-600' : 'bg-gray-300'
                  )}
                  aria-label={`${isOn ? 'Desactivar' : 'Activar'} ${integ.nombre}`}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all',
                      isOn ? 'left-5' : 'left-0.5'
                    )}
                  />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Nota de seguridad */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 flex items-start gap-2 mb-6">
        <span className="text-base">🔒</span>
        <span>
          Las credenciales de SIGE, SAE y JUNAEB se almacenan encriptadas con AES-256.
          Kiva360 nunca las comparte con terceros. Las configuras en Ajustes después.
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button type="button" onClick={onBack} className="btn btn-outline">
          ← Anterior
        </button>
        <div className="text-xs text-gray-400">Paso 3 de 4</div>
        <button
          type="submit"
          disabled={isPending}
          className={cn('btn btn-primary px-8', isPending && 'opacity-60 cursor-not-allowed')}
        >
          {isPending ? 'Conectando...' : 'Conectar y continuar →'}
        </button>
      </div>
    </form>
  )
}
