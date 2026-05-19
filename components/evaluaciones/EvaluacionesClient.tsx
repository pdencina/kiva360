'use client'

import { useState, useActionState, useTransition } from 'react'
import { crearEvaluacion } from '@/lib/actions/evaluaciones'
import { CalificarModal } from './CalificarModal'

const TIPO_COLOR: Record<string, string> = {
  control:     '#1976D2',
  prueba:      '#7B1FA2',
  tarea:       '#00897B',
  disertacion: '#E65100',
  proyecto:    '#C62828',
}

const TIPO_BG: Record<string, string> = {
  control:     '#E3F2FD',
  prueba:      '#EDE7F6',
  tarea:       '#E0F2F1',
  disertacion: '#FFF3E0',
  proyecto:    '#FFEBEE',
}

const ASIGNATURAS = ['Matemáticas', 'Lenguaje', 'Ciencias Naturales', 'Historia', 'Inglés', 'Educación Física', 'Artes', 'Música', 'Tecnología', 'Religión']
const TIPOS       = ['control', 'prueba', 'tarea', 'disertacion', 'proyecto']

interface Evaluacion {
  id: string
  titulo: string
  asignatura: string
  tipo: string
  fecha: string | null
  ponderacion: number | null
  curso_id: string
  cursos?: { nombre: string; nivel: string } | null
}

interface Props { evaluaciones: Evaluacion[] }

export function EvaluacionesClient({ evaluaciones: inicial }: Props) {
  const [mostrarCrear,    setMostrarCrear]    = useState(false)
  const [evalCalificar,   setEvalCalificar]   = useState<string | null>(null)
  const [filtroAsig,      setFiltroAsig]      = useState('todas')
  const [, startTransition]                  = useTransition()

  const [state, action, isPending] = useActionState(
    async (prev: { error: string | null; success: boolean }, formData: FormData) => {
      const result = await crearEvaluacion(prev, formData)
      if (result.success) {
        startTransition(() => setMostrarCrear(false))
        window.location.reload()
      }
      return result
    },
    { error: null, success: false }
  )

  const hoy = new Date().toISOString().split('T')[0]

  const asignaturas = ['todas', ...Array.from(new Set(inicial.map(e => e.asignatura)))]
  const filtradas = filtroAsig === 'todas' ? inicial : inicial.filter(e => e.asignatura === filtroAsig)

  const getEstado = (e: Evaluacion) => {
    if (!e.fecha) return { label: 'Sin fecha', color: '#94A3B8', bg: '#F8FAFC' }
    if (e.fecha > hoy) return { label: 'Próxima',    color: '#1976D2', bg: '#E3F2FD' }
    if (e.fecha === hoy) return { label: 'Hoy',      color: '#E65100', bg: '#FFF3E0' }
    return { label: 'Pasada', color: '#64748B', bg: '#F1F5F9' }
  }

  return (
    <div>
      {/* Filtros + botón crear */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {asignaturas.map(a => (
            <button key={a} onClick={() => setFiltroAsig(a)} style={{
              padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem',
              fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: filtroAsig === a ? '#0F172A' : '#F1F5F9',
              color:      filtroAsig === a ? 'white'   : '#475569',
            }}>
              {a === 'todas' ? 'Todas' : a}
            </button>
          ))}
        </div>
        <button onClick={() => setMostrarCrear(true)} style={{
          padding: '0.55rem 1.2rem', background: '#1976D2', color: 'white',
          border: 'none', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
          boxShadow: '0 2px 8px rgba(25,118,210,0.3)',
        }}>
          + Nueva evaluación
        </button>
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
          <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.3rem' }}>Sin evaluaciones</div>
          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Crea la primera evaluación con el botón de arriba.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filtradas.map(ev => {
            const estado = getEstado(ev)
            return (
              <div key={ev.id} style={{
                background: 'white', borderRadius: '12px',
                border: '1.5px solid #E2E8F0', padding: '1rem 1.2rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
                transition: 'box-shadow 0.15s',
              }}>
                {/* Tipo chip */}
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                  background: TIPO_COLOR[ev.tipo] ?? '#94A3B8',
                }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem', marginBottom: '0.2rem' }}>
                    {ev.titulo}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      {ev.cursos?.nombre ?? '—'} · {ev.asignatura}
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '5px', background: TIPO_BG[ev.tipo] ?? '#F1F5F9', color: TIPO_COLOR[ev.tipo] ?? '#64748B' }}>
                      {ev.tipo}
                    </span>
                    {ev.ponderacion && (
                      <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{ev.ponderacion}%</span>
                    )}
                  </div>
                </div>

                {/* Fecha */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>
                    {ev.fecha ? new Date(ev.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : '—'}
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '20px', background: estado.bg, color: estado.color }}>
                    {estado.label}
                  </span>
                </div>

                {/* Acciones */}
                <button
                  onClick={() => setEvalCalificar(ev.id)}
                  style={{
                    padding: '0.4rem 0.9rem', background: '#1976D2', color: 'white',
                    border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  Calificar →
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal crear evaluación */}
      {mostrarCrear && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={e => e.target === e.currentTarget && setMostrarCrear(false)}>
          <div style={{
            background: 'white', borderRadius: '16px', width: '100%', maxWidth: '520px',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <div style={{ padding: '1.3rem 1.5rem 1rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>📝 Nueva evaluación</div>
              <button onClick={() => setMostrarCrear(false)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#64748B' }}>✕</button>
            </div>

            <form action={action} style={{ padding: '1.3rem 1.5rem' }}>
              {state.error && (
                <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.82rem', color: '#C62828', marginBottom: '1rem' }}>
                  {state.error}
                </div>
              )}

              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>Título</label>
                <input name="titulo" required placeholder="Ej: Control de Fracciones Unidad 2" style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: '9px', padding: '0.55rem 0.8rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'system-ui' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>Asignatura</label>
                  <select name="asignatura" required style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: '9px', padding: '0.55rem 0.8rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'system-ui' }}>
                    {ASIGNATURAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>Tipo</label>
                  <select name="tipo" required style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: '9px', padding: '0.55rem 0.8rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'system-ui' }}>
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>Curso</label>
                <input name="curso_id" required placeholder="ID del curso (ej: 00000000-...)" style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: '9px', padding: '0.55rem 0.8rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'system-ui' }} />
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '0.3rem' }}>Próximamente será un selector. Por ahora ingresa el ID del curso desde Supabase.</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>Fecha</label>
                  <input name="fecha" type="date" required style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: '9px', padding: '0.55rem 0.8rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'system-ui' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>Ponderación (%)</label>
                  <input name="ponderacion" type="number" min="0" max="100" placeholder="Ej: 30" style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: '9px', padding: '0.55rem 0.8rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'system-ui' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>Modalidad</label>
                <select name="modalidad" style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: '9px', padding: '0.55rem 0.8rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'system-ui' }}>
                  <option value="digital">Digital</option>
                  <option value="papel">Papel</option>
                  <option value="mixta">Mixta</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button type="button" onClick={() => setMostrarCrear(false)} style={{ padding: '0.55rem 1.1rem', background: 'white', color: '#475569', border: '1.5px solid #E2E8F0', borderRadius: '9px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} style={{ padding: '0.55rem 1.4rem', background: '#1976D2', color: 'white', border: 'none', borderRadius: '9px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}>
                  {isPending ? 'Creando...' : '✓ Crear evaluación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal calificar */}
      {evalCalificar && (
        <CalificarModal
          evalId={evalCalificar}
          onCerrar={() => setEvalCalificar(null)}
        />
      )}
    </div>
  )
}
