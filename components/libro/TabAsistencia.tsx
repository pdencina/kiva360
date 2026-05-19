'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAsistenciaSemana, guardarAsistencia } from '@/lib/actions/libro'

type Estado = 'P' | 'A' | 'J'
const CICLO: Estado[] = ['P', 'A', 'J']
const LABEL: Record<Estado, string> = { P: 'Presente', A: 'Ausente', J: 'Justificado' }

const CHIP_STYLE: Record<Estado, React.CSSProperties> = {
  P: { background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7' },
  A: { background: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2' },
  J: { background: '#FFF8E1', color: '#E65100', border: '1px solid #FFE082' },
}

const PCT_COLOR = (p: number | null) =>
  !p ? '#94A3B8' : p >= 90 ? '#2E7D32' : p >= 75 ? '#E65100' : '#C62828'

interface Props {
  cursoId:     string
  cursoNombre: string
  onVerHoja:   (id: string) => void
}

export function TabAsistencia({ cursoId, cursoNombre, onVerHoja }: Props) {
  const [datos,    setDatos]    = useState<Awaited<ReturnType<typeof getAsistenciaSemana>> | null>(null)
  const [cambios,  setCambios]  = useState<Record<string, Record<string, Estado>>>({})
  const [loading,  setLoading]  = useState(true)
  const [guardando,setGuardando]= useState(false)
  const [guardado, setGuardado] = useState(false)

  const hoy = new Date().toISOString().split('T')[0]

  useEffect(() => {
    setLoading(true); setCambios({})
    getAsistenciaSemana(cursoId).then(d => { setDatos(d); setLoading(false) })
  }, [cursoId])

  const getEstado = useCallback((alumnoId: string, fecha: string): Estado | null => {
    const cambio = cambios[alumnoId]?.[fecha]
    if (cambio) return cambio
    const orig = datos?.alumnos.find(a => a.id === alumnoId)?.semana[fecha]
    return (orig as Estado) ?? null
  }, [cambios, datos])

  const toggle = (alumnoId: string, fecha: string) => {
    if (fecha !== hoy) return
    const actual = getEstado(alumnoId, fecha)
    const idx = actual ? CICLO.indexOf(actual) : -1
    const next = CICLO[(idx + 1) % CICLO.length]
    setCambios(prev => ({ ...prev, [alumnoId]: { ...prev[alumnoId], [fecha]: next } }))
    setGuardado(false)
  }

  const marcarTodos = () => {
    if (!datos) return
    const n = { ...cambios }
    datos.alumnos.forEach(a => { if (!n[a.id]) n[a.id] = {}; n[a.id][hoy] = 'P' })
    setCambios(n); setGuardado(false)
  }

  const guardar = async () => {
    if (!datos) return
    setGuardando(true)
    const registros = datos.alumnos
      .map(a => ({ alumno_id: a.id, estado: getEstado(a.id, hoy) ?? 'P' }))
    const result = await guardarAsistencia({ cursoId, fecha: hoy, registros })
    if (result.success) {
      setGuardado(true); setCambios({})
      const nuevos = await getAsistenciaSemana(cursoId)
      setDatos(nuevos)
    }
    setGuardando(false)
  }

  const stats = datos?.alumnos.reduce((acc, a) => {
    const e = getEstado(a.id, hoy)
    if (e === 'P') acc.p++; else if (e === 'A') acc.a++; else if (e === 'J') acc.j++; else acc.sin++
    return acc
  }, { p: 0, a: 0, j: 0, sin: 0 })

  const total   = datos?.alumnos.length ?? 0
  const pctHoy  = stats && total > 0 ? Math.round((stats.p / total) * 100) : null
  const hayPend = Object.keys(cambios).length > 0

  const formatFecha = (f: string) => {
    const d = new Date(f + 'T12:00:00')
    return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  if (loading) return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
      <div style={{ background: '#F1F5F9', height: '20px', borderRadius: '8px', width: '40%', marginBottom: '1rem' }} />
      {[...Array(6)].map((_, i) => <div key={i} style={{ background: '#F8FAFC', height: '44px', borderRadius: '8px', marginBottom: '0.5rem' }} />)}
    </div>
  )

  if (!datos) return null

  return (
    <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
            {cursoNombre} · {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.3rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
            {stats && <>
              <span style={{ color: '#2E7D32', fontWeight: 600 }}>{stats.p} presentes</span>
              {stats.a > 0 && <span style={{ color: '#C62828', fontWeight: 600 }}>{stats.a} ausentes</span>}
              {stats.j > 0 && <span style={{ color: '#E65100', fontWeight: 600 }}>{stats.j} justificados</span>}
              {stats.sin > 0 && <span style={{ color: '#94A3B8' }}>{stats.sin} sin marcar</span>}
              {pctHoy !== null && (
                <span style={{
                  fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '20px',
                  background: pctHoy >= 90 ? '#E8F5E9' : pctHoy >= 75 ? '#FFF8E1' : '#FFEBEE',
                  color: PCT_COLOR(pctHoy)
                }}>{pctHoy}%</span>
              )}
            </>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={marcarTodos} style={{
            padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
            background: 'white', border: '1px solid #E2E8F0', color: '#475569', cursor: 'pointer'
          }}>✓ Todos presentes</button>
          <button onClick={guardar} disabled={guardando || !hayPend} style={{
            padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
            background: guardado ? '#E8F5E9' : '#1976D2', color: guardado ? '#2E7D32' : 'white',
            border: 'none', cursor: hayPend ? 'pointer' : 'not-allowed', opacity: (!hayPend && !guardando) ? 0.5 : 1
          }}>
            {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : '💾 Guardar'}
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              <th style={{ padding: '0.5rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>N°</th>
              <th style={{ padding: '0.5rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.7rem' }}>Estudiante</th>
              <th style={{ padding: '0.5rem 0.4rem', textAlign: 'center', fontWeight: 700, color: '#64748B', fontSize: '0.7rem' }}>Info</th>
              {datos.fechas.map(f => (
                <th key={f} style={{ padding: '0.5rem 0.4rem', textAlign: 'center', minWidth: '70px' }}>
                  <div style={{ fontSize: '0.62rem', color: '#94A3B8', textTransform: 'capitalize' }}>
                    {new Date(f + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'short' })}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: f === hoy ? '#1976D2' : '#475569' }}>
                    {new Date(f + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                  </div>
                </th>
              ))}
              <th style={{ padding: '0.5rem 0.8rem', textAlign: 'center', fontWeight: 700, color: '#64748B', fontSize: '0.7rem' }}>% Mes</th>
              <th style={{ padding: '0.5rem 0.8rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {datos.alumnos.map((a, i) => (
              <tr key={a.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                <td style={{ padding: '0.55rem 0.8rem', color: '#94A3B8', fontSize: '0.72rem' }}>{a.numero}</td>
                <td style={{ padding: '0.55rem 0.8rem', fontWeight: 600, color: '#0F172A' }}>{a.nombre_completo}</td>
                <td style={{ padding: '0.55rem 0.4rem', textAlign: 'center' }}>
                  {a.alumno_sep && <span style={{ fontSize: '0.6rem', fontWeight: 700, background: '#EDE7F6', color: '#4527A0', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>SEP</span>}
                  {a.beneficio_pae && <span style={{ fontSize: '0.6rem', fontWeight: 700, background: '#FFF3E0', color: '#BF360C', padding: '0.1rem 0.35rem', borderRadius: '4px', marginLeft: '2px' }}>PAE</span>}
                </td>
                {datos.fechas.map(f => {
                  const estado = getEstado(a.id, f)
                  const esHoy  = f === hoy
                  return (
                    <td key={f} style={{ padding: '0.55rem 0.4rem', textAlign: 'center' }}>
                      <button
                        onClick={() => toggle(a.id, f)}
                        disabled={!esHoy}
                        title={estado ? LABEL[estado] : 'Sin marcar'}
                        style={{
                          width: '36px', height: '26px', borderRadius: '6px',
                          fontSize: '0.72rem', fontWeight: 700, cursor: esHoy ? 'pointer' : 'default',
                          ...(estado ? CHIP_STYLE[estado] : { background: '#F8FAFC', color: '#CBD5E1', border: '1px solid #F1F5F9' }),
                          transition: 'all 0.15s',
                        }}
                      >
                        {estado ?? '·'}
                      </button>
                    </td>
                  )
                })}
                <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', fontWeight: 700, color: PCT_COLOR(a.pct_mes), fontSize: '0.78rem', fontFamily: 'monospace' }}>
                  {a.pct_mes !== null ? `${a.pct_mes}%${a.pct_mes < 75 ? ' ⚠️' : ''}` : '—'}
                </td>
                <td style={{ padding: '0.55rem 0.8rem' }}>
                  <button onClick={() => onVerHoja(a.id)} style={{ fontSize: '0.72rem', color: '#1976D2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Ver →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div style={{ padding: '0.7rem 1.2rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>Clic para cambiar:</span>
        {(['P','A','J'] as Estado[]).map(e => (
          <span key={e} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '5px', ...CHIP_STYLE[e] }}>
            {e} = {LABEL[e]}
          </span>
        ))}
      </div>
    </div>
  )
}
