'use client'

// ═══════════════════════════════════════════════════════════════
// TabNotas
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from 'react'
import { getNotasCurso, guardarNota } from '@/lib/actions/libro'
import { calcularPromedio } from '@/lib/utils/notas'

type NotaMap = Map<string, Map<string, number | null>>

interface TabNotasProps { cursoId: string; cursoNombre: string }

const notaColor = (n: number | null) =>
  !n ? '#94A3B8' : n >= 6 ? '#2E7D32' : n >= 4 ? '#E65100' : '#C62828'

const notaBg = (n: number | null) =>
  !n ? '#F8FAFC' : n >= 6 ? '#E8F5E9' : n >= 4 ? '#FFF8E1' : '#FFEBEE'

export function TabNotas({ cursoId, cursoNombre }: TabNotasProps) {
  const [datos,  setDatos]  = useState<Awaited<ReturnType<typeof getNotasCurso>> | null>(null)
  const [notas,  setNotas]  = useState<NotaMap>(new Map())
  const [loading,setLoading]= useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getNotasCurso(cursoId).then(d => {
      setDatos(d)
      const m: NotaMap = new Map()
      for (const n of d.notas) {
        if (!m.has(n.alumno_id)) m.set(n.alumno_id, new Map())
        m.get(n.alumno_id)!.set(n.evaluacion_id, n.nota)
      }
      setNotas(m)
      setLoading(false)
    })
  }, [cursoId])

  const getNota = (aid: string, eid: string) => notas.get(aid)?.get(eid) ?? null

  const handleNota = async (aid: string, eid: string, val: string) => {
    const num = val === '' ? null : parseFloat(val.replace(',', '.'))
    if (num !== null && (isNaN(num) || num < 1 || num > 7)) return
    setNotas(prev => {
      const m = new Map(prev)
      if (!m.has(aid)) m.set(aid, new Map())
      m.get(aid)!.set(eid, num)
      return m
    })
    const key = `${eid}-${aid}`
    setSaving(key)
    await guardarNota(eid, aid, num)
    setSaving(null)
  }

  if (loading) return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
      {[...Array(5)].map((_, i) => <div key={i} style={{ background: '#F8FAFC', height: '40px', borderRadius: '8px', marginBottom: '0.5rem' }} />)}
    </div>
  )

  if (!datos || datos.evaluaciones.length === 0) return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', border: '1px solid #E2E8F0', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
      <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.3rem' }}>Sin evaluaciones</div>
      <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Crea evaluaciones desde el módulo de Evaluaciones.</div>
    </div>
  )

  return (
    <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700, color: '#0F172A' }}>{cursoNombre} · Notas {new Date().getFullYear()}</div>
        <button style={{ padding: '0.4rem 0.8rem', border: '1px solid #E2E8F0', borderRadius: '8px', background: 'white', color: '#475569', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
          📥 Exportar
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              <th style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.7rem', position: 'sticky', left: 0, background: '#F8FAFC' }}>
                Estudiante
              </th>
              {datos.evaluaciones.map(ev => (
                <th key={ev.id} style={{ padding: '0.55rem 0.5rem', textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', maxWidth: '76px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ev.titulo}>
                    {ev.titulo.length > 10 ? ev.titulo.slice(0, 9) + '…' : ev.titulo}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#94A3B8', fontWeight: 400 }}>
                    {ev.ponderacion ? `${ev.ponderacion}%` : '—'}
                  </div>
                </th>
              ))}
              <th style={{ padding: '0.55rem 0.5rem', textAlign: 'center', background: '#EFF6FF', color: '#1565C0', fontWeight: 700, fontSize: '0.72rem', minWidth: '72px' }}>
                Prom.
              </th>
            </tr>
          </thead>
          <tbody>
            {datos.alumnos.map(a => {
              const notasAlumno = datos.evaluaciones.map(ev => ({ evaluacion_id: ev.id, nota: getNota(a.id, ev.id) }))
              const prom = calcularPromedio(notasAlumno, datos.evaluaciones)
              return (
                <tr key={a.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.55rem 0.8rem', fontWeight: 600, color: '#0F172A', position: 'sticky', left: 0, background: 'white' }}>
                    {a.nombre_completo}
                    {a.alumno_sep && <span style={{ marginLeft: '4px', fontSize: '0.6rem', fontWeight: 700, background: '#EDE7F6', color: '#4527A0', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>SEP</span>}
                  </td>
                  {datos.evaluaciones.map(ev => {
                    const nota = getNota(a.id, ev.id)
                    const key  = `${ev.id}-${a.id}`
                    return (
                      <td key={ev.id} style={{ padding: '0.4rem', textAlign: 'center' }}>
                        <NotaInput value={nota} saving={saving === key} onChange={v => handleNota(a.id, ev.id, v)} />
                      </td>
                    )
                  })}
                  <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.85rem', background: '#EFF6FF', color: notaColor(prom) }}>
                    {prom !== null ? prom.toFixed(1).replace('.', ',') : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '0.7rem 1.2rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {datos.evaluaciones.map(ev => (
          <span key={ev.id} style={{ fontSize: '0.68rem', background: '#F1F5F9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '20px' }}>
            {ev.titulo}: {ev.ponderacion ?? 0}%
          </span>
        ))}
      </div>
    </div>
  )
}

function NotaInput({ value, saving, onChange }: { value: number | null; saving: boolean; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [text,    setText]    = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const start = () => { setText(value !== null ? value.toFixed(1).replace('.', ',') : ''); setEditing(true); setTimeout(() => ref.current?.select(), 30) }
  const commit = () => { setEditing(false); onChange(text) }

  if (saving) return <div style={{ width: '44px', height: '28px', background: '#EFF6FF', borderRadius: '6px', margin: '0 auto', animation: 'pulse 1s infinite' }} />
  if (editing) return (
    <input ref={ref} value={text} onChange={e => setText(e.target.value)}
      onBlur={commit} onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Tab') commit(); if (e.key === 'Escape') setEditing(false) }}
      style={{ width: '52px', textAlign: 'center', fontSize: '0.82rem', border: '1.5px solid #1976D2', borderRadius: '6px', padding: '0.25rem 0.2rem', outline: 'none' }}
      placeholder="1-7" />
  )
  return (
    <button onClick={start} style={{
      width: '44px', height: '28px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700,
      cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.15s',
      background: notaBg(value), color: notaColor(value),
    }}>
      {value !== null ? value.toFixed(1).replace('.', ',') : '—'}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
// TabHojaVida
// ═══════════════════════════════════════════════════════════════
import { getHojaVidaAlumno } from '@/lib/actions/libro'

interface TabHojaProps { alumnoId: string | null; onVolver: () => void }

export function TabHojaVida({ alumnoId, onVolver }: TabHojaProps) {
  const [datos,  setDatos]  = useState<Awaited<ReturnType<typeof getHojaVidaAlumno>> | null>(null)
  const [loading,setLoading]= useState(false)

  useEffect(() => {
    if (!alumnoId) return
    setLoading(true)
    getHojaVidaAlumno(alumnoId).then(d => { setDatos(d); setLoading(false) })
  }, [alumnoId])

  if (!alumnoId) return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', border: '1px solid #E2E8F0', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
      <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Haz clic en «Ver →» junto a un alumno para ver su hoja de vida.</div>
    </div>
  )

  if (loading) return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
      {[...Array(4)].map((_, i) => <div key={i} style={{ background: '#F8FAFC', height: '50px', borderRadius: '8px', marginBottom: '0.8rem' }} />)}
    </div>
  )

  if (!datos) return null

  const { alumno, pct_mes, presentes, total_dias, notas } = datos
  const nombre = [alumno.apellido_paterno, alumno.apellido_materno, alumno.nombre].filter(Boolean).join(' ')
  const iniciales = `${alumno.nombre[0]}${alumno.apellido_paterno?.[0] ?? ''}`.toUpperCase()
  const pctColor = !pct_mes ? '#94A3B8' : pct_mes >= 90 ? '#2E7D32' : pct_mes >= 75 ? '#E65100' : '#C62828'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button onClick={onVolver} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        ← Volver al libro
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Datos personales */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: '#1565C0', flexShrink: 0 }}>
              {iniciales}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>{nombre}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                {(alumno as any).cursos?.nombre} · {(alumno as any).cursos?.nivel}
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                {alumno.alumno_sep    && <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#EDE7F6', color: '#4527A0', padding: '0.15rem 0.45rem', borderRadius: '20px' }}>⭐ SEP</span>}
                {alumno.beneficio_pae && <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#FFF3E0', color: '#BF360C', padding: '0.15rem 0.45rem', borderRadius: '20px' }}>🍽️ PAE</span>}
                {alumno.beneficio_tne && <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#E3F2FD', color: '#0D47A1', padding: '0.15rem 0.45rem', borderRadius: '20px' }}>💳 TNE</span>}
                {alumno.prioridad_sinae && <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#FFEBEE', color: '#C62828', padding: '0.15rem 0.45rem', borderRadius: '20px' }}>SINAE P{alumno.prioridad_sinae}</span>}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.8rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.82rem' }}>
            <div><div style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.2rem' }}>RUT</div><div style={{ fontWeight: 600 }}>{alumno.rut ?? '—'}</div></div>
            <div><div style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.2rem' }}>Nacimiento</div><div style={{ fontWeight: 600 }}>{alumno.fecha_nacimiento ? new Date(alumno.fecha_nacimiento + 'T12:00:00').toLocaleDateString('es-CL') : '—'}</div></div>
          </div>
        </div>

        {/* Asistencia */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.2rem' }}>
          <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.8rem' }}>Asistencia este mes</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.8rem', marginBottom: '0.6rem' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: pctColor, lineHeight: 1, fontFamily: 'monospace' }}>
              {pct_mes !== null ? `${pct_mes}%` : '—'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', paddingBottom: '0.3rem' }}>
              {presentes} de {total_dias} días
            </div>
          </div>
          <div style={{ height: '10px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div style={{ height: '100%', borderRadius: '10px', width: `${pct_mes ?? 0}%`, background: pct_mes && pct_mes >= 90 ? '#4CAF50' : pct_mes && pct_mes >= 75 ? '#FF9800' : '#F44336', transition: 'width 0.8s ease' }} />
          </div>
          {pct_mes !== null && pct_mes < 75 && (
            <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '0.6rem 0.8rem', fontSize: '0.75rem', color: '#C62828', fontWeight: 600 }}>
              ⚠️ Asistencia bajo el 75% reglamentario. Notificar al apoderado.
            </div>
          )}
        </div>
      </div>

      {/* Notas recientes */}
      {notas.length > 0 && (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #F1F5F9', fontWeight: 700, color: '#0F172A' }}>
            Notas recientes
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '0.5rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>Evaluación</th>
                <th style={{ padding: '0.5rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>Asignatura</th>
                <th style={{ padding: '0.5rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>Fecha</th>
                <th style={{ padding: '0.5rem 0.8rem', textAlign: 'center', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>Nota</th>
              </tr>
            </thead>
            <tbody>
              {notas.map((n: any, i: number) => (
                <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.55rem 0.8rem', fontWeight: 600 }}>{n.evaluaciones?.titulo ?? '—'}</td>
                  <td style={{ padding: '0.55rem 0.8rem', color: '#64748B' }}>{n.evaluaciones?.asignatura ?? '—'}</td>
                  <td style={{ padding: '0.55rem 0.8rem', color: '#64748B' }}>
                    {n.evaluaciones?.fecha ? new Date(n.evaluaciones.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                  <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center', fontWeight: 800, fontFamily: 'monospace', color: notaColor(n.nota) }}>
                    {n.nota !== null ? n.nota.toFixed(1).replace('.', ',') : '—'}
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
