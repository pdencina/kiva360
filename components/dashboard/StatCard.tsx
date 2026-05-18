// ── StatCard ──────────────────────────────────────────────────
import { cn } from '@/lib/utils'

type AccentColor = 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'teal'
type TagColor    = 'green' | 'red' | 'yellow' | 'blue'

const accentBorder: Record<AccentColor, string> = {
  blue:   'border-t-blue-700',
  green:  'border-t-teal-600',
  purple: 'border-t-purple-700',
  red:    'border-t-red-500',
  yellow: 'border-t-yellow-500',
  teal:   'border-t-teal-500',
}

const tagStyle: Record<TagColor, string> = {
  green:  'bg-green-100 text-green-800',
  red:    'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue:   'bg-blue-100 text-blue-800',
}

interface StatCardProps {
  icon:      string
  value:     string
  label:     string
  accent:    AccentColor
  tag?:      string
  tagColor?: TagColor
}

export function StatCard({ icon, value, label, accent, tag, tagColor = 'green' }: StatCardProps) {
  return (
    <div className={cn('card border-t-4', accentBorder[accent])}>
      <div className="text-xl mb-2">{icon}</div>
      <div className="text-3xl font-extrabold text-gray-900 leading-none mb-1">{value}</div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
      {tag && (
        <span className={cn('inline-block mt-2 text-[11px] font-bold px-1.5 py-0.5 rounded', tagStyle[tagColor])}>
          {tag}
        </span>
      )}
    </div>
  )
}

// ── AsistenciaBar ─────────────────────────────────────────────

interface AsistenciaBarProps {
  nombre:     string
  porcentaje: number | null
  presentes:  number
  total:      number
}

const getBarColor = (pct: number | null) => {
  if (!pct) return 'bg-gray-200'
  if (pct >= 90) return 'bg-teal-600'
  if (pct >= 75) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getPctColor = (pct: number | null) => {
  if (!pct) return 'text-gray-400'
  if (pct >= 90) return 'text-teal-700'
  if (pct >= 75) return 'text-yellow-700'
  return 'text-red-600'
}

export function AsistenciaBar({ nombre, porcentaje, presentes, total }: AsistenciaBarProps) {
  const pct = porcentaje ?? 0
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className="font-bold text-sm text-gray-800 w-12 flex-shrink-0">{nombre}</div>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', getBarColor(porcentaje))}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={cn('text-xs font-bold w-12 text-right tabular-nums', getPctColor(porcentaje))}>
        {porcentaje !== null ? `${pct}%` : '—'}
      </div>
    </div>
  )
}

// ── EvalItem ──────────────────────────────────────────────────

interface EvalItemProps {
  titulo:     string
  asignatura: string
  curso:      string
  fecha:      string
}

const ASIG_COLORS: Record<string, string> = {
  'Matemáticas':    'bg-blue-500',
  'Lenguaje':       'bg-purple-500',
  'Cs. Naturales':  'bg-teal-600',
  'Historia':       'bg-orange-500',
  'Inglés':         'bg-sky-500',
  'Música':         'bg-pink-500',
}

export function EvalItem({ titulo, asignatura, curso, fecha }: EvalItemProps) {
  const dotColor = ASIG_COLORS[asignatura] ?? 'bg-gray-400'
  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0 text-sm">
      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', dotColor)} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800 truncate text-xs">{titulo}</div>
        <div className="text-[11px] text-gray-400">{curso} · {asignatura}</div>
      </div>
      <div className="text-[11px] text-gray-500 flex-shrink-0">{fecha}</div>
    </div>
  )
}

// ── IntegStatus ───────────────────────────────────────────────

interface IntegStatusProps {
  integ: {
    sige?:   { conectado: boolean; alerta: string | null } | null
    sae?:    { conectado: boolean; alerta: string | null } | null
    junaeb?: { conectado: boolean; alerta: string | null } | null
  } | null
}

const INTEGS = [
  { key: 'sige',   icon: '🔗', nombre: 'SIGE'   },
  { key: 'sae',    icon: '🎓', nombre: 'SAE'    },
  { key: 'junaeb', icon: '🍽️', nombre: 'JUNAEB' },
]

export function IntegStatus({ integ }: IntegStatusProps) {
  return (
    <div className="card">
      <h2 className="font-semibold text-gray-900 text-sm mb-3">Estado integraciones</h2>
      <div className="space-y-2">
        {INTEGS.map(({ key, icon, nombre }) => {
          const data  = integ?.[key as keyof typeof integ]
          const alerta = data?.alerta
          return (
            <div key={key} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-base">{icon}</span>
              <span className="text-xs font-semibold text-gray-800 flex-1">{nombre}</span>
              {alerta ? (
                <span className="text-[10px] font-bold bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
                  {alerta}
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-full">
                  Conectado
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── QuickActions ──────────────────────────────────────────────

import Link from 'next/link'

const ACTIONS = [
  { icon: '✅', label: 'Pasar asistencia', href: '/libro'        },
  { icon: '📝', label: 'Nueva evaluación', href: '/evaluaciones' },
  { icon: '✉️', label: 'Enviar aviso',     href: '/comunicacion' },
  { icon: '📅', label: 'Planificar clase', href: '/planificacion'},
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {ACTIONS.map(a => (
        <Link
          key={a.label}
          href={a.href}
          className="card text-center hover:border-blue-300 hover:bg-blue-50 transition-all group cursor-pointer"
        >
          <div className="text-2xl mb-1.5">{a.icon}</div>
          <div className="text-xs font-semibold text-gray-700 group-hover:text-blue-700">
            {a.label}
          </div>
        </Link>
      ))}
    </div>
  )
}
