import httpClient from '@/shared/api/httpClient'

export interface OtraMascota {
  especie: string
  cantidad: number
  edad_aprox?: string
  vacunadas: boolean
  esterilizadas: boolean
}

export interface CondicionesHogar {
  id: number
  tipo_vivienda: 'CASA' | 'APARTAMENTO' | 'FINCA' | 'OTRO'
  propiedad_vivienda: 'PROPIA' | 'ALQUILADA'
  tiene_patio: boolean
  numero_personas: number
  tiene_ninos: boolean
  tamano_hogar: 'PEQUENO' | 'MEDIANO' | 'GRANDE'
  tiene_mascotas_actualmente: boolean
  otras_mascotas: OtraMascota[]
  tiempo_solo_horas: number
  ingresos_estimados: string
  experiencia_mascotas: string
  motivacion: string
  acuerdo_responsabilidad: boolean
  fecha_registro: string
}

export interface Familia {
  id: number
  usuario_email: string
  nombre_familia: string
  cedula: string
  foto_cedula_url: string | null
  fecha_nacimiento: string
  telefono: string
  ciudad: string
  departamento: string
  direccion: string
  redes_sociales: string
  condiciones_hogar: CondicionesHogar | null
  fecha_registro: string
}

export interface CondicionesPayload {
  tipo_vivienda: 'CASA' | 'APARTAMENTO' | 'FINCA' | 'OTRO'
  propiedad_vivienda: 'PROPIA' | 'ALQUILADA'
  tiene_patio: boolean
  numero_personas: number
  tiene_ninos: boolean
  tamano_hogar: 'PEQUENO' | 'MEDIANO' | 'GRANDE'
  tiene_mascotas_actualmente: boolean
  otras_mascotas: OtraMascota[]
  tiempo_solo_horas: number
  ingresos_estimados: string
  experiencia_mascotas?: string
  motivacion: string
  acuerdo_responsabilidad: boolean
}

export const familiasApi = {
  miFamilia: () =>
    httpClient
      .get<{ familia: Familia | null; tiene_familia: boolean }>('/familias/mia/')
      .then((r) => r.data),

  crearFamilia: (formData: FormData) =>
    httpClient.post('/familias/mia/', formData).then((r) => r.data),

  actualizarFamilia: (payload: Partial<{
    nombre_familia: string; cedula: string; fecha_nacimiento: string;
    telefono: string; ciudad: string; departamento: string;
    direccion: string; redes_sociales: string;
  }>) =>
    httpClient.patch('/familias/mia/', payload).then((r) => r.data),

  misCondicionesHogar: () =>
    httpClient.get('/familias/mia/condiciones-hogar/').then((r) => r.data),

  registrarCondicionesHogar: (payload: CondicionesPayload) =>
    httpClient.post('/familias/mia/condiciones-hogar/', payload).then((r) => r.data),

  actualizarCondicionesHogar: (payload: Partial<CondicionesPayload>) =>
    httpClient.patch('/familias/mia/condiciones-hogar/', payload).then((r) => r.data),

  listarFamilias: () =>
    httpClient.get('/familias/').then((r) => r.data),
}
