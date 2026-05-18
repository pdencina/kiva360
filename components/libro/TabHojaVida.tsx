'use client'

import { useState, useEffect } from 'react'
import { getHojaVidaAlumno } from '@/lib/actions/libro'
import { formatFecha, formatNota, colorNota, cn } from '@/lib/utils'

interface Props {
  alumnoId: string | null
  onVolver: () => void
}

export function TabHojaVida({ alumnoId, onVolver }: Props) {
  const [datos,   setDatos]   = useState<Awaited<ReturnType<typeof getHojaVidaAlumno>> | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!alumnoId) return
    setLoading(true)
    getHojaVidaAlumno(alumnoId).then(d => {
      setDatos(d)
      setLoading(false)
    })
  }, [alumnoId])

  if (!alumnoId) {
    return (
      <div className="card text-center py-10">
        <div className="text-3xl mb-2">📋</div>
        <p className="text-sm text-gray-500">
          Haz clic en «Ver →» junto a un alumno para ver su hoja de vida.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/3 mb-4" />
        <div className="h-24 bg-gray-50 rounded mb-4" />
        <div className="h-32 bg-gray-50 rounded" />
      </div>
    )
  }

  if (!datos) return null

  const { alumno, pct_mes, presentes, total_dias, notas } = datos
  const nombreCompleto = [alumno.apellido_paterno, alumno.apellido_materno, alumno.nombre]
    .filter(Boolean).join(' ')

  return (
    <div className="space-y-4">
      {/* Botón volver */}
      <button
        onClick={onVolver}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        ← Volver al libro
      </button>

      <div className="grid grid-cols-[1fr_1fr] gap-4">

        {/* Panel izquierdo — datos personales */}
        <div className="card">
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700 flex-shrink-0">
              {alumno.nombre[0]}{alumno.apellido_paterno?.[0] ?? ''}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">{nombreCompleto}</h2>
              <div className="text-sm text-gray-500">
                {(alumno as any).cursos?.nombre} · {(alumno as any).cursos?.nivel}
              </div>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {alumno.alumno_sep && (
                  <span className="text-[11px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    ⭐ SEP
                  </span>
                )}
                {alumno.beneficio_pae && (
                  <span className="text-[11px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    🍽️ PAE
                  </span>
                )}
                {alumno.beneficio_tne && (
                  <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    💳 TNE
                  </span>
                )}
                {alumno.prioridad_sinae && (
                  <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    SINAE P{alumno.prioridad_sinae}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-gray-100 pt-4">
            <div>
              <div className="text-xs text-gray-400 font-medium mb-0.5">RUT</div>
              <div className="font-semibold text-gray-800">{alumno.rut ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium mb-0.5">Fecha de nacimiento</div>
              <div className="font-semibold text-gray-800">
                {alumno.fecha_nacimiento ? formatFecha(alumno.fecha_nacimiento) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho — asistencia del mes */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Asistencia este mes</h3>
          <div className="flex items-end gap-3 mb-3">
            <div className={cn(
              'text-4xl font-extrabold tabular-nums',
              pct_mes !== null
                ? pct_mes >= 90 ? 'text-teal-700'
                : pct_mes >= 75 ? 'text-yellow-700'
                :                 'text-red-600'
                : 'text-gray-300'
            )}>
              {pct_mes !== null ? `${pct_mes}%` : '—'}
            </div>
            <div className="text-sm text-gray-500 pb-1">
              {presentes} de {total_dias} días
            </div>
          </div>

          {/* Barra */}
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                pct_mes === null  ? 'w-0' :
                pct_mes >= 90     ? 'bg-teal-500' :
                pct_mes >= 75     ? 'bg-yellow-400' :
                                    'bg-red-500'
              )}
              style={{ width: `${pct_mes ?? 0}%` }}
            />
          </div>

          {pct_mes !== null && pct_mes < 75 && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 font-medium">
              ⚠️ Asistencia bajo el mínimo reglamentario (75%). Notificar al apoderado.
            </div>
          )}
        </div>

      </div>

      {/* Notas recientes */}
      {notas.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Notas recientes</h3>
          <table className="kimen-table w-full">
            <thead>
              <tr>
                <th>Evaluación</th>
                <th>Asignatura</th>
                <th>Fecha</th>
                <th>Ponderación</th>
                <th className="text-center">Nota</th>
              </tr>
            </thead>
            <tbody>
              {notas.map((n: any, i: number) => (
                <tr key={i}>
                  <td className="font-medium">{n.evaluaciones?.titulo ?? '—'}</td>
                  <td className="text-gray-500">{n.evaluaciones?.asignatura ?? '—'}</td>
                  <td className="text-gray-500">
                    {n.evaluaciones?.fecha ? formatFecha(n.evaluaciones.fecha, 'dd MMM') : '—'}
                  </td>
                  <td className="text-gray-500">
                    {n.evaluaciones?.ponderacion ? `${n.evaluaciones.ponderacion}%` : '—'}
                  </td>
                  <td className={cn('text-center font-extrabold tabular-nums', colorNota(n.nota))}>
                    {formatNota(n.nota)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
