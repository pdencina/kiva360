'use client'

import { cn } from '@/lib/utils'

interface Curso {
  id:     string
  nombre: string
  nivel:  string
}

interface Props {
  cursos:   Curso[]
  activo:   string
  onChange: (id: string) => void
}

export function SelectorCurso({ cursos, activo, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap mb-5">
      {cursos.map(curso => (
        <button
          key={curso.id}
          onClick={() => onChange(curso.id)}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all',
            curso.id === activo
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
          )}
        >
          {curso.nombre}
        </button>
      ))}
    </div>
  )
}
