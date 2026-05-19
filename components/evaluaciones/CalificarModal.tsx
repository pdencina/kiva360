'use client'

import { useState, useEffect } from 'react'
import { getEvaluacionConNotas, guardarNotasMasivas } from '@/lib/actions/evaluaciones'

type DatosEval = Awaited<ReturnType<typeof getEvaluacionConNotas>>

const notaColor = (n: number | null) =>
  !n ? '#94A3B8' : n >= 6 ? '#2E7D32' : n >= 4 ? '#E65100' : '#C62828'

const notaBg = (n: number | null) =>
  !n ? '#F8FAFC' : n >= 6 ? '#E8F5E9' : n >= 4 ? '#FFF8E1' : '#FFEBEE'

interface Props {
  evalId:   string
  onCerrar: () => void
}

export function CalificarModal({ evalId, onCerrar }: Props) {
  const [datos,    setDatos]    = useState<DatosEval | null>(null)
  const [notas,    setNotas]    = useState<Record<string, string>>({})
  const [loading,  setLoading]  = useState(true)
  const [guardando,setGuardando]= useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    getEvaluacionConNotas(evalId).then(d => {
      setDatos(d)
      if (d) {
        const m: Record<string, string> = {}
        d.alumnos.forEach(a => {
          if (a.nota !== null) m[a.id] = a.nota.toFixed(1).replace('.', ',')
        })
        setNotas(m)
      }
      setLoading(false)
    })
  }, [evalId])

  const guardar = async () => {
    if (!datos) return
    setGuardando(true)
    const registros = datos.alumnos.map(a => {
      const raw = notas[a.id]
      const num = raw ? parseFloat(raw.replace(',', '.')) : null
      return { alumno_id: a.id, nota: num && !isNaN(num) ? num : null }
    })
    await guardarNotasMasivas(evalId, registros)
    // Recalcular stats
    const updated = await getEvaluacionConNotas(evalId)
    setDatos(updated)
    setGuardado(true)
    setGuardando(false)
  }

  // Stats en tiempo real
  const notasNum = Object.values(notas)
    .map(v => parseFloat(v.replace(',', '.')))
    .filter(n => !isNaN(n) && n >= 1 && n <= 7)

  const promedio   = notasNum.length > 0 ? (notasNum.reduce((a, b) => a + b, 0) / notasNum.length) : null
  const aprobados  = notasNum.filter(n => n >= 4).length
  const reprobados = notasNum.filter(n => n < 4).length

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }} onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div style={{
        background: 'white', borderRadius: '16px',
        width: '100%', maxWidth: '680px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 72px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
              📊 Calificar — {datos?.evaluacion.titulo ?? '...'}
            </div>
            {datos && (
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                {(datos.evaluacion as any).cursos?.nombre} · {datos.evaluacion.asignatura} · {datos.evaluacion.ponderacion ? `${datos.evaluacion.ponderacion}%` : 'Sin ponderación'}
              </div>
            )}
          </div>
          <button onClick={onCerrar} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#64748B' }}>✕</button>
        </div>

        {/* Stats en tiempo real */}
        {!loading && datos && (
          <div style={{ padding: '0.8rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '1.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: notaColor(promedio), fontFamily: 'monospace' }}>
                {promedio !== null ? promedio.toFixed(1).replace('.', ',') : '—'}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>PROMEDIO</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2E7D32' }}>{aprobados}</div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>APROBADOS</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#C62828' }}>{reprobados}</div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>REPROBADOS</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#94A3B8' }}>{(datos?.alumnos.length ?? 0) - notasNum.length}</div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>SIN NOTA</div>
            </div>
          </div>
        )}

        {/* Lista de alumnos */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1.5rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>Cargando alumnos...</div>
          ) : !datos ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>No se encontró la evaluación</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.5rem 0', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem', borderBottom: '1.5px solid #E2E8F0' }}>N°</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem', borderBottom: '1.5px solid #E2E8F0' }}>Estudiante</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'center', fontWeight: 700, color: '#64748B', fontSize: '0.68rem', borderBottom: '1.5px solid #E2E8F0', width: '100px' }}>Nota (1,0–7,0)</th>
                </tr>
              </thead>
              <tbody>
                {datos.alumnos.map(a => {
                  const raw = notas[a.id] ?? ''
                  const num = raw ? parseFloat(raw.replace(',', '.')) : null
                  const valida = num !== null && !isNaN(num) && num >= 1 && num <= 7
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '0.55rem 0', color: '#94A3B8', fontSize: '0.72rem' }}>{a.numero}</td>
                      <td style={{ padding: '0.55rem 0', fontWeight: 600, color: '#0F172A' }}>
                        {a.nombre_completo}
                        {a.alumno_sep && <span style={{ marginLeft: '4px', fontSize: '0.58rem', fontWeight: 700, background: '#EDE7F6', color: '#4527A0', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>SEP</span>}
                      </td>
                      <td style={{ padding: '0.4rem 0', textAlign: 'center' }}>
                        <input
                          type="text"
                          value={raw}
                          onChange={e => {
                            setNotas(prev => ({ ...prev, [a.id]: e.target.value }))
                            setGuardado(false)
                          }}
                          placeholder="—"
                          style={{
                            width: '70px', textAlign: 'center',
                            padding: '0.3rem 0.4rem', fontSize: '0.88rem', fontWeight: 700,
                            border: `1.5px solid ${raw && !valida ? '#FFCDD2' : valida ? notaColor(num) + '66' : '#E2E8F0'}`,
                            borderRadius: '8px', outline: 'none',
                            background: valida ? notaBg(num) : raw && !valida ? '#FFEBEE' : 'white',
                            color: valida ? notaColor(num) : raw ? '#C62828' : '#94A3B8',
                            fontFamily: 'monospace',
                            transition: 'all 0.15s',
                          }}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onCerrar} style={{ padding: '0.55rem 1.1rem', background: 'white', color: '#475569', border: '1.5px solid #E2E8F0', borderRadius: '9px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando || loading} style={{
            padding: '0.55rem 1.4rem', borderRadius: '9px', fontSize: '0.82rem', fontWeight: 700,
            border: 'none', cursor: 'pointer',
            background: guardado ? '#E8F5E9' : '#1976D2',
            color:      guardado ? '#2E7D32' : 'white',
            opacity: (guardando || loading) ? 0.6 : 1,
          }}>
            {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : '💾 Guardar notas'}
          </button>
        </div>
      </div>
    </div>
  )
}
