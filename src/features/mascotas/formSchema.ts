import { z } from 'zod'

export const ESPECIES = [
  { value: 'PERRO', label: 'Perro' },
  { value: 'GATO', label: 'Gato' },
  { value: 'CONEJO', label: 'Conejo' },
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

/** Schema base compartido entre RegistrarMascotaPage y EditarMascotaPage */
export const mascotaBaseSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  especie: z.enum(['PERRO', 'GATO', 'CONEJO']),
  raza: z.string().min(1, 'Requerido'),
  edad: z.coerce.number().min(0, 'Debe ser ≥ 0'),
  edad_unidad: z.enum(['ANIOS', 'MESES']),
  tamano: z.string().min(1, 'Selecciona un tamaño'),
  peso: z.string().min(1, 'Requerido'),
  sexo: z.string().min(1, 'Selecciona el sexo'),
  nivel_energia: z.string().min(1, 'Selecciona el nivel de energía'),
  nivel_independencia: z.string().min(1, 'Requerido'),
  nivel_complejidad: z.string().min(1, 'Requerido'),
  nivel_sociabilidad: z.string().min(1, 'Requerido'),
  apta_ninos: z.string().min(1, 'Requerido'),
  costo_estimado_mensual: z.string().min(1, 'Requerido'),
  vacunas: z.array(vacunaSchema).min(1, 'Agrega al menos una vacuna'),
  historia_mascota: z.string().optional(),
  info_adicional: z.string().optional(),
})

// ---------------------------------------------------------------------------
// Comprime y redimensiona una imagen antes de subirla al backend.
// Reduce el tamaño de envío en >80 % en imágenes grandes → menos latencia.
// ---------------------------------------------------------------------------
export async function compressImage(
  file: File,
  maxPx = 1200,
  quality = 0.85,
): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img
      if (width > maxPx || height > maxPx) {
        if (width >= height) {
          height = Math.round((height * maxPx) / width)
          width = maxPx
        } else {
          width = Math.round((width * maxPx) / height)
          height = maxPx
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
        },
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file) }
    img.src = objectUrl
  })
}
