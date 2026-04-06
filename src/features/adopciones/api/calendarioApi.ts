import httpClient from '@/shared/api/httpClient'

export interface EntradaCalendario {
  id: number
  nombre_vacuna: string
  descripcion: string
  fecha_sugerida: string   // ISO date 'YYYY-MM-DD'
  es_refuerzo: boolean
  completada: boolean
  foto_comprobante_url?: string | null
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

  marcarAplicada: (entradaId: number, foto: File): Promise<EntradaCalendario> => {
    const form = new FormData()
    form.append('foto_comprobante', foto)
    return httpClient
      .patch(`entradas/${entradaId}/aplicar/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
