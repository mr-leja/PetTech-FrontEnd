import httpClient from '@/shared/api/httpClient'

export interface Mascota {
  id: number
  nombre: string
  especie: 'PERRO' | 'GATO' | 'OTRO'
  raza: string
  edad_anios: number
  descripcion: string
  estado: 'DISPONIBLE' | 'EN_PROCESO' | 'ADOPTADO' | 'NO_DISPONIBLE'
  foto_url: string | null
  registrado_por_email: string | null
  fecha_ingreso: string
}

export interface MascotasResponse {
  count: number
  next: string | null
  previous: string | null
  results: Mascota[]
}

export interface CreateMascotaPayload {
  nombre: string
  especie: string
  raza: string
  edad_anios: number
  descripcion: string
  estado?: string
  foto?: File
}

export const mascotasApi = {
  listar: (params?: { estado?: string; especie?: string; page?: number }) =>
    httpClient.get<MascotasResponse>('/mascotas/', { params }).then((r) => r.data),

  obtener: (id: number) =>
    httpClient.get<Mascota>(`/mascotas/${id}/`).then((r) => r.data),

  crear: (payload: CreateMascotaPayload) => {
    const form = new FormData()
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, v instanceof File ? v : String(v))
    })
    return httpClient.post<Mascota>('/mascotas/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  actualizar: (id: number, payload: Partial<CreateMascotaPayload>) => {
    const form = new FormData()
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, v instanceof File ? v : String(v))
    })
    return httpClient.patch<Mascota>(`/mascotas/${id}/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  eliminar: (id: number) =>
    httpClient.delete(`/mascotas/${id}/`).then((r) => r.data),
}
