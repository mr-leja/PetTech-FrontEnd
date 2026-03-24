import httpClient from '@/shared/api/httpClient'

export interface Mascota {
  id: number
  nombre: string
  especie: 'PERRO' | 'GATO' | 'CONEJO' | 'HAMSTER'
  raza: string
  edad_anios: number
  edad_unidad: 'ANIOS' | 'MESES'
  fecha_nacimiento: string | null
  tamano: 'PEQUENO' | 'MEDIANO' | 'GRANDE' | ''
  peso: number | null
  sexo: 'MACHO' | 'HEMBRA' | ''
  descripcion: string
  estado: 'DISPONIBLE' | 'EN_PROCESO' | 'ADOPTADO' | 'NO_DISPONIBLE'
  foto_url: string | null
  nivel_energia: 'BAJO' | 'MEDIO' | 'ALTO' | ''
  historial_vacunas: string
  historia_mascota: string
  info_adicional: string
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
  raza?: string
  edad_anios: number
  edad_unidad: 'ANIOS' | 'MESES'
  fecha_nacimiento?: string
  tamano?: string
  peso?: number
  sexo?: string
  descripcion?: string
  estado?: string
  foto?: File
  nivel_energia?: string
  historial_vacunas?: string
  historia_mascota?: string
  info_adicional?: string
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
