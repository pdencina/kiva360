'use client'

import { useState, useEffect, useRef } from 'react'
import { getNotasCurso, guardarNota } from '@/lib/actions/libro'
import { calcularPromedio } from '@/lib/utils/notas'
import { cn, formatNota, colorNota } from '@/lib/utils'

interface Props {
  cursoId:     string
  cursoNombre: string
}

type NotaMap = Map<string, Map<string, number | null>> // alumno_id → eval_id → nota

type NotaRow = {
  evaluacion_id: string
  alumno_id: string
  nota: number | null
}

type EvaluacionRow = {
  id: string
  titulo: string
  tipo?: string | null
  ponderacion: number | null
  asignatura?: string | null
  fecha?: string | null
  oa_asociados?: unknown
}

type AlumnoRow = {
  id: string
  nombre?: string | null
  apellido_paterno?: string | null
  apellido_materno?: string | null
  alumno_sep?: boolean | null
  numero?: number
  nombre_completo: string
}

type NotasCursoData = {
  evaluaciones: EvaluacionRow[]
  alumnos: AlumnoRow[]
  notas: NotaRow[]
}

export function TabNotas({ cursoId, cursoNombre }: Props) {
  const [datos,   setDatos]   = useState<NotasCursoData | null>(null)
  const [notas,   setNotas]   = useState<NotaMap>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState<string | null>(null)  // evalId-alumnoId

  useEffect(() => {
    setLoading(true)
    getNotasCurso(cursoId).then(raw => {
      const d = raw as NotasCursoData
      setDatos(d)
      // Construir mapa de notas
      const m: NotaMap = new Map()
      for (const n of d.notas) {
        if (!m.has(n.alumno_id)) m.set(n.alumno_id, new Map())
        m.get(n.alumno_id)!.set(n.evaluacion_id, n.nota)
      }
      setNotas(m)
      setLoading(false)
    })
  }, [cursoId])

  const getNota = (alumnoId: string, evalId: string) =>
    notas.get(alumnoId)?.get(evalId) ?? null

  const handleNota = async (alumnoId: string, evalId: string, valor: string) => {
    const num = valor === '' ? null : parseFloat(valor.replace(',', '.'))
    if (num !== null && (num < 1 || num > 7 || isNaN(num))) return

    // Actualizar local optimistamente
    setNotas(prev => {
      const m = new Map(prev)
      if (!m.has(alumnoId)) m.set(alumnoId, new Map())
      m.get(alumnoId)!.set(evalId, num)
      return m
    })

    const key = `${evalId}-${alumnoId}`
    setSaving(key)
    await guardarNota(evalId, alumnoId, num)
    setSaving(null)
  }

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-1/3 mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-50 rounded mb-2" />
        ))}
      </div>
    )
  }

  if (!datos || datos.evaluaciones.length === 0) {
    return (
      <div className="card text-center py-10">
        <div className="text-3xl mb-2">📝</div>
        <h3 className="font-semibold text-gray-800 mb-1">Sin evaluaciones aún</h3>
        <p className="text-sm text-gray-500">
          Crea evaluaciones desde el módulo de Evaluaciones.
        </p>
      </div>
    )
  }

  return (
    <div className="card overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">
          {cursoNombre} · Notas {new Date().getFullYear()}
        </h2>
        <button className="btn btn-outline text-sm">📥 Exportar</button>
      </div>

      <table className="kimen-table w-full" style={{ minWidth: '600px' }}>
        <thead>
          <tr>
            <th className="text-left sticky left-0 bg-gray-50 z-10">Estudiante</th>
            {datos.evaluaciones.map(ev => (
              <th key={ev.id} className="text-center min-w-[80px]">
                <div className="font-bold text-gray-700 text-[11px] truncate max-w-[76px]" title={ev.titulo}>
                  {ev.titulo.length > 12 ? ev.titulo.slice(0, 11) + '…' : ev.titulo}
                </div>
                <div className="text-[10px] text-gray-400 font-normal">
                  {ev.ponderacion ? `${ev.ponderacion}%` : '—'}
                </div>
              </th>
            ))}
            <th className="text-center min-w-[72px] bg-blue-50 text-blue-700">
              Promedio
            </th>
          </tr>
        </thead>
        <tbody>
          {datos.alumnos.map(alumno => {
            const notasAlumno = datos.evaluaciones.map(ev => ({
              evaluacion_id: ev.id,
              nota: getNota(alumno.id, ev.id),
            }))
            const promedio = calcularPromedio(notasAlumno, datos.evaluaciones)

            return (
              <tr key={alumno.id}>
                <td className="font-semibold sticky left-0 bg-white z-10">
                  <div>{alumno.nombre_completo}</div>
                  {alumno.alumno_sep && (
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1 rounded">
                      SEP
                    </span>
                  )}
                </td>

                {datos.evaluaciones.map(ev => {
                  const nota = getNota(alumno.id, ev.id)
                  const key  = `${ev.id}-${alumno.id}`

                  return (
                    <td key={ev.id} className="text-center">
                      <NotaInput
                        value={nota}
                        saving={saving === key}
                        onChange={val => handleNota(alumno.id, ev.id, val)}
                      />
                    </td>
                  )
                })}

                {/* Promedio */}
                <td className={cn(
                  'text-center font-extrabold bg-blue-50 tabular-nums',
                  colorNota(promedio)
                )}>
                  {promedio !== null ? formatNota(promedio) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Leyenda ponderaciones */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
        {datos.evaluaciones.map(ev => (
          <span key={ev.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {ev.titulo}: {ev.ponderacion ?? 0}%
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Sub-componente: input de nota editable inline ─────────────
function NotaInput({
  value,
  saving,
  onChange,
}: {
  value:   number | null
  saving:  boolean
  onChange: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [text,    setText]    = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = () => {
    setText(value !== null ? value.toFixed(1).replace('.', ',') : '')
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 50)
  }

  const commit = () => {
    setEditing(false)
    onChange(text)
  }

  if (saving) {
    return (
      <div className="w-12 h-7 mx-auto bg-blue-50 rounded animate-pulse" />
    )
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === 'Tab') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="w-14 text-center text-sm border border-blue-400 rounded-lg px-1 py-0.5 outline-none ring-2 ring-blue-100"
        placeholder="1,0–7,0"
      />
    )
  }

  return (
    <button
      onClick={startEdit}
      className={cn(
        'w-12 h-7 rounded-lg text-sm font-bold border transition-all hover:scale-105 active:scale-95',
        value !== null
          ? cn(
              'border-transparent',
              value >= 6.0 ? 'bg-green-100 text-green-800 border-green-200' :
              value >= 4.0 ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                             'bg-red-100 text-red-700 border-red-200'
            )
          : 'bg-gray-50 text-gray-300 border-gray-100 hover:bg-gray-100'
      )}
      title="Clic para editar"
    >
      {value !== null ? formatNota(value) : '—'}
    </button>
  )
}
