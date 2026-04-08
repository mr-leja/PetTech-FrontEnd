/**
 * Tests unitarios — mascotasApi
 * Cubre: listar (sin/con params), obtener, eliminar y propagación de errores.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mascota, MascotasResponse } from '../features/mascotas/api/mascotasApi'

vi.mock('../shared/api/httpClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import { mascotasApi } from '../features/mascotas/api/mascotasApi'
import httpClient from '../shared/api/httpClient'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MASCOTA_MOCK: Mascota = {
  id: 1,
  nombre: 'Luna',
  especie: 'PERRO',
  raza: 'Labrador',
  edad_anios: 2,
  edad_unidad: 'ANIOS',
  fecha_nacimiento: null,
  tamano: 'MEDIANO',
  peso: 10,
  sexo: 'HEMBRA',
  descripcion: '',
  estado: 'DISPONIBLE',
  foto_url: null,
  nivel_energia: 'MEDIO',
  nivel_independencia: 'MEDIO',
  nivel_complejidad: 'BAJO',
  nivel_sociabilidad: 'ALTO',
  apta_ninos: true,
  costo_estimado_mensual: '1_2SMLV',
  historial_vacunas: [],
  carnet_vacunas_url: null,
  historia_mascota: '',
  info_adicional: '',
  registrado_por_email: null,
  fecha_ingreso: '2026-01-01T00:00:00Z',
}

const RESPONSE_MOCK: MascotasResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [MASCOTA_MOCK],
}

// ─── mascotasApi.listar ──────────────────────────────────────────────────────

describe('mascotasApi.listar', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('llama a la URL correcta sin params', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: RESPONSE_MOCK })
    await mascotasApi.listar()
    expect(httpClient.get).toHaveBeenCalledWith('/mascotas/', { params: undefined })
  })

  it('retorna count y results', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: RESPONSE_MOCK })
    const result = await mascotasApi.listar()
    expect(result.count).toBe(1)
    expect(result.results).toHaveLength(1)
    expect(result.results[0].nombre).toBe('Luna')
  })

  it('pasa el filtro de especie como param', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: RESPONSE_MOCK })
    await mascotasApi.listar({ especie: 'PERRO' })
    expect(httpClient.get).toHaveBeenCalledWith('/mascotas/', { params: { especie: 'PERRO' } })
  })

  it('pasa page_size como param', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: RESPONSE_MOCK })
    await mascotasApi.listar({ page_size: 100 })
    expect(httpClient.get).toHaveBeenCalledWith('/mascotas/', { params: { page_size: 100 } })
  })

  it('pasa filtro de estado como param', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: RESPONSE_MOCK })
    await mascotasApi.listar({ estado: 'DISPONIBLE' })
    expect(httpClient.get).toHaveBeenCalledWith('/mascotas/', { params: { estado: 'DISPONIBLE' } })
  })

  it('propaga error si la petición falla', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))
    await expect(mascotasApi.listar()).rejects.toThrow('Network error')
  })
})

// ─── mascotasApi.obtener ─────────────────────────────────────────────────────

describe('mascotasApi.obtener', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('llama a la URL correcta con el id', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: MASCOTA_MOCK })
    await mascotasApi.obtener(1)
    expect(httpClient.get).toHaveBeenCalledWith('/mascotas/1/')
  })

  it('retorna los datos de la mascota', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: MASCOTA_MOCK })
    const result = await mascotasApi.obtener(1)
    expect(result.id).toBe(1)
    expect(result.nombre).toBe('Luna')
    expect(result.especie).toBe('PERRO')
  })

  it('usa el id correcto en la URL', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: MASCOTA_MOCK })
    await mascotasApi.obtener(42)
    expect(httpClient.get).toHaveBeenCalledWith('/mascotas/42/')
  })

  it('propaga error si la petición falla', async () => {
    ;(httpClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Not found'))
    await expect(mascotasApi.obtener(999)).rejects.toThrow('Not found')
  })
})

// ─── mascotasApi.eliminar ────────────────────────────────────────────────────

describe('mascotasApi.eliminar', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('llama a la URL correcta con el id', async () => {
    ;(httpClient.delete as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} })
    await mascotasApi.eliminar(5)
    expect(httpClient.delete).toHaveBeenCalledWith('/mascotas/5/')
  })

  it('usa el id correcto en la URL', async () => {
    ;(httpClient.delete as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} })
    await mascotasApi.eliminar(99)
    expect(httpClient.delete).toHaveBeenCalledWith('/mascotas/99/')
  })

  it('propaga error si la petición falla', async () => {
    ;(httpClient.delete as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Forbidden'))
    await expect(mascotasApi.eliminar(1)).rejects.toThrow('Forbidden')
  })
})
