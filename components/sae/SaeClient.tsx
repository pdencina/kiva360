'use client'

import { useState, useTransition } from 'react'
import { matricularPostulante, rechazarPostulante, importarNominaSae } from '@/lib/actions/sae'

const PRIORIDAD_LABEL: Record<string, string> = {
  hermano:     '👨‍👩‍👧 Hermano/a',
  prioritario: '⭐ Prioritario',
  nee:         '♿ NEE',
  funcionario: '👔 Funcionario',
  cercania:    '📍 Cercanía',
  sorteo:      '🎲 Sorteo',
  prioridad:   '⭐ Prioritario',
}

const PRIORIDAD_COLOR: Record<string, string> = {
  hermano: '#1976D2', prioritario: '#7B1FA2', nee: '#00897B',
  funcionario: '#E65100', cercania: '#455A64', sorteo: '#78909C', prioridad: '#7B1FA2',
}

const ESTADO_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pendiente:         { bg: '#FFF3E0', color: '#E65100', label: '⏳ Pendiente' },
  matriculado:       { bg: '#E8F5E9', color: '#2E7D32', label: '✓ Matriculado' },
  rechazo_apoderado: { bg: '#FFEBEE', color: '#C62828', label: '✗ Rechazado' },
  cupo_lleno:        { bg: '#F1F5F9', color: '#64748B', label: 'Cupo lleno' },
}

interface Postulante {
  id: string
  rut_alumno: string | null
  nombre_alumno: string | null
  nivel_postulado: string | null
  prioridad: string | null
  preferencia: number | null
  estado_matricula: string
}

interface Props {
  postulantes: Postulante[]
  estado: { proceso_anio: number; pendientes: number }
}

export function SaeClient({ postulantes: inicial, estado }: Props) {
  const [postulantes, setPostulantes] = useState(inicial)
  const [filtro,      setFiltro]      = useState<'todos' | 'pendiente' | 'matriculado' | 'rechazo_apoderado'>('todos')
  const [importando,  setImportando]  = useState(false)
  const [msg,         setMsg]         = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [, startTransition]           = useTransition()

  const filtrados = filtro === 'todos' ? postulantes : postulantes.filter(p => p.estado_matricula === filtro)

  const handleMatricular = async (id: string) => {
    const result = await matricularPostulante(id)
    if (result.success) {
      setPostulantes(prev => prev.map(p => p.id === id ? { ...p, estado_matricula: 'matriculado' } : p))
      setMsg({ tipo: 'ok', texto: 'Alumno/a matriculado/a exitosamente' })
    } else {
      setMsg({ tipo: 'error', texto: result.error ?? 'Error al matricular' })
    }
    setTimeout(() => setMsg(null), 3000)
  }

  const handleRechazar = async (id: string) => {
    if (!confirm('¿Confirmas registrar el rechazo del apoderado?')) return
    const result = await rechazarPostulante(id)
    if (result.success) {
      setPostulantes(prev => prev.map(p => p.id === id ? { ...p, estado_matricula: 'rechazo_apoderado' } : p))
    }
  }

  const handleImportar = async () => {
    if (!confirm('¿Importar nómina de prueba SAE con 8 postulantes?')) return
    setImportando(true)
    const result = await importarNominaSae()
    if (result.success) {
      setMsg({ tipo: 'ok', texto: `✅ ${result.importados} postulantes importados exitosamente` })
      startTransition(() => window.location.reload())
    } else {
      setMsg({ tipo: 'error', texto: result.error ?? 'Error al importar' })
    }
    setImportando(false)
    setTimeout(() => setMsg(null), 4000)
  }

  return (
    <div>
      {msg && (
        <div style={{ marginBottom: '1rem', padding: '0.8rem 1.1rem', borderRadius: '10px', background: msg.tipo === 'ok' ? '#E8F5E9' : '#FFEBEE', border: `1px solid ${msg.tipo === 'ok' ? '#A5D6A7' : '#FFCDD2'}`, color: msg.tipo === 'ok' ? '#2E7D32' : '#C62828', fontSize: '0.82rem', fontWeight: 600 }}>
          {msg.texto}
        </div>
      )}

      {/* Alerta plazo */}
      {estado.pendientes > 0 && (
        <div style={{ marginBottom: '1rem', padding: '0.9rem 1.1rem', borderRadius: '12px', background: '#FFF3E0', border: '1px solid #FFE082', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '1.2rem' }}>⏰</span>
          <div>
            <div style={{ fontWeight: 700, color: '#E65100', fontSize: '0.85rem' }}>
              {estado.pendientes} postulantes esperando matrícula
            </div>
            <div style={{ fontSize: '0.72rem', color: '#BF360C' }}>
              Plazo proceso {estado.proceso_anio}: 30 de mayo 2026 · Kiva360 puede enviar recordatorios automáticos a los apoderados
            </div>
          </div>
        </div>
      )}

      {/* Filtros + acciones */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'todos',             label: `Todos (${postulantes.length})` },
            { id: 'pendiente',         label: `Pendientes (${postulantes.filter(p => p.estado_matricula === 'pendiente').length})` },
            { id: 'matriculado',       label: `Matriculados (${postulantes.filter(p => p.estado_matricula === 'matriculado').length})` },
            { id: 'rechazo_apoderado', label: `Rechazados (${postulantes.filter(p => p.estado_matricula === 'rechazo_apoderado').length})` },
          ].map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id as any)} style={{
              padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
              cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: filtro === f.id ? '#0F172A' : '#F1F5F9',
              color:      filtro === f.id ? 'white'   : '#475569',
            }}>{f.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleImportar} disabled={importando} style={{
            padding: '0.5rem 1rem', background: '#00897B', color: 'white',
            border: 'none', borderRadius: '9px', fontSize: '0.78rem', fontWeight: 700,
            cursor: importando ? 'not-allowed' : 'pointer', opacity: importando ? 0.6 : 1,
          }}>
            {importando ? 'Importando...' : '📥 Importar nómina SAE'}
          </button>
          <button style={{ padding: '0.5rem 1rem', background: '#1976D2', color: 'white', border: 'none', borderRadius: '9px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            ✉️ Avisar a pendientes
          </button>
        </div>
      </div>

      {/* Tabla postulantes */}
      {filtrados.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
          <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.3rem' }}>Sin postulantes</div>
          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Importa la nómina SAE desde el MINEDUC.</div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Postulante', 'RUT', 'Nivel', 'Prioridad', 'Pref.', 'Estado', 'Acción'].map(h => (
                  <th key={h} style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => {
                const est = ESTADO_STYLE[p.estado_matricula] ?? ESTADO_STYLE.pendiente
                return (
                  <tr key={p.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.7rem 0.8rem', fontWeight: 600, color: '#0F172A' }}>{p.nombre_alumno ?? '—'}</td>
                    <td style={{ padding: '0.7rem 0.8rem', color: '#64748B', fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.rut_alumno ?? '—'}</td>
                    <td style={{ padding: '0.7rem 0.8rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '20px', background: '#E3F2FD', color: '#1565C0' }}>
                        {p.nivel_postulado ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '0.7rem 0.8rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: PRIORIDAD_COLOR[p.prioridad ?? ''] ?? '#64748B' }}>
                        {PRIORIDAD_LABEL[p.prioridad ?? ''] ?? p.prioridad ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '0.7rem 0.8rem', textAlign: 'center', color: '#64748B' }}>{p.preferencia ?? '—'}</td>
                    <td style={{ padding: '0.7rem 0.8rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', background: est.bg, color: est.color }}>
                        {est.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.7rem 0.8rem' }}>
                      {p.estado_matricula === 'pendiente' && (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => handleMatricular(p.id)} style={{ padding: '0.3rem 0.7rem', background: '#00897B', color: 'white', border: 'none', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                            ✓ Matricular
                          </button>
                          <button onClick={() => handleRechazar(p.id)} style={{ padding: '0.3rem 0.7rem', background: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                            ✗
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
