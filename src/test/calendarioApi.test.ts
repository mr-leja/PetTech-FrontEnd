/**
 * Tests unitarios — calendarioApi types y estructura (sin llamadas HTTP reales).
 * Cubre: construcción correcta de la petición, tipos de datos del contrato API.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CalendarioVacunacion, EntradaCalendario } from '../features/adopciones/api/calendarioApi'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../shared/api/httpClient', () => ({
  default: {
    get: vi.fn(),
  },
}))

import { calendarioApi } from '../features/adopciones/api/calendarioApi'
import httpClient from '../shared/api/httpClient'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ENTRADA_MOCK: EntradaCalendario = {
  id: 1,
  nombre_vacuna: 'Rabia',
  descripcion: 'Antirrábica',
  fecha_sugerida: '2026-04-01',
  es_refuerzo: false,
  completada: false,
}

const CALENDARIO_MOCK: CalendarioVacunacion = {
  id: 1,
  adopcion: 2,
  mascota_nombre: 'Luna',
  mascota_especie: 'PERRO',
  mascota_foto_url: null,
  notas: 'Calendario orientativo.',
  fecha_generacion: '2026-03-26T10:00:00Z',
  entradas: [ENTRADA_MOCK],
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('calendarioApi.obtener', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('llama a la URL correcta con el adopcionId', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: CALENDARIO_MOCK })
    await calendarioApi.obtener(2)
    expect(httpClient.get).toHaveBeenCalledWith('adopciones/2/calendario/')
  })

  it('retorna los datos del calendario', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: CALENDARIO_MOCK })
    const result = await calendarioApi.obtener(2)
    expect(result.id).toBe(1)
    expect(result.mascota_nombre).toBe('Luna')
  })

  it('retorna las entradas del calendario', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: CALENDARIO_MOCK })
    const result = await calendarioApi.obtener(2)
    expect(result.entradas).toHaveLength(1)
    expect(result.entradas[0].nombre_vacuna).toBe('Rabia')
  })

  it('propaga el error si la petición falla', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))
    await expect(calendarioApi.obtener(99)).rejects.toThrow('Network error')
  })

  it('usa el adopcionId correcto en la URL', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: CALENDARIO_MOCK })
    await calendarioApi.obtener(42)
    expect(httpClient.get).toHaveBeenCalledWith('adopciones/42/calendario/')
  })
})

// ─── Tipos de EntradaCalendario ───────────────────────────────────────────────

describe('EntradaCalendario type contract', () => {
  it('entrada con completada=true es correctamente tipada', () => {
    const entrada: EntradaCalendario = { ...ENTRADA_MOCK, completada: true }
    expect(entrada.completada).toBe(true)
  })

  it('entrada con es_refuerzo=true es correctamente tipada', () => {
    const entrada: EntradaCalendario = { ...ENTRADA_MOCK, es_refuerzo: true }
    expect(entrada.es_refuerzo).toBe(true)
  })

  it('entrada con foto_url null es válida', () => {
    const cal: CalendarioVacunacion = { ...CALENDARIO_MOCK, mascota_foto_url: null }
    expect(cal.mascota_foto_url).toBeNull()
  })

  it('entrada con fecha_sugerida en formato YYYY-MM-DD', () => {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    expect(regex.test(ENTRADA_MOCK.fecha_sugerida)).toBe(true)
  })
})
