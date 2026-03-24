import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { mascotasApi } from '../api/mascotasApi'
import { Input } from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import NavBar from '@/shared/components/NavBar'
import { ArrowLeft, ArrowRight, Check, Upload, Plus, Trash2 } from 'lucide-react'

const ESPECIES = [
  { value: 'PERRO', label: 'Perro' },
  { value: 'GATO', label: 'Gato' },
  { value: 'CONEJO', label: 'Conejo' },
  { value: 'HAMSTER', label: 'Hámster' },
] as const

const TODAY = new Date().toISOString().split('T')[0]

const vacunaSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  fecha_aplicacion: z.string().min(1, 'Requerido'),
  proxima_dosis: z.string().optional(),
  veterinario: z.string().optional(),
  lote: z.string().optional(),
})

const schema = z.object({
  // Paso 1 — Información básica
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  especie: z.enum(['PERRO', 'GATO', 'CONEJO', 'HAMSTER']),
  raza: z.string().min(1, 'Requerido'),
  edad: z.coerce.number().min(0, 'Debe ser ≥ 0'),
  edad_unidad: z.enum(['ANIOS', 'MESES']),
  fecha_nacimiento: z.string().min(1, 'Requerido').refine(
    (v) => !v || new Date(v) <= new Date(),
    'La fecha no puede ser futura'
  ),
  tamano: z.string().min(1, 'Selecciona un tamaño'),
  peso: z.string().min(1, 'Requerido'),
  sexo: z.string().min(1, 'Selecciona el sexo'),
  estado: z.enum(['DISPONIBLE', 'EN_PROCESO', 'NO_DISPONIBLE']).default('DISPONIBLE'),
  // Paso 2 — Información de salud
  nivel_energia: z.enum(['BAJO', 'MEDIO', 'ALTO', '']).optional(),
  vacunas: z.array(vacunaSchema).optional(),
  historia_mascota: z.string().optional(),
  info_adicional: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const STEP1_FIELDS: (keyof FormData)[] = [
  'nombre', 'especie', 'raza', 'edad', 'edad_unidad',
  'fecha_nacimiento', 'tamano', 'peso', 'sexo', 'estado',
]

export default function RegistrarMascotaPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [carnetFile, setCarnetFile] = useState<File | null>(null)
  const [step, setStep] = useState(1)

  const { register, handleSubmit, trigger, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { especie: 'PERRO', estado: 'DISPONIBLE', edad: 0, edad_unidad: 'ANIOS', tamano: '', sexo: '', vacunas: [] },
  })

  const { fields: vacunaFields, append: appendVacuna, remove: removeVacuna } = useFieldArray({
    control,
    name: 'vacunas',
  })

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const goToStep2 = async () => {
    const valid = await trigger(STEP1_FIELDS)
    if (valid) setStep(2)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await mascotasApi.crear({
        nombre: data.nombre,
        especie: data.especie,
        raza: data.raza,
        edad_anios: data.edad,
        edad_unidad: data.edad_unidad,
        fecha_nacimiento: data.fecha_nacimiento,
        tamano: data.tamano,
        peso: data.peso ? parseFloat(data.peso) : undefined,
        sexo: data.sexo,
        descripcion: data.historia_mascota,
        estado: data.estado,
        ...(fotoFile && { foto: fotoFile }),
        nivel_energia: data.nivel_energia || undefined,
        historial_vacunas: data.vacunas || [],
        ...(carnetFile && { carnet_vacunas: carnetFile }),
        historia_mascota: data.historia_mascota,
        info_adicional: data.info_adicional,
      })
      await qc.invalidateQueries({ queryKey: ['mascotas'] })
      toast.success('Mascota registrada exitosamente.')
      navigate('/mascotas')
    } catch {
      toast.error('Error al registrar la mascota.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pettech-cream">
      <NavBar />
      <main className="max-w-2xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        {/* Stepper */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-pettech-orange' : 'text-gray-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step > 1 ? 'bg-pettech-orange border-pettech-orange text-white' : step === 1 ? 'border-pettech-orange text-pettech-orange' : 'border-gray-300 text-gray-400'}`}>
              {step > 1 ? <Check className="w-3 h-3" /> : '1'}
            </div>
            <span className="text-sm font-medium">Información básica</span>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-pettech-orange' : 'text-gray-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= 2 ? 'border-pettech-orange text-pettech-orange' : 'border-gray-300 text-gray-400'}`}>
              2
            </div>
            <span className="text-sm font-medium">Información de salud</span>
          </div>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* â”€â”€ PASO 1 â”€â”€ */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Información básica</h2>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Nombre *" error={errors.nombre?.message} {...register('nombre')} />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Especie *</label>
                    <select className="input-field" {...register('especie')}>
                      {ESPECIES.map((e) => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Raza *" placeholder="Labrador, Persa..." error={errors.raza?.message} {...register('raza')} />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Estado</label>
                    <select className="input-field" {...register('estado')}>
                      <option value="DISPONIBLE">Disponible</option>
                      <option value="EN_PROCESO">En proceso</option>
                      <option value="NO_DISPONIBLE">No disponible</option>
                    </select>
                  </div>
                </div>

                {/* Edad + unidad */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Edad *</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      max={99}
                      className="input-field flex-1"
                      onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                      {...register('edad')}
                    />
                    <select className="input-field w-32" {...register('edad_unidad')}>
                      <option value="ANIOS">Años</option>
                      <option value="MESES">Meses</option>
                    </select>
                  </div>
                  {errors.edad && <p className="text-xs text-red-500">{errors.edad.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Fecha de nacimiento *</label>
                    <input type="date" className="input-field" max={TODAY} {...register('fecha_nacimiento')} />
                    {errors.fecha_nacimiento && <p className="text-xs text-red-500">{errors.fecha_nacimiento.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Tamaño *</label>
                    <select className="input-field" {...register('tamano')}>
                      <option value="">Seleccionar...</option>
                      <option value="PEQUENO">Raza pequeña</option>
                      <option value="MEDIANO">Raza mediana</option>
                      <option value="GRANDE">Raza grande</option>
                    </select>
                    {errors.tamano && <p className="text-xs text-red-500">{errors.tamano.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Peso en kg *"
                    type="number"
                    step="0.1"
                    min={0}
                    placeholder="Ej: 5.5"
                    onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                    error={errors.peso?.message}
                    {...register('peso')}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Sexo *</label>
                    <select className="input-field" {...register('sexo')}>
                      <option value="">Seleccionar...</option>
                      <option value="MACHO">Macho</option>
                      <option value="HEMBRA">Hembra</option>
                    </select>
                    {errors.sexo && <p className="text-xs text-red-500">{errors.sexo.message}</p>}
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <Button type="button" onClick={goToStep2} className="flex items-center gap-2">
                    Siguiente <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* â”€â”€ PASO 2 â”€â”€ */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Información de salud</h2>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Nivel de energía</label>
                  <select className="input-field" {...register('nivel_energia')}>
                    <option value="">Seleccionar...</option>
                    <option value="BAJO">Bajo</option>
                    <option value="MEDIO">Medio</option>
                    <option value="ALTO">Alto</option>
                  </select>
                </div>

                {/* Foto / Video */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Foto / Video (opcional)</label>
                  <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-pettech-orange transition-colors">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">{fotoFile ? fotoFile.name : 'Subir archivo'}</span>
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFoto} />
                  </label>
                  {preview && (
                    fotoFile?.type.startsWith('video/')
                      ? <video src={preview} controls className="w-full max-h-48 rounded-lg" />
                      : <img src={preview} alt="preview" className="w-32 h-32 object-cover rounded-lg" />
                  )}
                </div>

                {/* â”€â”€ Historial de vacunas â”€â”€ */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Historial de vacunas (opcional)</label>
                    <button
                      type="button"
                      onClick={() => appendVacuna({ nombre: '', fecha_aplicacion: '', proxima_dosis: '', veterinario: '', lote: '' })}
                      className="flex items-center gap-1 text-sm text-pettech-orange hover:underline font-medium"
                    >
                      <Plus className="w-4 h-4" /> Agregar vacuna
                    </button>
                  </div>

                  {vacunaFields.length === 0 && (
                    <p className="text-xs text-gray-400 italic">Sin vacunas registradas. Haz clic en "Agregar vacuna".</p>
                  )}

                  {vacunaFields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">Vacuna {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeVacuna(index)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-600">Nombre *</label>
                          <input
                            className="input-field"
                            placeholder="Ej: Rabia"
                            {...register(`vacunas.${index}.nombre`)}
                          />
                          {errors.vacunas?.[index]?.nombre && (
                            <p className="text-xs text-red-500">{errors.vacunas[index]?.nombre?.message}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-600">Fecha de aplicación *</label>
                          <input
                            type="date"
                            className="input-field"
                            max={TODAY}
                            {...register(`vacunas.${index}.fecha_aplicacion`)}
                          />
                          {errors.vacunas?.[index]?.fecha_aplicacion && (
                            <p className="text-xs text-red-500">{errors.vacunas[index]?.fecha_aplicacion?.message}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-600">Próxima dosis</label>
                          <input
                            type="date"
                            className="input-field"
                            {...register(`vacunas.${index}.proxima_dosis`)}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-600">Veterinario / Clínica</label>
                          <input
                            className="input-field"
                            placeholder="Ej: Clínica Vet Salud"
                            {...register(`vacunas.${index}.veterinario`)}
                          />
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                          <label className="text-xs font-medium text-gray-600">Lote</label>
                          <input
                            className="input-field"
                            placeholder="Ej: ABC123"
                            {...register(`vacunas.${index}.lote`)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Carnet de vacunas */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">📎 Subir carnet de vacunas (opcional)</label>
                    <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-pettech-orange transition-colors">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {carnetFile ? carnetFile.name : 'PDF o imagen del carnet'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => setCarnetFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Historia de la mascota</label>
                  <textarea
                    className="input-field min-h-[100px]"
                    placeholder="Breve descripción de su personalidad y comportamiento..."
                    {...register('historia_mascota')}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Información adicional</label>
                  <textarea
                    className="input-field min-h-[80px]"
                    placeholder="Ej: desparasitado, esterilizado/a, alergias conocidas..."
                    {...register('info_adicional')}
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="w-4 h-4" /> Anterior
                  </button>
                  <Button type="submit" loading={loading}>Registrar mascota</Button>
                </div>
              </div>
            )}

          </form>
        </div>
      </main>
    </div>
  )
}