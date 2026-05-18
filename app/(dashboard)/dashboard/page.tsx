import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getDashboardStats,
  getAsistenciaPorCurso,
  getEvaluacionesProximas,
  getEstadoIntegraciones,
} from '@/lib/actions/dashboard'
import { createClient } from '@/lib/supabase/server'
import { formatFecha } from '@/lib/utils'
import { StatCard } from '@/components/dashboard/StatCard'
import { AsistenciaBar } from '@/components/dashboard/AsistenciaBar'
import { EvalItem } from '@/components/dashboard/EvalItem'
import { IntegStatus } from '@/components/dashboard/IntegStatus'
import { QuickActions } from '@/components/dashboard/QuickActions'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

type EvaluacionProxima = {
  id: string | number
  titulo: string
  asignatura: string
  fecha?: string | null
  cursos?: {
    nombre?: string | null
  } | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [stats, asistencia, evaluacionesRaw, integraciones] = await Promise.all([
    getDashboardStats(),
    getAsistenciaPorCurso(),
    getEvaluacionesProximas(),
    getEstadoIntegraciones(),
  ])

  const evaluaciones = evaluacionesRaw as EvaluacionProxima[]

  const nombreCorto =
    user?.user_metadata?.nombre?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'Profe'

  const hoy = formatFecha(new Date(), "EEEE d 'de' MMMM 'de' yyyy")

  const asistenciaPromedio =
    asistencia.length > 0
      ? Math.round(
          asistencia.reduce((acc, curso) => acc + (curso.porcentaje ?? 0), 0) /
            asistencia.length
        )
      : null

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-3xl text-gray-900 mb-0.5">
          Hola, {nombreCorto} 👋
        </h1>
        <p className="text-sm text-gray-400 capitalize">{hoy}</p>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-[#0A1929] via-[#0D47A1] to-[#1565C0] p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white mb-1">
            📊 Panel operativo Kiva360
          </h3>
          <p className="text-sm text-blue-200 leading-relaxed">
            Métricas reales de alumnos, cursos, asistencia, evaluaciones e integraciones.
          </p>
        </div>
        <Link
          href="/asistencia"
          className="flex-shrink-0 bg-white text-blue-800 text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
        >
          Registrar asistencia
        </Link>
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          value={stats.totalAlumnos.toLocaleString('es-CL')}
          label="Estudiantes activos"
          accent="blue"
          tag={`${stats.totalCursos} cursos activos`}
          tagColor="green"
        />

        <StatCard
          icon="✅"
          value={stats.pctAsistenciaHoy !== null ? `${stats.pctAsistenciaHoy}%` : '—'}
          label="Asistencia hoy"
          accent="green"
          tag={`${stats.presentesHoy} presentes · ${stats.ausentesHoy} ausentes`}
          tagColor={stats.ausentesHoy > 0 ? 'yellow' : 'green'}
        />

        <StatCard
          icon="📝"
          value={String(stats.evalPendientes)}
          label="Evaluaciones próximas"
          accent="purple"
          tag="Próximos 7 días"
          tagColor="green"
        />

        <StatCard
          icon="⚠️"
          value={String(stats.alertas)}
          label="Alertas activas"
          accent="red"
          tag={stats.alertas > 0 ? 'Requiere revisión' : 'Sin alertas'}
          tagColor={stats.alertas > 0 ? 'yellow' : 'green'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">📊 Asistencia por curso</h2>
              {asistenciaPromedio !== null && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Promedio general: {asistenciaPromedio}%
                </p>
              )}
            </div>
            <Link href="/asistencia" className="text-sm text-blue-600 hover:underline font-medium">
              Ver asistencia →
            </Link>
          </div>

          {asistencia.length > 0 ? (
            <div className="space-y-0">
              {asistencia.map((curso) => (
                <AsistenciaBar
                  key={curso.cursoId}
                  nombre={curso.nombre}
                  porcentaje={curso.porcentaje}
                  presentes={curso.presentes}
                  total={curso.total}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="font-semibold text-gray-800">Aún no hay asistencia registrada</h3>
              <p className="text-sm text-gray-500 mt-1">
                Crea cursos y alumnos, luego registra la asistencia del día.
              </p>
              <Link href="/asistencia" className="btn btn-primary mt-4">
                Ir a asistencia
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <IntegStatus integ={integraciones} />

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 text-sm">
                📝 Evaluaciones próximas
              </h2>
              <Link href="/evaluaciones" className="text-xs text-blue-600 hover:underline">
                Ver todas →
              </Link>
            </div>

            <div className="space-y-0">
              {evaluaciones.length > 0 ? (
                evaluaciones.map((ev) => (
                  <EvalItem
                    key={ev.id}
                    titulo={ev.titulo}
                    asignatura={ev.asignatura}
                    curso={ev.cursos?.nombre ?? ''}
                    fecha={ev.fecha ?? ''}
                  />
                ))
              ) : (
                <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                  No hay evaluaciones próximas.
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">
              🚀 Próximas acciones
            </h2>
            <div className="space-y-2 text-sm">
              <Link href="/cursos" className="block rounded-xl bg-gray-50 px-3 py-2 hover:bg-blue-50">
                Crear o revisar cursos
              </Link>
              <Link href="/alumnos" className="block rounded-xl bg-gray-50 px-3 py-2 hover:bg-blue-50">
                Administrar alumnos
              </Link>
              <Link href="/evaluaciones" className="block rounded-xl bg-gray-50 px-3 py-2 hover:bg-blue-50">
                Programar evaluación
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
