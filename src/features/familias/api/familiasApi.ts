import httpClient from '@/shared/api/httpClient'

export interface FamiliaPayload {
  nombre_familia: string
  telefono: string
  ciudad: string
  departamento: string
}

export interface CondicionesPayload {
  tipo_vivienda: 'CASA' | 'APARTAMENTO' | 'FINCA' | 'OTRO'
  tiene_patio: boolean
  numero_personas: number
  tiene_mascotas_actualmente: boolean
  experiencia_mascotas?: string
  acuerdo_responsabilidad: boolean
}

export const familiasApi = {
  miFamilia: () =>
    httpClient.get('/familias/mia/').then((r) => r.data),

  crearFamilia: (payload: FamiliaPayload) =>
    httpClient.post('/familias/mia/', payload).then((r) => r.data),

  misCondicionesHogar: () =>
    httpClient.get('/familias/mia/condiciones-hogar/').then((r) => r.data),

  registrarCondicionesHogar: (payload: CondicionesPayload) =>
    httpClient.post('/familias/mia/condiciones-hogar/', payload).then((r) => r.data),

  listarFamilias: () =>
    httpClient.get('/familias/').then((r) => r.data),
}
