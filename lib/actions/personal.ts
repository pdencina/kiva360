'use server'

import { createClient } from '@/lib/supabase/server'
import { requireEstablecimientoId } from '@/lib/supabase/getEstablecimientoId'

export async function getDocentes() {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { data } = await supabase
    .from('docentes')
    .select('*, asignaciones_docente(asignatura, curso_id, es_jefe, cursos(nombre))')
    .eq('establecimiento_id', estId)
    .eq('activo', true)
    .order('apellido_paterno')
  return data ?? []
}

export async function getHorarioDocente(docenteId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('horarios')
    .select('*, cursos(nombre)')
    .eq('docente_id', docenteId)
    .order('dia').order('hora_inicio')
  return data ?? []
}

export async function getResumenPersonal() {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { data } = await supabase
    .from('docentes')
    .select('tipo_contrato, horas_contrato')
    .eq('establecimiento_id', estId)
    .eq('activo', true)
  const docentes = data ?? []
  const totalHoras = docentes.reduce((a, d) => a + (d.horas_contrato ?? 0), 0)
  const porContrato: Record<string, number> = {}
  docentes.forEach(d => { porContrato[d.tipo_contrato] = (porContrato[d.tipo_contrato] ?? 0) + 1 })
  return {
    total: docentes.length, totalHoras, porContrato,
    planta:     porContrato['planta']     ?? 0,
    contrata:   porContrato['contrata']   ?? 0,
    honorarios: porContrato['honorarios'] ?? 0,
    reemplazo:  porContrato['reemplazo']  ?? 0,
  }
}

export async function crearDocente(params: {
  rut?: string; nombre: string; apellidoPaterno: string; apellidoMaterno?: string
  email?: string; telefono?: string; especialidad: string[]; nivel: string[]
  tipoContrato: string; horasContrato: number; titulo?: string; fechaIngreso?: string
}) {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { error } = await supabase.from('docentes').insert({
    establecimiento_id: estId,
    rut:              params.rut ?? null,
    nombre:           params.nombre,
    apellido_paterno: params.apellidoPaterno,
    apellido_materno: params.apellidoMaterno ?? null,
    email:            params.email ?? null,
    telefono:         params.telefono ?? null,
    especialidad:     params.especialidad,
    nivel:            params.nivel,
    tipo_contrato:    params.tipoContrato,
    horas_contrato:   params.horasContrato,
    titulo:           params.titulo ?? null,
    fecha_ingreso:    params.fechaIngreso ?? null,
  })
  if (error) return { error: error.message, success: false }
  return { success: true, error: null }
}

export async function asignarDocente(params: {
  docenteId: string; cursoId: string; asignatura: string
  horasSem: number; esJefe: boolean
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('asignaciones_docente').insert({
    docente_id: params.docenteId,
    curso_id:   params.cursoId,
    asignatura: params.asignatura,
    horas_sem:  params.horasSem,
    es_jefe:    params.esJefe,
  })
  if (error) return { error: error.message, success: false }
  return { success: true, error: null }
}
