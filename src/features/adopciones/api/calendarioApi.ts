import httpClient from '@/shared/api/httpClient'

export interface EntradaCalendario {
  id: number
  nombre_vacuna: string
  descripcion: string
  fecha_sugerida: string   // ISO date 'YYYY-MM-DD'
  es_refuerzo: boolean
  completada: boolean
}

export interface CalendarioVacunacion {
  id: number
  adopcion: number
  mascota_nombre: string
  mascota_especie: string
  mascota_foto_url: string | null
  notas: string
  fecha_generacion: string  // ISO datetime
  entradas: EntradaCalendario[]
}

export const calendarioApi = {
  obtener: (adopcionId: number): Promise<CalendarioVacunacion> =>
    httpClient
      .get(`adopciones/${adopcionId}/calendario/`)
      .then((r) => r.data),
}
