// app/dashboard/page.tsx
// REEMPLAZA el archivo actual con este contenido

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A1929',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      <div style={{ fontSize: '3rem' }}>🎓</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Kiva360</h1>
      <p style={{ color: '#90CAF9' }}>✅ Dashboard funcionando</p>
      <p style={{ color: '#64B5F6', fontSize: '0.9rem' }}>
        Usuario: {user.email}
      </p>
      <a
        href="/api/auth/signout"
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1.5rem',
          background: '#1976D2',
          borderRadius: '8px',
          color: 'white',
          textDecoration: 'none',
          fontSize: '0.9rem'
        }}
      >
        Cerrar sesión
      </a>
    </div>
  )
}