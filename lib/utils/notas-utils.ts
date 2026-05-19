// Utilidades de cálculo de notas — NO es server action
// Se puede importar desde client y server components

export function calcularPromedio(
  notas: { evaluacion_id: string; nota: number | null }[],
  evaluaciones: { id: string; ponderacion: number | null }[]
): number | null {
  const evalMap = new Map(evaluaciones.map(e => [e.id, e.ponderacion ?? 0]))
  let suma = 0, totalPond = 0
  for (const n of notas) {
    if (n.nota === null) continue
    const pond = evalMap.get(n.evaluacion_id) ?? 0
    suma += n.nota * pond
    totalPond += pond
  }
  if (totalPond === 0) return null
  return Math.round((suma / totalPond) * 10) / 10
}
