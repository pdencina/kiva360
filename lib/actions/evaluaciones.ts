'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ── Obtener todas las evaluaciones ───────────────────────────
export async function getEvaluaciones() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('evaluaciones')
    .select('*, cursos(nombre, nivel)')
    .order('fecha', { ascending: false })

  if (error) {
    console.error('getEvaluaciones:', error)
    return []
  }

  return data ?? []
}

// ── Obtener una evaluación con sus notas ─────────────────────
export async function getEvaluacionConNotas(evalId: string) {
  const supabase = await createClient()

  const [evalRes, notasRes] = await Promise.all([
    supabase
      .from('evaluaciones')
      .select('*, cursos(nombre, nivel)')
      .eq('id', evalId)
      .single(),
    supabase
      .from('notas')
      .select('alumno_id, nota, alumnos(nombre, apellido_paterno, apellido_materno, rut, alumno_sep)')
      .eq('evaluacion_id', evalId),
  ])

  if (!evalRes.data) return null

  // Alumnos del curso sin nota aún
  const { data: alumnosCurso } = await supabase
    .from('alumnos')
    .select('id, nombre, apellido_paterno, apellido_materno, rut, alumno_sep')
    .eq('curso_id', evalRes.data.curso_id)
    .eq('activo', true)
    .order('apellido_paterno')

  const notaMap = new Map((notasRes.data ?? []).map(n => [n.alumno_id, n.nota]))

  const alumnos = (alumnosCurso ?? []).map((a, idx) => ({
    ...a,
    numero: idx + 1,
    nombre_completo: [a.apellido_paterno, a.apellido_materno, a.nombre].filter(Boolean).join(' '),
    nota: notaMap.get(a.id) ?? null,
  }))

  const notas    = alumnos.map(a => a.nota).filter(n => n !== null) as number[]
  const promedio = notas.length > 0 ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10 : null
  const aprobados = notas.filter(n => n >= 4.0).length

  return {
    evaluacion: evalRes.data,
    alumnos,
    stats: {
      promedio,
      aprobados,
      reprobados: notas.length - aprobados,
      sin_nota:   alumnos.length - notas.length,
      total:      alumnos.length,
    }
  }
}

// ── Crear evaluación ─────────────────────────────────────────
const CrearSchema = z.object({
  curso_id:    z.string().uuid(),
  asignatura:  z.string().min(2),
  titulo:      z.string().min(3),
  tipo:        z.enum(['control', 'prueba', 'tarea', 'disertacion', 'proyecto']),
  fecha:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ponderacion: z.coerce.number().min(0).max(100).optional(),
  modalidad:   z.enum(['digital', 'papel', 'mixta']).default('digital'),
})

export async function crearEvaluacion(
  _prev: { error: string | null; success: boolean },
  formData: FormData
) {
  const supabase = await createClient()

  const parsed = CrearSchema.safeParse({
    curso_id:    formData.get('curso_id'),
    asignatura:  formData.get('asignatura'),
    titulo:      formData.get('titulo'),
    tipo:        formData.get('tipo'),
    fecha:       formData.get('fecha'),
    ponderacion: formData.get('ponderacion') || undefined,
    modalidad:   formData.get('modalidad'),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message, success: false }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('establecimiento_id')
    .eq('id', user.id)
    .single()

  const establecimiento_id = perfil?.establecimiento_id ?? '00000000-0000-0000-0000-000000000001'

  const { error } = await supabase.from('evaluaciones').insert({
    ...parsed.data,
    establecimiento_id,
    oa_asociados: '[]',
  })

  if (error) {
    console.error('crearEvaluacion:', error)
    return { error: 'Error al crear. Intenta nuevamente.', success: false }
  }

  revalidatePath('/evaluaciones')
  return { success: true, error: null }
}

// ── Guardar notas masivas ─────────────────────────────────────
export async function guardarNotasMasivas(
  evalId: string,
  notas: { alumno_id: string; nota: number | null }[]
) {
  const supabase = await createClient()

  const rows = notas
    .filter(n => n.nota !== null)
    .map(n => ({
      evaluacion_id: evalId,
      alumno_id:     n.alumno_id,
      nota:          Math.min(7.0, Math.max(1.0, n.nota!)),
    }))

  if (rows.length > 0) {
    const { error } = await supabase
      .from('notas')
      .upsert(rows, { onConflict: 'evaluacion_id,alumno_id' })

    if (error) {
      console.error('guardarNotasMasivas:', error)
      return { error: 'Error al guardar notas', success: false }
    }
  }

  revalidatePath('/evaluaciones')
  return { success: true, error: null }
}

// ── Eliminar evaluación ───────────────────────────────────────
export async function eliminarEvaluacion(evalId: string) {
  const supabase = await createClient()
  await supabase.from('evaluaciones').delete().eq('id', evalId)
  revalidatePath('/evaluaciones')
  return { success: true }
}

// ── Stats generales de evaluaciones ──────────────────────────
export async function getStatsEvaluaciones() {
  const supabase = await createClient()
  const hoy = new Date().toISOString().split('T')[0]

  const [total, proximas, sinCalificar] = await Promise.all([
    supabase.from('evaluaciones').select('id', { count: 'exact', head: true }),
    supabase.from('evaluaciones').select('id', { count: 'exact', head: true }).gte('fecha', hoy),
    supabase.from('evaluaciones').select('id', { count: 'exact', head: true }).lt('fecha', hoy),
  ])

  return {
    total:         total.count ?? 0,
    proximas:      proximas.count ?? 0,
    sin_calificar: sinCalificar.count ?? 0,
  }
}
