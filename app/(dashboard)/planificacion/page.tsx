export const dynamic = 'force-dynamic'

export default function PlanificacionPage() {
  const OA_MATEMATICAS = [
    { oa: 'OA1', desc: 'Contar, leer y escribir números hasta 1.000', nivel: '3° básico', estado: 'completado' },
    { oa: 'OA2', desc: 'Identificar el orden de los números hasta 1.000', nivel: '3° básico', estado: 'completado' },
    { oa: 'OA3', desc: 'Representar fracciones propias', nivel: '3° básico', estado: 'en_curso' },
    { oa: 'OA4', desc: 'Multiplicar por 1 dígito', nivel: '3° básico', estado: 'en_curso' },
    { oa: 'OA5', desc: 'Resolver problemas de multiplicación y división', nivel: '3° básico', estado: 'pendiente' },
    { oa: 'OA6', desc: 'Medir longitudes con unidades estandarizadas', nivel: '3° básico', estado: 'pendiente' },
  ]

  const UNIDADES = [
    { id: 1, nombre: 'Números hasta 1.000', asignatura: 'Matemáticas', inicio: '03 mar', fin: '14 mar', oas: ['OA1','OA2'], estado: 'completada', horas: 12 },
    { id: 2, nombre: 'Fracciones básicas',  asignatura: 'Matemáticas', inicio: '17 mar', fin: '11 abr', oas: ['OA3'],       estado: 'en_curso',   horas: 16 },
    { id: 3, nombre: 'Multiplicación',       asignatura: 'Matemáticas', inicio: '14 abr', fin: '02 may', oas: ['OA4','OA5'], estado: 'pendiente',  horas: 14 },
    { id: 4, nombre: 'Comprensión lectora', asignatura: 'Lenguaje',     inicio: '03 mar', fin: '28 mar', oas: ['OA1','OA2'], estado: 'completada', horas: 20 },
    { id: 5, nombre: 'Producción de textos',asignatura: 'Lenguaje',     inicio: '31 mar', fin: '25 abr', oas: ['OA5','OA6'], estado: 'en_curso',   horas: 18 },
    { id: 6, nombre: 'Ecosistemas',          asignatura: 'Ciencias',    inicio: '07 abr', fin: '09 may', oas: ['OA7'],       estado: 'en_curso',   horas: 10 },
  ]

  const ESTADO_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    completada:  { bg: '#F0F0EE', color: '#6B6B6B', label: '✓ Completada' },
    en_curso:    { bg: '#FAFAF8', color: '#37352F', label: '→ En curso'   },
    pendiente:   { bg: '#FAFAF8', color: '#9B9A97', label: '○ Pendiente'  },
    completado:  { bg: '#F0F0EE', color: '#6B6B6B', label: '✓'            },
  }

  const asignaturas = [...new Set(UNIDADES.map(u => u.asignatura))]
  const completadas = UNIDADES.filter(u => u.estado === 'completada').length
  const pctAvance   = Math.round((completadas / UNIDADES.length) * 100)

  return (
    <>
      <style>{`
        .pl { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .pl-header { margin-bottom: 1.5rem; }
        .pl-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .pl-sub { font-size: 0.8rem; color: #9B9A97; }

        .pl-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #E8E8E5; border: 1px solid #E8E8E5; border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
        .pl-stat { background: white; padding: 1.1rem; }
        .pl-stat-n { font-size: 0.65rem; font-weight: 600; color: #9B9A97; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .pl-stat-v { font-size: 1.6rem; font-weight: 700; color: #37352F; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.3rem; }
        .pl-stat-t { font-size: 0.7rem; color: #9B9A97; }

        .pl-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.1rem; margin-bottom: 1rem; }
        .pl-card-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .pl-card-title { font-size: 0.78rem; font-weight: 600; color: #37352F; }
        .pl-btn { font-size: 0.72rem; font-weight: 500; color: #6B6B6B; background: #F0F0EE; border: none; border-radius: 6px; padding: 0.3rem 0.7rem; cursor: pointer; font-family: inherit; transition: background 0.12s; }
        .pl-btn:hover { background: #E8E8E5; color: #37352F; }
        .pl-btn-dark { background: #37352F; color: white; }
        .pl-btn-dark:hover { background: #1A1A1A; }

        .unidad-row {
          display: flex; align-items: center; gap: 1rem; padding: 0.65rem 0;
          border-bottom: 1px solid #F5F5F3; transition: background 0.1s;
        }
        .unidad-row:last-child { border-bottom: none; }
        .unidad-asig { width: 80px; flex-shrink: 0; }
        .unidad-asig-chip { font-size: 0.6rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 3px; background: #F0F0EE; color: #6B6B6B; }
        .unidad-nombre { flex: 1; font-size: 0.82rem; font-weight: 500; color: #37352F; }
        .unidad-fechas { font-size: 0.7rem; color: #9B9A97; width: 130px; flex-shrink: 0; }
        .unidad-oas { display: flex; gap: 0.25rem; flex-wrap: wrap; width: 100px; flex-shrink: 0; }
        .oa-chip { font-size: 0.58rem; font-weight: 600; padding: 0.1rem 0.35rem; border-radius: 3px; background: #F5F5F3; color: #9B9A97; }
        .unidad-estado { flex-shrink: 0; }
        .estado-tag { font-size: 0.68rem; font-weight: 500; padding: 0.2rem 0.55rem; border-radius: 4px; }

        .oa-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
        .oa-card { border: 1px solid #E8E8E5; border-radius: 7px; padding: 0.75rem; display: flex; gap: 0.65rem; align-items: flex-start; }
        .oa-num { font-size: 0.65rem; font-weight: 700; color: #9B9A97; flex-shrink: 0; width: 28px; }
        .oa-desc { font-size: 0.75rem; color: #37352F; flex: 1; line-height: 1.5; }
        .oa-estado { flex-shrink: 0; }
      `}</style>

      <div className="pl">
        <div className="pl-header">
          <h1 className="pl-title">🗓️ Planificación Curricular</h1>
          <p className="pl-sub">Objetivos de Aprendizaje MINEDUC · Año 2026 · 3°A</p>
        </div>

        {/* Stats */}
        <div className="pl-stats">
          {[
            { n: 'Unidades totales',   v: String(UNIDADES.length),   t: `${asignaturas.length} asignaturas` },
            { n: 'Completadas',        v: String(completadas),        t: `${pctAvance}% de avance` },
            { n: 'En curso',           v: String(UNIDADES.filter(u => u.estado === 'en_curso').length),  t: 'Actualmente' },
            { n: 'Horas planificadas', v: String(UNIDADES.reduce((a, u) => a + u.horas, 0)), t: 'Horas pedagógicas' },
          ].map(s => (
            <div key={s.n} className="pl-stat">
              <div className="pl-stat-n">{s.n}</div>
              <div className="pl-stat-v">{s.v}</div>
              <div className="pl-stat-t">{s.t}</div>
            </div>
          ))}
        </div>

        {/* Barra de avance */}
        <div className="pl-card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#37352F' }}>Avance curricular 2026</span>
            <span style={{ fontSize: '0.75rem', color: '#9B9A97' }}>{pctAvance}%</span>
          </div>
          <div style={{ height: '6px', background: '#F0F0EE', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pctAvance}%`, background: '#37352F', borderRadius: '10px', transition: 'width 0.8s' }} />
          </div>
        </div>

        {/* Unidades didácticas */}
        <div className="pl-card">
          <div className="pl-card-hd">
            <span className="pl-card-title">Unidades didácticas</span>
            <button className="pl-btn pl-btn-dark">+ Nueva unidad</button>
          </div>
          {UNIDADES.map(u => {
            const est = ESTADO_STYLE[u.estado]
            return (
              <div key={u.id} className="unidad-row">
                <div className="unidad-asig">
                  <span className="unidad-asig-chip">{u.asignatura.slice(0, 7)}</span>
                </div>
                <div className="unidad-nombre">{u.nombre}</div>
                <div className="unidad-fechas">{u.inicio} → {u.fin}</div>
                <div className="unidad-oas">
                  {u.oas.map(oa => <span key={oa} className="oa-chip">{oa}</span>)}
                </div>
                <div className="unidad-estado">
                  <span className="estado-tag" style={{ background: est.bg, color: est.color }}>{est.label}</span>
                </div>
                <button className="pl-btn" style={{ flexShrink: 0 }}>Ver →</button>
              </div>
            )
          })}
        </div>

        {/* OA Matemáticas */}
        <div className="pl-card">
          <div className="pl-card-hd">
            <span className="pl-card-title">Objetivos de Aprendizaje — Matemáticas 3°</span>
            <button className="pl-btn">Ver todos los OA</button>
          </div>
          <div className="oa-grid">
            {OA_MATEMATICAS.map(oa => {
              const est = ESTADO_STYLE[oa.estado]
              return (
                <div key={oa.oa} className="oa-card">
                  <span className="oa-num">{oa.oa}</span>
                  <span className="oa-desc">{oa.desc}</span>
                  <span className="oa-estado">
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.1rem 0.4rem', borderRadius: '3px', background: est.bg, color: est.color }}>
                      {est.label}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
