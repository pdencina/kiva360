// ═══════════════════════════════════════════════════════════════
// app/(dashboard)/comunicacion/page.tsx
// ═══════════════════════════════════════════════════════════════
import { getConversaciones, getUsuariosColegio } from '@/lib/actions/comunicacion'
import { ComunicacionClient } from '@/components/comunicacion/ComunicacionClient'
import { createClient } from '@/lib/supabase/server'

export default async function ComunicacionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [conversaciones, usuarios] = await Promise.all([
    getConversaciones(),
    getUsuariosColegio(),
  ])

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'system-ui', height: 'calc(100vh - 52px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>💬 Comunicación</h1>
        <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Mensajes con apoderados y equipo docente</p>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ComunicacionClient
          conversaciones={conversaciones}
          usuarios={usuarios}
          usuarioActualId={user?.id ?? ''}
        />
      </div>
    </div>
  )
}
