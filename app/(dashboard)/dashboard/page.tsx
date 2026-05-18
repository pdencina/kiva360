import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getDashboardStats,
  getAsistenciaPorCurso,
  getEvaluacionesProximas,
  getEstadoIntegraciones,
} from '@/lib/actions/dashboard'
import { createClient } from '@/lib/supabase/server'
import { formatFecha, colorAsistencia } from '@/lib/utils'
import { StatCard       } from '@/components/dashboard/StatCard'
import { AsistenciaBar  } from '@/components/dashboard/AsistenciaBar'
import { EvalItem       } from '@/components/dashboard/EvalItem'
import { IntegStatus    } from '@/components/dashboard/IntegStatus'
import { QuickActions   } from '@/components/dashboard/QuickActions'

export const metadata: Metadata = { title: 'Dashboard' }

// Revalidar cada 5 minutos
export const revalidate = 300

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Cargar todos los datos en paralelo
  const [stats, asistencia, evaluaciones, integraciones] = await Promise.all([
    getDashboardStats(),
    getAsistenciaPorCurso(),
    getEvaluacionesProximas(),
    getEstadoIntegraciones(),
  ])

  const nombreCorto = user?.user_metadata?.nombre?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'Profe'

  const hoy = formatFecha(new Date(), "EEEE d 'de' MMMM 'de' yyyy")

  return (
    <div className="space-y-5">

      {/* Saludo */}
      <div>
        <h1 className="font-serif text-3xl text-gray-900 mb-0.5">
          Hola, {nombreCorto} 👋
        </h1>
        <p className="text-sm text-gray-400 capitalize">{hoy}</p>
      </div>

      {/* Banner SIMCE */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0A1929] via-[#0D47A1] to-[#1565C0] p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white mb-1">
            📋 SIMCE 2025 se acerca — 42 días
          </h3>
          <p className="text-sm text-blue-200 leading-relaxed">
            3°A tiene 78% de logro en Comprensión Lectora. 3 OA requieren refuerzo urgente antes de la prueba.
          </p>
        </div>
        <Link
          href="/planificacion"
          className="flex-shrink-0 bg-white text-blue-800 text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
        >
          Ver plan de refuerzo
        </Link>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          value={stats.totalAlumnos.toLocaleString('es-CL')}
          label="Estudiantes activos"
          accent="blue"
          tag="↑ 12 nuevos este mes"
          tagColor="green"
        />
        <StatCard
          icon="✅"
          value={stats.pctAsistenciaHoy !== null ? `${stats.pctAsistenciaHoy}%` : '—'}
          label="Asistencia hoy"
          accent="green"
          tag="↑ +1.2% vs semana"
          tagColor="green"
        />
        <StatCard
          icon="⭐"
          value="5,8"
          label="Promedio general"
          accent="purple"
          tag="↑ +0.3 vs mes ant."
          tagColor="green"
        />
        <StatCard
          icon="⚠️"
          value={String(stats.alertas)}
          label="Alertas activas"
          accent="red"
          tag="3 críticas"
          tagColor="yellow"
        />
      </div>

      {/* Fila principal */}
      <div className="grid grid-cols-[2fr_1fr] gap-4">

        {/* Asistencia por curso */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">📊 Asistencia por curso — Hoy</h2>
            <Link href="/libro" className="text-sm text-blue-600 hover:underline font-medium">
              Ver todos →
            </Link>
          </div>

          {asistencia.length > 0 ? (
            <div className="space-y-0">
              {asistencia.map(curso => (
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
            /* Fallback con datos demo si no hay registros hoy */
            <div className="space-y-0">
              {[
                { nombre:'1°A', pct:96, p:29, t:30 },
                { nombre:'2°B', pct:88, p:28, t:32 },
                { nombre:'3°A', pct:94, p:33, t:35 },
                { nombre:'4°C', pct:76, p:26, t:34 },
                { nombre:'5°A', pct:91, p:33, t:36 },
                { nombre:'6°B', pct:65, p:26, t:40 },
              ].map(c => (
                <AsistenciaBar
                  key={c.nombre}
                  nombre={c.nombre}
                  porcentaje={c.pct}
                  presentes={c.p}
                  total={c.t}
                />
              ))}
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div className="space-y-4">

          {/* Integraciones */}
          <IntegStatus integ={integraciones} />

          {/* Evaluaciones próximas */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 text-sm">📝 Evaluaciones próximas</h2>
              <Link href="/evaluaciones" className="text-xs text-blue-600 hover:underline">
                Ver todas →
              </Link>
            </div>
            <div className="space-y-0">
              {evaluaciones.length > 0 ? (
                evaluaciones.map(ev => (
                  <EvalItem
                    key={ev.id}
                    titulo={ev.titulo}
                    asignatura={ev.asignatura}
                    curso={(ev.cursos as any)?.nombre ?? ''}
                    fecha={ev.fecha ?? ''}
                  />
                ))
              ) : (
                <>
                  <EvalItem titulo="Control de Fracciones" asignatura="Matemáticas" curso="3°A" fecha="Hoy" />
                  <EvalItem titulo="Comprensión Lectora"   asignatura="Lenguaje"    curso="5°B" fecha="Mañana" />
                  <EvalItem titulo="Ecosistemas"           asignatura="Cs. Naturales" curso="4°C" fecha="Vie 23" />
                </>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
