'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const EST_ID = '00000000-0000-0000-0000-000000000001'

// ── Resumen de cobranzas ───────────────────────────────────────
export async function getResumenCobranzas() {
  const supabase = await createClient()

  const [cuotas, pagos, vencidas] = await Promise.all([
    supabase.from('cuotas').select('monto_total, estado').eq('establecimiento_id', EST_ID),
    supabase.from('pagos').select('monto').eq('establecimiento_id', EST_ID),
    supabase.from('cuotas').select('id', { count: 'exact', head: true })
      .eq('establecimiento_id', EST_ID).eq('estado', 'vencida'),
  ])

  const totalCuotas   = (cuotas.data ?? []).reduce((a, c) => a + c.monto_total, 0)
  const totalCobrado  = (pagos.data ?? []).reduce((a, p) => a + p.monto, 0)
  const totalPendiente = totalCuotas - totalCobrado
  const totalVencidas  = vencidas.count ?? 0

  return { totalCuotas, totalCobrado, totalPendiente, totalVencidas }
}

// ── Listar planes de pago ─────────────────────────────────────
export async function getPlanesPago() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('planes_pago')
    .select('*')
    .eq('establecimiento_id', EST_ID)
    .eq('activo', true)
    .order('nombre')
  return data ?? []
}

// ── Cuotas por alumno ─────────────────────────────────────────
export async function getCuotasAlumno(alumnoId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cuotas')
    .select('*, pagos(*)')
    .eq('alumno_id', alumnoId)
    .order('numero_cuota')
  return data ?? []
}

// ── Cuotas pendientes y vencidas ──────────────────────────────
export async function getCuotasPendientes() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cuotas')
    .select(`
      *,
      alumnos(nombre, apellido_paterno, apellido_materno, cursos(nombre)),
      pagos(monto, fecha_pago)
    `)
    .eq('establecimiento_id', EST_ID)
    .in('estado', ['pendiente', 'vencida'])
    .order('fecha_vencimiento')
    .limit(50)
  return data ?? []
}

// ── Registrar pago ────────────────────────────────────────────
export async function registrarPago(params: {
  cuotaId:    string
  alumnoId:   string
  monto:      number
  medioPago:  string
  referencia?: string
  fechaPago:  string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const { error: pagoError } = await supabase.from('pagos').insert({
    establecimiento_id: EST_ID,
    cuota_id:           params.cuotaId,
    alumno_id:          params.alumnoId,
    monto:              params.monto,
    medio_pago:         params.medioPago,
    referencia:         params.referencia ?? null,
    fecha_pago:         params.fechaPago,
    registrado_por:     user.id,
  })

  if (pagoError) return { error: pagoError.message, success: false }

  // Actualizar estado de la cuota a pagada
  await supabase.from('cuotas')
    .update({ estado: 'pagada' })
    .eq('id', params.cuotaId)

  return { success: true, error: null }
}

// ── Crear plan de pago ────────────────────────────────────────
export async function crearPlanPago(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('planes_pago').insert({
    establecimiento_id: EST_ID,
    nombre:             formData.get('nombre') as string,
    descripcion:        formData.get('descripcion') as string,
    monto_total:        parseInt(formData.get('monto_total') as string),
    num_cuotas:         parseInt(formData.get('num_cuotas') as string),
    dia_vencimiento:    parseInt(formData.get('dia_vencimiento') as string),
    aplica_interes:     formData.get('aplica_interes') === 'true',
    pct_interes:        parseFloat(formData.get('pct_interes') as string) || 0,
  })

  if (error) return { error: error.message, success: false }
  return { success: true, error: null }
}

// ── Asignar plan a alumno y generar cuotas ────────────────────
export async function asignarPlanAlumno(params: {
  alumnoId: string
  planId:   string
  anio:     number
  descuento: number
}) {
  const supabase = await createClient()

  // Obtener el plan
  const { data: plan } = await supabase
    .from('planes_pago')
    .select('*')
    .eq('id', params.planId)
    .single()

  if (!plan) return { error: 'Plan no encontrado', success: false }

  // Crear asignación
  const { data: asignacion, error: asigError } = await supabase
    .from('alumno_planes')
    .insert({
      establecimiento_id: EST_ID,
      alumno_id:  params.alumnoId,
      plan_id:    params.planId,
      anio:       params.anio,
      descuento_pct: params.descuento,
    })
    .select('id')
    .single()

  if (asigError) return { error: asigError.message, success: false }

  // Calcular monto por cuota
  const montoCuota = Math.round(
    (plan.monto_total * (1 - params.descuento / 100)) / plan.num_cuotas
  )

  // Generar cuotas
  const cuotas = []
  for (let i = 1; i <= plan.num_cuotas; i++) {
    const fecha = new Date(params.anio, i, plan.dia_vencimiento) // mes i (marzo=3, abril=4...)
    const fechaVencimiento = new Date(params.anio, i + 2, plan.dia_vencimiento) // empieza en marzo
    cuotas.push({
      establecimiento_id: EST_ID,
      alumno_plan_id:     asignacion.id,
      alumno_id:          params.alumnoId,
      numero_cuota:       i,
      monto_original:     montoCuota,
      monto_interes:      0,
      monto_total:        montoCuota,
      fecha_vencimiento:  `${params.anio}-${String(i + 2).padStart(2,'0')}-${String(plan.dia_vencimiento).padStart(2,'0')}`,
      estado:             'pendiente',
    })
  }

  const { error: cuotaError } = await supabase.from('cuotas').insert(cuotas)
  if (cuotaError) return { error: cuotaError.message, success: false }

  return { success: true, error: null }
}

// ── Actualizar cuotas vencidas ─────────────────────────────────
export async function actualizarCuotasVencidas() {
  const supabase = await createClient()
  const hoy = new Date().toISOString().split('T')[0]

  await supabase.from('cuotas')
    .update({ estado: 'vencida' })
    .eq('establecimiento_id', EST_ID)
    .eq('estado', 'pendiente')
    .lt('fecha_vencimiento', hoy)

  return { success: true }
}
