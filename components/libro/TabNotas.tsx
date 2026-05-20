'use client'

import { useState, useEffect, useRef } from 'react'
import { getNotasCurso, guardarNota } from '@/lib/actions/libro'
import { calcularPromedio } from '@/lib/utils/notas'

interface Props { cursoId: string; cursoNombre: string }

type NotaMap = Map<string, Map<string, number | null>>
type NotaRow = { evaluacion_id: string; alumno_id: string; nota: number | null }
type EvalRow = { id: string; titulo: string; tipo?: string | null; ponderacion: number | null; asignatura?: string | null }
type AlumnoRow = { id: string; nombre_completo: string; alumno_sep?: boolean | null }
type Data = { evaluaciones: EvalRow[]; alumnos: AlumnoRow[]; notas: NotaRow[] }

const notaColor = (n: number | null): string =>
  n === null ? '#9B9A97' : n >= 6 ? '#16A34A' : n >= 4 ? '#D97706' : '#DC2626'

const notaBg = (n: number | null): string =>
  n === null ? '#F5F5F3' : n >= 6 ? '#F0FDF4' : n >= 4 ? '#FFFBEB' : '#FEF2F2'

const formatN = (n: number | null) =>
  n === null ? '—' : n.toFixed(1).replace('.', ',')

export function TabNotas({ cursoId, cursoNombre }: Props) {
  const [datos,   setDatos]   = useState<Data | null>(null)
  const [notas,   setNotas]   = useState<NotaMap>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getNotasCurso(cursoId).then((raw: any) => {
      const d = raw as Data
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

  const getNota = (aId: string, eId: string) => notas.get(aId)?.get(eId) ?? null

  const handleNota = async (aId: string, eId: string, val: string) => {
    const num = val === '' ? null : parseFloat(val.replace(',', '.'))
    if (num !== null && (num < 1 || num > 7 || isNaN(num))) return
    setNotas(prev => {
      const m = new Map(prev)
      if (!m.has(aId)) m.set(aId, new Map())
      m.get(aId)!.set(eId, num)
      return m
    })
    const key = `${eId}-${aId}`
    setSaving(key)
    await guardarNota(eId, aId, num)
    setSaving(null)
  }

  if (loading) return (
    <div style={{ background: 'white', border: '1px solid #E8E8E5', borderRadius: '10px', padding: '1.25rem' }}>
      <div style={{ height: '20px', background: '#F5F5F3', borderRadius: '4px', width: '30%', marginBottom: '1rem' }} />
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ height: '36px', background: '#FAFAF8', borderRadius: '4px', marginBottom: '0.5rem' }} />
      ))}
    </div>
  )

  if (!datos || datos.evaluaciones.length === 0) return (
    <div style={{ background: 'white', border: '1px solid #E8E8E5', borderRadius: '10px', padding: '2.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
      <h3 style={{ fontWeight: 600, color: '#37352F', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Sin evaluaciones aún</h3>
      <p style={{ fontSize: '0.78rem', color: '#9B9A97' }}>Crea evaluaciones desde el módulo de Evaluaciones.</p>
    </div>
  )

  return (
    <>
      <style>{`
        .nt-wrap { background: white; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; width: 100%; }
        .nt-head { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid #E8E8E5; }
        .nt-title { font-size: 0.88rem; font-weight: 600; color: #37352F; letter-spacing: -0.02em; }
        .nt-export { font-size: 0.72rem; font-weight: 500; color: #6B6B6B; background: #F0F0EE; border: none; border-radius: 6px; padding: 0.3rem 0.7rem; cursor: pointer; font-family: inherit; transition: background 0.12s; }
        .nt-export:hover { background: #E8E8E5; }

        .nt-scroll { overflow-x: auto; width: 100%; }
        .nt-table { width: 100%; border-collapse: collapse; font-family: 'Inter', system-ui, sans-serif; }

        .nt-th { padding: 0.6rem 0.5rem; background: #FAFAF8; border-bottom: 1px solid #E8E8E5; text-align: center; white-space: nowrap; }
        .nt-th-alumno { text-align: left; padding-left: 1.25rem; position: sticky; left: 0; z-index: 2; background: #FAFAF8; min-width: 160px; }
        .nt-th-label { font-size: 0.65rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.04em; text-transform: uppercase; display: block; margin-bottom: 0.15rem; max-width: 80px; overflow: hidden; text-overflow: ellipsis; }
        .nt-th-pond { font-size: 0.62rem; color: #C2C0BB; font-weight: 500; }
        .nt-th-prom { background: #F5F5F3; min-width: 70px; }

        .nt-tr { border-bottom: 1px solid #F5F5F3; }
        .nt-tr:last-child { border-bottom: none; }
        .nt-tr:hover { background: #FAFAF8; }
        .nt-td { padding: 0.5rem; text-align: center; }
        .nt-td-alumno { padding: 0.6rem 0.5rem 0.6rem 1.25rem; text-align: left; position: sticky; left: 0; background: white; z-index: 1; }
        .nt-tr:hover .nt-td-alumno { background: #FAFAF8; }
        .nt-alumno-nombre { font-size: 0.78rem; font-weight: 500; color: #37352F; white-space: nowrap; }
        .nt-sep { font-size: 0.58rem; font-weight: 600; background: #F0F0EE; color: #6B6B6B; padding: 0.08rem 0.35rem; border-radius: 3px; margin-left: 0.3rem; }
        .nt-td-prom { background: #FAFAF8; font-size: 0.85rem; font-weight: 700; font-variant-numeric: tabular-nums; }

        .nt-footer { padding: 0.75rem 1.25rem; border-top: 1px solid #F0F0EE; display: flex; flex-wrap: wrap; gap: 0.4rem; background: #FAFAF8; }
        .nt-pond-chip { font-size: 0.62rem; color: #9B9A97; background: #F0F0EE; padding: 0.15rem 0.5rem; border-radius: 3px; font-weight: 500; }
      `}</style>

      <div className="nt-wrap">
        <div className="nt-head">
          <span className="nt-title">{cursoNombre} · Notas {new Date().getFullYear()}</span>
          <button className="nt-export">📥 Exportar</button>
        </div>

        <div className="nt-scroll">
          <table className="nt-table">
            <thead>
              <tr>
                <th className="nt-th nt-th-alumno">
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#9B9A97', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Estudiante
                  </span>
                </th>
                {datos.evaluaciones.map(ev => (
                  <th key={ev.id} className="nt-th">
                    <span className="nt-th-label" title={ev.titulo}>{ev.titulo}</span>
                    <span className="nt-th-pond">{ev.ponderacion ? `${ev.ponderacion}%` : '—'}</span>
                  </th>
                ))}
                <th className="nt-th nt-th-prom">
                  <span className="nt-th-label">Promedio</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {datos.alumnos.map(alumno => {
                const ns = datos.evaluaciones.map(ev => ({ evaluacion_id: ev.id, nota: getNota(alumno.id, ev.id) }))
                const prom = calcularPromedio(ns, datos.evaluaciones)
                return (
                  <tr key={alumno.id} className="nt-tr">
                    <td className="nt-td-alumno">
                      <span className="nt-alumno-nombre">
                        {alumno.nombre_completo}
                        {alumno.alumno_sep && <span className="nt-sep">SEP</span>}
                      </span>
                    </td>
                    {datos.evaluaciones.map(ev => {
                      const nota = getNota(alumno.id, ev.id)
                      const key  = `${ev.id}-${alumno.id}`
                      return (
                        <td key={ev.id} className="nt-td">
                          <NotaInput value={nota} saving={saving === key} onChange={v => handleNota(alumno.id, ev.id, v)} />
                        </td>
                      )
                    })}
                    <td className="nt-td nt-td-prom" style={{ color: notaColor(prom) }}>
                      {formatN(prom)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Leyenda ponderaciones */}
        <div className="nt-footer">
          {datos.evaluaciones.map(ev => (
            <span key={ev.id} className="nt-pond-chip">
              {ev.titulo}: {ev.ponderacion ?? 0}%
            </span>
          ))}
        </div>
      </div>
    </>
  )
}

function NotaInput({ value, saving, onChange }: { value: number | null; saving: boolean; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const startEdit = () => {
    setText(value !== null ? value.toFixed(1).replace('.', ',') : '')
    setEditing(true)
    setTimeout(() => ref.current?.select(), 40)
  }

  const commit = () => { setEditing(false); onChange(text) }

  if (saving) return (
    <div style={{ width: '44px', height: '28px', margin: '0 auto', background: '#F0F0EE', borderRadius: '5px', animation: 'pulse 1s infinite' }} />
  )

  if (editing) return (
    <input
      ref={ref} value={text}
      onChange={e => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Tab') commit(); if (e.key === 'Escape') setEditing(false) }}
      style={{ width: '52px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 600, border: '1.5px solid #37352F', borderRadius: '5px', padding: '0.25rem 0.3rem', outline: 'none', fontFamily: 'inherit', boxShadow: '0 0 0 2px rgba(55,53,47,0.08)', color: '#37352F' }}
      placeholder="4,0"
    />
  )

  return (
    <button
      onClick={startEdit}
      style={{
        width: '44px', height: '28px', borderRadius: '5px',
        fontSize: '0.78rem', fontWeight: 700,
        border: '1px solid transparent',
        background: notaBg(value), color: notaColor(value),
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'transform 0.1s, box-shadow 0.1s',
        fontVariantNumeric: 'tabular-nums',
      }}
      title="Clic para editar"
    >
      {formatN(value)}
    </button>
  )
}
