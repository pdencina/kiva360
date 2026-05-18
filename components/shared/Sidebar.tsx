'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Perfil } from '@/types'
import { iniciales } from '@/lib/utils'

interface Props {
  perfil: Perfil & { establecimientos?: { nombre: string } | null }
}

const NAV_ITEMS = [
  {
    section: 'Principal',
    items: [
      { href: '/dashboard',         icon: '🏠', label: 'Inicio' },
      { href: '/libro',             icon: '📒', label: 'Libro de Clases' },
      { href: '/evaluaciones',      icon: '📝', label: 'Evaluaciones',   badge: 3  },
      { href: '/planificacion',     icon: '🗓️', label: 'Planificación'  },
    ],
  },
  {
    section: 'Integración MINEDUC',
    items: [
      { href: '/integraciones/sige',   icon: '🔗', label: 'SIGE'   },
      { href: '/integraciones/sae',    icon: '🎓', label: 'SAE'    },
      { href: '/integraciones/junaeb', icon: '🍽️', label: 'JUNAEB', badge: 2 },
    ],
  },
  {
    section: 'Comunidad',
    items: [
      { href: '/comunicacion', icon: '💬', label: 'Comunicación', badge: 5 },
      { href: '/familias',     icon: '👨‍👩‍👧', label: 'Familias'      },
      { href: '/reportes',     icon: '📊', label: 'Reportes'      },
    ],
  },
]

export function Sidebar({ perfil }: Props) {
  const pathname = usePathname()

  return (
    <aside
      className="w-[240px] bg-[#0A1929] flex flex-col fixed top-0 left-0 bottom-0 z-50"
      aria-label="Navegación principal"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.07]">
        <div className="w-9 h-9 bg-blue-700 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0">
          📚
        </div>
        <div>
          <div className="font-serif text-lg text-white leading-none">Kiva360</div>
          <div className="text-[10px] text-blue-400 font-medium tracking-widest uppercase">
            Educación Chile
          </div>
        </div>
      </div>

      {/* Usuario */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.07]">
        <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {iniciales(perfil.nombre)}
        </div>
        <div className="min-w-0">
          <div className="text-sm text-blue-100 font-medium truncate">{perfil.nombre}</div>
          <div className="text-[11px] text-blue-400 capitalize">{perfil.rol}</div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map(group => (
          <div key={group.section} className="mb-1">
            <div className="text-[10px] font-bold tracking-widest uppercase text-blue-950 px-4 py-2">
              {group.section}
            </div>
            {group.items.map(item => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-4 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-blue-700/20 text-blue-300 border-l-[3px] border-blue-500 pl-[13px]'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
                  )}
                >
                  <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer — integraciones activas */}
      <div className="px-4 py-3 border-t border-white/[0.07]">
        <div className="text-[10px] text-blue-950 font-bold uppercase tracking-wider mb-1.5">
          Integraciones activas
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['SIGE', 'SAE', 'JUNAEB'].map(int => (
            <span
              key={int}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-900/40 text-teal-400 border border-teal-800/40"
            >
              {int} ●
            </span>
          ))}
        </div>
      </div>
    </aside>
  )
}
