import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// ── Tailwind merge helper ─────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Formateo de fechas chilenas ───────────────────────────────
export function formatFecha(fecha: string | Date, formato = 'dd MMM yyyy'): string {
  const date = typeof fecha === 'string' ? parseISO(fecha) : fecha
  return format(date, formato, { locale: es })
}

export function formatFechaLarga(fecha: string | Date): string {
  return formatFecha(fecha, "EEEE d 'de' MMMM 'de' yyyy")
}

// ── Formateo de notas chilenas ────────────────────────────────
export function formatNota(nota: number | null): string {
  if (nota === null) return '—'
  return nota.toFixed(1).replace('.', ',')
}

export function colorNota(nota: number | null): string {
  if (nota === null) return 'text-gray-300'
  if (nota >= 6.0) return 'text-green-700'
  if (nota >= 4.0) return 'text-orange-600'
  return 'text-red-600'
}

// ── Formateo de RUT chileno ───────────────────────────────────
export function formatRut(rut: string): string {
  const clean = rut.replace(/[^0-9kK]/g, '')
  if (clean.length < 2) return clean
  const cuerpo = clean.slice(0, -1)
  const dv     = clean.slice(-1).toUpperCase()
  const formatted = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted}-${dv}`
}

export function validarRut(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length < 2) return false
  const cuerpo = parseInt(clean.slice(0, -1))
  const dv     = clean.slice(-1)
  let suma = 0
  let mult = 2
  let num  = cuerpo
  while (num > 0) {
    suma += (num % 10) * mult
    num  = Math.floor(num / 10)
    mult = mult === 7 ? 2 : mult + 1
  }
  const dvCalc = 11 - (suma % 11)
  const dvEsp  = dvCalc === 11 ? '0' : dvCalc === 10 ? 'K' : String(dvCalc)
  return dv === dvEsp
}

// ── Porcentaje de asistencia ──────────────────────────────────
export function calcularPorcentajeAsistencia(
  presentes: number,
  total: number
): number {
  if (total === 0) return 0
  return Math.round((presentes / total) * 100 * 10) / 10
}

export function colorAsistencia(porcentaje: number): string {
  if (porcentaje >= 90) return 'text-green-700'
  if (porcentaje >= 75) return 'text-orange-600'
  return 'text-red-600'
}

// ── Nombre completo de alumno ─────────────────────────────────
export function nombreCompleto(
  nombre: string,
  apellidoPaterno?: string | null,
  apellidoMaterno?: string | null
): string {
  return [apellidoPaterno, apellidoMaterno, nombre]
    .filter(Boolean)
    .join(' ')
}

// ── Iniciales para avatar ─────────────────────────────────────
export function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

// ── Truncar texto ─────────────────────────────────────────────
export function truncar(texto: string, largo = 50): string {
  if (texto.length <= largo) return texto
  return texto.slice(0, largo).trimEnd() + '…'
}

// ── Delay para testing / skeleton ─────────────────────────────
export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))
