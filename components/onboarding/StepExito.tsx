'use client'

import { useTransition } from 'react'
import { completarOnboarding } from '@/lib/actions/onboarding'
import { cn } from '@/lib/utils'

interface Props {
  nombreUsuario: string
}

const LOGROS = [
  'Colegio registrado y verificado',
  'SIGE · SAE · JUNAEB conectados',
  'Alumnos sincronizados automáticamente',
  'Dashboard listo para usar',
]

export function StepExito({ nombreUsuario }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleIrDashboard = () => {
    startTransition(() => {
      completarOnboarding()
    })
  }

  return (
    <div className="p-8 flex flex-col items-center text-center">

      {/* Ícono animado */}
      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce">
        🎉
      </div>

      <h2 className="font-serif text-2xl text-gray-900 mb-2">
        ¡Kiva360 está listo, {nombreUsuario.split(' ')[0]}!
      </h2>

      <p className="text-sm text-gray-500 mb-6 max-w-sm leading-relaxed">
        Tu colegio quedó configurado correctamente. Todo está conectado y listo para usar desde hoy.
      </p>

      {/* Lista de logros */}
      <div className="w-full max-w-sm flex flex-col gap-2 mb-7">
        {LOGROS.map((logro, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm"
          >
            <span className="text-teal-600 font-bold text-base">✓</span>
            <span className="text-gray-700">{logro}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={handleIrDashboard}
        disabled={isPending}
        className={cn(
          'btn btn-primary px-10 py-3 text-base',
          isPending && 'opacity-60 cursor-not-allowed'
        )}
      >
        {isPending ? 'Entrando...' : 'Ir al Dashboard →'}
      </button>

      <p className="text-xs text-gray-400 mt-4">
        Puedes configurar las integraciones en detalle desde Ajustes
      </p>
    </div>
  )
}
