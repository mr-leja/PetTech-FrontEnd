import httpClient from '@/shared/api/httpClient'

export interface CondicionesHogarResumen {
  tipo_vivienda: string
  tiene_patio: boolean
  numero_personas: number
  tiene_ninos: boolean
  tamano_hogar: string
  tiene_mascotas_actualmente: boolean
  tiempo_solo_horas: number
  ingresos_estimados: string
  experiencia_mascotas: string
  motivacion: string
}

export interface SolicitudAdopcion {
  id: number
  mascota: number
  mascota_nombre: string
  mascota_especie: string
  mascota_raza: string
  mascota_edad_anios: number
  mascota_edad_unidad: string
  mascota_sexo: string
  mascota_tamano: string
  mascota_nivel_energia: string
  mascota_descripcion: string
  mascota_historia: string
  mascota_estado: string
  mascota_foto_url: string | null
  familia: number
  familia_nombre: string
  familia_cedula: string
  familia_telefono: string
  familia_ciudad: string
  familia_departamento: string
  familia_direccion: string
  familia_email: string
  familia_foto_perfil_url: string | null
  condiciones_hogar: CondicionesHogarResumen | null
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
  mensaje: string
  notas_admin: string
  fecha_solicitud: string
  fecha_decision: string | null
}

export interface SolicitudesResponse {
  results: SolicitudAdopcion[]
  count: number
}

export interface Adopcion {
  id: number
  solicitud: number
  // Mascota
  mascota_nombre: string
  mascota_especie: string
  mascota_raza: string
  mascota_edad_anios: number
  mascota_edad_unidad: string
  mascota_sexo: string
  mascota_tamano: string
  mascota_descripcion: string
  mascota_foto_url: string | null
  // Familia
  familia_nombre: string
  familia_email: string
  familia_cedula: string
  familia_telefono: string
  familia_ciudad: string
  familia_departamento: string
  familia_foto_perfil_url: string | null
  // Solicitud original
  solicitud_mensaje: string
  solicitud_notas_admin: string
  solicitud_fecha: string
  // Adopcion
  fecha_adopcion: string
  notas: string
}

export interface AdopcionesResponse {
  results: Adopcion[]
  count: number
}

export interface ContadoresFamilia {
  adopciones_en_proceso: number
  adopciones_realizadas: number
}

export const solicitudesApi = {
  listar: () =>
    httpClient.get<SolicitudesResponse>('/solicitudes/').then((r) => r.data),

  crear: (mascotaId: number, mensaje?: string) =>
    httpClient
      .post<SolicitudAdopcion>('/solicitudes/', { mascota: mascotaId, mensaje: mensaje ?? '' })
      .then((r) => r.data),

  aprobar: (id: number, notasAdmin?: string) =>
    httpClient
      .post<SolicitudAdopcion>(`/solicitudes/${id}/aprobar/`, { notas_admin: notasAdmin ?? '' })
      .then((r) => r.data),

  rechazar: (id: number, notasAdmin?: string) =>
    httpClient
      .post<SolicitudAdopcion>(`/solicitudes/${id}/rechazar/`, { notas_admin: notasAdmin ?? '' })
      .then((r) => r.data),

  misContadores: () =>
    httpClient.get<ContadoresFamilia>('/solicitudes/mis-contadores/').then((r) => r.data),

  listarAdopciones: () =>
    httpClient.get<AdopcionesResponse>('/adopciones/').then((r) => r.data),
}
