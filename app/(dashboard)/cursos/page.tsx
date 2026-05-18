import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function crearCurso(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const db = supabase as any

  const nombre = String(formData.get('nombre') ?? '').trim()
  const nivel = String(formData.get('nivel') ?? '').trim()
  const letra = String(formData.get('letra') ?? '').trim()
  const anio = Number(formData.get('anio') ?? new Date().getFullYear())

  if (!nombre) return

  await db.from('cursos').insert({
    establecimiento_id: '00000000-0000-0000-0000-000000000001',
    nombre,
    nivel: nivel || null,
    letra: letra || null,
    anio,
    activo: true,
  })

  revalidatePath('/cursos')
}

async function desactivarCurso(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const db = supabase as any
  const id = String(formData.get('id') ?? '')

  if (!id) return

  await db.from('cursos').update({ activo: false }).eq('id', id)
  revalidatePath('/cursos')
}

export default async function CursosPage() {
  const supabase = await createClient()
  const db = supabase as any

  const { data } = await db
    .from('cursos')
    .select('id, nombre, nivel, letra, anio, activo')
    .eq('activo', true)
    .order('nombre')

  const cursos = data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-gray-900">Cursos</h1>
        <p className="text-sm text-gray-500">Administra los cursos del establecimiento.</p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Crear nuevo curso</h2>

        <form action={crearCurso} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input name="nombre" placeholder="Ej: 3°A" className="input" required />
          <input name="nivel" placeholder="Ej: 3° Básico" className="input" />
          <input name="letra" placeholder="A" className="input" />
          <input name="anio" type="number" defaultValue={new Date().getFullYear()} className="input" />
          <button className="btn btn-primary justify-center">Crear</button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Listado de cursos</h2>
          <span className="text-xs text-gray-400">{cursos.length} activos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="kiva360-table w-full">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Nivel</th>
                <th>Letra</th>
                <th>Año</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((curso: any) => (
                <tr key={curso.id}>
                  <td className="font-semibold">{curso.nombre}</td>
                  <td>{curso.nivel ?? '—'}</td>
                  <td>{curso.letra ?? '—'}</td>
                  <td>{curso.anio}</td>
                  <td className="text-right">
                    <form action={desactivarCurso}>
                      <input type="hidden" name="id" value={curso.id} />
                      <button className="text-xs text-red-600 hover:underline">Desactivar</button>
                    </form>
                  </td>
                </tr>
              ))}

              {cursos.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">
                    Aún no hay cursos activos.
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
