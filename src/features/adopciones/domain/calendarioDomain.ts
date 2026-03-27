import type { EntradaCalendario } from '../api/calendarioApi'

export type EstadoVacuna = 'completada' | 'vencida' | 'proxima'

/** Convierte 'YYYY-MM-DD' a Date local sin desfase de zona horaria UTC */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatFecha(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getEstado(entrada: EntradaCalendario): EstadoVacuna {
  if (entrada.completada) return 'completada'
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fecha = parseLocalDate(entrada.fecha_sugerida)
  return fecha < hoy ? 'vencida' : 'proxima'
}
