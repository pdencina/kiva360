import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

async function guardarAsistenciaRapida(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const db = supabase as any

  const alumno_id = String(formData.get('alumno_id') ?? '')
  const estado = String(formData.get('estado') ?? 'P')
  const fecha = String(formData.get('fecha') ?? format(new Date(), 'yyyy-MM-dd'))

  if (!alumno_id || !['P', 'A', 'J'].includes(estado)) return

  await db.from('asistencia').upsert(
    {
      establecimiento_id: '00000000-0000-0000-0000-000000000001',
      alumno_id,
      fecha,
      estado,
      declarado_sige: false,
    },
    { onConflict: 'alumno_id,fecha' }
  )

  revalidatePath('/asistencia')
  revalidatePath('/dashboard')
}

export default async function AsistenciaPage() {
  const supabase = await createClient()
  const db = supabase as any
  const hoy = format(new Date(), 'yyyy-MM-dd')

  const [{ data: alumnosData }, { data: asistenciaData }] = await Promise.all([
    db
      .from('alumnos')
      .select('id, nombre, apellido_paterno, apellido_materno, cursos(nombre)')
      .eq('activo', true)
      .order('apellido_paterno'),
    db
      .from('asistencia')
      .select('alumno_id, estado')
      .eq('fecha', hoy),
  ])

  const alumnos = alumnosData ?? []
  const asistencia = asistenciaData ?? []
  const asistenciaMap = new Map(asistencia.map((a: any) => [a.alumno_id, a.estado]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-gray-900">Asistencia</h1>
        <p className="text-sm text-gray-500">Registro rápido de asistencia de hoy.</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Hoy · {hoy}</h2>
          <span className="text-xs text-gray-400">{alumnos.length} alumnos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="kiva360-table w-full">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Curso</th>
                <th>Estado actual</th>
                <th className="text-right">Marcar</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno: any) => {
                const estado = asistenciaMap.get(alumno.id) as string | undefined

                return (
                  <tr key={alumno.id}>
                    <td className="font-semibold">
                      {[alumno.apellido_paterno, alumno.apellido_materno, alumno.nombre].filter(Boolean).join(' ')}
                    </td>
                    <td>{alumno.cursos?.nombre ?? '—'}</td>
                    <td>
                      {estado ? (
                        <span className={
                          estado === 'P'
                            ? 'pill bg-green-100 text-green-700'
                            : estado === 'A'
                              ? 'pill bg-red-100 text-red-700'
                              : 'pill bg-yellow-100 text-yellow-700'
                        }>
                          {estado === 'P' ? 'Presente' : estado === 'A' ? 'Ausente' : 'Justificado'}
                        </span>
                      ) : (
                        <span className="text-gray-300">Sin marcar</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        {(['P', 'A', 'J'] as const).map((e) => (
                          <form key={e} action={guardarAsistenciaRapida}>
                            <input type="hidden" name="alumno_id" value={alumno.id} />
                            <input type="hidden" name="fecha" value={hoy} />
                            <input type="hidden" name="estado" value={e} />
                            <button className="text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 hover:bg-blue-100">
                              {e}
                            </button>
                          </form>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {alumnos.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 py-8">
                    Crea alumnos primero para registrar asistencia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
