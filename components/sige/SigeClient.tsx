'use client'

import { useState, useTransition } from 'react'
import { getInconsistencias, declararAsistencia, getAlumnosSige } from '@/lib/actions/sige'

type Tab = 'estado' | 'inconsistencias' | 'alumnos' | 'historial'

interface Props {
  estado: Awaited<ReturnType<typeof import('@/lib/actions/sige').getSigeEstado>>
}

const ESTADO_COLOR: Record<string, string>   = { enviado: '#2E7D32', error: '#C62828', pendiente: '#E65100', confirmado: '#1976D2' }
const ESTADO_BG:    Record<string, string>   = { enviado: '#E8F5E9', error: '#FFEBEE', pendiente: '#FFF3E0', confirmado: '#E3F2FD' }
const ESTADO_LABEL: Record<string, string>   = { enviado: '✓ Enviado', error: '✗ Error', pendiente: '⏳ Pendiente', confirmado: '✓ Confirmado' }

const TIPO_COLOR: Record<string, string> = { error: '#C62828', aviso: '#E65100', info: '#1976D2' }
const TIPO_BG:    Record<string, string> = { error: '#FFEBEE', aviso: '#FFF3E0', info: '#E3F2FD' }

const formatFecha = (f: string) =>
  new Date(f + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })

const pctColor = (p: number | null) =>
  !p ? '#94A3B8' : p >= 90 ? '#2E7D32' : p >= 75 ? '#E65100' : '#C62828'

export function SigeClient({ estado }: Props) {
  const [tab,             setTab]            = useState<Tab>('estado')
  const [inconsistencias, setInconsistencias]= useState<Awaited<ReturnType<typeof getInconsistencias>> | null>(null)
  const [alumnos,         setAlumnos]        = useState<Awaited<ReturnType<typeof getAlumnosSige>> | null>(null)
  const [cargando,        setCargando]       = useState(false)
  const [declarando,      setDeclarando]     = useState(false)
  const [resultado,       setResultado]      = useState<{ tipo: 'ok' | 'error'; msg: string } | null>(null)
  const [, startTransition]                  = useTransition()

  const cargarInconsistencias = async () => {
    setCargando(true)
    const data = await getInconsistencias()
    setInconsistencias(data)
    setCargando(false)
  }

  const cargarAlumnos = async () => {
    setCargando(true)
    const data = await getAlumnosSige(estado.periodoActual.inicio, estado.periodoActual.fin)
    setAlumnos(data)
    setCargando(false)
  }

  const handleTab = (t: Tab) => {
    setTab(t)
    if (t === 'inconsistencias' && !inconsistencias) cargarInconsistencias()
    if (t === 'alumnos'         && !alumnos)         cargarAlumnos()
  }

  const handleDeclarar = async () => {
    if (!confirm(`¿Confirmas enviar la declaración de asistencia al SIGE?\nPeríodo: ${formatFecha(estado.periodoActual.inicio)} al ${formatFecha(estado.periodoActual.fin)}`)) return
    setDeclarando(true)
    setResultado(null)
    const result = await declararAsistencia(estado.periodoActual.inicio, estado.periodoActual.fin)
    if (result.success) {
      setResultado({ tipo: 'ok', msg: '✅ Declaración enviada al SIGE exitosamente. La asistencia del período fue marcada como declarada.' })
      startTransition(() => window.location.reload())
    } else {
      setResultado({ tipo: 'error', msg: result.error ?? 'Error al declarar' })
    }
    setDeclarando(false)
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'estado',           label: 'Estado actual',    icon: '📊' },
    { id: 'inconsistencias',  label: 'Validador',        icon: '🔍' },
    { id: 'alumnos',          label: 'Alumnos',          icon: '👨‍🎓' },
    { id: 'historial',        label: 'Historial',        icon: '📋' },
  ]

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '1.2rem' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => handleTab(t.id)} style={{
            padding: '0.55rem 1.1rem', fontSize: '0.82rem', fontWeight: 600,
            border: 'none', background: 'transparent', cursor: 'pointer',
            borderBottom: tab === t.id ? '2.5px solid #1976D2' : '2.5px solid transparent',
            color: tab === t.id ? '#1976D2' : '#64748B',
            marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Resultado declaración */}
      {resultado && (
        <div style={{
          marginBottom: '1rem', padding: '0.8rem 1.1rem', borderRadius: '10px',
          background: resultado.tipo === 'ok' ? '#E8F5E9' : '#FFEBEE',
          border: `1px solid ${resultado.tipo === 'ok' ? '#A5D6A7' : '#FFCDD2'}`,
          color: resultado.tipo === 'ok' ? '#2E7D32' : '#C62828',
          fontSize: '0.82rem', fontWeight: 600,
        }}>
          {resultado.msg}
        </div>
      )}

      {/* ── TAB: ESTADO ── */}
      {tab === 'estado' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          {/* Panel principal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Período actual */}
            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.2rem' }}>
              <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>
                📅 Período actual de declaración
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.8rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.2rem' }}>INICIO</div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{formatFecha(estado.periodoActual.inicio)}</div>
                </div>
                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.8rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.2rem' }}>FIN</div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{formatFecha(estado.periodoActual.fin)}</div>
                </div>
              </div>

              {estado.periodoActual.declarado ? (
                <div style={{ background: '#E8F5E9', borderRadius: '10px', padding: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#2E7D32', fontSize: '0.85rem' }}>Período declarado al SIGE</div>
                    <div style={{ fontSize: '0.72rem', color: '#388E3C' }}>La asistencia fue enviada correctamente al MINEDUC</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ background: '#FFF3E0', borderRadius: '10px', padding: '0.9rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>⏳</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#E65100', fontSize: '0.85rem' }}>Declaración pendiente</div>
                      <div style={{ fontSize: '0.72rem', color: '#BF360C' }}>Este período aún no ha sido declarado al MINEDUC</div>
                    </div>
                  </div>
                  <button onClick={handleDeclarar} disabled={declarando} style={{
                    width: '100%', padding: '0.7rem', background: '#1976D2', color: 'white',
                    border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700,
                    cursor: declarando ? 'not-allowed' : 'pointer',
                    opacity: declarando ? 0.6 : 1,
                    transition: 'all 0.15s',
                  }}>
                    {declarando ? 'Enviando al SIGE...' : '📤 Declarar asistencia al SIGE'}
                  </button>
                </div>
              )}
            </div>

            {/* Módulos SIGE */}
            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.2rem' }}>
              <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>Módulos SIGE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { icon: '👨‍🎓', name: 'Matrícula',            desc: 'Alumnos sincronizados con SIGE',            estado: 'enviado' },
                  { icon: '✅',   name: 'Declaración Asistencia', desc: estado.periodoActual.declarado ? 'Período actual declarado' : 'Pendiente de declarar', estado: estado.periodoActual.declarado ? 'enviado' : 'pendiente' },
                  { icon: '📊',   name: 'Actas Rendimiento',      desc: 'Plazo: 15 de julio 2026',                  estado: 'pendiente' },
                  { icon: '👩‍🏫',  name: 'Idoneidad Docente',     desc: 'Docentes validados en SIGE',               estado: 'enviado' },
                ].map(m => (
                  <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 0.8rem', background: '#F8FAFC', borderRadius: '10px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{m.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0F172A' }}>{m.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{m.desc}</div>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', background: ESTADO_BG[m.estado], color: ESTADO_COLOR[m.estado] }}>
                      {ESTADO_LABEL[m.estado]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel derecho — próximos plazos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.2rem' }}>
              <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>📅 Próximos plazos SIGE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { fecha: '23 may', label: 'Asistencia mayo 1–15', urgente: true },
                  { fecha: '06 jun', label: 'Asistencia mayo 16–31', urgente: false },
                  { fecha: '15 jul', label: 'Actas 1er semestre',    urgente: false },
                  { fecha: '15 ene', label: 'Actas 2do semestre',    urgente: false },
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 0', borderBottom: i < 3 ? '1px solid #F1F5F9' : 'none' }}>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '6px', whiteSpace: 'nowrap',
                      background: p.urgente ? '#FFEBEE' : '#F1F5F9',
                      color:      p.urgente ? '#C62828' : '#475569',
                    }}>{p.fecha}</span>
                    <span style={{ fontSize: '0.78rem', color: p.urgente ? '#C62828' : '#475569', fontWeight: p.urgente ? 600 : 400 }}>{p.label}</span>
                    {p.urgente && <span style={{ fontSize: '0.65rem', color: '#C62828' }}>⚠️</span>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #0A1929, #0D47A1)', borderRadius: '14px', padding: '1.2rem', color: 'white' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>🤖 Kiva360 automatiza</div>
              <div style={{ fontSize: '0.75rem', color: '#90CAF9', lineHeight: 1.6 }}>
                ✓ Sincroniza alumnos automáticamente<br />
                ✓ Valida errores antes de declarar<br />
                ✓ Genera actas desde tus notas<br />
                ✓ Historial completo de envíos
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: VALIDADOR ── */}
      {tab === 'inconsistencias' && (
        <div>
          {cargando ? (
            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
              🔍 Analizando datos...
            </div>
          ) : !inconsistencias ? null : (
            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>Validador pre-envío SIGE</div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.15rem' }}>
                    Período: {formatFecha(inconsistencias.periodoInicio)} — {formatFecha(inconsistencias.periodoFin)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', background: '#FFEBEE', color: '#C62828' }}>
                    {inconsistencias.inconsistencias.filter(i => i.tipo === 'error').length} errores
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', background: '#FFF3E0', color: '#E65100' }}>
                    {inconsistencias.inconsistencias.filter(i => i.tipo === 'aviso').length} avisos
                  </span>
                </div>
              </div>

              {inconsistencias.inconsistencias.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                  <div style={{ fontWeight: 700, color: '#2E7D32', marginBottom: '0.3rem' }}>Sin inconsistencias</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Puedes declarar la asistencia al SIGE sin problemas.</div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      <th style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>Severidad</th>
                      <th style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>Alumno</th>
                      <th style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>Curso</th>
                      <th style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>Problema</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inconsistencias.inconsistencias.map((inc, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.6rem 0.8rem' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px', background: TIPO_BG[inc.tipo], color: TIPO_COLOR[inc.tipo] }}>
                            {inc.tipo === 'error' ? '🔴 Error' : inc.tipo === 'aviso' ? '🟡 Aviso' : '🔵 Info'}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#0F172A' }}>
                          <div>{inc.alumno}</div>
                          <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontFamily: 'monospace' }}>{inc.rut}</div>
                        </td>
                        <td style={{ padding: '0.6rem 0.8rem', color: '#64748B' }}>{inc.curso}</td>
                        <td style={{ padding: '0.6rem 0.8rem', color: '#475569' }}>{inc.mensaje}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ALUMNOS ── */}
      {tab === 'alumnos' && (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ fontWeight: 700, color: '#0F172A' }}>Alumnos — Asistencia período actual</div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.15rem' }}>
              {formatFecha(estado.periodoActual.inicio)} — {formatFecha(estado.periodoActual.fin)}
            </div>
          </div>
          {cargando ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Cargando...</div>
          ) : !alumnos ? null : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>N°</th>
                  <th style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>Alumno</th>
                  <th style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>RUT</th>
                  <th style={{ padding: '0.55rem 0.8rem', textAlign: 'center', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>Presentes</th>
                  <th style={{ padding: '0.55rem 0.8rem', textAlign: 'center', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>% Asistencia</th>
                  <th style={{ padding: '0.55rem 0.8rem', textAlign: 'center', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>SIGE</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map(a => (
                  <tr key={a.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#94A3B8', fontSize: '0.72rem' }}>{a.numero}</td>
                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#0F172A' }}>{a.nombre_completo}</td>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#64748B', fontFamily: 'monospace', fontSize: '0.75rem' }}>{a.rut ?? '—'}</td>
                    <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center', color: '#475569' }}>
                      {a.presentes}/{a.total_dias}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center', fontWeight: 700, color: pctColor(a.pct_asistencia), fontFamily: 'monospace' }}>
                      {a.pct_asistencia !== null ? `${a.pct_asistencia}%` : '—'}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '20px', background: a.declarado ? '#E8F5E9' : '#F1F5F9', color: a.declarado ? '#2E7D32' : '#94A3B8' }}>
                        {a.declarado ? '✓ Sync' : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB: HISTORIAL ── */}
      {tab === 'historial' && (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #F1F5F9', fontWeight: 700, color: '#0F172A' }}>
            Historial de declaraciones SIGE
          </div>
          {estado.declaraciones.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
              <div>Sin declaraciones registradas aún</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>Tipo</th>
                  <th style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>Período</th>
                  <th style={{ padding: '0.55rem 0.8rem', textAlign: 'center', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>Estado</th>
                  <th style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: '0.68rem' }}>Enviado</th>
                </tr>
              </thead>
              <tbody>
                {estado.declaraciones.map((d: any) => (
                  <tr key={d.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#0F172A', textTransform: 'capitalize' }}>{d.tipo}</td>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#475569' }}>
                      {d.periodo_inicio ? `${formatFecha(d.periodo_inicio)} — ${formatFecha(d.periodo_fin)}` : '—'}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', background: ESTADO_BG[d.estado] ?? '#F1F5F9', color: ESTADO_COLOR[d.estado] ?? '#475569' }}>
                        {ESTADO_LABEL[d.estado] ?? d.estado}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#64748B', fontSize: '0.75rem' }}>
                      {d.enviado_en ? new Date(d.enviado_en).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
