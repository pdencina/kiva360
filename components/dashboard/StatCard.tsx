// components/dashboard/StatCard.tsx — sin Tailwind

const pctColor = (p: number | null) =>
  !p ? '#9B9A97' : p >= 90 ? '#16A34A' : p >= 75 ? '#D97706' : '#DC2626'

// ── StatCard ──────────────────────────────────────────────────
interface StatCardProps {
  value:  string
  label:  string
  tag?:   string
}

export function StatCard({ value, label, tag }: StatCardProps) {
  return (
    <div style={{ background: 'white', border: '1px solid #E8E8E5', padding: '1.1rem' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#9B9A97', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#37352F', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.3rem' }}>{value}</div>
      {tag && <div style={{ fontSize: '0.7rem', color: '#9B9A97' }}>{tag}</div>}
    </div>
  )
}

// ── AsistenciaBar ─────────────────────────────────────────────
interface AsistenciaBarProps {
  nombre:     string
  porcentaje: number | null
  presentes:  number
  total:      number
}

export function AsistenciaBar({ nombre, porcentaje }: AsistenciaBarProps) {
  const pct = porcentaje ?? 0
  const col = pctColor(porcentaje)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid #F5F5F3' }}>
      <div style={{ fontWeight: 600, fontSize: '0.75rem', color: '#37352F', width: '48px', flexShrink: 0 }}>{nombre}</div>
      <div style={{ flex: 1, height: '5px', background: '#F0F0EE', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: '10px', transition: 'width 0.7s' }} />
      </div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: col, width: '36px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {porcentaje !== null ? `${pct}%` : '—'}
      </div>
    </div>
  )
}

// ── EvalItem ──────────────────────────────────────────────────
interface EvalItemProps {
  titulo:     string
  asignatura: string
  curso:      string
  fecha:      string
}

export function EvalItem({ titulo, asignatura, curso, fecha }: EvalItemProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid #F5F5F3' }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C2C0BB', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: '0.75rem', color: '#37352F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titulo}</div>
        <div style={{ fontSize: '0.68rem', color: '#9B9A97' }}>{curso} · {asignatura}</div>
      </div>
      <div style={{ fontSize: '0.68rem', color: '#9B9A97', flexShrink: 0 }}>{fecha}</div>
    </div>
  )
}

// ── IntegStatus ───────────────────────────────────────────────
interface IntegStatusProps {
  integ: {
    sige?:   { conectado: boolean; alerta: string | null } | null
    sae?:    { conectado: boolean; alerta: string | null } | null
    junaeb?: { conectado: boolean; alerta: string | null } | null
  } | null
}

const INTEGS = [
  { key: 'sige',   icon: '🔗', nombre: 'SIGE'   },
  { key: 'sae',    icon: '🎓', nombre: 'SAE'    },
  { key: 'junaeb', icon: '🍽️', nombre: 'JUNAEB' },
]

export function IntegStatus({ integ }: IntegStatusProps) {
  return (
    <div style={{ background: 'white', border: '1px solid #E8E8E5', borderRadius: '10px', padding: '1.1rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#37352F', marginBottom: '0.85rem' }}>Integraciones</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {INTEGS.map(({ key, icon, nombre }) => {
          const data   = integ?.[key as keyof typeof integ]
          const alerta = data?.alerta
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 0', borderBottom: '1px solid #F5F5F3' }}>
              <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#37352F', flex: 1 }}>{nombre}</span>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: alerta ? '#9B9A97' : '#6B6B6B' }}>
                  {alerta ?? ''}
                </div>
              </div>
              <span style={{ fontSize: '0.62rem', fontWeight: 600, color: alerta ? '#D97706' : '#9B9A97' }}>
                {alerta ? '⚠ Alerta' : '● Activo'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
