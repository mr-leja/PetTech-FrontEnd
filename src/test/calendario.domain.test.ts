/**
 * Tests unitarios — lógica de dominio del calendario de vacunación en frontend.
 * Cubre: parseLocalDate, formatFecha, getEstado (proxima/vencida/completada).
 * Se prueban las funciones puras exportadas desde CalendarioVacunacionPage.
 * Como son privadas, las reimplementamos aquí para testear la lógica de negocio
 * de la misma forma que la UI la consume.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { EntradaCalendario } from '../features/adopciones/api/calendarioApi'

// ─── Reimplantación de las funciones puras del componente ───────────────────
// (misma lógica que CalendarioVacunacionPage.tsx)

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatFecha(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

type EstadoVacuna = 'completada' | 'vencida' | 'proxima'

function getEstado(entrada: EntradaCalendario): EstadoVacuna {
  if (entrada.completada) return 'completada'
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fecha = parseLocalDate(entrada.fecha_sugerida)
  return fecha < hoy ? 'vencida' : 'proxima'
}

// ─── Fixture base ────────────────────────────────────────────────────────────

function makeEntrada(overrides: Partial<EntradaCalendario> = {}): EntradaCalendario {
  return {
    id: 1,
    nombre_vacuna: 'Rabia',
    descripcion: 'Antirrábica',
    fecha_sugerida: '2030-12-31', // futuro por defecto
    es_refuerzo: false,
    completada: false,
    ...overrides,
  }
}

// ─── parseLocalDate ──────────────────────────────────────────────────────────

describe('parseLocalDate', () => {
  it('parsea correctamente año, mes y día', () => {
    const d = parseLocalDate('2026-03-15')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(2) // 0-indexed
    expect(d.getDate()).toBe(15)
  })

  it('no añade desfase de zona horaria (local date)', () => {
    const d = parseLocalDate('2026-01-01')
    // Con new Date('2026-01-01') en UTC habría desfase; con parseLocalDate no
    expect(d.getDate()).toBe(1)
    expect(d.getMonth()).toBe(0)
  })

  it('parsea fecha de fin de año', () => {
    const d = parseLocalDate('2025-12-31')
    expect(d.getFullYear()).toBe(2025)
    expect(d.getMonth()).toBe(11)
    expect(d.getDate()).toBe(31)
  })
})

// ─── formatFecha ─────────────────────────────────────────────────────────────

describe('formatFecha', () => {
  it('devuelve string no vacío', () => {
    expect(formatFecha('2026-06-15').length).toBeGreaterThan(0)
  })

  it('incluye el año en el resultado', () => {
    expect(formatFecha('2028-04-01')).toContain('2028')
  })

  it('incluye el día en el resultado', () => {
    const result = formatFecha('2026-03-26')
    expect(result).toContain('26')
  })
})

// ─── getEstado ───────────────────────────────────────────────────────────────

describe('getEstado', () => {
  const FAKE_TODAY = new Date(2026, 2, 26) // 26 marzo 2026

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FAKE_TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna "completada" si entrada.completada es true sin importar la fecha', () => {
    const entrada = makeEntrada({ completada: true, fecha_sugerida: '2020-01-01' })
    expect(getEstado(entrada)).toBe('completada')
  })

  it('retorna "proxima" para fecha futura y no completada', () => {
    const entrada = makeEntrada({ fecha_sugerida: '2030-01-01' })
    expect(getEstado(entrada)).toBe('proxima')
  })

  it('retorna "vencida" para fecha pasada y no completada', () => {
    const entrada = makeEntrada({ fecha_sugerida: '2020-01-01' })
    expect(getEstado(entrada)).toBe('vencida')
  })

  it('retorna "proxima" para fecha = hoy (no vencida aún)', () => {
    const entrada = makeEntrada({ fecha_sugerida: '2026-03-26' })
    expect(getEstado(entrada)).toBe('proxima')
  })

  it('retorna "vencida" para ayer', () => {
    const entrada = makeEntrada({ fecha_sugerida: '2026-03-25' })
    expect(getEstado(entrada)).toBe('vencida')
  })

  it('completada=true con fecha futura sigue siendo "completada"', () => {
    const entrada = makeEntrada({ completada: true, fecha_sugerida: '2030-01-01' })
    expect(getEstado(entrada)).toBe('completada')
  })
})
