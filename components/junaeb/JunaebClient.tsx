'use client'

// ═══════════════════════════════════════════════════════════════
// components/junaeb/JunaebClient.tsx
// ═══════════════════════════════════════════════════════════════
import { useState } from 'react'
import { registrarRacionesPae } from '@/lib/actions/junaeb'

type Tab = 'pae' | 'sep' | 'encuesta' | 'programas'

const pctColor = (p: number) => p >= 90 ? '#2E7D32' : p >= 75 ? '#E65100' : '#C62828'
const pctBg    = (p: number) => p >= 90 ? '#E8F5E9' : p >= 75 ? '#FFF3E0' : '#FFEBEE'

interface Props {
  estado:     any
  historial:  any[]
  alumnosSep: any[]
}

export function JunaebClient({ estado, historial, alumnosSep }: Props) {
  const [tab,         setTab]         = useState<Tab>('pae')
  const [desayuno,    setDesayuno]    = useState(estado.pae_hoy?.raciones_desayuno?.toString() ?? '')
  const [almuerzo,    setAlmuerzo]    = useState(estado.pae_hoy?.raciones_almuerzo?.toString() ?? '')
  const [obs,         setObs]         = useState(estado.pae_hoy?.observaciones ?? '')
  const [guardando,   setGuardando]   = useState(false)
  const [guardado,    setGuardado]    = useState(false)
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null)

  const hoy = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  const guardarPae = async () => {
    const d = parseInt(desayuno)
    const a = parseInt(almuerzo)
    if (isNaN(d) || isNaN(a) || d < 0 || a < 0) {
      setErrorMsg('Ingresa cantidades válidas (números positivos)')
      return
    }
    setGuardando(true)
    setErrorMsg(null)
    const result = await registrarRacionesPae(d, a, obs || undefined)
    if (result.success) { setGuardado(true); setTimeout(() => setGuardado(false), 3000) }
    else setErrorMsg(result.error ?? 'Error al guardar')
    setGuardando(false)
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'pae',      label: 'PAE',              icon: '🍽️' },
    { id: 'sep',      label: 'Alumnos SEP',      icon: '⭐' },
    { id: 'encuesta', label: 'Vulnerabilidad',   icon: '📋' },
    { id: 'programas',label: 'Programas',        icon: '📦' },
  ]

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '1.2rem' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '0.55rem 1.1rem', fontSize: '0.82rem', fontWeight: 600,
            border: 'none', background: 'transparent', cursor: 'pointer',
            borderBottom: tab === t.id ? '2.5px solid #E53935' : '2.5px solid transparent',
            color: tab === t.id ? '#E53935' : '#64748B', marginBottom: '-2px',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* ── PAE ── */}
      {tab === 'pae' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Registro diario */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.2rem' }}>
            <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.3rem' }}>Registro de raciones — Hoy</div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '1rem', textTransform: 'capitalize' }}>{hoy}</div>

            {errorMsg && <div style={{ background: '#FFEBEE', borderRadius: '8px', padding: '0.6rem 0.8rem', fontSize: '0.78rem', color: '#C62828', marginBottom: '0.8rem' }}>{errorMsg}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
              {[
                { label: '🌅 Desayuno', val: desayuno, set: setDesayuno },
                { label: '🍛 Almuerzo', val: almuerzo, set: setAlmuerzo },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>{label}</label>
                  <input
                    type="number" min="0" value={val}
                    onChange={e => { set(e.target.value); setGuardado(false) }}
                    placeholder="0"
                    style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: '9px', padding: '0.55rem 0.8rem', fontSize: '1rem', fontWeight: 700, textAlign: 'center', outline: 'none', fontFamily: 'system-ui' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '0.8rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>Observaciones (opcional)</label>
              <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2} placeholder="Ej: Feriado parcial, solo almuerzo..."
                style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: '9px', padding: '0.55rem 0.8rem', fontSize: '0.82rem', outline: 'none', fontFamily: 'system-ui', resize: 'none' }} />
            </div>

            <button onClick={guardarPae} disabled={guardando} style={{
              width: '100%', padding: '0.7rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700,
              border: 'none', cursor: guardando ? 'not-allowed' : 'pointer',
              background: guardado ? '#E8F5E9' : '#E53935', color: guardado ? '#2E7D32' : 'white',
              opacity: guardando ? 0.6 : 1,
            }}>
              {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : '💾 Registrar raciones del día'}
            </button>
          </div>

          {/* Historial */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.2rem' }}>
            <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.3rem' }}>Historial PAE — Mes actual</div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#E53935' }}>{estado.raciones_mes.desayuno}</div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>DESAYUNOS MES</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1976D2' }}>{estado.raciones_mes.almuerzo}</div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>ALMUERZOS MES</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00897B' }}>{estado.raciones_mes.dias}</div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>DÍAS REGISTRADOS</div>
              </div>
            </div>
            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {historial.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.82rem', padding: '1.5rem' }}>Sin registros este mes</div>
              ) : historial.map((r: any) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.78rem' }}>
                  <span style={{ color: '#64748B', fontSize: '0.72rem', minWidth: '70px' }}>
                    {new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{ color: '#E53935', fontWeight: 600 }}>🌅 {r.raciones_desayuno}</span>
                  <span style={{ color: '#1976D2', fontWeight: 600 }}>🍛 {r.raciones_almuerzo}</span>
                  {r.declarado_junaeb && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 700, background: '#E8F5E9', color: '#2E7D32', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>✓ Sync</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SEP ── */}
      {tab === 'sep' && (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, color: '#0F172A' }}>Alumnos Prioritarios SEP — IVE {estado.ive_porcentaje}%</div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', background: '#EDE7F6', color: '#4527A0' }}>
              {alumnosSep.length} alumnos SEP
            </span>
          </div>
          {alumnosSep.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
              <div>Sin alumnos SEP registrados</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['N°', 'Alumno', 'RUT', 'Curso', 'Prioridad SINAE', 'PAE', 'TNE'].map(h => (
                    <th key={h} style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alumnosSep.map((a: any) => (
                  <tr key={a.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#94A3B8', fontSize: '0.72rem' }}>{a.numero}</td>
                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#0F172A' }}>{a.nombre_completo}</td>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#64748B', fontFamily: 'monospace', fontSize: '0.75rem' }}>{a.rut ?? '—'}</td>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#64748B' }}>{a.cursos?.nombre ?? '—'}</td>
                    <td style={{ padding: '0.6rem 0.8rem' }}>
                      {a.prioridad_sinae ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '20px', background: a.prioridad_sinae === 1 ? '#FFEBEE' : a.prioridad_sinae === 2 ? '#FFF3E0' : '#F3E5F5', color: a.prioridad_sinae === 1 ? '#C62828' : a.prioridad_sinae === 2 ? '#E65100' : '#7B1FA2' }}>
                          P{a.prioridad_sinae}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem' }}>{a.beneficio_pae ? '✅' : '—'}</td>
                    <td style={{ padding: '0.6rem 0.8rem' }}>{a.beneficio_tne ? '✅' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── ENCUESTA ── */}
      {tab === 'encuesta' && (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>Encuesta de Vulnerabilidad 2026</div>

          {estado.encuesta_porcentaje < 100 && (
            <div style={{ background: '#FFF3E0', border: '1px solid #FFE082', borderRadius: '10px', padding: '0.9rem', marginBottom: '1rem', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 700, color: '#E65100', fontSize: '0.85rem' }}>Encuesta al {estado.encuesta_porcentaje}% — plazo: 3 de junio 2026</div>
                <div style={{ fontSize: '0.72rem', color: '#BF360C' }}>Kiva360 puede enviar recordatorios automáticos a los apoderados pendientes</div>
              </div>
            </div>
          )}

          {/* Barra progreso */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
              <span style={{ fontWeight: 600 }}>Progreso general</span>
              <span style={{ fontWeight: 800, color: pctColor(estado.encuesta_porcentaje) }}>{estado.encuesta_porcentaje}%</span>
            </div>
            <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${estado.encuesta_porcentaje}%`, background: pctColor(estado.encuesta_porcentaje) === '#2E7D32' ? '#4CAF50' : pctColor(estado.encuesta_porcentaje) === '#E65100' ? '#FF9800' : '#F44336', borderRadius: '10px', transition: 'width 0.8s' }} />
            </div>
          </div>

          <button style={{ padding: '0.65rem 1.5rem', background: '#E53935', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
            📩 Enviar recordatorios a pendientes
          </button>
        </div>
      )}

      {/* ── PROGRAMAS ── */}
      {tab === 'programas' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
          {[
            { icon: '🍽️', name: 'PAE',                      desc: 'Programa Alimentación Escolar', estado: 'Activo',    color: '#E53935' },
            { icon: '📊', name: 'IVE-SINAE',                desc: 'Índice Vulnerabilidad Escolar', estado: 'Activo',    color: '#1976D2' },
            { icon: '📋', name: 'Encuesta Vulnerabilidad',  desc: 'Cierre 03/06/2026',            estado: 'En curso',  color: '#E65100' },
            { icon: '💳', name: 'TNE',                      desc: 'Tarjeta Nacional Estudiante',   estado: 'Activo',    color: '#00897B' },
            { icon: '🏫', name: 'SEP',                      desc: 'Subvención Escolar Preferencial',estado:'Activo',    color: '#7B1FA2' },
            { icon: '🥗', name: 'Mapa Nutricional',          desc: 'Evaluación nutricional anual', estado: 'Pendiente', color: '#64748B' },
            { icon: '🏃', name: 'SIMCE EF',                  desc: 'Educación Física',             estado: 'Pendiente', color: '#64748B' },
            { icon: '👓', name: 'Salud Visual',              desc: 'Examen visual 1° básico',      estado: 'Pendiente', color: '#64748B' },
            { icon: '🦷', name: 'Salud Oral',               desc: 'Atención odontológica',        estado: 'Pendiente', color: '#64748B' },
          ].map(p => (
            <div key={p.name} style={{ background: 'white', borderRadius: '12px', border: `1.5px solid ${p.estado === 'Activo' ? p.color + '33' : '#E2E8F0'}`, padding: '1rem', borderLeft: `4px solid ${p.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '20px', background: p.estado === 'Activo' ? '#E8F5E9' : p.estado === 'En curso' ? '#FFF3E0' : '#F1F5F9', color: p.estado === 'Activo' ? '#2E7D32' : p.estado === 'En curso' ? '#E65100' : '#94A3B8' }}>
                  {p.estado}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', marginBottom: '0.2rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{p.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
