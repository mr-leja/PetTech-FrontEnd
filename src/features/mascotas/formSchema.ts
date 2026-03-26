import { z } from 'zod'
import type { FieldPath } from 'react-hook-form'

export const ESPECIES = [
  { value: 'PERRO', label: 'Perro' },
  { value: 'GATO', label: 'Gato' },
  { value: 'CONEJO', label: 'Conejo' },
  { value: 'HAMSTER', label: 'Hámster' },
] as const

export const vacunaSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  fecha_aplicacion: z.string().min(1, 'Requerido'),
  proxima_dosis: z.string().optional(),
  veterinario: z.string().optional(),
  lote: z.string().optional(),
})

export type VacunaFormData = z.infer<typeof vacunaSchema>

/** Campos del paso 1 del formulario de mascota */
export const STEP1_FIELDS = [
  'nombre', 'especie', 'raza', 'edad', 'edad_unidad',
  'fecha_nacimiento', 'tamano', 'peso', 'sexo', 'estado',
] as const

/** Devuelve la fecha de hoy en formato YYYY-MM-DD */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}
