'use client'

export default function OfflinePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', background: '#F5F6FA', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📵</div>
      <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#37352F', marginBottom: '0.5rem' }}>Sin conexión</h1>
      <p style={{ fontSize: '0.85rem', color: '#9B9A97', marginBottom: '1.5rem' }}>La asistencia que marques se guardará cuando recuperes internet.</p>
      <button onClick={() => window.location.reload()} style={{ background: '#37352F', color: 'white', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
        Reintentar
      </button>
    </div>
  )
}
