// ═══════════════════════════════════════════════════════════════
// components/libro/LibroSkeleton.tsx
// ═══════════════════════════════════════════════════════════════
export function LibroSkeleton() {
  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: '34px', width: '60px', background: '#E2E8F0', borderRadius: '10px' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ height: '36px', width: '100px', background: '#E2E8F0', borderRadius: '6px' }} />
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ height: '44px', background: '#F8FAFC', borderRadius: '8px', marginBottom: '0.5rem' }} />
        ))}
      </div>
    </div>
  )
}
