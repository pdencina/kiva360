'use server'

import { createClient } from '@/lib/supabase/server'
import { requireEstablecimientoId } from '@/lib/supabase/getEstablecimientoId'

export async function getResumenCobranzas() {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()

  const [cuotas, pagos, vencidas] = await Promise.all([
    supabase.from('cuotas').select('monto_total, estado').eq('establecimiento_id', estId),
    supabase.from('pagos').select('monto').eq('establecimiento_id', estId),
    supabase.from('cuotas').select('id', { count: 'exact', head: true })
      .eq('establecimiento_id', estId).eq('estado', 'vencida'),
  ])

  const totalCuotas    = (cuotas.data ?? []).reduce((a, c) => a + c.monto_total, 0)
  const totalCobrado   = (pagos.data ?? []).reduce((a, p) => a + p.monto, 0)
  const totalPendiente = totalCuotas - totalCobrado
  const totalVencidas  = vencidas.count ?? 0

  return { totalCuotas, totalCobrado, totalPendiente, totalVencidas }
}

export async function getPlanesPago() {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { data } = await supabase
    .from('planes_pago')
    .select('*')
    .eq('establecimiento_id', estId)
    .eq('activo', true)
    .order('nombre')
  return data ?? []
}

export async function getCuotasPendientes() {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { data } = await supabase
    .from('cuotas')
    .select(`*, alumnos(nombre, apellido_paterno, apellido_materno, cursos(nombre)), pagos(monto, fecha_pago)`)
    .eq('establecimiento_id', estId)
    .in('estado', ['pendiente', 'vencida'])
    .order('fecha_vencimiento')
    .limit(50)
  return data ?? []
}

export async function registrarPago(params: {
  cuotaId: string; alumnoId: string; monto: number
  medioPago: string; referencia?: string; fechaPago: string
}) {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', success: false }

  const { error } = await supabase.from('pagos').insert({
    establecimiento_id: estId,
    cuota_id:    params.cuotaId,
    alumno_id:   params.alumnoId,
    monto:       params.monto,
    medio_pago:  params.medioPago,
    referencia:  params.referencia ?? null,
    fecha_pago:  params.fechaPago,
    registrado_por: user.id,
  })
  if (error) return { error: error.message, success: false }

  await supabase.from('cuotas').update({ estado: 'pagada' }).eq('id', params.cuotaId)
  return { success: true, error: null }
}

export async function crearPlanPago(formData: FormData) {
  const supabase = await createClient()
  const estId = await requireEstablecimientoId()

  const { error } = await supabase.from('planes_pago').insert({
    establecimiento_id: estId,
    nombre:           formData.get('nombre') as string,
    descripcion:      formData.get('descripcion') as string,
    monto_total:      parseInt(formData.get('monto_total') as string),
    num_cuotas:       parseInt(formData.get('num_cuotas') as string),
    dia_vencimiento:  parseInt(formData.get('dia_vencimiento') as string),
    aplica_interes:   formData.get('aplica_interes') === 'true',
    pct_interes:      parseFloat(formData.get('pct_interes') as string) || 0,
  })
  if (error) return { error: error.message, success: false }
  return { success: true, error: null }
}
