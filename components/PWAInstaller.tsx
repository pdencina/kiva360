'use client'

import { useEffect, useState } from 'react'

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }

    // Capturar evento de instalación
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const instalar = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShowBanner(false)
    setDeferredPrompt(null)
  }

  if (!showBanner) return null

  return (
    <div style={{
      position: 'fixed', bottom: '1rem', left: '1rem', right: '1rem',
      background: '#37352F', color: 'white', borderRadius: '12px',
      padding: '1rem 1.25rem', display: 'flex', alignItems: 'center',
      gap: '0.75rem', zIndex: 999, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <span style={{ fontSize: '1.5rem' }}>📱</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.1rem' }}>
          Instalar Kiva360
        </div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
          Agrega la app a tu pantalla de inicio
        </div>
      </div>
      <button onClick={() => setShowBanner(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem', fontFamily: 'inherit' }}>✕</button>
      <button onClick={instalar} style={{ background: 'white', color: '#37352F', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
        Instalar →
      </button>
    </div>
  )
}
