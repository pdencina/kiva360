'use client'

import { useState, useEffect } from 'react'
import { getHojaVidaAlumno } from '@/lib/actions/libro'

interface Props { alumnoId: string | null; onVolver: () => void }

const pctColor = (p: number | null) =>
  !p ? '#9B9A97' : p >= 90 ? '#16A34A' : p >= 75 ? '#D97706' : '#DC2626'

const notaColor = (n: number | null) =>
  !n ? '#9B9A97' : n >= 6 ? '#16A34A' : n >= 4 ? '#D97706' : '#DC2626'

const formatN = (n: number | null) =>
  n === null ? '—' : n.toFixed(1).replace('.', ',')

export function TabHojaVida({ alumnoId, onVolver }: Props) {
  const [datos,   setDatos]   = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!alumnoId) return
    setLoading(true)
    getHojaVidaAlumno(alumnoId).then(d => { setDatos(d); setLoading(false) })
  }, [alumnoId])

  if (!alumnoId) return (
    <div style={{ background: 'white', border: '1px solid #E8E8E5', borderRadius: '10px', padding: '2.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
      <p style={{ fontSize: '0.82rem', color: '#9B9A97' }}>
        Haz clic en <strong style={{ color: '#37352F' }}>Ver →</strong> junto a un alumno para ver su hoja de vida.
      </p>
    </div>
  )

  if (loading) return (
    <div style={{ background: 'white', border: '1px solid #E8E8E5', borderRadius: '10px', padding: '1.5rem' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: i === 0 ? '28px' : '60px', background: '#F5F5F3', borderRadius: '6px', marginBottom: '0.75rem', width: i === 0 ? '30%' : '100%' }} />
      ))}
    </div>
  )

  if (!datos) return null

  const { alumno, pct_mes, presentes, total_dias, notas } = datos
  const nombreCompleto = [alumno.apellido_paterno, alumno.apellido_materno, alumno.nombre].filter(Boolean).join(' ')
  const iniciales = `${alumno.nombre?.[0] ?? ''}${alumno.apellido_paterno?.[0] ?? ''}`.toUpperCase()

  return (
    <>
      <style>{`
        .hv-wrap { display: flex; flex-direction: column; gap: 1rem; width: 100%; font-family: 'Inter', system-ui, sans-serif; }
        .hv-back { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: #9B9A97; font-family: inherit; padding: 0; display: flex; align-items: center; gap: 0.4rem; transition: color 0.12s; }
        .hv-back:hover { color: #37352F; }
        .hv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .hv-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.25rem; }
        .hv-card-title { font-size: 0.75rem; font-weight: 600; color: #37352F; margin-bottom: 0.9rem; letter-spacing: -0.01em; }
        .hv-avatar { width: 42px; height: 42px; border-radius: 8px; background: #F0F0EE; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; color: #6B6B6B; flex-shrink: 0; }
        .hv-nombre { font-size: 1rem; font-weight: 700; color: #37352F; letter-spacing: -0.02em; margin-bottom: 0.2rem; }
        .hv-curso  { font-size: 0.75rem; color: #9B9A97; margin-bottom: 0.5rem; }
        .hv-badges { display: flex; gap: 0.3rem; flex-wrap: wrap; }
        .hv-badge  { font-size: 0.6rem; font-weight: 600; padding: 0.12rem 0.45rem; border-radius: 3px; background: #F0F0EE; color: #6B6B6B; }
        .hv-data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #F0F0EE; }
        .hv-data-label { font-size: 0.62rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.2rem; }
        .hv-data-val { font-size: 0.82rem; font-weight: 600; color: #37352F; }
        .hv-pct { font-size: 2rem; font-weight: 800; letter-spacing: -0.05em; line-height: 1; margin-bottom: 0.25rem; }
        .hv-pct-sub { font-size: 0.75rem; color: #9B9A97; margin-bottom: 0.75rem; }
        .hv-bar-track { height: 5px; background: #F0F0EE; border-radius: 10px; overflow: hidden; margin-bottom: 0.75rem; }
        .hv-bar-fill { height: 100%; border-radius: 10px; transition: width 0.8s ease; }
        .hv-alert { background: #FAFAF8; border: 1px solid #E8E8E5; border-radius: 7px; padding: 0.6rem 0.8rem; font-size: 0.73rem; color: #6B6B6B; }
        .hv-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
        .hv-th { padding: 0.5rem 0.75rem; text-align: left; font-size: 0.62rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; background: #FAFAF8; border-bottom: 1px solid #E8E8E5; }
        .hv-td { padding: 0.55rem 0.75rem; border-bottom: 1px solid #F5F5F3; color: #37352F; }
        .hv-tr:last-child td { border-bottom: none; }
      `}</style>

      <div className="hv-wrap">
        <button className="hv-back" onClick={onVolver}>← Volver al libro</button>

        <div className="hv-grid">
          {/* Datos personales */}
          <div className="hv-card">
            <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '0.25rem' }}>
              <div className="hv-avatar">{iniciales}</div>
              <div>
                <div className="hv-nombre">{nombreCompleto}</div>
                <div className="hv-curso">{alumno.cursos?.nombre} · {alumno.cursos?.nivel}</div>
                <div className="hv-badges">
                  {alumno.alumno_sep        && <span className="hv-badge">SEP</span>}
                  {alumno.beneficio_pae     && <span className="hv-badge">PAE</span>}
                  {alumno.beneficio_tne     && <span className="hv-badge">TNE</span>}
                  {alumno.prioridad_sinae   && <span className="hv-badge">SINAE P{alumno.prioridad_sinae}</span>}
                </div>
              </div>
            </div>
            <div className="hv-data-grid">
              <div>
                <div className="hv-data-label">RUT</div>
                <div className="hv-data-val">{alumno.rut ?? '—'}</div>
              </div>
              <div>
                <div className="hv-data-label">Nacimiento</div>
                <div className="hv-data-val">{alumno.fecha_nacimiento ? new Date(alumno.fecha_nacimiento).toLocaleDateString('es-CL') : '—'}</div>
              </div>
            </div>
          </div>

          {/* Asistencia */}
          <div className="hv-card">
            <div className="hv-card-title">Asistencia este mes</div>
            <div className="hv-pct" style={{ color: pctColor(pct_mes) }}>
              {pct_mes !== null ? `${pct_mes}%` : '—'}
            </div>
            <div className="hv-pct-sub">{presentes} de {total_dias} días</div>
            <div className="hv-bar-track">
              <div className="hv-bar-fill" style={{ width: `${pct_mes ?? 0}%`, background: pctColor(pct_mes) }} />
            </div>
            {pct_mes !== null && pct_mes < 75 && (
              <div className="hv-alert">
                ⚠️ Asistencia bajo el mínimo reglamentario (75%). Notificar al apoderado.
              </div>
            )}
            {pct_mes !== null && pct_mes >= 90 && (
              <div className="hv-alert">✓ Asistencia en buen estado.</div>
            )}
          </div>
        </div>

        {/* Notas */}
        {notas?.length > 0 && (
          <div className="hv-card">
            <div className="hv-card-title">Notas recientes</div>
            <table className="hv-table">
              <thead>
                <tr>
                  <th className="hv-th">Evaluación</th>
                  <th className="hv-th">Asignatura</th>
                  <th className="hv-th">Ponderación</th>
                  <th className="hv-th" style={{ textAlign: 'center' }}>Nota</th>
                </tr>
              </thead>
              <tbody>
                {notas.map((n: any, i: number) => (
                  <tr key={i} className="hv-tr">
                    <td className="hv-td" style={{ fontWeight: 500 }}>{n.evaluaciones?.titulo ?? '—'}</td>
                    <td className="hv-td" style={{ color: '#9B9A97' }}>{n.evaluaciones?.asignatura ?? '—'}</td>
                    <td className="hv-td" style={{ color: '#9B9A97' }}>{n.evaluaciones?.ponderacion ? `${n.evaluaciones.ponderacion}%` : '—'}</td>
                    <td className="hv-td" style={{ textAlign: 'center', fontWeight: 700, color: notaColor(n.nota), fontVariantNumeric: 'tabular-nums' }}>
                      {formatN(n.nota)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
