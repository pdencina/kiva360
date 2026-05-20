// components/dashboard/QuickActions.tsx — sin Tailwind

const ACTIONS = [
  { icon: '✅', label: 'Pasar asistencia', href: '/libro'              },
  { icon: '📝', label: 'Nueva evaluación', href: '/evaluaciones'       },
  { icon: '✉️', label: 'Enviar aviso',     href: '/comunicacion'       },
  { icon: '🔗', label: 'SIGE',             href: '/integraciones/sige' },
]

export function QuickActions() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: '#E8E8E5', border: '1px solid #E8E8E5', borderRadius: '10px', overflow: 'hidden' }}>
      {ACTIONS.map(a => (
        <a key={a.label} href={a.href} style={{
          background: 'white', padding: '1rem', textAlign: 'center',
          textDecoration: 'none', color: '#6B6B6B', fontSize: '0.75rem',
          fontWeight: 500, transition: 'background 0.12s, color 0.12s',
          display: 'block', fontFamily: 'inherit',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAF8'; (e.currentTarget as HTMLElement).style.color = '#37352F'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.color = '#6B6B6B'; }}
        >
          <span style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.4rem' }}>{a.icon}</span>
          {a.label}
        </a>
      ))}
    </div>
  )
}
