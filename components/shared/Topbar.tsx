'use client'

import { usePathname } from 'next/navigation'
import type { Perfil } from '@/types'

interface Props {
  perfil: Perfil & { establecimientos?: { nombre: string } | null }
}

const TITULOS: Record<string, [string, string]> = {
  '/dashboard':                ['Inicio',              'Dashboard'          ],
  '/libro':                    ['Libro de Clases',     'Asistencia y Notas' ],
  '/evaluaciones':             ['Evaluaciones',        'Mis evaluaciones'   ],
  '/planificacion':            ['Planificación',       'Currículum 2025'    ],
  '/integraciones/sige':       ['Integración',         'SIGE · MINEDUC'     ],
  '/integraciones/sae':        ['Integración',         'SAE · Admisión'     ],
  '/integraciones/junaeb':     ['Integración',         'JUNAEB'             ],
  '/comunicacion':             ['Comunicación',        'Mensajes'           ],
  '/familias':                 ['Familias',            'Portal Apoderados'  ],
  '/reportes':                 ['Reportes',            'Analítica'          ],
}

export function Topbar({ perfil }: Props) {
  const pathname  = usePathname()
  const [sec, sub] = TITULOS[pathname] ?? ['Kiva360', '']

  return (
    <header className="h-[54px] bg-white border-b border-gray-200 flex items-center justify-between px-5 sticky top-0 z-40">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        {sec}{' '}
        {sub && (
          <>
            <span className="mx-1 text-gray-300">›</span>
            <strong className="text-gray-900 font-semibold">{sub}</strong>
          </>
        )}
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-2">
        {/* Búsqueda */}
        <input
          type="text"
          placeholder="🔍  Buscar alumno, curso..."
          className="hidden md:block w-52 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
        />

        {/* Año escolar */}
        <div className="bg-blue-700 text-white text-xs font-bold px-2.5 py-1 rounded-md">
          2025
        </div>

        {/* Notificaciones */}
        <button
          className="relative w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Notificaciones"
        >
          <span className="text-base" aria-hidden="true">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Ayuda */}
        <button
          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Ayuda"
        >
          <span className="text-base" aria-hidden="true">❓</span>
        </button>
      </div>
    </header>
  )
}
