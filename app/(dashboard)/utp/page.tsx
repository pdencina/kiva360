export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UTPClient } from '@/components/utp/UTPClient'

export default async function UTPPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [alumnos, notas, planes, cursos, evaluaciones] = await Promise.all([
    supabase.from('alumnos')
      .select('id, nombre, apellido_paterno, alumno_sep, pie, cursos(id, nombre)')
      .eq('activo', true)
      .order('apellido_paterno'),

    supabase.from('notas')
      .select('alumno_id, nota, evaluaciones(asignatura, ponderacion)'),

    supabase.from('planes_clase')
      .select('id, titulo, asignatura, fecha, estado, oas, estrategias, curso_id, cursos(nombre), perfiles(nombre)')
      .order('fecha', { ascending: false })
      .limit(50),

    supabase.from('cursos')
      .select('id, nombre, nivel')
      .order('nombre'),

    supabase.from('evaluaciones')
      .select('id, titulo, asignatura, curso_id, fecha, ponderacion')
      .order('fecha', { ascending: false }),
  ])

  // ── Alumnos en riesgo ─────────────────────────────────────
  const alumnosRiesgo = (alumnos.data ?? []).map(a => {
    const notasA = (notas.data ?? []).filter(n => n.alumno_id === a.id)
    const vals   = notasA.map(n => n.nota).filter(Boolean) as number[]
    const prom   = vals.length > 0 ? Math.round(vals.reduce((x,y) => x+y,0) / vals.length * 10) / 10 : null
    const reprobadas = vals.filter(n => n < 4).length
    return { ...a, promedio: prom, reprobadas, enRiesgo: prom !== null && prom < 5, critico: prom !== null && prom < 4 }
  }).sort((a,b) => (a.promedio ?? 9) - (b.promedio ?? 9))

  // ── Cobertura por asignatura ──────────────────────────────
  const asigStats: Record<string, { total: number; reprobados: number; notas: number[] }> = {}
  ;(notas.data ?? []).forEach((n: any) => {
    const asig = n.evaluaciones?.asignatura
    if (!asig || !n.nota) return
    if (!asigStats[asig]) asigStats[asig] = { total: 0, reprobados: 0, notas: [] }
    asigStats[asig].total++
    asigStats[asig].notas.push(n.nota)
    if (n.nota < 4) asigStats[asig].reprobados++
  })
  const asigRanking = Object.entries(asigStats).map(([asig, s]) => ({
    asig,
    total: s.total,
    reprobados: s.reprobados,
    pct: Math.round(s.reprobados / s.total * 100),
    prom: Math.round(s.notas.reduce((a,b) => a+b,0) / s.notas.length * 10) / 10,
  })).sort((a,b) => b.pct - a.pct)

  // ── Cobertura OA por asignatura ───────────────────────────
  const oaMap: Record<string, Set<string>> = {}
  ;(planes.data ?? []).forEach((p: any) => {
    if (!p.asignatura) return
    if (!oaMap[p.asignatura]) oaMap[p.asignatura] = new Set()
    ;(p.oas ?? []).forEach((oa: string) => oaMap[p.asignatura].add(oa))
  })
  const coberturaOA = Object.entries(oaMap).map(([asig, oas]) => ({
    asig, oas: [...oas], total: oas.size
  }))

  // ── Estadísticas planificaciones ─────────────────────────
  const planesData    = planes.data ?? []
  const realizados    = planesData.filter(p => p.estado === 'realizado').length
  const publicados    = planesData.filter(p => p.estado === 'publicado').length
  const borradores    = planesData.filter(p => p.estado === 'borrador').length
  const pctRealizados = planesData.length > 0 ? Math.round(realizados / planesData.length * 100) : 0

  return (
    <UTPClient
      alumnosRiesgo={alumnosRiesgo as any}
      asigRanking={asigRanking}
      coberturaOA={coberturaOA}
      planes={planesData as any}
      cursos={(cursos.data ?? []) as any}
      stats={{
        totalAlumnos: alumnos.data?.length ?? 0,
        enRiesgo: alumnosRiesgo.filter(a => a.enRiesgo).length,
        criticos: alumnosRiesgo.filter(a => a.critico).length,
        totalPlanes: planesData.length,
        realizados, publicados, borradores, pctRealizados,
        asignaturas: asigRanking.length,
      }}
    />
  )
}
