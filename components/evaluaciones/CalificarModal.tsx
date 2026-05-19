'use client'

import { useState, useEffect } from 'react'
import { getEvaluacionConNotas, guardarNotasMasivas } from '@/lib/actions/evaluaciones'

type DatosEval = Awaited<ReturnType<typeof getEvaluacionConNotas>>

const notaColor = (n: number | null) =>
  !n ? '#94A3B8' : n >= 6 ? '#2E7D32' : n >= 4 ? '#E65100' : '#C62828'

const notaBg = (n: number | null) =>
  !n ? '#F8FAFC' : n >= 6 ? '#E8F5E9' : n >= 4 ? '#FFF8E1' : '#FFEBEE'

// Validar si un string es una nota válida (1,0 - 7,0)
const esNotaValida = (raw: string): boolean => {
  if (!raw) return false
  const num = parseFloat(raw.replace(',', '.'))
  return !isNaN(num) && num >= 1.0 && num <= 7.0
}

const parseNota = (raw: string): number | null => {
  if (!raw) return null
  const num = parseFloat(raw.replace(',', '.'))
  return isNaN(num) ? null : num
}

interface Props {
  evalId:   string
  onCerrar: () => void
}

export function CalificarModal({ evalId, onCerrar }: Props) {
  const [datos,     setDatos]     = useState<DatosEval | null>(null)
  const [notas,     setNotas]     = useState<Record<string, string>>({})
  const [loading,   setLoading]   = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardado,  setGuardado]  = useState(false)
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null)

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

  const handleCambioNota = (alumnoId: string, valor: string) => {
    // Permitir vacío (borrar nota)
    if (valor === '') {
      setNotas(prev => ({ ...prev, [alumnoId]: '' }))
      setGuardado(false)
      setErrorMsg(null)
      return
    }

    // Solo permitir dígitos, coma y punto — máximo formato: X,X o X.X
    if (!/^[1-9]([,.]([0-9])?)?$|^7([,.][0]?)?$/.test(valor) && valor !== '1' && valor !== '2' &&
        valor !== '3' && valor !== '4' && valor !== '5' && valor !== '6' && valor !== '7') {
      // Si no cumple el patrón estricto, igual dejar escribir pero marcar como inválido
    }

    // Bloquear valores mayores a 7 inmediatamente
    const num = parseFloat(valor.replace(',', '.'))
    if (!isNaN(num) && num > 7.0) {
      setErrorMsg('La nota máxima es 7,0')
      return
    }

    setNotas(prev => ({ ...prev, [alumnoId]: valor }))
    setGuardado(false)
    setErrorMsg(null)
  }

  const guardar = async () => {
    if (!datos) return

    // Validar todas las notas ingresadas antes de guardar
    const invalidas = datos.alumnos.filter(a => {
      const raw = notas[a.id]
      if (!raw) return false // Sin nota = ok, no se guarda
      const num = parseNota(raw)
      return num === null || num < 1.0 || num > 7.0
    })

    if (invalidas.length > 0) {
      setErrorMsg(`⚠️ ${invalidas.length} nota(s) fuera del rango 1,0 – 7,0. Corrígelas antes de guardar.`)
      return
    }

    setGuardando(true)
    setErrorMsg(null)

    const registros = datos.alumnos.map(a => {
      const raw = notas[a.id]
      const num = parseNota(raw ?? '')
      // Solo guardar si está en rango válido
      const notaFinal = num !== null && num >= 1.0 && num <= 7.0 ? num : null
      return { alumno_id: a.id, nota: notaFinal }
    })

    await guardarNotasMasivas(evalId, registros)
    const updated = await getEvaluacionConNotas(evalId)
    setDatos(updated)
    setGuardado(true)
    setGuardando(false)
  }

  // Stats en tiempo real — solo notas válidas
  const notasNum = Object.values(notas)
    .map(v => parseNota(v))
    .filter((n): n is number => n !== null && n >= 1.0 && n <= 7.0)

  const promedio   = notasNum.length > 0 ? (notasNum.reduce((a, b) => a + b, 0) / notasNum.length) : null
  const aprobados  = notasNum.filter(n => n >= 4.0).length
  const reprobados = notasNum.filter(n => n < 4.0).length

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
          <div style={{ padding: '0.8rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '1.5rem', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
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
            {/* Indicador rango */}
            <div style={{ marginLeft: 'auto', background: '#F1F5F9', borderRadius: '8px', padding: '0.4rem 0.7rem', fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>
              Rango válido: 1,0 – 7,0
            </div>
          </div>
        )}

        {/* Error de validación */}
        {errorMsg && (
          <div style={{ margin: '0.5rem 1.5rem 0', background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '9px', padding: '0.6rem 1rem', fontSize: '0.8rem', color: '#C62828', fontWeight: 600, flexShrink: 0 }}>
            {errorMsg}
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
                  <th style={{ padding: '0.5rem 0', textAlign: 'center', fontWeight: 700, color: '#64748B', fontSize: '0.68rem', borderBottom: '1.5px solid #E2E8F0', width: '120px' }}>
                    Nota (1,0 – 7,0)
                  </th>
                </tr>
              </thead>
              <tbody>
                {datos.alumnos.map(a => {
                  const raw    = notas[a.id] ?? ''
                  const num    = parseNota(raw)
                  const valida = esNotaValida(raw)
                  const fueraRango = raw !== '' && (num === null || num < 1.0 || num > 7.0)

                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '0.55rem 0', color: '#94A3B8', fontSize: '0.72rem' }}>{a.numero}</td>
                      <td style={{ padding: '0.55rem 0', fontWeight: 600, color: '#0F172A' }}>
                        {a.nombre_completo}
                        {a.alumno_sep && <span style={{ marginLeft: '4px', fontSize: '0.58rem', fontWeight: 700, background: '#EDE7F6', color: '#4527A0', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>SEP</span>}
                      </td>
                      <td style={{ padding: '0.4rem 0', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                          <input
                            type="text"
                            value={raw}
                            onChange={e => handleCambioNota(a.id, e.target.value)}
                            onBlur={e => {
                              // Al salir del campo, corregir formato si es válido
                              const num = parseNota(e.target.value)
                              if (num !== null && num >= 1.0 && num <= 7.0) {
                                setNotas(prev => ({ ...prev, [a.id]: num.toFixed(1).replace('.', ',') }))
                              }
                            }}
                            placeholder="—"
                            maxLength={3}
                            style={{
                              width: '64px', textAlign: 'center',
                              padding: '0.3rem 0.4rem', fontSize: '0.88rem', fontWeight: 700,
                              border: `1.5px solid ${fueraRango ? '#F44336' : valida ? notaColor(num) + '66' : '#E2E8F0'}`,
                              borderRadius: '8px', outline: 'none',
                              background: fueraRango ? '#FFEBEE' : valida ? notaBg(num) : 'white',
                              color: fueraRango ? '#C62828' : valida ? notaColor(num) : '#94A3B8',
                              fontFamily: 'monospace',
                              transition: 'all 0.15s',
                            }}
                          />
                          {fueraRango && (
                            <span title="Fuera del rango 1,0-7,0" style={{ color: '#F44336', fontSize: '0.85rem', cursor: 'default' }}>⚠️</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', flexShrink: 0, alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginRight: 'auto' }}>
            {notasNum.length} de {datos?.alumnos.length ?? 0} notas ingresadas
          </span>
          <button onClick={onCerrar} style={{ padding: '0.55rem 1.1rem', background: 'white', color: '#475569', border: '1.5px solid #E2E8F0', borderRadius: '9px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando || loading} style={{
            padding: '0.55rem 1.4rem', borderRadius: '9px', fontSize: '0.82rem', fontWeight: 700,
            border: 'none', cursor: (guardando || loading) ? 'not-allowed' : 'pointer',
            background: guardado ? '#E8F5E9' : '#1976D2',
            color:      guardado ? '#2E7D32' : 'white',
            opacity: (guardando || loading) ? 0.6 : 1,
            transition: 'all 0.2s',
          }}>
            {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : '💾 Guardar notas'}
          </button>
        </div>
      </div>
    </div>
  )
}
