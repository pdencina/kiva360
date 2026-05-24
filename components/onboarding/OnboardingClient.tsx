'use client'

import { useState, useActionState, useTransition } from 'react'
import { guardarColegio, guardarRol } from '@/lib/actions/onboarding'
import type { OnboardingState } from '@/lib/actions/onboarding'

export type StepId = 1 | 2 | 3 | 4

const STEPS = [
  { id: 1, label: 'Tu colegio' },
  { id: 2, label: 'Tu rol'     },
  { id: 3, label: 'Cursos'     },
  { id: 4, label: '¡Listo!'    },
] as const

const TIPOS = [
  { value: 'municipal',                label: 'Municipal'               },
  { value: 'particular_subvencionado', label: 'Particular subvencionado' },
  { value: 'particular_pagado',        label: 'Particular pagado'        },
]

const REGIONES = [
  'Metropolitana','Valparaíso','Biobío','Araucanía','Los Lagos',
  "O'Higgins",'Maule','Antofagasta','Coquimbo','Atacama',
  'Tarapacá','Arica y Parinacota','Los Ríos','Aysén','Magallanes','Ñuble',
]

const ROLES = [
  { value: 'director',  icon: '🏫', nombre: 'Director/a',   desc: 'Visión completa del establecimiento, reportes y gestión' },
  { value: 'utp',       icon: '📋', nombre: 'UTP',          desc: 'Supervisión curricular, planificaciones y alumnos en riesgo' },
  { value: 'profesor',  icon: '👩‍🏫', nombre: 'Profesor/a',   desc: 'Libro de clases, evaluaciones y planificación de clases' },
  { value: 'apoderado', icon: '👨‍👩‍👧', nombre: 'Apoderado/a', desc: 'Notas, asistencia y comunicación con el colegio' },
]

const CURSOS_SUGERIDOS = [
  ['1°A','2°A','3°A','4°A'],
  ['5°A','6°A','7°A','8°A'],
  ['I°A','II°A','III°A','IV°A'],
]

interface Props { stepInicial: number; nombreUsuario: string }

const INIT: OnboardingState = { error: null, success: false }

export function OnboardingClient({ stepInicial, nombreUsuario }: Props) {
  const [step,   setStep]   = useState<StepId>(stepInicial as StepId)
  const [rolSel, setRolSel] = useState('director')
  const [cursosSelec, setCursosSelec] = useState<string[]>(['3°A','4°A'])

  const next = () => setStep(s => Math.min(s + 1, 4) as StepId)
  const prev = () => setStep(s => Math.max(s - 1, 1) as StepId)

  const toggleCurso = (c: string) => {
    setCursosSelec(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  const pct = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: #F5F6FA; }

        .ob-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; background: #F5F6FA; }

        .ob-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem; }
        .ob-logo-k { width: 28px; height: 28px; background: #37352F; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; color: white; }
        .ob-logo-n { font-size: 0.95rem; font-weight: 600; color: #37352F; }

        .ob-card { background: white; border-radius: 14px; width: 100%; max-width: 560px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #E8E8E5; }

        .ob-progress-bar { height: 3px; background: #F0F0EE; }
        .ob-progress-fill { height: 100%; background: #37352F; transition: width 0.4s ease; }

        .ob-steps { display: flex; padding: 1.1rem 1.5rem; border-bottom: 1px solid #F0F0EE; gap: 0; }
        .ob-step { display: flex; align-items: center; gap: 0.4rem; flex: 1; }
        .ob-step-num { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; transition: all 0.2s; flex-shrink: 0; }
        .ob-step-num.done   { background: #37352F; color: white; }
        .ob-step-num.active { background: #37352F; color: white; }
        .ob-step-num.pend   { background: #F0F0EE; color: #9B9A97; }
        .ob-step-lbl { font-size: 0.7rem; font-weight: 500; transition: color 0.2s; white-space: nowrap; }
        .ob-step-lbl.done   { color: #37352F; }
        .ob-step-lbl.active { color: #37352F; font-weight: 600; }
        .ob-step-lbl.pend   { color: #C2C0BB; }
        .ob-step-sep { flex: 1; height: 1px; background: #F0F0EE; margin: 0 0.4rem; }

        .ob-body { padding: 2rem 2rem 1.5rem; }
        .ob-step-tag { font-size: 0.65rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .ob-title { font-size: 1.3rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.35rem; }
        .ob-subtitle { font-size: 0.82rem; color: #9B9A97; margin-bottom: 1.5rem; line-height: 1.5; }

        .ob-error { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 0.65rem 0.85rem; font-size: 0.78rem; color: #DC2626; margin-bottom: 1rem; }

        .ob-label { display: block; font-size: 0.7rem; font-weight: 500; color: #6B6B6B; margin-bottom: 0.35rem; letter-spacing: 0.03em; }
        .ob-input { width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #E8E8E5; border-radius: 8px; font-size: 0.85rem; color: #37352F; outline: none; font-family: inherit; transition: border-color 0.15s; background: white; }
        .ob-input:focus { border-color: #37352F; box-shadow: 0 0 0 3px rgba(55,53,47,0.06); }
        .ob-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 0.85rem; }
        .ob-field { margin-bottom: 0.85rem; }

        .ob-roles { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; }
        .ob-rol-btn { text-align: left; border: 1.5px solid #E8E8E5; border-radius: 10px; padding: 1rem; cursor: pointer; background: white; font-family: inherit; transition: all 0.15s; }
        .ob-rol-btn:hover { border-color: #C2C0BB; background: #FAFAF8; }
        .ob-rol-btn.selected { border-color: #37352F; background: #FAFAF8; }
        .ob-rol-icon { font-size: 1.3rem; margin-bottom: 0.5rem; display: block; }
        .ob-rol-nombre { font-size: 0.82rem; font-weight: 600; color: #37352F; margin-bottom: 0.2rem; }
        .ob-rol-desc { font-size: 0.72rem; color: #9B9A97; line-height: 1.45; }

        .ob-cursos-grid { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .ob-curso-btn { font-size: 0.78rem; font-weight: 500; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; border: 1.5px solid #E8E8E5; background: white; color: #6B6B6B; font-family: inherit; transition: all 0.12s; }
        .ob-curso-btn.selected { border-color: #37352F; background: #37352F; color: white; }
        .ob-curso-btn:hover:not(.selected) { border-color: #37352F; color: #37352F; }
        .ob-cursos-label { font-size: 0.72rem; color: #9B9A97; margin-bottom: 0.5rem; }

        .ob-exito { text-align: center; padding: 1rem 0 0.5rem; }
        .ob-exito-icon { font-size: 3rem; margin-bottom: 1rem; display: block; }
        .ob-exito-title { font-size: 1.4rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.5rem; }
        .ob-exito-sub { font-size: 0.85rem; color: #9B9A97; line-height: 1.6; margin-bottom: 1.5rem; }
        .ob-exito-checks { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.75rem; text-align: left; }
        .ob-exito-check { display: flex; align-items: center; gap: 0.6rem; font-size: 0.82rem; color: #37352F; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 7px; padding: 0.55rem 0.85rem; }

        .ob-footer { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 2rem; border-top: 1px solid #F0F0EE; }
        .ob-btn { font-size: 0.85rem; font-weight: 600; padding: 0.6rem 1.25rem; border-radius: 8px; cursor: pointer; font-family: inherit; border: none; transition: all 0.15s; }
        .ob-btn-dark { background: #37352F; color: white; }
        .ob-btn-dark:hover { background: #1A1A1A; }
        .ob-btn-dark:disabled { opacity: 0.4; cursor: not-allowed; }
        .ob-btn-ghost { background: #F0F0EE; color: #37352F; }
        .ob-btn-ghost:hover { background: #E8E8E5; }
        .ob-step-counter { font-size: 0.72rem; color: #C2C0BB; }
      `}</style>

      <div className="ob-wrap">
        {/* Logo */}
        <div className="ob-header">
          <div className="ob-logo-k">K</div>
          <span className="ob-logo-n">Kiva360</span>
        </div>

        <div className="ob-card">
          {/* Barra de progreso */}
          <div className="ob-progress-bar">
            <div className="ob-progress-fill" style={{ width: `${pct}%` }} />
          </div>

          {/* Steps indicator */}
          <div className="ob-steps">
            {STEPS.map((s, i) => {
              const done   = s.id < step
              const active = s.id === step
              const cls    = done ? 'done' : active ? 'active' : 'pend'
              return (
                <div key={s.id} className="ob-step">
                  <div className={`ob-step-num ${cls}`}>{done ? '✓' : s.id}</div>
                  <span className={`ob-step-lbl ${cls}`}>{s.label}</span>
                  {i < STEPS.length - 1 && <div className="ob-step-sep" />}
                </div>
              )
            })}
          </div>

          {/* ── PASO 1: Datos del colegio ── */}
          {step === 1 && <StepColegio onSuccess={next} />}

          {/* ── PASO 2: Rol ── */}
          {step === 2 && (
            <>
              <div className="ob-body">
                <div className="ob-step-tag">Paso 2 de 4</div>
                <div className="ob-title">¿Cuál es tu rol en el colegio?</div>
                <div className="ob-subtitle">Esto personaliza el sistema para mostrarte exactamente lo que necesitas.</div>
                <div className="ob-roles">
                  {ROLES.map(r => (
                    <button key={r.value} type="button"
                      className={`ob-rol-btn${rolSel === r.value ? ' selected' : ''}`}
                      onClick={() => setRolSel(r.value)}>
                      <span className="ob-rol-icon">{r.icon}</span>
                      <div className="ob-rol-nombre">{r.nombre}</div>
                      <div className="ob-rol-desc">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <StepRolForm rol={rolSel} onSuccess={next} onBack={prev} />
            </>
          )}

          {/* ── PASO 3: Cursos ── */}
          {step === 3 && (
            <>
              <div className="ob-body">
                <div className="ob-step-tag">Paso 3 de 4</div>
                <div className="ob-title">¿Qué cursos tiene tu colegio?</div>
                <div className="ob-subtitle">Selecciona los cursos de tu establecimiento. Puedes agregar o quitar más adelante.</div>

                {CURSOS_SUGERIDOS.map((grupo, gi) => (
                  <div key={gi} style={{ marginBottom: '0.85rem' }}>
                    <div className="ob-cursos-label">
                      {gi === 0 ? '1° a 4° Básico' : gi === 1 ? '5° a 8° Básico' : 'Enseñanza Media'}
                    </div>
                    <div className="ob-cursos-grid">
                      {grupo.map(c => (
                        <button key={c} type="button"
                          className={`ob-curso-btn${cursosSelec.includes(c) ? ' selected' : ''}`}
                          onClick={() => toggleCurso(c)}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ fontSize: '0.75rem', color: '#9B9A97', background: '#FAFAF8', borderRadius: '8px', padding: '0.65rem 0.85rem', marginTop: '0.5rem' }}>
                  💡 Seleccionados: {cursosSelec.length > 0 ? cursosSelec.join(', ') : 'Ninguno — puedes agregar cursos después'}
                </div>
              </div>
              <div className="ob-footer">
                <button className="ob-btn ob-btn-ghost" onClick={prev}>← Anterior</button>
                <span className="ob-step-counter">Paso 3 de 4</span>
                <button className="ob-btn ob-btn-dark" onClick={next}>Siguiente →</button>
              </div>
            </>
          )}

          {/* ── PASO 4: Éxito ── */}
          {step === 4 && (
            <>
              <div className="ob-body">
                <div className="ob-exito">
                  <span className="ob-exito-icon">🎉</span>
                  <div className="ob-exito-title">¡Kiva360 está listo!</div>
                  <div className="ob-exito-sub">
                    Hola, <strong>{nombreUsuario}</strong>. Tu colegio ya está configurado.<br />
                    Puedes empezar a usar el sistema ahora mismo.
                  </div>
                  <div className="ob-exito-checks">
                    {[
                      '✓ Establecimiento creado y configurado',
                      '✓ Tu rol está asignado correctamente',
                      '✓ El sistema está listo para tu equipo',
                      '✓ Puedes invitar a más usuarios desde Configuración',
                    ].map(c => (
                      <div key={c} className="ob-exito-check">{c}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="ob-footer" style={{ justifyContent: 'center' }}>
                <a href="/dashboard"
                  style={{ display: 'inline-block', padding: '0.75rem 2rem', background: '#37352F', color: 'white', borderRadius: '9px', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                  Ir al dashboard →
                </a>
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: '1.25rem', fontSize: '0.72rem', color: '#C2C0BB', textAlign: 'center' }}>
          ¿Necesitas ayuda? <a href="mailto:contacto@kiva360.cl" style={{ color: '#9B9A97', textDecoration: 'none' }}>contacto@kiva360.cl</a>
        </div>
      </div>
    </>
  )
}

// ── Step 1 — Datos del colegio ────────────────────────────────
function StepColegio({ onSuccess }: { onSuccess: () => void }) {
  const [, startT] = useTransition()
  const [state, action, isPending] = useActionState(
    async (prev: OnboardingState, fd: FormData) => {
      const r = await guardarColegio(prev, fd)
      if (r.success) startT(() => onSuccess())
      return r
    }, INIT
  )

  return (
    <form action={action}>
      <div className="ob-body">
        <div className="ob-step-tag">Paso 1 de 4</div>
        <div className="ob-title">Cuéntanos sobre tu colegio</div>
        <div className="ob-subtitle">Esta información identifica tu establecimiento en el sistema.</div>

        {state.error && <div className="ob-error">⚠️ {state.error}</div>}

        <div className="ob-row2">
          <div>
            <label className="ob-label">RBD *</label>
            <input name="rbd" className="ob-input" placeholder="12345-6" required />
            <div style={{ fontSize: '0.68rem', color: '#C2C0BB', marginTop: '0.25rem' }}>Código MINEDUC</div>
          </div>
          <div>
            <label className="ob-label">Tipo de establecimiento *</label>
            <select name="tipo" className="ob-input" required defaultValue="particular_subvencionado">
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div className="ob-field">
          <label className="ob-label">Nombre del establecimiento *</label>
          <input name="nombre" className="ob-input" placeholder="Ej: Colegio San Patricio de Santiago" required />
        </div>

        <div className="ob-row2">
          <div>
            <label className="ob-label">Región *</label>
            <select name="region" className="ob-input" required defaultValue="Metropolitana">
              {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="ob-label">Comuna *</label>
            <input name="comuna" className="ob-input" placeholder="Providencia" required />
          </div>
        </div>

        <div className="ob-field">
          <label className="ob-label">Nombre del director/a *</label>
          <input name="director" className="ob-input" placeholder="Juan Pérez Soto" required />
        </div>
      </div>

      <div className="ob-footer">
        <div />
        <span className="ob-step-counter">Paso 1 de 4</span>
        <button type="submit" className="ob-btn ob-btn-dark" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Siguiente →'}
        </button>
      </div>
    </form>
  )
}

// ── Step 2 — Rol (formulario) ─────────────────────────────────
function StepRolForm({ rol, onSuccess, onBack }: { rol: string; onSuccess: () => void; onBack: () => void }) {
  const [, startT] = useTransition()
  const [state, action, isPending] = useActionState(
    async (prev: OnboardingState, fd: FormData) => {
      const r = await guardarRol(prev, fd)
      if (r.success) startT(() => onSuccess())
      return r
    }, INIT
  )

  return (
    <form action={action}>
      <input type="hidden" name="rol" value={rol} />
      {state.error && (
        <div style={{ padding: '0 2rem' }}>
          <div className="ob-error">⚠️ {state.error}</div>
        </div>
      )}
      <div className="ob-footer">
        <button type="button" className="ob-btn ob-btn-ghost" onClick={onBack}>← Anterior</button>
        <span className="ob-step-counter">Paso 2 de 4</span>
        <button type="submit" className="ob-btn ob-btn-dark" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Siguiente →'}
        </button>
      </div>
    </form>
  )
}

