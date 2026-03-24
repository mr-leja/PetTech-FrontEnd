import httpClient from '@/shared/api/httpClient'

export interface VacunaRecord {
  nombre: string
  fecha_aplicacion: string
  proxima_dosis?: string
  veterinario?: string
  lote?: string
}

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
  historial_vacunas: VacunaRecord[]
  carnet_vacunas_url: string | null
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
  historial_vacunas?: VacunaRecord[]
  carnet_vacunas?: File
  historia_mascota?: string
  info_adicional?: string
}

function appendToForm(form: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return
  if (value instanceof File) form.append(key, value)
  else if (Array.isArray(value)) form.append(key, JSON.stringify(value))
  else form.append(key, String(value))
}

export const mascotasApi = {
  listar: (params?: { estado?: string; especie?: string; page?: number }) =>
    httpClient.get<MascotasResponse>('/mascotas/', { params }).then((r) => r.data),

  obtener: (id: number) =>
    httpClient.get<Mascota>(`/mascotas/${id}/`).then((r) => r.data),

  crear: (payload: CreateMascotaPayload) => {
    const form = new FormData()
    Object.entries(payload).forEach(([k, v]) => appendToForm(form, k, v))
    return httpClient.post<Mascota>('/mascotas/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  actualizar: (id: number, payload: Partial<CreateMascotaPayload>) => {
    const form = new FormData()
    Object.entries(payload).forEach(([k, v]) => appendToForm(form, k, v))
    return httpClient.patch<Mascota>(`/mascotas/${id}/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  eliminar: (id: number) =>
    httpClient.delete(`/mascotas/${id}/`).then((r) => r.data),
}
