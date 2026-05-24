export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ApoderadoClient } from '@/components/apoderado/ApoderadoClient'

export default async function PortalApoderadoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Demo: tomar el primer alumno activo como "hijo del apoderado"
  const { data: hijos } = await supabase
    .from('alumnos')
    .select(`
      id, nombre, apellido_paterno, apellido_materno, rut,
      alumno_sep, beneficio_pae, beneficio_tne, pie, diagnostico_pie,
      nombre_apoderado, telefono_apoderado, email_apoderado,
      condicion_especial, fecha_nacimiento,
      cursos(id, nombre, nivel)
    `)
    .eq('activo', true)
    .order('apellido_paterno')
    .limit(3)

  const hijo = hijos?.[0]
  if (!hijo) {
    return (
      <div style={{ fontFamily: 'Inter, system-ui', padding: '2rem', textAlign: 'center', color: '#9B9A97' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍👩‍👧</div>
        <p>No hay alumnos asociados a esta cuenta.</p>
      </div>
    )
  }

  const hoyStr      = new Date().toISOString().split('T')[0]
  const inicioAnio  = `${new Date().getFullYear()}-01-01`
  const inicioMes   = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-01`

  const [notas, asistAnio, asistMes, entrevistas, anotaciones, evaluaciones] = await Promise.all([
    supabase.from('notas')
      .select('nota, evaluaciones(id, titulo, asignatura, fecha, ponderacion, tipo)')
      .eq('alumno_id', hijo.id)
      .order('created_at', { ascending: false }),

    supabase.from('asistencia')
      .select('estado, fecha')
      .eq('alumno_id', hijo.id)
      .gte('fecha', inicioAnio)
      .lte('fecha', hoyStr)
      .order('fecha', { ascending: false }),

    supabase.from('asistencia')
      .select('estado, fecha')
      .eq('alumno_id', hijo.id)
      .gte('fecha', inicioMes)
      .lte('fecha', hoyStr),

    supabase.from('entrevistas')
      .select('*')
      .eq('alumno_id', hijo.id)
      .order('fecha', { ascending: false }),

    supabase.from('anotaciones')
      .select('*')
      .eq('alumno_id', hijo.id)
      .eq('privada', false)   // apoderado solo ve anotaciones no privadas
      .order('fecha', { ascending: false }),

    supabase.from('evaluaciones')
      .select('id, titulo, asignatura, fecha, ponderacion, tipo')
      .order('fecha', { ascending: false })
      .limit(20),
  ])

  // Cálculos asistencia
  const asistAnioData = asistAnio.data ?? []
  const asistMesData  = asistMes.data ?? []
  const pctAnio = asistAnioData.length > 0
    ? Math.round(asistAnioData.filter(a => a.estado === 'P').length / asistAnioData.length * 100) : null
  const pctMes = asistMesData.length > 0
    ? Math.round(asistMesData.filter(a => a.estado === 'P').length / asistMesData.length * 100) : null
  const ausenciasAnio = asistAnioData.filter(a => a.estado === 'A').length
  const ausenciasMes  = asistMesData.filter(a => a.estado === 'A').length

  // Cálculos notas
  const notasData = notas.data ?? []
  const vals      = notasData.map(n => n.nota).filter(Boolean) as number[]
  const promGeneral = vals.length > 0
    ? Math.round(vals.reduce((a,b) => a+b,0) / vals.length * 10) / 10 : null

  // Notas por asignatura
  const porAsig: Record<string, number[]> = {}
  notasData.forEach((n: any) => {
    const asig = n.evaluaciones?.asignatura
    if (!asig || !n.nota) return
    if (!porAsig[asig]) porAsig[asig] = []
    porAsig[asig].push(n.nota)
  })
  const promediosPorAsig = Object.entries(porAsig).map(([asig, ns]) => ({
    asig,
    prom: Math.round(ns.reduce((a,b) => a+b,0) / ns.length * 10) / 10,
    total: ns.length,
  })).sort((a,b) => a.prom - b.prom)

  // Próximas entrevistas
  const entrevistasData     = entrevistas.data ?? []
  const proximasEntrevistas = entrevistasData.filter(e => e.fecha >= hoyStr && !e.realizada)
  const historialEntrevistas = entrevistasData.filter(e => e.fecha < hoyStr || e.realizada)

  return (
    <ApoderadoClient
      hijo={hijo as any}
      notas={notasData as any}
      asistencia={{
        anio: { pct: pctAnio, total: asistAnioData.length, ausencias: ausenciasAnio, historial: asistAnioData.slice(0,30) },
        mes:  { pct: pctMes,  total: asistMesData.length,  ausencias: ausenciasMes  },
      }}
      rendimiento={{ promGeneral, porAsignatura: promediosPorAsig }}
      entrevistas={{ proximas: proximasEntrevistas, historial: historialEntrevistas }}
      anotaciones={anotaciones.data ?? []}
      alumnoId={hijo.id}
    />
  )
}
