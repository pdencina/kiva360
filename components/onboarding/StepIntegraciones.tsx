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
