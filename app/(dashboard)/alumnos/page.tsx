import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function crearAlumno(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const db = supabase as any

  const nombre = String(formData.get('nombre') ?? '').trim()
  const apellido_paterno = String(formData.get('apellido_paterno') ?? '').trim()
  const apellido_materno = String(formData.get('apellido_materno') ?? '').trim()
  const rut = String(formData.get('rut') ?? '').trim()
  const curso_id = String(formData.get('curso_id') ?? '').trim()
  const fecha_nacimiento = String(formData.get('fecha_nacimiento') ?? '').trim()

  if (!nombre || !curso_id) return

  await db.from('alumnos').insert({
    establecimiento_id: '00000000-0000-0000-0000-000000000001',
    curso_id,
    rut: rut || null,
    nombre,
    apellido_paterno: apellido_paterno || null,
    apellido_materno: apellido_materno || null,
    fecha_nacimiento: fecha_nacimiento || null,
    activo: true,
  })

  revalidatePath('/alumnos')
  revalidatePath('/dashboard')
}

async function desactivarAlumno(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const db = supabase as any
  const id = String(formData.get('id') ?? '')

  if (!id) return

  await db.from('alumnos').update({ activo: false }).eq('id', id)
  revalidatePath('/alumnos')
  revalidatePath('/dashboard')
}

export default async function AlumnosPage() {
  const supabase = await createClient()
  const db = supabase as any

  const [{ data: cursosData }, { data: alumnosData }] = await Promise.all([
    db.from('cursos').select('id, nombre').eq('activo', true).order('nombre'),
    db
      .from('alumnos')
      .select('id, rut, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, alumno_sep, beneficio_pae, activo, cursos(nombre)')
      .eq('activo', true)
      .order('apellido_paterno'),
  ])

  const cursos = cursosData ?? []
  const alumnos = alumnosData ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-gray-900">Alumnos</h1>
        <p className="text-sm text-gray-500">Administra la matrícula activa del colegio.</p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Crear alumno</h2>

        <form action={crearAlumno} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input name="nombre" placeholder="Nombres" className="input" required />
          <input name="apellido_paterno" placeholder="Apellido paterno" className="input" />
          <input name="apellido_materno" placeholder="Apellido materno" className="input" />
          <input name="rut" placeholder="RUT" className="input" />
          <input name="fecha_nacimiento" type="date" className="input" />
          <select name="curso_id" className="input" required>
            <option value="">Selecciona curso</option>
            {cursos.map((curso: any) => (
              <option key={curso.id} value={curso.id}>{curso.nombre}</option>
            ))}
          </select>
          <button className="btn btn-primary justify-center md:col-span-3">Crear alumno</button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Listado de alumnos</h2>
          <span className="text-xs text-gray-400">{alumnos.length} activos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="kiva360-table w-full">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>RUT</th>
                <th>Curso</th>
                <th>Beneficios</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno: any) => (
                <tr key={alumno.id}>
                  <td className="font-semibold">
                    {[alumno.apellido_paterno, alumno.apellido_materno, alumno.nombre].filter(Boolean).join(' ')}
                  </td>
                  <td>{alumno.rut ?? '—'}</td>
                  <td>{alumno.cursos?.nombre ?? '—'}</td>
                  <td>
                    <div className="flex gap-1">
                      {alumno.alumno_sep && <span className="pill bg-purple-100 text-purple-700">SEP</span>}
                      {alumno.beneficio_pae && <span className="pill bg-orange-100 text-orange-700">PAE</span>}
                      {!alumno.alumno_sep && !alumno.beneficio_pae && <span className="text-gray-300">—</span>}
                    </div>
                  </td>
                  <td className="text-right">
                    <form action={desactivarAlumno}>
                      <input type="hidden" name="id" value={alumno.id} />
                      <button className="text-xs text-red-600 hover:underline">Desactivar</button>
                    </form>
                  </td>
                </tr>
              ))}

              {alumnos.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">
                    Aún no hay alumnos activos.
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
