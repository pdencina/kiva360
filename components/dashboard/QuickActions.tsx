import Link from 'next/link'

const actions = [
  {
    href: '/cursos',
    icon: '🏫',
    title: 'Cursos',
    description: 'Gestionar cursos',
  },
  {
    href: '/alumnos',
    icon: '👥',
    title: 'Alumnos',
    description: 'Matrícula activa',
  },
  {
    href: '/asistencia',
    icon: '✅',
    title: 'Asistencia',
    description: 'Registrar hoy',
  },
  {
    href: '/evaluaciones',
    icon: '📝',
    title: 'Evaluaciones',
    description: 'Crear pruebas',
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group rounded-2xl bg-white border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl group-hover:bg-blue-100">
              {action.icon}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">{action.title}</div>
              <div className="text-xs text-gray-400">{action.description}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
