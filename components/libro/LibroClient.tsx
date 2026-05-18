'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SelectorCurso    } from './SelectorCurso'
import { TabAsistencia    } from './TabAsistencia'
import { TabNotas         } from './TabNotas'
import { TabHojaVida      } from './TabHojaVida'

type Tab = 'asistencia' | 'notas' | 'hojavida'

interface Curso {
  id:     string
  nombre: string
  nivel:  string
}

interface Props {
  cursos: Curso[]
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'asistencia', label: 'Asistencia', icon: '✅' },
  { id: 'notas',      label: 'Notas',      icon: '📊' },
  { id: 'hojavida',   label: 'Hoja de Vida', icon: '📋' },
]

export function LibroClient({ cursos }: Props) {
  const [tabActiva,    setTab]    = useState<Tab>('asistencia')
  const [cursoActivo,  setCurso]  = useState<Curso>(cursos[0])
  const [alumnoId,     setAlumno] = useState<string | null>(null)

  const abrirHojaVida = (id: string) => {
    setAlumno(id)
    setTab('hojavida')
  }

  return (
    <div>
      {/* Selector de curso */}
      <SelectorCurso
        cursos={cursos}
        activo={cursoActivo.id}
        onChange={id => {
          const c = cursos.find(c => c.id === id)
          if (c) setCurso(c)
        }}
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
              tabActiva === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido por tab */}
      {tabActiva === 'asistencia' && (
        <TabAsistencia
          cursoId={cursoActivo.id}
          cursoNombre={cursoActivo.nombre}
          onVerHojaVida={abrirHojaVida}
        />
      )}

      {tabActiva === 'notas' && (
        <TabNotas
          cursoId={cursoActivo.id}
          cursoNombre={cursoActivo.nombre}
        />
      )}

      {tabActiva === 'hojavida' && (
        <TabHojaVida
          alumnoId={alumnoId}
          onVolver={() => setTab('asistencia')}
        />
      )}
    </div>
  )
}
