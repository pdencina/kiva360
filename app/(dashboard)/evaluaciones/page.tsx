import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function crearEvaluacion(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const db = supabase as any

  const curso_id = String(formData.get('curso_id') ?? '').trim()
  const titulo = String(formData.get('titulo') ?? '').trim()
  const asignatura = String(formData.get('asignatura') ?? '').trim()
  const tipo = String(formData.get('tipo') ?? '').trim()
  const fecha = String(formData.get('fecha') ?? '').trim()
  const ponderacionRaw = String(formData.get('ponderacion') ?? '').trim()
  const ponderacion = ponderacionRaw ? Number(ponderacionRaw) : null

  if (!curso_id || !titulo || !asignatura) return

  await db.from('evaluaciones').insert({
    establecimiento_id: '00000000-0000-0000-0000-000000000001',
    curso_id,
    titulo,
    asignatura,
    tipo: tipo || null,
    fecha: fecha || null,
    ponderacion,
  })

  revalidatePath('/evaluaciones')
  revalidatePath('/dashboard')
}

export default async function EvaluacionesPage() {
  const supabase = await createClient()
  const db = supabase as any

  const [{ data: cursosData }, { data: evaluacionesData }] = await Promise.all([
    db.from('cursos').select('id, nombre').eq('activo', true).order('nombre'),
    db
      .from('evaluaciones')
      .select('id, titulo, asignatura, tipo, fecha, ponderacion, cursos(nombre)')
      .order('fecha', { ascending: true }),
  ])

  const cursos = cursosData ?? []
  const evaluaciones = evaluacionesData ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-gray-900">Evaluaciones</h1>
        <p className="text-sm text-gray-500">Crea y administra evaluaciones por curso.</p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Crear evaluación</h2>

        <form action={crearEvaluacion} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select name="curso_id" className="input" required>
            <option value="">Selecciona curso</option>
            {cursos.map((curso: any) => (
              <option key={curso.id} value={curso.id}>{curso.nombre}</option>
            ))}
          </select>
          <input name="titulo" placeholder="Título" className="input" required />
          <input name="asignatura" placeholder="Asignatura" className="input" required />
          <input name="tipo" placeholder="Tipo: prueba/control" className="input" />
          <input name="fecha" type="date" className="input" />
          <input name="ponderacion" type="number" step="1" min="0" max="100" placeholder="Ponderación %" className="input" />
          <button className="btn btn-primary justify-center md:col-span-3">Crear evaluación</button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Listado de evaluaciones</h2>
          <span className="text-xs text-gray-400">{evaluaciones.length} registradas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="kiva360-table w-full">
            <thead>
              <tr>
                <th>Título</th>
                <th>Asignatura</th>
                <th>Curso</th>
                <th>Fecha</th>
                <th>Ponderación</th>
              </tr>
            </thead>
            <tbody>
              {evaluaciones.map((ev: any) => (
                <tr key={ev.id}>
                  <td className="font-semibold">{ev.titulo}</td>
                  <td>{ev.asignatura}</td>
                  <td>{ev.cursos?.nombre ?? '—'}</td>
                  <td>{ev.fecha ?? '—'}</td>
                  <td>{ev.ponderacion ? `${ev.ponderacion}%` : '—'}</td>
                </tr>
              ))}

              {evaluaciones.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">
                    Aún no hay evaluaciones.
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
