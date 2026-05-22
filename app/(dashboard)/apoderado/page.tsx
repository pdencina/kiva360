export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PortalApoderadoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Obtener hijos del apoderado
  const { data: hijos } = await supabase
    .from('alumnos')
    .select(`
      id, nombre, apellido_paterno, apellido_materno, rut,
      alumno_sep, beneficio_pae, beneficio_tne,
      cursos(nombre, nivel)
    `)
    .eq('activo', true)
    .limit(5)

  const hijo = hijos?.[0] // Demo: primer alumno

  // Notas del hijo
  const { data: notas } = hijo ? await supabase
    .from('notas')
    .select('nota, evaluaciones(titulo, asignatura, fecha, ponderacion)')
    .eq('alumno_id', hijo.id)
    .order('created_at', { ascending: false })
    .limit(10) : { data: [] }

  // Asistencia del mes
  const inicioMes = new Date()
  inicioMes.setDate(1)
  const { data: asistencia } = hijo ? await supabase
    .from('asistencia')
    .select('estado, fecha')
    .eq('alumno_id', hijo.id)
    .gte('fecha', inicioMes.toISOString().split('T')[0])
    .order('fecha', { ascending: false }) : { data: [] }

  const totalDias  = asistencia?.length ?? 0
  const presentes  = asistencia?.filter(a => a.estado === 'P').length ?? 0
  const ausentes   = asistencia?.filter(a => a.estado === 'A').length ?? 0
  const justif     = asistencia?.filter(a => a.estado === 'J').length ?? 0
  const pctAsist   = totalDias > 0 ? Math.round((presentes / totalDias) * 100) : null

  const notasArr   = (notas ?? []).map((n: any) => n.nota).filter(Boolean) as number[]
  const promedio   = notasArr.length > 0
    ? Math.round(notasArr.reduce((a, b) => a + b, 0) / notasArr.length * 10) / 10
    : null

  const notaColor  = (n: number | null) => !n ? '#9B9A97' : n >= 6 ? '#16A34A' : n >= 4 ? '#D97706' : '#DC2626'
  const pctColor   = (p: number | null) => !p ? '#9B9A97' : p >= 90 ? '#16A34A' : p >= 75 ? '#D97706' : '#DC2626'

  return (
    <>
      <style>{`
        .ap { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .ap-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .ap-sub { font-size: 0.8rem; color: #9B9A97; margin-bottom: 1.5rem; }
        .ap-alumno-card { background: #37352F; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem; }
        .ap-avatar { width: 48px; height: 48px; border-radius: 10px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; color: white; flex-shrink: 0; }
        .ap-alumno-nombre { font-size: 1rem; font-weight: 700; color: white; letter-spacing: -0.02em; margin-bottom: 0.2rem; }
        .ap-alumno-curso { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
        .ap-badges { display: flex; gap: 0.3rem; margin-top: 0.4rem; flex-wrap: wrap; }
        .ap-badge { font-size: 0.58rem; font-weight: 600; padding: 0.1rem 0.4rem; border-radius: 3px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }

        .ap-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .ap-stat { background: white; padding: 1.1rem; text-align: center; }
        .ap-stat-v { font-size: 1.8rem; font-weight: 700; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.3rem; }
        .ap-stat-n { font-size: 0.65rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; }

        .ap-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; margin-bottom: 1rem; }
        .ap-card-title { font-size: 0.78rem; font-weight: 600; color: #37352F; margin-bottom: 1rem; }

        .ap-nota-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 0; border-bottom: 1px solid #F5F5F3; }
        .ap-nota-row:last-child { border-bottom: none; }
        .ap-nota-asig { flex: 1; }
        .ap-nota-titulo { font-size: 0.8rem; font-weight: 500; color: #37352F; }
        .ap-nota-meta { font-size: 0.68rem; color: #9B9A97; }
        .ap-nota-val { font-size: 1rem; font-weight: 700; font-variant-numeric: tabular-nums; }

        .ap-asist-resumen { display: flex; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
        .ap-asist-item { font-size: 0.75rem; font-weight: 600; }
        .ap-bar-track { height: 6px; background: #F0F0EE; border-radius: 10px; overflow: hidden; margin-bottom: 0.5rem; }
        .ap-bar-fill { height: 100%; border-radius: 10px; transition: width 0.8s; }
        .ap-alerta { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 0.65rem 0.85rem; font-size: 0.75rem; color: #DC2626; margin-top: 0.75rem; }
        .ap-ok { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 0.65rem 0.85rem; font-size: 0.75rem; color: #16A34A; margin-top: 0.75rem; }

        .ap-comm-btn { display: block; width: 100%; padding: 0.75rem; background: #37352F; color: white; border: none; border-radius: 9px; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; text-align: center; text-decoration: none; transition: background 0.12s; }
        .ap-comm-btn:hover { background: #1A1A1A; }
      `}</style>

      <div className="ap">
        <h1 className="ap-title">👨‍👩‍👧 Portal Apoderado</h1>
        <p className="ap-sub">Seguimiento escolar de tu hijo/a</p>

        {/* Card alumno */}
        {hijo ? (
          <div className="ap-alumno-card">
            <div className="ap-avatar">
              {hijo.nombre[0]}{hijo.apellido_paterno[0]}
            </div>
            <div>
              <div className="ap-alumno-nombre">
                {hijo.apellido_paterno} {hijo.apellido_materno}, {hijo.nombre}
              </div>
              <div className="ap-alumno-curso">
                {(hijo as any).cursos?.nombre} · {(hijo as any).cursos?.nivel}
              </div>
              <div className="ap-badges">
                {hijo.alumno_sep    && <span className="ap-badge">SEP</span>}
                {hijo.beneficio_pae && <span className="ap-badge">PAE</span>}
                {hijo.beneficio_tne && <span className="ap-badge">TNE</span>}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#FAFAF8', border: '1px solid #E8E8E5', borderRadius: '10px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.82rem', color: '#9B9A97' }}>No hay alumnos asociados a tu cuenta.</p>
          </div>
        )}

        {/* Stats */}
        <div className="ap-stats">
          <div className="ap-stat">
            <div className="ap-stat-v" style={{ color: notaColor(promedio) }}>
              {promedio ? promedio.toFixed(1).replace('.', ',') : '—'}
            </div>
            <div className="ap-stat-n">Promedio</div>
          </div>
          <div className="ap-stat">
            <div className="ap-stat-v" style={{ color: pctColor(pctAsist) }}>
              {pctAsist !== null ? `${pctAsist}%` : '—'}
            </div>
            <div className="ap-stat-n">Asistencia</div>
          </div>
          <div className="ap-stat">
            <div className="ap-stat-v" style={{ color: ausentes > 3 ? '#DC2626' : '#37352F' }}>
              {ausentes}
            </div>
            <div className="ap-stat-n">Ausencias</div>
          </div>
        </div>

        {/* Notas recientes */}
        <div className="ap-card">
          <div className="ap-card-title">Notas recientes</div>
          {(notas ?? []).length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: '#9B9A97' }}>Sin notas registradas</p>
          ) : (notas ?? []).slice(0, 6).map((n: any, i: number) => (
            <div key={i} className="ap-nota-row">
              <div className="ap-nota-asig">
                <div className="ap-nota-titulo">{n.evaluaciones?.titulo ?? '—'}</div>
                <div className="ap-nota-meta">
                  {n.evaluaciones?.asignatura} · {n.evaluaciones?.ponderacion}%
                  {n.evaluaciones?.fecha && ` · ${new Date(n.evaluaciones.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}`}
                </div>
              </div>
              <div className="ap-nota-val" style={{ color: notaColor(n.nota) }}>
                {n.nota ? n.nota.toFixed(1).replace('.', ',') : '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Asistencia del mes */}
        <div className="ap-card">
          <div className="ap-card-title">Asistencia — {new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</div>
          <div className="ap-asist-resumen">
            <span className="ap-asist-item" style={{ color: '#16A34A' }}>{presentes} presentes</span>
            {ausentes > 0 && <span className="ap-asist-item" style={{ color: '#DC2626' }}>{ausentes} ausencias</span>}
            {justif  > 0 && <span className="ap-asist-item" style={{ color: '#D97706' }}>{justif} justificadas</span>}
          </div>
          <div className="ap-bar-track">
            <div className="ap-bar-fill" style={{ width: `${pctAsist ?? 0}%`, background: pctColor(pctAsist) }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: '#9B9A97' }}>{presentes} de {totalDias} días asistidos</div>
          {pctAsist !== null && pctAsist < 75 && (
            <div className="ap-alerta">
              ⚠️ La asistencia está bajo el 75% reglamentario. Por favor contacte al colegio.
            </div>
          )}
          {pctAsist !== null && pctAsist >= 90 && (
            <div className="ap-ok">✓ Excelente asistencia este mes.</div>
          )}
        </div>

        {/* Comunicación */}
        <div className="ap-card">
          <div className="ap-card-title">Comunicación con el colegio</div>
          <p style={{ fontSize: '0.78rem', color: '#9B9A97', marginBottom: '1rem', lineHeight: 1.6 }}>
            ¿Tienes alguna consulta o necesitas justificar una inasistencia? Escríbenos directamente.
          </p>
          <a href="/comunicacion" className="ap-comm-btn">✉️ Enviar mensaje al colegio</a>
        </div>
      </div>
    </>
  )
}
