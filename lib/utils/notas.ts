export function calcularPromedio(
  notas: { evaluacion_id: string; nota: number | null }[],
  evaluaciones: { id: string; ponderacion: number | null }[]
): number | null {

  let suma = 0
  let ponderacionTotal = 0

  for (const nota of notas) {
    if (nota.nota === null) continue

    const evaluacion = evaluaciones.find(
      e => e.id === nota.evaluacion_id
    )

    const ponderacion = evaluacion?.ponderacion ?? 1

    suma += nota.nota * ponderacion
    ponderacionTotal += ponderacion
  }

  if (ponderacionTotal === 0) return null

  return Math.round((suma / ponderacionTotal) * 10) / 10
}