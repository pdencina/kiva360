import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getCursosDelColegio } from '@/lib/actions/libro'
import { LibroClient } from '@/components/libro/LibroClient'
import { LibroSkeleton } from '@/components/libro/LibroSkeleton'

export const metadata: Metadata = { title: 'Libro de Clases' }

export default async function LibroPage() {
  const cursos = await getCursosDelColegio()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900 mb-0.5">
            📒 Libro de Clases Digital
          </h1>
          <p className="text-sm text-gray-400">
            Sin papel · Conforme MINEDUC · Sincronizado con SIGE
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            SIGE sincronizado
          </div>
        </div>
      </div>

      {cursos.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <h2 className="font-semibold text-gray-800 mb-1">No hay cursos configurados</h2>
          <p className="text-sm text-gray-500">
            Importa los cursos desde SIGE o créalos en Configuración.
          </p>
        </div>
      ) : (
        <Suspense fallback={<LibroSkeleton />}>
          <LibroClient cursos={cursos} />
        </Suspense>
      )}
    </div>
  )
}
