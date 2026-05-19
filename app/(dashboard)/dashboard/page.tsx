import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Cargar stats en paralelo — si falla alguna query no rompe el dashboard
  const [alumnos, asistencia, evaluaciones] = await Promise.allSettled([
    supabase.from('alumnos').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('asistencia').select('estado').eq('fecha', new Date().toISOString().split('T')[0]),
    supabase.from('evaluaciones').select('id', { count: 'exact', head: true }),
  ])

  const totalAlumnos = alumnos.status === 'fulfilled' ? (alumnos.value.count ?? 0) : 0

  const registrosAsist = asistencia.status === 'fulfilled' ? (asistencia.value.data ?? []) : []
  const presentes      = registrosAsist.filter(r => r.estado === 'P').length
  const pctAsist       = registrosAsist.length > 0
    ? Math.round((presentes / registrosAsist.length) * 100)
    : null

  const totalEval = evaluaciones.status === 'fulfilled' ? (evaluaciones.value.count ?? 0) : 0

  const nombreCorto = user.email?.split('@')[0] ?? 'Admin'

  const hoy = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4F8', fontFamily: 'system-ui' }}>

      {/* Topbar */}
      <div style={{
        background: 'white', borderBottom: '1px solid #E2E8F0',
        padding: '0 1.5rem', height: '54px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>📚</span>
          <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0D47A1' }}>Kiva360</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748B' }}>{user.email}</span>
          <a href="/api/auth/signout" style={{
            padding: '0.4rem 1rem', background: '#F1F5F9',
            borderRadius: '8px', color: '#475569',
            textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600'
          }}>
            Cerrar sesión
          </a>
        </div>
      </div>

      <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Saludo */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.2rem' }}>
            Hola, {nombreCorto} 👋
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'capitalize' }}>{hoy}</p>
        </div>

        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0A1929, #0D47A1)',
          borderRadius: '16px', padding: '1.3rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'
        }}>
          <div>
            <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '0.3rem' }}>
              🎓 Kiva360 — Sistema operativo
            </h3>
            <p style={{ color: '#90CAF9', fontSize: '0.82rem' }}>
              SIGE · SAE · JUNAEB integrados. Construyendo el futuro de la educación chilena.
            </p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)', color: 'white',
            padding: '0.5rem 1rem', borderRadius: '8px',
            fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap'
          }}>
            ✅ En línea
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { icon: '👥', value: totalAlumnos > 0 ? totalAlumnos.toLocaleString('es-CL') : '—', label: 'Estudiantes', color: '#0D47A1' },
            { icon: '✅', value: pctAsist !== null ? `${pctAsist}%` : '—', label: 'Asistencia hoy', color: '#00897B' },
            { icon: '📝', value: totalEval > 0 ? String(totalEval) : '—', label: 'Evaluaciones', color: '#7B1FA2' },
            { icon: '🔗', value: '3', label: 'Integraciones activas', color: '#E53935' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'white', borderRadius: '14px',
              border: `2px solid ${stat.color}22`,
              borderTop: `4px solid ${stat.color}`,
              padding: '1.1rem'
            }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Acciones rápidas */}
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Acciones rápidas
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem' }}>
            {[
              { icon: '✅', label: 'Pasar asistencia', href: '/libro' },
              { icon: '📝', label: 'Nueva evaluación', href: '/evaluaciones' },
              { icon: '✉️', label: 'Enviar aviso',     href: '/comunicacion' },
              { icon: '🔗', label: 'SIGE',             href: '/integraciones/sige' },
            ].map(a => (
              <a key={a.label} href={a.href} style={{
                background: 'white', border: '1.5px solid #E2E8F0',
                borderRadius: '12px', padding: '1rem',
                textAlign: 'center', textDecoration: 'none', color: '#334155',
                fontWeight: '600', fontSize: '0.8rem', display: 'block',
                transition: 'all 0.15s'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{a.icon}</div>
                {a.label}
              </a>
            ))}
          </div>
        </div>

        {/* Integraciones */}
        <div>
          <h2 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Estado integraciones
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
            {[
              { icon: '🔗', name: 'SIGE', desc: 'Sistema de Información General de Estudiantes', color: '#0D47A1' },
              { icon: '🎓', name: 'SAE',  desc: 'Sistema de Admisión Escolar', color: '#00897B' },
              { icon: '🍽️', name: 'JUNAEB', desc: 'PAE · IVE-SINAE · Alumnos SEP', color: '#E53935' },
            ].map(integ => (
              <div key={integ.name} style={{
                background: 'white', borderRadius: '12px',
                border: '1.5px solid #E2E8F0', padding: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{integ.icon}</span>
                    <span style={{ fontWeight: '700', color: '#0F172A' }}>{integ.name}</span>
                  </div>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: '700',
                    background: '#E8F5E9', color: '#2E7D32',
                    padding: '0.15rem 0.5rem', borderRadius: '20px'
                  }}>
                    ● Activo
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{integ.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}