'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { getAsistenciaSemana, guardarAsistencia } from '@/lib/actions/libro'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type Estado = 'P' | 'A' | 'J'

interface Props {
  cursoId:        string
  cursoNombre:    string
  onVerHojaVida:  (alumnoId: string) => void
}

const ESTADO_LABEL: Record<Estado, string> = { P: 'Presente', A: 'Ausente', J: 'Justificado' }
const ESTADO_CLASS: Record<Estado, string> = {
  P: 'bg-green-100 text-green-800 border-green-200',
  A: 'bg-red-100   text-red-700   border-red-200',
  J: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

const CICLO: Estado[] = ['P', 'A', 'J']

export function TabAsistencia({ cursoId, cursoNombre, onVerHojaVida }: Props) {
  const [datos,     setDatos]     = useState<Awaited<ReturnType<typeof getAsistenciaSemana>> | null>(null)
  const [cambios,   setCambios]   = useState<Record<string, Record<string, Estado>>>({})
  const [loading,   setLoading]   = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardado,  setGuardado]  = useState(false)
  const [, startTransition]       = useTransition()

  const fechaHoy = format(new Date(), 'yyyy-MM-dd')

  // Cargar datos
  useEffect(() => {
    setLoading(true)
    setCambios({})
    getAsistenciaSemana(cursoId).then(d => {
      setDatos(d)
      setLoading(false)
    })
  }, [cursoId])

  // Obtener estado actual (cambio pendiente o dato original)
  const getEstado = useCallback(
    (alumnoId: string, fecha: string): Estado | null => {
      return (cambios[alumnoId]?.[fecha] ?? datos?.alumnos.find(a => a.id === alumnoId)?.semana[fecha] ?? null) as Estado | null
    },
    [cambios, datos]
  )

  // Ciclar al hacer clic: null → P → A → J → P
  const toggleEstado = (alumnoId: string, fecha: string) => {
    const actual   = getEstado(alumnoId, fecha)
    const idx      = actual ? CICLO.indexOf(actual) : -1
    const siguiente = CICLO[(idx + 1) % CICLO.length]

    setCambios(prev => ({
      ...prev,
      [alumnoId]: { ...prev[alumnoId], [fecha]: siguiente },
    }))
    setGuardado(false)
  }

  // Marcar todos presentes en una fecha
  const marcarTodosPresentes = (fecha: string) => {
    if (!datos) return
    const nuevos = { ...cambios }
    for (const a of datos.alumnos) {
      if (!nuevos[a.id]) nuevos[a.id] = {}
      nuevos[a.id][fecha] = 'P'
    }
    setCambios(nuevos)
    setGuardado(false)
  }

  // Guardar todos los cambios
  const guardar = async () => {
    if (!datos) return
    setGuardando(true)

    // Consolidar todos los registros: combinar originales + cambios
    const todosLosRegistros: { alumno_id: string; estado: Estado }[] = []

    for (const alumno of datos.alumnos) {
      const estadoHoy = getEstado(alumno.id, fechaHoy)
      if (estadoHoy) {
        todosLosRegistros.push({ alumno_id: alumno.id, estado: estadoHoy })
      }
    }

    if (todosLosRegistros.length === 0) {
      setGuardando(false)
      return
    }

    startTransition(async () => {
      const result = await guardarAsistencia({
        cursoId,
        fecha: fechaHoy,
        registros: todosLosRegistros,
      })

      if (result.success) {
        setGuardado(true)
        setCambios({})
        // Recargar datos
        const nuevos = await getAsistenciaSemana(cursoId)
        setDatos(nuevos)
      }
      setGuardando(false)
    })
  }

  // Calcular stats de hoy
  const statsHoy = datos?.alumnos.reduce(
    (acc, a) => {
      const e = getEstado(a.id, fechaHoy)
      if (e === 'P') acc.p++
      else if (e === 'A') acc.a++
      else if (e === 'J') acc.j++
      else acc.sin++
      return acc
    },
    { p: 0, a: 0, j: 0, sin: 0 }
  )

  const total     = datos?.alumnos.length ?? 0
  const pctHoy    = statsHoy && total > 0
    ? Math.round(((statsHoy.p) / total) * 100)
    : null

  const hayPendientes = Object.keys(cambios).length > 0

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-1/3 mb-4" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-50 rounded mb-2" />
        ))}
      </div>
    )
  }

  if (!datos) return null

  return (
    <div className="space-y-4">
      {/* Header con stats y acciones */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">
              {cursoNombre} · {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              {statsHoy && (
                <>
                  <span className="text-xs text-green-700 font-semibold">{statsHoy.p} presentes</span>
                  {statsHoy.a > 0 && <span className="text-xs text-red-600 font-semibold">{statsHoy.a} ausentes</span>}
                  {statsHoy.j > 0 && <span className="text-xs text-yellow-700 font-semibold">{statsHoy.j} justificados</span>}
                  {statsHoy.sin > 0 && <span className="text-xs text-gray-400">{statsHoy.sin} sin marcar</span>}
                  {pctHoy !== null && (
                    <span className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-full',
                      pctHoy >= 90 ? 'bg-green-100 text-green-800' :
                      pctHoy >= 75 ? 'bg-yellow-100 text-yellow-800' :
                                     'bg-red-100 text-red-700'
                    )}>
                      {pctHoy}% asistencia
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => marcarTodosPresentes(fechaHoy)}
              className="btn btn-outline text-sm"
            >
              ✓ Todos presentes
            </button>
            <button
              onClick={guardar}
              disabled={guardando || !hayPendientes}
              className={cn(
                'btn btn-primary text-sm',
                (!hayPendientes && !guardando) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : '💾 Guardar'}
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="kimen-table w-full">
            <thead>
              <tr>
                <th className="w-8">N°</th>
                <th>Estudiante</th>
                <th className="w-8">SEP</th>
                {datos.fechas.map(fecha => (
                  <th key={fecha} className="text-center min-w-[72px]">
                    <div className="text-[10px] text-gray-400 capitalize">
                      {format(parseISO(fecha), 'EEE', { locale: es })}
                    </div>
                    <div className={cn(
                      'font-bold',
                      fecha === fechaHoy ? 'text-blue-600' : 'text-gray-600'
                    )}>
                      {format(parseISO(fecha), 'd MMM', { locale: es })}
                    </div>
                  </th>
                ))}
                <th className="text-center">% Mes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {datos.alumnos.map(alumno => (
                <tr key={alumno.id}>
                  <td className="text-gray-400 text-xs tabular-nums">{alumno.numero}</td>
                  <td className="font-semibold">{alumno.nombre_completo}</td>
                  <td className="text-center">
                    {alumno.alumno_sep && (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1 py-0.5 rounded">
                        SEP
                      </span>
                    )}
                  </td>

                  {datos.fechas.map(fecha => {
                    const estado = getEstado(alumno.id, fecha)
                    const esHoy  = fecha === fechaHoy
                    return (
                      <td key={fecha} className="text-center">
                        <button
                          onClick={() => esHoy ? toggleEstado(alumno.id, fecha) : undefined}
                          disabled={!esHoy}
                          title={estado ? ESTADO_LABEL[estado] : 'Sin marcar'}
                          className={cn(
                            'w-9 h-7 rounded-lg text-xs font-bold border transition-all',
                            estado
                              ? ESTADO_CLASS[estado]
                              : 'bg-gray-50 text-gray-300 border-gray-100',
                            esHoy && 'cursor-pointer hover:scale-110 active:scale-95',
                            !esHoy && 'cursor-default opacity-80'
                          )}
                        >
                          {estado ?? '·'}
                        </button>
                      </td>
                    )
                  })}

                  {/* % mes */}
                  <td className="text-center">
                    {alumno.pct_mes !== null ? (
                      <span className={cn(
                        'text-xs font-bold tabular-nums',
                        alumno.pct_mes >= 90 ? 'text-teal-700' :
                        alumno.pct_mes >= 75 ? 'text-yellow-700' :
                                               'text-red-600'
                      )}>
                        {alumno.pct_mes}%
                        {alumno.pct_mes < 75 && ' ⚠️'}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Hoja de vida */}
                  <td>
                    <button
                      onClick={() => onVerHojaVida(alumno.id)}
                      className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      Ver →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-medium">Haz clic para cambiar:</span>
          {(['P','A','J'] as Estado[]).map(e => (
            <span key={e} className={cn(
              'text-xs font-bold px-2 py-0.5 rounded border',
              ESTADO_CLASS[e]
            )}>
              {e} = {ESTADO_LABEL[e]}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
