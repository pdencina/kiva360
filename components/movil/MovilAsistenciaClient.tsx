'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAsistenciaSemana, guardarAsistencia } from '@/lib/actions/libro'

type Estado = 'P' | 'A' | 'J'
const CICLO: Estado[] = ['P', 'A', 'J']
const LABEL: Record<Estado, string> = { P: 'Presente', A: 'Ausente', J: 'Justificado' }
const COLOR: Record<Estado, { bg: string; text: string; border: string }> = {
  P: { bg: '#F0FDF4', text: '#16A34A', border: '#86EFAC' },
  A: { bg: '#FEF2F2', text: '#DC2626', border: '#FCA5A5' },
  J: { bg: '#FFFBEB', text: '#D97706', border: '#FCD34D' },
}

interface Curso { id: string; nombre: string; nivel: string }
interface Props  { cursos: Curso[]; userEmail: string }

export function MovilAsistenciaClient({ cursos, userEmail }: Props) {
  const [curso,     setCurso]    = useState<Curso | null>(cursos[0] ?? null)
  const [datos,     setDatos]    = useState<any>(null)
  const [cambios,   setCambios]  = useState<Record<string, Estado>>({})
  const [loading,   setLoading]  = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardado,  setGuardado]  = useState(false)
  const [vista,     setVista]    = useState<'cursos' | 'asistencia'>('cursos')
  const [showMenu,  setShowMenu] = useState(false)

  const hoy = new Date().toISOString().split('T')[0]
  const hoyLabel = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  const cargarAsistencia = useCallback(async (c: Curso) => {
    setLoading(true)
    setCambios({})
    setGuardado(false)
    const data = await getAsistenciaSemana(c.id)
    setDatos(data)
    setLoading(false)
  }, [])

  const seleccionarCurso = (c: Curso) => {
    setCurso(c)
    setVista('asistencia')
    cargarAsistencia(c)
  }

  const getEstado = (alumnoId: string): Estado | null => {
    if (cambios[alumnoId]) return cambios[alumnoId]
    return (datos?.alumnos.find((a: any) => a.id === alumnoId)?.semana[hoy] as Estado) ?? null
  }

  const toggle = (alumnoId: string) => {
    const actual = getEstado(alumnoId)
    const idx = actual ? CICLO.indexOf(actual) : -1
    const next = CICLO[(idx + 1) % CICLO.length]
    setCambios(prev => ({ ...prev, [alumnoId]: next }))
    setGuardado(false)
  }

  const marcarTodos = () => {
    if (!datos) return
    const n: Record<string, Estado> = {}
    datos.alumnos.forEach((a: any) => { n[a.id] = 'P' })
    setCambios(n)
    setGuardado(false)
  }

  const guardar = async () => {
    if (!datos || !curso) return
    setGuardando(true)
    const registros = datos.alumnos.map((a: any) => ({
      alumno_id: a.id,
      estado: getEstado(a.id) ?? 'P'
    }))
    const result = await guardarAsistencia({ cursoId: curso.id, fecha: hoy, registros })
    if (result.success) {
      setGuardado(true)
      setCambios({})
      await cargarAsistencia(curso)
    }
    setGuardando(false)
  }

  const stats = datos?.alumnos.reduce((acc: any, a: any) => {
    const e = getEstado(a.id)
    if (e === 'P') acc.p++
    else if (e === 'A') acc.a++
    else if (e === 'J') acc.j++
    else acc.sin++
    return acc
  }, { p: 0, a: 0, j: 0, sin: 0 })

  const hayPend = Object.keys(cambios).length > 0
  const iniciales = userEmail.slice(0, 2).toUpperCase()

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        html, body { height: 100%; font-family: 'Inter', -apple-system, sans-serif; background: #F5F6FA; }

        .mv { min-height: 100vh; display: flex; flex-direction: column; max-width: 480px; margin: 0 auto; background: white; }

        /* Header */
        .mv-header {
          background: #37352F; color: white;
          padding: env(safe-area-inset-top, 0) 1rem 0;
          position: sticky; top: 0; z-index: 50;
        }
        .mv-header-inner { height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .mv-logo { display: flex; align-items: center; gap: 0.5rem; }
        .mv-logo-k { width: 26px; height: 26px; background: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; color: #37352F; }
        .mv-logo-n { font-size: 0.88rem; font-weight: 600; color: white; }
        .mv-avatar { width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 600; color: white; cursor: pointer; }

        /* Tab bar */
        .mv-tabs { display: flex; border-bottom: 1px solid #E8E8E5; background: white; }
        .mv-tab { flex: 1; padding: 0.75rem 0.5rem; text-align: center; font-size: 0.72rem; font-weight: 500; color: #9B9A97; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.12s; font-family: inherit; }
        .mv-tab.active { color: #37352F; border-bottom-color: #37352F; }

        /* Contenido */
        .mv-content { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }

        /* Lista cursos */
        .mv-cursos { padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .mv-curso-card {
          background: white; border: 1px solid #E8E8E5; border-radius: 12px;
          padding: 1rem 1.25rem; display: flex; align-items: center; gap: 0.75rem;
          cursor: pointer; transition: all 0.15s; active: scale(0.98);
        }
        .mv-curso-card:active { transform: scale(0.98); background: #FAFAF8; }
        .mv-curso-icon { width: 40px; height: 40px; border-radius: 10px; background: #F0F0EE; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .mv-curso-nombre { font-size: 0.9rem; font-weight: 600; color: #37352F; }
        .mv-curso-nivel { font-size: 0.72rem; color: #9B9A97; margin-top: 0.1rem; }
        .mv-curso-arrow { margin-left: auto; color: #C2C0BB; font-size: 0.9rem; }

        /* Cabecera asistencia */
        .mv-asist-header { padding: 1rem; background: white; border-bottom: 1px solid #F0F0EE; }
        .mv-asist-back { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: #9B9A97; background: none; border: none; cursor: pointer; padding: 0; margin-bottom: 0.75rem; font-family: inherit; }
        .mv-asist-title { font-size: 1rem; font-weight: 700; color: #37352F; letter-spacing: -0.02em; }
        .mv-asist-date { font-size: 0.72rem; color: #9B9A97; margin-top: 0.15rem; text-transform: capitalize; }
        .mv-stats { display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; }
        .mv-stat { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 20px; }

        /* Botones acción */
        .mv-actions { display: flex; gap: 0.5rem; padding: 0.75rem 1rem; background: white; border-bottom: 1px solid #F0F0EE; }
        .mv-btn { flex: 1; padding: 0.65rem; border-radius: 9px; font-size: 0.8rem; font-weight: 600; border: none; cursor: pointer; font-family: inherit; transition: all 0.12s; }
        .mv-btn-ghost { background: #F0F0EE; color: #37352F; }
        .mv-btn-ghost:active { background: #E8E8E5; }
        .mv-btn-save { background: #37352F; color: white; }
        .mv-btn-save:active { background: #1A1A1A; }
        .mv-btn-ok { background: #F0FDF4; color: #16A34A; }
        .mv-btn-save:disabled { opacity: 0.4; }

        /* Lista alumnos */
        .mv-alumno {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.85rem 1rem; border-bottom: 1px solid #F5F5F3;
          background: white;
        }
        .mv-alumno:active { background: #FAFAF8; }
        .mv-alumno-num { font-size: 0.65rem; color: #C2C0BB; width: 20px; flex-shrink: 0; text-align: right; }
        .mv-alumno-nombre { flex: 1; font-size: 0.85rem; font-weight: 500; color: #37352F; }
        .mv-alumno-sep { font-size: 0.58rem; font-weight: 600; background: #F0F0EE; color: #6B6B6B; padding: 0.08rem 0.35rem; border-radius: 3px; margin-left: 0.3rem; }
        .mv-estado-btn {
          width: 72px; height: 36px; border-radius: 8px;
          font-size: 0.75rem; font-weight: 700; border: none;
          cursor: pointer; font-family: inherit; transition: all 0.1s;
          display: flex; align-items: center; justify-content: center; gap: 0.3rem;
          flex-shrink: 0;
        }
        .mv-estado-btn:active { transform: scale(0.95); }

        /* Sin estado */
        .mv-sin-estado { background: #F5F5F3; color: #C2C0BB; border: 1.5px dashed #E0DDD8; }

        /* Loading */
        .mv-loading { display: flex; align-items: center; justify-content: center; padding: 3rem; color: #9B9A97; font-size: 0.82rem; }

        /* Barra inferior */
        .mv-bottom { height: env(safe-area-inset-bottom, 0); background: white; }

        /* Leyenda */
        .mv-leyenda { padding: 0.75rem 1rem; background: #FAFAF8; border-top: 1px solid #F0F0EE; display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
        .mv-leyenda-txt { font-size: 0.65rem; color: #9B9A97; font-weight: 600; }
        .mv-leyenda-chip { font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 5px; }
      `}</style>

      <div className="mv">
        {/* Header */}
        <div className="mv-header">
          <div className="mv-header-inner">
            <div className="mv-logo">
              <div className="mv-logo-k">K</div>
              <span className="mv-logo-n">Kiva360</span>
            </div>
            <div className="mv-avatar">{iniciales}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mv-tabs">
          <button className={`mv-tab${vista === 'cursos' ? ' active' : ''}`} onClick={() => setVista('cursos')}>
            📚 Cursos
          </button>
          <button className={`mv-tab${vista === 'asistencia' ? ' active' : ''}`}
            onClick={() => curso && setVista('asistencia')}
            disabled={!curso}>
            ✅ Asistencia
          </button>
          <button className="mv-tab" onClick={() => window.location.href = '/dashboard'}>
            🏠 Dashboard
          </button>
        </div>

        {/* Contenido */}
        <div className="mv-content">

          {/* Vista cursos */}
          {vista === 'cursos' && (
            <div className="mv-cursos">
              <div style={{ padding: '0.5rem 0', fontSize: '0.78rem', color: '#9B9A97' }}>
                Selecciona un curso para pasar asistencia
              </div>
              {cursos.map(c => (
                <div key={c.id} className="mv-curso-card" onClick={() => seleccionarCurso(c)}>
                  <div className="mv-curso-icon">📒</div>
                  <div>
                    <div className="mv-curso-nombre">{c.nombre}</div>
                    <div className="mv-curso-nivel">{c.nivel}</div>
                  </div>
                  <span className="mv-curso-arrow">›</span>
                </div>
              ))}
            </div>
          )}

          {/* Vista asistencia */}
          {vista === 'asistencia' && curso && (
            <>
              <div className="mv-asist-header">
                <button className="mv-asist-back" onClick={() => setVista('cursos')}>
                  ‹ Volver a cursos
                </button>
                <div className="mv-asist-title">{curso.nombre}</div>
                <div className="mv-asist-date">{hoyLabel}</div>
                {stats && (
                  <div className="mv-stats">
                    <span className="mv-stat" style={{ background: '#F0FDF4', color: '#16A34A' }}>{stats.p} P</span>
                    {stats.a > 0 && <span className="mv-stat" style={{ background: '#FEF2F2', color: '#DC2626' }}>{stats.a} A</span>}
                    {stats.j > 0 && <span className="mv-stat" style={{ background: '#FFFBEB', color: '#D97706' }}>{stats.j} J</span>}
                    {stats.sin > 0 && <span className="mv-stat" style={{ background: '#F5F5F3', color: '#9B9A97' }}>{stats.sin} sin marcar</span>}
                  </div>
                )}
              </div>

              <div className="mv-actions">
                <button className="mv-btn mv-btn-ghost" onClick={marcarTodos}>✓ Todos presentes</button>
                <button
                  className={`mv-btn ${guardado ? 'mv-btn-ok' : 'mv-btn-save'}`}
                  onClick={guardar}
                  disabled={guardando || !hayPend}
                >
                  {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : '💾 Guardar'}
                </button>
              </div>

              {loading ? (
                <div className="mv-loading">Cargando alumnos...</div>
              ) : (
                <>
                  {(datos?.alumnos ?? []).map((a: any, i: number) => {
                    const estado = getEstado(a.id)
                    const col = estado ? COLOR[estado] : null
                    return (
                      <div key={a.id} className="mv-alumno" onClick={() => toggle(a.id)}>
                        <span className="mv-alumno-num">{i + 1}</span>
                        <div className="mv-alumno-nombre">
                          {a.nombre_completo}
                          {a.alumno_sep && <span className="mv-alumno-sep">SEP</span>}
                        </div>
                        <button
                          className={`mv-estado-btn${!estado ? ' mv-sin-estado' : ''}`}
                          style={col ? { background: col.bg, color: col.text, border: `1.5px solid ${col.border}` } : {}}
                          onClick={e => { e.stopPropagation(); toggle(a.id) }}
                        >
                          {estado ? `${estado} — ${LABEL[estado].slice(0,3)}` : '· · ·'}
                        </button>
                      </div>
                    )
                  })}

                  <div className="mv-leyenda">
                    <span className="mv-leyenda-txt">Toca para cambiar:</span>
                    {(['P','A','J'] as Estado[]).map(e => (
                      <span key={e} className="mv-leyenda-chip"
                        style={{ background: COLOR[e].bg, color: COLOR[e].text }}>
                        {e} = {LABEL[e]}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="mv-bottom" />
      </div>
    </>
  )
}
