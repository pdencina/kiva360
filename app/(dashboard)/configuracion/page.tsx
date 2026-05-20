export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*, establecimientos(*)')
    .eq('id', user?.id ?? '')
    .single()

  const estab = (perfil as any)?.establecimientos

  const USUARIOS_DEMO = [
    { nombre: 'Pablo Encina',    email: 'admin@kiva360.cl',    rol: 'Director',     activo: true  },
    { nombre: 'María González',  email: 'profesora@kiva360.cl',rol: 'Profesora',    activo: true  },
    { nombre: 'Jorge Soto',      email: 'utp@kiva360.cl',      rol: 'UTP',          activo: true  },
  ]

  const ROLES = [
    { rol: 'director',  desc: 'Acceso completo al sistema',               permisos: ['Todo'] },
    { rol: 'utp',       desc: 'Planificación, evaluaciones y reportes',   permisos: ['Libro', 'Evaluaciones', 'Reportes', 'Planificación'] },
    { rol: 'profesor',  desc: 'Libro de clases y comunicación',           permisos: ['Libro', 'Evaluaciones', 'Comunicación'] },
    { rol: 'apoderado', desc: 'Solo vista de notas y asistencia del hijo', permisos: ['Solo lectura'] },
  ]

  return (
    <>
      <style>{`
        .cfg { font-family: 'Inter', system-ui, sans-serif; width: 100%; }
        .cfg-title { font-size: 1.5rem; font-weight: 700; color: #37352F; letter-spacing: -0.03em; margin-bottom: 0.2rem; }
        .cfg-sub { font-size: 0.8rem; color: #9B9A97; margin-bottom: 1.5rem; }

        .cfg-tabs { display: flex; border-bottom: 1px solid #E8E8E5; margin-bottom: 1.5rem; }
        .cfg-tab { font-size: 0.78rem; font-weight: 500; padding: 0.55rem 1rem; color: #9B9A97; border-bottom: 2px solid transparent; cursor: pointer; border-top: none; border-left: none; border-right: none; background: none; font-family: inherit; transition: all 0.12s; margin-bottom: -1px; }
        .cfg-tab.active { color: #37352F; border-bottom-color: #37352F; }
        .cfg-tab:hover { color: #37352F; }

        .cfg-card { background: white; border: 1px solid #E8E8E5; border-radius: 10px; padding: 1.25rem; margin-bottom: 1rem; }
        .cfg-card-title { font-size: 0.78rem; font-weight: 600; color: #37352F; margin-bottom: 1rem; }

        .cfg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 0.85rem; }
        .cfg-field { }
        .cfg-label { display: block; font-size: 0.7rem; font-weight: 500; color: #9B9A97; margin-bottom: 0.35rem; letter-spacing: 0.04em; text-transform: uppercase; }
        .cfg-input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #E8E8E5; border-radius: 7px; font-size: 0.82rem; color: #37352F; background: white; outline: none; font-family: inherit; transition: border-color 0.15s; }
        .cfg-input:focus { border-color: #37352F; box-shadow: 0 0 0 2px rgba(55,53,47,0.06); }
        .cfg-input[disabled] { background: #FAFAF8; color: #9B9A97; cursor: not-allowed; }

        .cfg-btn { font-size: 0.78rem; font-weight: 500; padding: 0.55rem 1.1rem; border-radius: 7px; cursor: pointer; font-family: inherit; transition: all 0.12s; border: none; }
        .cfg-btn-dark { background: #37352F; color: white; }
        .cfg-btn-dark:hover { background: #1A1A1A; }
        .cfg-btn-ghost { background: white; color: #6B6B6B; border: 1px solid #E8E8E5; }
        .cfg-btn-ghost:hover { border-color: #37352F; color: #37352F; }
        .cfg-btn-danger { background: white; color: #DC2626; border: 1px solid #FECACA; }
        .cfg-btn-danger:hover { background: #FEF2F2; }

        .user-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0; border-bottom: 1px solid #F5F5F3; }
        .user-row:last-child { border-bottom: none; }
        .user-av { width: 30px; height: 30px; border-radius: 5px; background: #F0F0EE; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 600; color: #6B6B6B; flex-shrink: 0; }
        .user-nombre { font-size: 0.8rem; font-weight: 500; color: #37352F; }
        .user-email { font-size: 0.7rem; color: #9B9A97; }
        .user-rol { font-size: 0.68rem; font-weight: 600; padding: 0.12rem 0.45rem; border-radius: 3px; background: #F0F0EE; color: #6B6B6B; }
        .user-activo { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

        .rol-row { display: flex; gap: 0.75rem; padding: 0.65rem 0; border-bottom: 1px solid #F5F5F3; align-items: flex-start; }
        .rol-row:last-child { border-bottom: none; }
        .rol-name { font-size: 0.8rem; font-weight: 600; color: #37352F; width: 90px; flex-shrink: 0; text-transform: capitalize; }
        .rol-desc { font-size: 0.75rem; color: #6B6B6B; flex: 1; }
        .rol-perms { display: flex; gap: 0.25rem; flex-wrap: wrap; }
        .rol-perm { font-size: 0.6rem; font-weight: 500; padding: 0.1rem 0.4rem; border-radius: 3px; background: #F5F5F3; color: #9B9A97; }

        .integ-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid #F5F5F3; }
        .integ-row:last-child { border-bottom: none; }
        .integ-icon { font-size: 1.1rem; flex-shrink: 0; }
        .integ-name { font-size: 0.82rem; font-weight: 600; color: #37352F; }
        .integ-desc { font-size: 0.7rem; color: #9B9A97; }
        .integ-status { margin-left: auto; font-size: 0.68rem; font-weight: 600; }
        .cfg-divider { height: 1px; background: #F0F0EE; margin: 1rem 0; }
      `}</style>

      <div className="cfg">
        <h1 className="cfg-title">⚙️ Configuración</h1>
        <p className="cfg-sub">Datos del establecimiento, usuarios y preferencias del sistema</p>

        {/* Datos del colegio */}
        <div className="cfg-card">
          <div className="cfg-card-title">Datos del establecimiento</div>
          <div className="cfg-grid">
            <div className="cfg-field">
              <label className="cfg-label">RBD</label>
              <input className="cfg-input" defaultValue={estab?.rbd ?? '12345-6'} disabled />
            </div>
            <div className="cfg-field">
              <label className="cfg-label">Tipo</label>
              <input className="cfg-input" defaultValue={estab?.tipo ?? 'Particular subvencionado'} />
            </div>
            <div className="cfg-field" style={{ gridColumn: '1 / -1' }}>
              <label className="cfg-label">Nombre del establecimiento</label>
              <input className="cfg-input" defaultValue={estab?.nombre ?? 'Colegio San Patricio de Santiago'} />
            </div>
            <div className="cfg-field">
              <label className="cfg-label">Región</label>
              <input className="cfg-input" defaultValue={estab?.region ?? 'Metropolitana'} />
            </div>
            <div className="cfg-field">
              <label className="cfg-label">Comuna</label>
              <input className="cfg-input" defaultValue={estab?.comuna ?? 'Providencia'} />
            </div>
            <div className="cfg-field" style={{ gridColumn: '1 / -1' }}>
              <label className="cfg-label">Director/a</label>
              <input className="cfg-input" defaultValue={estab?.director ?? 'Pablo Encina'} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="cfg-btn cfg-btn-dark">Guardar cambios</button>
            <button className="cfg-btn cfg-btn-ghost">Cancelar</button>
          </div>
        </div>

        {/* Usuarios */}
        <div className="cfg-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span className="cfg-card-title" style={{ margin: 0 }}>Usuarios del sistema</span>
            <button className="cfg-btn cfg-btn-dark">+ Invitar usuario</button>
          </div>
          {USUARIOS_DEMO.map(u => (
            <div key={u.email} className="user-row">
              <div className="user-activo" style={{ background: u.activo ? '#16A34A' : '#9B9A97' }} />
              <div className="user-av">{u.nombre.slice(0,2).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div className="user-nombre">{u.nombre}</div>
                <div className="user-email">{u.email}</div>
              </div>
              <span className="user-rol">{u.rol}</span>
              <button className="cfg-btn cfg-btn-ghost" style={{ fontSize: '0.7rem', padding: '0.3rem 0.65rem' }}>Editar</button>
            </div>
          ))}
        </div>

        {/* Roles */}
        <div className="cfg-card">
          <div className="cfg-card-title">Roles y permisos</div>
          {ROLES.map(r => (
            <div key={r.rol} className="rol-row">
              <span className="rol-name">{r.rol}</span>
              <span className="rol-desc">{r.desc}</span>
              <div className="rol-perms">
                {r.permisos.map(p => <span key={p} className="rol-perm">{p}</span>)}
              </div>
            </div>
          ))}
        </div>

        {/* Integraciones */}
        <div className="cfg-card">
          <div className="cfg-card-title">Estado de integraciones</div>
          {[
            { icon: '🔗', name: 'SIGE',    desc: 'Sistema de Información General de Estudiantes · MINEDUC', activo: true  },
            { icon: '🎓', name: 'SAE',     desc: 'Sistema de Admisión Escolar · Ley Inclusión N°20.845',     activo: true  },
            { icon: '🍽️', name: 'JUNAEB',  desc: 'Junta Nacional de Auxilio Escolar y Becas',               activo: true  },
          ].map(i => (
            <div key={i.name} className="integ-row">
              <span className="integ-icon">{i.icon}</span>
              <div>
                <div className="integ-name">{i.name}</div>
                <div className="integ-desc">{i.desc}</div>
              </div>
              <span className="integ-status" style={{ color: i.activo ? '#16A34A' : '#9B9A97' }}>
                {i.activo ? '● Conectado' : '○ Desconectado'}
              </span>
              <button className="cfg-btn cfg-btn-ghost" style={{ fontSize: '0.7rem', padding: '0.3rem 0.65rem', marginLeft: '0.5rem' }}>
                Configurar
              </button>
            </div>
          ))}
        </div>

        {/* Zona peligrosa */}
        <div className="cfg-card" style={{ borderColor: '#FECACA' }}>
          <div className="cfg-card-title" style={{ color: '#DC2626' }}>Zona de peligro</div>
          <p style={{ fontSize: '0.78rem', color: '#6B6B6B', marginBottom: '1rem' }}>
            Estas acciones son irreversibles. Procede con precaución.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="cfg-btn cfg-btn-danger">Eliminar todos los datos del año</button>
            <button className="cfg-btn cfg-btn-danger">Desactivar cuenta</button>
          </div>
        </div>
      </div>
    </>
  )
}
