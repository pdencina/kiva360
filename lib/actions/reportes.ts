'use server'

import { createClient } from '@/lib/supabase/server'

const EST_ID = '00000000-0000-0000-0000-000000000001'

// ── Resumen general del colegio ───────────────────────────────
export async function getResumenColegio() {
  const supabase = await createClient()
  const hoy      = new Date()
  const anio     = hoy.getFullYear()
  const inicioAnio = `${anio}-01-01`
  const hoyStr   = hoy.toISOString().split('T')[0]
  const inicioMes = `${anio}-${String(hoy.getMonth() + 1).padStart(2,'0')}-01`

  const [alumnos, cursos, eval_, asist, notas, sep] = await Promise.all([
    supabase.from('alumnos').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('cursos').select('id', { count: 'exact', head: true }).eq('anio', anio).eq('activo', true),
    supabase.from('evaluaciones').select('id', { count: 'exact', head: true }),
    supabase.from('asistencia').select('estado').eq('fecha', hoyStr),
    supabase.from('notas').select('nota'),
    supabase.from('alumnos').select('id', { count: 'exact', head: true }).eq('alumno_sep', true).eq('activo', true),
  ])

  const registros  = asist.data ?? []
  const presentes  = registros.filter(r => r.estado === 'P').length
  const pctAsist   = registros.length > 0 ? Math.round((presentes / registros.length) * 100) : null
  const notasArr   = (notas.data ?? []).map(n => n.nota).filter(Boolean) as number[]
  const promNotas  = notasArr.length > 0 ? Math.round((notasArr.reduce((a, b) => a + b, 0) / notasArr.length) * 10) / 10 : null
  const aprobados  = notasArr.filter(n => n >= 4).length
  const pctAprueba = notasArr.length > 0 ? Math.round((aprobados / notasArr.length) * 100) : null

  return {
    totalAlumnos:   alumnos.count ?? 0,
    totalCursos:    cursos.count ?? 0,
    totalEval:      eval_.count ?? 0,
    totalSep:       sep.count ?? 0,
    pctAsistHoy:    pctAsist,
    presentesHoy:   presentes,
    promedioNotas:  promNotas,
    pctAprobacion:  pctAprueba,
  }
}

// ── Asistencia por curso ──────────────────────────────────────
export async function getAsistenciaPorCurso() {
  const supabase = await createClient()
  const hoy = new Date()
  const inicioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2,'0')}-01`
  const hoyStr = hoy.toISOString().split('T')[0]

  const { data: cursos } = await supabase
    .from('cursos').select('id, nombre').eq('anio', hoy.getFullYear()).eq('activo', true).order('nombre')

  if (!cursos?.length) return []

  const resultados = await Promise.all(cursos.map(async curso => {
    const { data: alumnos } = await supabase
      .from('alumnos').select('id').eq('curso_id', curso.id).eq('activo', true)
    if (!alumnos?.length) return { curso: curso.nombre, pct: 0, presentes: 0, total: 0 }

    const { data: asist } = await supabase
      .from('asistencia').select('estado')
      .gte('fecha', inicioMes).lte('fecha', hoyStr)
      .in('alumno_id', alumnos.map(a => a.id))

    const total    = asist?.length ?? 0
    const pres     = (asist ?? []).filter(a => a.estado === 'P').length
    const pct      = total > 0 ? Math.round((pres / total) * 100) : 0
    return { curso: curso.nombre, pct, presentes: pres, total }
  }))

  return resultados
}

// ── Rendimiento por asignatura ────────────────────────────────
export async function getRendimientoPorAsignatura() {
  const supabase = await createClient()

  const { data: evaluaciones } = await supabase
    .from('evaluaciones').select('id, asignatura')

  if (!evaluaciones?.length) return []

  const { data: notas } = await supabase
    .from('notas').select('nota, evaluacion_id')
    .in('evaluacion_id', evaluaciones.map(e => e.id))

  const mapaAsig = new Map<string, number[]>()
  for (const nota of (notas ?? [])) {
    const ev = evaluaciones.find(e => e.id === nota.evaluacion_id)
    if (!ev || nota.nota === null) continue
    if (!mapaAsig.has(ev.asignatura)) mapaAsig.set(ev.asignatura, [])
    mapaAsig.get(ev.asignatura)!.push(nota.nota)
  }

  return Array.from(mapaAsig.entries()).map(([asig, ns]) => ({
    asignatura: asig,
    promedio:   Math.round((ns.reduce((a, b) => a + b, 0) / ns.length) * 10) / 10,
    aprobados:  ns.filter(n => n >= 4).length,
    reprobados: ns.filter(n => n < 4).length,
    total:      ns.length,
  })).sort((a, b) => b.promedio - a.promedio)
}

// ── Alumnos en riesgo ────────────────────────────────────────
export async function getAlumnosEnRiesgo() {
  const supabase = await createClient()
  const hoy = new Date()
  const inicioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2,'0')}-01`

  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, nombre, apellido_paterno, alumno_sep, cursos(nombre)')
    .eq('activo', true).order('apellido_paterno')

  if (!alumnos?.length) return []

  const riesgo = []
  for (const alumno of alumnos) {
    const { data: asist } = await supabase
      .from('asistencia').select('estado')
      .eq('alumno_id', alumno.id)
      .gte('fecha', inicioMes)
      .lte('fecha', hoy.toISOString().split('T')[0])

    const total = asist?.length ?? 0
    const pres  = (asist ?? []).filter(a => a.estado === 'P').length
    const pct   = total > 0 ? Math.round((pres / total) * 100) : null

    if (pct !== null && pct < 75) {
      riesgo.push({
        id:     alumno.id,
        nombre: `${alumno.apellido_paterno}, ${alumno.nombre}`,
        curso:  (alumno as any).cursos?.nombre ?? '—',
        sep:    alumno.alumno_sep,
        pct_asistencia: pct,
        dias_ausente:   total - pres,
      })
    }
  }

  return riesgo.sort((a, b) => a.pct_asistencia - b.pct_asistencia)
}
