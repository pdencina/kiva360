export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'

export default async function FamiliasPage() {
  const supabase = await createClient()

  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, nombre, apellido_paterno, apellido_materno, rut, cursos(nombre), alumno_sep, beneficio_pae')
    .eq('activo', true)
    .order('apellido_paterno')
    .limit(20)

  const AVISOS = [
    { id: 1, tipo: 'general',   titulo: 'Reunión de apoderados',    fecha: '28 may 2026', destinatarios: 'Todos', leidos: 18, total: 20 },
    { id: 2, tipo: 'asistencia',titulo: 'Inasistencia reiterada',   fecha: '20 may 2026', destinatarios: '3 alumnos', leidos: 3, total: 3 },
    { id: 3, tipo: 'nota',      titulo: 'Notas Control Fracciones', fecha: '15 may 2026', destinatarios: '3°A', leidos: 9, total: 10 },
  ]

  const TIPO_STYLE: Record<string, { bg: string; color: string }> = {
    general:    { bg: '#F0F0EE', color: '#6B6B6B' },
    asistencia: { bg: '#FEF9C3', color: '#854D0E' },
    nota:       { bg: '#F0F0EE', color: '#37352F'  },
  }

  return (
    <>
      <style>{`
        .fam { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .fam-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .fam-sub { font-size: 0.8rem; color: #9B9A97; margin-bottom: 1.5rem; }

        .fam-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .fam-stat { background: white; padding: 1.1rem; }
        .fam-stat-n { font-size: 0.65rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .fam-stat-v { font-size: 1.6rem; font-weight: 700; color: #37352F; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.3rem; }
        .fam-stat-t { font-size: 0.7rem; color: #9B9A97; }

        .fam-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1rem; }
        .fam-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; }
        .fam-card-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .fam-card-title { font-size: 0.78rem; font-weight: 600; color: #37352F; }
        .fam-btn { font-size: 0.72rem; font-weight: 500; color: #6B6B6B; background: #F0F0EE; border: none; border-radius: 6px; padding: 0.3rem 0.7rem; cursor: pointer; font-family: inherit; }
        .fam-btn:hover { background: #E8E8E5; }
        .fam-btn-dark { background: #37352F; color: white; }
        .fam-btn-dark:hover { background: #1A1A1A; color: white; }

        .alumno-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 0; border-bottom: 1px solid #F5F5F3; }
        .alumno-row:last-child { border-bottom: none; }
        .alumno-avatar { width: 28px; height: 28px; border-radius: 5px; background: #F0F0EE; display: flex; align-items: center; justify-content: center; font-size: 0.62rem; font-weight: 600; color: #6B6B6B; flex-shrink: 0; }
        .alumno-nombre { flex: 1; font-size: 0.78rem; font-weight: 500; color: #37352F; }
        .alumno-curso { font-size: 0.68rem; color: #9B9A97; }
        .alumno-badges { display: flex; gap: 0.25rem; }
        .alumno-badge { font-size: 0.58rem; font-weight: 600; padding: 0.1rem 0.35rem; border-radius: 3px; background: #F0F0EE; color: #6B6B6B; }

        .aviso-row { padding: 0.75rem 0; border-bottom: 1px solid #F5F5F3; }
        .aviso-row:last-child { border-bottom: none; }
        .aviso-top { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; }
        .aviso-titulo { font-size: 0.8rem; font-weight: 500; color: #37352F; flex: 1; }
        .aviso-fecha { font-size: 0.68rem; color: #9B9A97; }
        .aviso-meta { display: flex; align-items: center; justify-content: space-between; }
        .aviso-dest { font-size: 0.7rem; color: #9B9A97; }
        .aviso-leidos { font-size: 0.68rem; color: #9B9A97; }
        .aviso-tipo { font-size: 0.6rem; font-weight: 600; padding: 0.12rem 0.4rem; border-radius: 3px; }

        .nuevo-aviso { background: #FAFAF8; border: 1px dashed #E8E8E5; border-radius: 10px; padding: 1.5rem; text-align: center; margin-bottom: 1rem; }
        .nuevo-aviso-title { font-size: 0.82rem; font-weight: 600; color: #37352F; margin-bottom: 0.3rem; }
        .nuevo-aviso-sub { font-size: 0.75rem; color: #9B9A97; margin-bottom: 1rem; }
        .aviso-tipos-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.5rem; }
        .aviso-tipo-btn { padding: 0.65rem; border: 1px solid #E8E8E5; border-radius: 7px; background: white; cursor: pointer; font-family: inherit; font-size: 0.75rem; font-weight: 500; color: #37352F; transition: all 0.12s; text-align: center; }
        .aviso-tipo-btn:hover { border-color: #37352F; background: #FAFAF8; }
        .aviso-ico { font-size: 1.1rem; display: block; margin-bottom: 0.3rem; }
      `}</style>

      <div className="fam">
        <h1 className="fam-title">👨‍👩‍👧 Familias</h1>
        <p className="fam-sub">Portal de comunicación con apoderados · {alumnos?.length ?? 0} alumnos registrados</p>

        {/* Stats */}
        <div className="fam-stats">
          {[
            { n: 'Alumnos',        v: String(alumnos?.length ?? 0),  t: 'Con ficha activa' },
            { n: 'Avisos enviados', v: String(AVISOS.length),         t: 'Este mes' },
            { n: 'Tasa lectura',   v: '87%',                          t: 'Apoderados conectados' },
            { n: 'Respuestas',     v: '12',                           t: 'Mensajes sin responder' },
          ].map(s => (
            <div key={s.n} className="fam-stat">
              <div className="fam-stat-n">{s.n}</div>
              <div className="fam-stat-v">{s.v}</div>
              <div className="fam-stat-t">{s.t}</div>
            </div>
          ))}
        </div>

        {/* Nuevo aviso */}
        <div className="nuevo-aviso">
          <div className="nuevo-aviso-title">Enviar aviso a apoderados</div>
          <div className="nuevo-aviso-sub">Elige el tipo de comunicación</div>
          <div className="aviso-tipos-grid">
            {[
              { icon: '📢', label: 'Aviso general' },
              { icon: '⚠️', label: 'Inasistencia' },
              { icon: '📝', label: 'Notas publicadas' },
              { icon: '📅', label: 'Reunión' },
              { icon: '💊', label: 'Salud' },
              { icon: '✉️', label: 'Mensaje directo' },
            ].map(t => (
              <button key={t.label} className="aviso-tipo-btn">
                <span className="aviso-ico">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="fam-grid">
          {/* Lista alumnos */}
          <div className="fam-card">
            <div className="fam-card-hd">
              <span className="fam-card-title">Directorio de familias</span>
              <button className="fam-btn">Exportar →</button>
            </div>
            {(alumnos ?? []).slice(0, 10).map(a => {
              const nombre    = `${a.apellido_paterno}, ${a.nombre}`
              const iniciales = `${a.nombre[0]}${a.apellido_paterno[0]}`.toUpperCase()
              return (
                <div key={a.id} className="alumno-row">
                  <div className="alumno-avatar">{iniciales}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="alumno-nombre">{nombre}</div>
                    <div className="alumno-curso">{(a as any).cursos?.nombre ?? '—'}</div>
                  </div>
                  <div className="alumno-badges">
                    {a.alumno_sep    && <span className="alumno-badge">SEP</span>}
                    {a.beneficio_pae && <span className="alumno-badge">PAE</span>}
                  </div>
                  <button className="fam-btn" style={{ flexShrink: 0 }}>✉️</button>
                </div>
              )
            })}
          </div>

          {/* Historial avisos */}
          <div className="fam-card">
            <div className="fam-card-hd">
              <span className="fam-card-title">Avisos recientes</span>
              <button className="fam-btn fam-btn-dark">+ Nuevo</button>
            </div>
            {AVISOS.map(av => {
              const est = TIPO_STYLE[av.tipo]
              return (
                <div key={av.id} className="aviso-row">
                  <div className="aviso-top">
                    <span className="aviso-tipo" style={{ background: est.bg, color: est.color }}>{av.tipo}</span>
                    <span className="aviso-titulo">{av.titulo}</span>
                    <span className="aviso-fecha">{av.fecha}</span>
                  </div>
                  <div className="aviso-meta">
                    <span className="aviso-dest">→ {av.destinatarios}</span>
                    <span className="aviso-leidos">{av.leidos}/{av.total} leídos</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
