'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAsistenciaSemana, guardarAsistencia } from '@/lib/actions/libro'

type Estado = 'P' | 'A' | 'J'
const CICLO: Estado[] = ['P', 'A', 'J']
const LABEL: Record<Estado, string> = { P: 'Presente', A: 'Ausente', J: 'Justificado' }

const CHIP: Record<Estado, React.CSSProperties> = {
  P: { background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' },
  A: { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
  J: { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' },
}

const pctColor = (p: number | null) =>
  !p ? '#9B9A97' : p >= 90 ? '#16A34A' : p >= 75 ? '#D97706' : '#DC2626'

interface Props { cursoId: string; cursoNombre: string; onVerHoja: (id: string) => void }

export function TabAsistencia({ cursoId, cursoNombre, onVerHoja }: Props) {
  const [datos,     setDatos]     = useState<any>(null)
  const [cambios,   setCambios]   = useState<Record<string, Record<string, Estado>>>({})
  const [loading,   setLoading]   = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardado,  setGuardado]  = useState(false)

  const hoy = new Date().toISOString().split('T')[0]

  useEffect(() => {
    setLoading(true); setCambios({})
    getAsistenciaSemana(cursoId).then(d => { setDatos(d); setLoading(false) })
  }, [cursoId])

  const getEstado = useCallback((aId: string, fecha: string): Estado | null => {
    const c = cambios[aId]?.[fecha]
    if (c) return c
    const orig = datos?.alumnos.find((a: any) => a.id === aId)?.semana[fecha]
    return (orig as Estado) ?? null
  }, [cambios, datos])

  const toggle = (aId: string, fecha: string) => {
    if (fecha !== hoy) return
    const actual = getEstado(aId, fecha)
    const idx = actual ? CICLO.indexOf(actual) : -1
    const next = CICLO[(idx + 1) % CICLO.length]
    setCambios(prev => ({ ...prev, [aId]: { ...prev[aId], [fecha]: next } }))
    setGuardado(false)
  }

  const marcarTodos = () => {
    if (!datos) return
    const n = { ...cambios }
    datos.alumnos.forEach((a: any) => { if (!n[a.id]) n[a.id] = {}; n[a.id][hoy] = 'P' })
    setCambios(n); setGuardado(false)
  }

  const guardar = async () => {
    if (!datos) return
    setGuardando(true)
    const registros = datos.alumnos.map((a: any) => ({ alumno_id: a.id, estado: getEstado(a.id, hoy) ?? 'P' }))
    const result = await guardarAsistencia({ cursoId, fecha: hoy, registros })
    if (result.success) {
      setGuardado(true); setCambios({})
      const nuevos = await getAsistenciaSemana(cursoId)
      setDatos(nuevos)
    }
    setGuardando(false)
  }

  const stats = datos?.alumnos.reduce((acc: any, a: any) => {
    const e = getEstado(a.id, hoy)
    if (e === 'P') acc.p++; else if (e === 'A') acc.a++; else if (e === 'J') acc.j++; else acc.sin++
    return acc
  }, { p: 0, a: 0, j: 0, sin: 0 })

  const total  = datos?.alumnos.length ?? 0
  const pctHoy = stats && total > 0 ? Math.round((stats.p / total) * 100) : null
  const hayPend = Object.keys(cambios).length > 0

  if (loading) return (
    <div style={{ background: 'white', borderRadius: '10px', padding: '1.25rem', border: '1px solid #E8E8E5' }}>
      {[...Array(6)].map((_, i) => <div key={i} style={{ height: '36px', background: '#F5F5F3', borderRadius: '5px', marginBottom: '0.5rem' }} />)}
    </div>
  )

  if (!datos) return null

  return (
    <>
      <style>{`
        .ta-wrap { background: white; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; width: 100%; font-family: 'Inter', system-ui, sans-serif; }
        .ta-head { padding: 0.9rem 1.25rem; border-bottom: 1px solid #E8E8E5; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; }
        .ta-head-info { font-size: 0.82rem; font-weight: 600; color: #37352F; letter-spacing: -0.01em; margin-bottom: 0.25rem; }
        .ta-stats { display: flex; gap: 0.75rem; font-size: 0.72rem; flex-wrap: wrap; }
        .ta-stat { font-weight: 600; }
        .ta-pct-badge { font-size: 0.68rem; font-weight: 700; padding: 0.1rem 0.5rem; border-radius: 20px; background: #F0F0EE; }
        .ta-btns { display: flex; gap: 0.5rem; }
        .ta-btn { padding: 0.4rem 0.85rem; border-radius: 7px; font-size: 0.75rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: all 0.12s; border: 1px solid #E8E8E5; background: white; color: #6B6B6B; }
        .ta-btn:hover { border-color: #37352F; color: #37352F; }
        .ta-btn-save { background: #37352F; color: white; border-color: #37352F; }
        .ta-btn-save:hover { background: #1A1A1A; }
        .ta-btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
        .ta-btn-ok { background: #F0FDF4; color: #16A34A; border-color: #BBF7D0; }
        .ta-scroll { overflow-x: auto; }
        .ta-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
        .ta-th { padding: 0.5rem 0.5rem; background: #FAFAF8; border-bottom: 1px solid #E8E8E5; text-align: center; white-space: nowrap; }
        .ta-th-left { text-align: left; padding-left: 1.25rem; }
        .ta-th-text { font-size: 0.6rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; }
        .ta-th-date { font-size: 0.72rem; font-weight: 700; }
        .ta-tr { border-bottom: 1px solid #F5F5F3; }
        .ta-tr:last-child { border-bottom: none; }
        .ta-tr:hover { background: #FAFAF8; }
        .ta-td { padding: 0.5rem 0.5rem; text-align: center; }
        .ta-td-left { padding: 0.5rem 0.5rem 0.5rem 1.25rem; text-align: left; }
        .ta-nombre { font-size: 0.8rem; font-weight: 500; color: #37352F; white-space: nowrap; }
        .ta-badge { font-size: 0.58rem; font-weight: 600; padding: 0.08rem 0.35rem; border-radius: 3px; background: #F0F0EE; color: #6B6B6B; margin-left: 0.3rem; }
        .ta-num { font-size: 0.7rem; color: #C2C0BB; }
        .ta-ver { font-size: 0.72rem; color: #9B9A97; background: none; border: none; cursor: pointer; font-family: inherit; padding: 0.2rem 0.5rem; border-radius: 4px; transition: all 0.12s; }
        .ta-ver:hover { color: #37352F; background: #F0F0EE; }
        .ta-legend { padding: 0.6rem 1.25rem; border-top: 1px solid #F0F0EE; background: #FAFAF8; display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
        .ta-legend-lbl { font-size: 0.65rem; color: #9B9A97; font-weight: 600; }
        .ta-legend-chip { font-size: 0.65rem; font-weight: 700; padding: 0.12rem 0.45rem; border-radius: 4px; }
      `}</style>

      <div className="ta-wrap">
        <div className="ta-head">
          <div>
            <div className="ta-head-info">
              {cursoNombre} · {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div className="ta-stats">
              {stats && <>
                {stats.p > 0 && <span className="ta-stat" style={{ color: '#16A34A' }}>{stats.p} presentes</span>}
                {stats.a > 0 && <span className="ta-stat" style={{ color: '#DC2626' }}>{stats.a} ausentes</span>}
                {stats.j > 0 && <span className="ta-stat" style={{ color: '#D97706' }}>{stats.j} justificados</span>}
                {stats.sin > 0 && <span className="ta-stat" style={{ color: '#9B9A97' }}>{stats.sin} sin marcar</span>}
                {pctHoy !== null && (
                  <span className="ta-pct-badge" style={{ color: pctColor(pctHoy) }}>{pctHoy}%</span>
                )}
              </>}
            </div>
          </div>
          <div className="ta-btns">
            <button className="ta-btn" onClick={marcarTodos}>✓ Todos presentes</button>
            <button
              className={`ta-btn ${guardado ? 'ta-btn-ok' : 'ta-btn-save'}`}
              onClick={guardar}
              disabled={guardando || !hayPend}
            >
              {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : '💾 Guardar'}
            </button>
          </div>
        </div>

        <div className="ta-scroll">
          <table className="ta-table">
            <thead>
              <tr>
                <th className="ta-th ta-th-left" style={{ minWidth: '160px' }}>
                  <span className="ta-th-text">Estudiante</span>
                </th>
                <th className="ta-th"><span className="ta-th-text">Info</span></th>
                {datos.fechas.map((f: string) => (
                  <th key={f} className="ta-th" style={{ minWidth: '64px' }}>
                    <div className="ta-th-text" style={{ textTransform: 'capitalize' }}>
                      {new Date(f + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'short' })}
                    </div>
                    <div className="ta-th-date" style={{ color: f === hoy ? '#37352F' : '#9B9A97' }}>
                      {new Date(f + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }).toUpperCase()}
                    </div>
                  </th>
                ))}
                <th className="ta-th"><span className="ta-th-text">% Mes</span></th>
                <th className="ta-th"></th>
              </tr>
            </thead>
            <tbody>
              {datos.alumnos.map((a: any) => (
                <tr key={a.id} className="ta-tr">
                  <td className="ta-td-left">
                    <span className="ta-nombre">{a.nombre_completo}</span>
                  </td>
                  <td className="ta-td">
                    {a.alumno_sep    && <span className="ta-badge">SEP</span>}
                    {a.beneficio_pae && <span className="ta-badge">PAE</span>}
                  </td>
                  {datos.fechas.map((f: string) => {
                    const estado = getEstado(a.id, f)
                    const esHoy  = f === hoy
                    return (
                      <td key={f} className="ta-td">
                        <button
                          onClick={() => toggle(a.id, f)}
                          disabled={!esHoy}
                          title={estado ? LABEL[estado] : 'Sin marcar'}
                          style={{
                            width: '34px', height: '25px', borderRadius: '5px',
                            fontSize: '0.7rem', fontWeight: 700,
                            cursor: esHoy ? 'pointer' : 'default',
                            fontFamily: 'inherit',
                            transition: 'all 0.12s',
                            ...(estado ? CHIP[estado] : { background: '#F5F5F3', color: '#C2C0BB', border: '1px solid #EBEBEB' }),
                          }}
                        >
                          {estado ?? '·'}
                        </button>
                      </td>
                    )
                  })}
                  <td className="ta-td" style={{ fontWeight: 700, color: pctColor(a.pct_mes), fontVariantNumeric: 'tabular-nums', fontSize: '0.78rem' }}>
                    {a.pct_mes !== null ? `${a.pct_mes}%${a.pct_mes < 75 ? ' ⚠️' : ''}` : '—'}
                  </td>
                  <td className="ta-td">
                    <button className="ta-ver" onClick={() => onVerHoja(a.id)}>Ver →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ta-legend">
          <span className="ta-legend-lbl">Clic para cambiar:</span>
          {(['P','A','J'] as Estado[]).map(e => (
            <span key={e} className="ta-legend-chip" style={CHIP[e]}>{e} = {LABEL[e]}</span>
          ))}
        </div>
      </div>
    </>
  )
}
