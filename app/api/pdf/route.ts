// app/api/pdf/route.ts
// Genera PDFs de acta de notas, informe alumno y asistencia
// Uso: GET /api/pdf?tipo=acta&curso_id=xxx
//      GET /api/pdf?tipo=alumno&alumno_id=xxx
//      GET /api/pdf?tipo=asistencia&curso_id=xxx

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const tipo      = searchParams.get('tipo')      // 'acta' | 'alumno' | 'asistencia'
  const cursoId   = searchParams.get('curso_id')
  const alumnoId  = searchParams.get('alumno_id')

  try {
    // Importar PDFKit (más compatible con Edge que reportlab)
    // Usamos jsPDF + html2canvas approach via HTML estático
    // Por ahora retornamos el HTML que el browser puede imprimir como PDF

    if (tipo === 'acta') {
      if (!cursoId) return NextResponse.json({ error: 'curso_id requerido' }, { status: 400 })

      const [curso, alumnos, evaluaciones] = await Promise.all([
        supabase.from('cursos').select('nombre, nivel').eq('id', cursoId).single(),
        supabase.from('alumnos').select('id, nombre, apellido_paterno, alumno_sep').eq('curso_id', cursoId).eq('activo', true).order('apellido_paterno'),
        supabase.from('evaluaciones').select('id, titulo, asignatura, ponderacion').eq('curso_id', cursoId).order('fecha'),
      ])

      const { data: notas } = await supabase
        .from('notas')
        .select('alumno_id, evaluacion_id, nota')
        .in('evaluacion_id', (evaluaciones.data ?? []).map(e => e.id))

      const html = generarHTMLActa({
        curso: curso.data,
        alumnos: alumnos.data ?? [],
        evaluaciones: evaluaciones.data ?? [],
        notas: notas ?? [],
      })

      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    }

    if (tipo === 'asistencia') {
      if (!cursoId) return NextResponse.json({ error: 'curso_id requerido' }, { status: 400 })

      const inicioMes = new Date()
      inicioMes.setDate(1)
      const hoy = new Date().toISOString().split('T')[0]
      const inicio = inicioMes.toISOString().split('T')[0]

      const [curso, alumnos, asistencia] = await Promise.all([
        supabase.from('cursos').select('nombre, nivel').eq('id', cursoId).single(),
        supabase.from('alumnos').select('id, nombre, apellido_paterno').eq('curso_id', cursoId).eq('activo', true).order('apellido_paterno'),
        supabase.from('asistencia').select('alumno_id, fecha, estado').gte('fecha', inicio).lte('fecha', hoy),
      ])

      const html = generarHTMLAsistencia({
        curso: curso.data,
        alumnos: alumnos.data ?? [],
        asistencia: asistencia.data ?? [],
        mes: new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
      })

      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    }

    return NextResponse.json({ error: 'tipo inválido' }, { status: 400 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ── Generadores HTML (se imprimen como PDF desde el browser) ──

function generarHTMLActa({ curso, alumnos, evaluaciones, notas }: any) {
  const getNotaAlumno = (alumnoId: string, evalId: string) => {
    const n = notas.find((n: any) => n.alumno_id === alumnoId && n.evaluacion_id === evalId)
    return n?.nota ?? null
  }

  const fmtNota = (n: number | null) => n !== null ? n.toFixed(1).replace('.', ',') : '—'
  const notaColor = (n: number | null) => !n ? '#9B9A97' : n >= 6 ? '#16A34A' : n >= 4 ? '#D97706' : '#DC2626'

  const filas = alumnos.map((a: any, i: number) => {
    const notasAlumno = evaluaciones.map((ev: any) => getNotaAlumno(a.id, ev.id))
    const vals = notasAlumno.filter((n: any) => n !== null)
    const prom = vals.length > 0 ? Math.round(vals.reduce((x: number, y: number) => x + y, 0) / vals.length * 10) / 10 : null

    return `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#FAFAF8'}">
        <td style="text-align:center;color:#9B9A97">${i + 1}</td>
        <td>${a.apellido_paterno}, ${a.nombre}${a.alumno_sep ? ' <span style="font-size:9px;background:#F0F0EE;padding:1px 4px;border-radius:3px">SEP</span>' : ''}</td>
        ${notasAlumno.map((n: any) => `<td style="text-align:center;font-weight:700;color:${notaColor(n)}">${fmtNota(n)}</td>`).join('')}
        <td style="text-align:center;font-weight:800;font-size:14px;color:${notaColor(prom)}">${fmtNota(prom)}</td>
      </tr>
    `
  }).join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Acta de Notas — Kiva360</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #37352F; padding: 20px; }
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
    @page { size: A4 landscape; margin: 1.5cm; }
  }
  .header { background: #37352F; color: white; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-radius: 6px; }
  .header-left h1 { font-size: 14px; margin-bottom: 2px; }
  .header-left p { font-size: 10px; opacity: 0.7; }
  .header-right { font-size: 10px; opacity: 0.7; text-align: right; }
  .info-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 12px; }
  .info-cell { background: #F5F5F3; border-radius: 5px; padding: 8px; }
  .info-cell label { font-size: 9px; color: #9B9A97; display: block; margin-bottom: 2px; text-transform: uppercase; }
  .info-cell strong { font-size: 10px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #37352F; color: white; padding: 7px 8px; text-align: center; font-size: 10px; }
  th:nth-child(2) { text-align: left; }
  td { padding: 6px 8px; border-bottom: 1px solid #F0F0EE; font-size: 10px; }
  .btn-print { margin-bottom: 12px; padding: 8px 20px; background: #37352F; color: white; border: none; border-radius: 7px; cursor: pointer; font-size: 12px; font-weight: 600; }
  .footer { margin-top: 20px; display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
  .firma { text-align: center; padding-top: 30px; border-top: 1px solid #37352F; font-size: 9px; color: #9B9A97; }
</style>
</head>
<body>
<button class="btn-print no-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>

<div class="header">
  <div class="header-left">
    <h1>ACTA DE NOTAS — ${curso?.nombre ?? ''}</h1>
    <p>Año escolar ${new Date().getFullYear()} · Generado por Kiva360</p>
  </div>
  <div class="header-right">kiva360.cl</div>
</div>

<div class="info-grid">
  <div class="info-cell"><label>Curso</label><strong>${curso?.nombre ?? '—'}</strong></div>
  <div class="info-cell"><label>Nivel</label><strong>${curso?.nivel ?? '—'}</strong></div>
  <div class="info-cell"><label>Período</label><strong>${new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</strong></div>
  <div class="info-cell"><label>Total alumnos</label><strong>${alumnos.length}</strong></div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:30px">N°</th>
      <th style="text-align:left">Alumno/a</th>
      ${evaluaciones.map((ev: any) => `<th>${ev.titulo}<br><span style="font-weight:400;font-size:9px">${ev.asignatura} · ${ev.ponderacion}%</span></th>`).join('')}
      <th>PROMEDIO</th>
    </tr>
  </thead>
  <tbody>${filas}</tbody>
</table>

<div class="footer">
  <div class="firma">Profesor/a Jefe</div>
  <div class="firma">Jefe de UTP</div>
  <div class="firma">Director/a</div>
  <div class="firma">Timbre del Establecimiento</div>
</div>
</body>
</html>`
}

function generarHTMLAsistencia({ curso, alumnos, asistencia, mes }: any) {
  const getEstado = (alumnoId: string, fecha: string) => {
    const r = asistencia.find((a: any) => a.alumno_id === alumnoId && a.fecha === fecha)
    return r?.estado ?? null
  }

  const fechas = [...new Set(asistencia.map((a: any) => a.fecha))].sort() as string[]
  const estadoColor = (e: string | null) => !e ? '#DDD' : e === 'P' ? '#16A34A' : e === 'A' ? '#DC2626' : '#D97706'

  const filas = alumnos.map((a: any, i: number) => {
    const estados = fechas.map(f => getEstado(a.id, f))
    const presentes = estados.filter(e => e === 'P').length
    const total = estados.filter(e => e !== null).length
    const pct = total > 0 ? Math.round(presentes / total * 100) : null

    return `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#FAFAF8'}">
        <td style="text-align:center;color:#9B9A97">${i + 1}</td>
        <td>${a.apellido_paterno}, ${a.nombre}</td>
        ${estados.map(e => `<td style="text-align:center;font-weight:700;color:${estadoColor(e)}">${e ?? '·'}</td>`).join('')}
        <td style="text-align:center;font-weight:700;color:${!pct ? '#9B9A97' : pct >= 90 ? '#16A34A' : pct >= 75 ? '#D97706' : '#DC2626'}">${pct !== null ? `${pct}%` : '—'}</td>
      </tr>
    `
  }).join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte Asistencia — Kiva360</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #37352F; padding: 20px; }
  @media print { body { padding: 0; } .no-print { display: none; } @page { size: A4; margin: 1.5cm; } }
  .header { background: #37352F; color: white; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-radius: 6px; }
  .header h1 { font-size: 14px; margin-bottom: 2px; }
  .header p { font-size: 10px; opacity: 0.7; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th { background: #37352F; color: white; padding: 7px 8px; text-align: center; font-size: 10px; }
  th:nth-child(2) { text-align: left; }
  td { padding: 6px 8px; border-bottom: 1px solid #F0F0EE; font-size: 10px; }
  .btn-print { margin-bottom: 12px; padding: 8px 20px; background: #37352F; color: white; border: none; border-radius: 7px; cursor: pointer; font-size: 12px; font-weight: 600; }
  .leyenda { margin-top: 12px; display: flex; gap: 20px; font-size: 10px; }
  .leyenda span { display: flex; align-items: center; gap: 4px; }
</style>
</head>
<body>
<button class="btn-print no-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>

<div class="header">
  <div>
    <h1>REPORTE DE ASISTENCIA — ${curso?.nombre ?? ''}</h1>
    <p>${mes} · Generado por Kiva360</p>
  </div>
  <div style="font-size:10px;opacity:0.7">kiva360.cl</div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:30px">N°</th>
      <th style="text-align:left">Alumno/a</th>
      ${fechas.map(f => `<th>${new Date(f + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}</th>`).join('')}
      <th>% MES</th>
    </tr>
  </thead>
  <tbody>${filas}</tbody>
</table>

<div class="leyenda">
  <span><strong style="color:#16A34A">P</strong> Presente</span>
  <span><strong style="color:#DC2626">A</strong> Ausente</span>
  <span><strong style="color:#D97706">J</strong> Justificado</span>
</div>
</body>
</html>`
}
