'use client'

// ═══════════════════════════════════════════════════════
// StepRol
// ═══════════════════════════════════════════════════════
import { useState, useActionState, useTransition } from 'react'
import { guardarRol } from '@/lib/actions/onboarding'
import type { OnboardingState } from '@/lib/actions/onboarding'

const ROLES = [
  { value: 'director',  icon: '🏫', nombre: 'Director/a',   desc: 'Visión completa del establecimiento' },
  { value: 'utp',       icon: '📋', nombre: 'UTP',          desc: 'Gestión curricular y pedagógica' },
  { value: 'profesor',  icon: '👩‍🏫', nombre: 'Profesor/a',   desc: 'Clases, notas y comunicación' },
  { value: 'apoderado', icon: '👨‍👩‍👧', nombre: 'Apoderado/a', desc: 'Notas y comunicación familiar' },
]

interface StepRolProps { onSuccess: () => void; onBack: () => void }

export function StepRol({ onSuccess, onBack }: StepRolProps) {
  const [rolSeleccionado, setRol] = useState('director')
  const [, startTransition] = useTransition()

  const [state, action, isPending] = useActionState(
    async (prev: OnboardingState, formData: FormData) => {
      const result = await guardarRol(prev, formData)
      if (result.success) startTransition(() => onSuccess())
      return result
    },
    { error: null, success: false }
  )

  return (
    <form action={action} style={{ padding: '2rem' }}>
      <input type="hidden" name="rol" value={rolSeleccionado} />

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{ width: '22px', height: '22px', background: '#EEF2FF', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#6366F1' }}>2</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6366F1' }}>Paso 2 de 4</span>
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
          ¿Cuál es tu rol en el colegio?
        </h2>
        <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Personaliza el dashboard según tu función.</p>
      </div>

      {state.error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '9px', padding: '0.7rem 1rem', fontSize: '0.78rem', color: '#DC2626', marginBottom: '1rem' }}>
          ⚠️ {state.error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {ROLES.map(rol => (
          <button key={rol.value} type="button" onClick={() => setRol(rol.value)} style={{
            textAlign: 'left', padding: '1rem', border: `2px solid ${rolSeleccionado === rol.value ? '#6366F1' : '#E5E7EB'}`,
            borderRadius: '12px', background: rolSeleccionado === rol.value ? '#EEF2FF' : 'white',
            cursor: 'pointer', transition: 'all 0.15s',
            boxShadow: rolSeleccionado === rol.value ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{rol.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: rolSeleccionado === rol.value ? '#4F46E5' : '#0F172A', marginBottom: '0.2rem' }}>
              {rol.nombre}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{rol.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.2rem', borderTop: '1px solid #F1F5F9' }}>
        <button type="button" onClick={onBack} style={{ padding: '0.6rem 1.1rem', background: 'white', color: '#475569', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
          ← Anterior
        </button>
        <span style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>Paso 2 de 4</span>
        <button type="submit" disabled={isPending} style={{ padding: '0.6rem 1.6rem', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none', borderRadius: '9px', fontSize: '0.875rem', fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.6 : 1 }}>
          {isPending ? 'Guardando...' : 'Siguiente →'}
        </button>
      </div>
    </form>
  )
}

// ═══════════════════════════════════════════════════════
// StepIntegraciones
// ═══════════════════════════════════════════════════════
import { guardarIntegraciones } from '@/lib/actions/onboarding'

const INTEGS = [
  { id: 'sige',   icon: '🔗', nombre: 'SIGE',   sub: 'MINEDUC',         desc: 'Matrícula, declaración asistencia y actas' },
  { id: 'sae',    icon: '🎓', nombre: 'SAE',    sub: 'Admisión Escolar', desc: 'Vacantes, nóminas y gestión de matrícula' },
  { id: 'junaeb', icon: '🍽️', nombre: 'JUNAEB', sub: '+30 programas',   desc: 'PAE, IVE-SINAE, encuesta vulnerabilidad' },
] as const

interface StepIntegProps { onSuccess: () => void; onBack: () => void }

export function StepIntegraciones({ onSuccess, onBack }: StepIntegProps) {
  const [activas, setActivas] = useState({ sige: true, sae: true, junaeb: true })
  const [, startTransition] = useTransition()

  const [state, action, isPending] = useActionState(
    async (prev: OnboardingState, formData: FormData) => {
      const result = await guardarIntegraciones(prev, formData)
      if (result.success) startTransition(() => onSuccess())
      return result
    },
    { error: null, success: false }
  )

  const toggle = (id: keyof typeof activas) =>
    setActivas(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <form action={action} style={{ padding: '2rem' }}>
      {activas.sige   && <input type="hidden" name="sige"   value="on" />}
      {activas.sae    && <input type="hidden" name="sae"    value="on" />}
      {activas.junaeb && <input type="hidden" name="junaeb" value="on" />}

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{ width: '22px', height: '22px', background: '#EEF2FF', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#6366F1' }}>3</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6366F1' }}>Paso 3 de 4</span>
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
          Conecta con MINEDUC y JUNAEB
        </h2>
        <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Activa las integraciones que necesitas. Puedes cambiarlas después.</p>
      </div>

      {state.error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '9px', padding: '0.7rem 1rem', fontSize: '0.78rem', color: '#DC2626', marginBottom: '1rem' }}>
          ⚠️ {state.error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1rem' }}>
        {INTEGS.map(integ => {
          const on = activas[integ.id]
          return (
            <div key={integ.id} style={{
              border: `1.5px solid ${on ? '#10B981' : '#E5E7EB'}`,
              borderRadius: '12px', padding: '1rem',
              background: on ? '#F0FDF4' : 'white',
              transition: 'all 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.8rem' }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>{integ.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>{integ.nombre}</span>
                      <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{integ.sub}</span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.15rem' }}>{integ.desc}</p>
                  </div>
                </div>
                {/* Toggle */}
                <button type="button" onClick={() => toggle(integ.id)} aria-label={`${on ? 'Desactivar' : 'Activar'} ${integ.nombre}`} style={{
                  width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                  background: on ? '#10B981' : '#D1D5DB', position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                }}>
                  <span style={{
                    position: 'absolute', top: '3px', left: on ? '21px' : '3px',
                    width: '16px', height: '16px', background: 'white', borderRadius: '50%',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.8rem 1rem', fontSize: '0.72rem', color: '#64748B', marginBottom: '1.2rem', display: 'flex', gap: '0.5rem' }}>
        🔒 Las credenciales se almacenan encriptadas. Las configuras en Ajustes.
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.2rem', borderTop: '1px solid #F1F5F9' }}>
        <button type="button" onClick={onBack} style={{ padding: '0.6rem 1.1rem', background: 'white', color: '#475569', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
          ← Anterior
        </button>
        <span style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>Paso 3 de 4</span>
        <button type="submit" disabled={isPending} style={{ padding: '0.6rem 1.6rem', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none', borderRadius: '9px', fontSize: '0.875rem', fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.6 : 1 }}>
          {isPending ? 'Conectando...' : 'Conectar →'}
        </button>
      </div>
    </form>
  )
}

// ═══════════════════════════════════════════════════════
// StepExito
// ═══════════════════════════════════════════════════════
import { useTransition as useT } from 'react'
import { completarOnboarding } from '@/lib/actions/onboarding'

interface StepExitoProps { nombreUsuario: string }

export function StepExito({ nombreUsuario }: StepExitoProps) {
  const [isPending, startT] = useT()

  const handleIr = () => {
    startT(() => { completarOnboarding() })
  }

  const LOGROS = [
    'Colegio registrado y verificado',
    'SIGE · SAE · JUNAEB conectados',
    'Alumnos sincronizados automáticamente',
    'Dashboard listo para usar hoy',
  ]

  return (
    <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      {/* Ícono animado */}
      <div style={{
        width: '64px', height: '64px', background: '#F0FDF4', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.8rem', marginBottom: '1.2rem',
      }}>
        🎉
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
        ¡Kiva360 está listo, {nombreUsuario.split(' ')[0]}!
      </h2>
      <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1.5rem', maxWidth: '380px', lineHeight: 1.6 }}>
        Tu colegio quedó configurado correctamente. Todo está conectado y listo para usar.
      </p>

      {/* Logros */}
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.8rem' }}>
        {LOGROS.map((logro, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            borderRadius: '10px', padding: '0.6rem 1rem',
            fontSize: '0.8rem', color: '#166534',
          }}>
            <span style={{ color: '#10B981', fontWeight: 700, fontSize: '1rem' }}>✓</span>
            {logro}
          </div>
        ))}
      </div>

      <button onClick={handleIr} disabled={isPending} style={{
        padding: '0.75rem 2.5rem',
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        color: 'white', border: 'none', borderRadius: '10px',
        fontSize: '1rem', fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.6 : 1,
        boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
        transition: 'all 0.2s',
      }}>
        {isPending ? 'Entrando...' : 'Ir al Dashboard →'}
      </button>

      <p style={{ fontSize: '0.7rem', color: '#CBD5E1', marginTop: '1rem' }}>
        Puedes configurar las integraciones en detalle desde Ajustes
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// StepIndicator — ya no se usa (incluido en OnboardingClient)
// pero lo dejamos como export para no romper imports
// ═══════════════════════════════════════════════════════
export function StepIndicator() { return null }
