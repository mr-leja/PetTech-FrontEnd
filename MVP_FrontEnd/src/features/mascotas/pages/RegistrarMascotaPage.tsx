import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { mascotasApi } from '../api/mascotasApi'
import { ESPECIES, vacunaSchema, STEP1_FIELDS, getTodayDate } from '../formSchema'
import { useMascotaForm } from '../hooks/useMascotaForm'
import { Input } from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import NavBar from '@/shared/components/NavBar'
import StepperHeader from '../components/StepperHeader'
import VacunaFieldArray, { CarnetUpload } from '../components/VacunaFieldArray'
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react'

const DRAFT_KEY = 'pettech_mascota_draft'

function loadDraft(): Partial<FormData> | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const TODAY = getTodayDate()

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
  // Paso 2 — Características para adopción (matching) — obligatorios
  nivel_energia: z.string().min(1, 'Selecciona el nivel de energía'),
  nivel_independencia: z.string().min(1, 'Requerido'),
  nivel_complejidad: z.string().min(1, 'Requerido'),
  nivel_sociabilidad: z.string().min(1, 'Requerido'),
  apta_ninos: z.string().min(1, 'Requerido'),
  costo_estimado_mensual: z.string().min(1, 'Requerido'),
  // Paso 2 — Historial de vacunas — obligatorio
  vacunas: z.array(vacunaSchema).min(1, 'Agrega al menos una vacuna'),
  historia_mascota: z.string().optional(),
  info_adicional: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const STEPS = ['Información básica', 'Información de salud']

export default function RegistrarMascotaPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [loading, setLoading] = useState(false)

  const {
    fotoFile, setFotoFile, preview, setPreview,
    carnetFile, setCarnetFile, step, setStep, handleFoto,
  } = useMascotaForm()

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      especie: 'PERRO', estado: 'DISPONIBLE', edad: 0, edad_unidad: 'ANIOS',
      tamano: '', sexo: '', vacunas: [],
      ...loadDraft(),
    },
  })

  const { register, handleSubmit, trigger, watch, formState: { errors } } = methods

  const watchedValues = watch()
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(watchedValues))
    } catch {}
  }, [JSON.stringify(watchedValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  const goToStep2 = async () => {
    const valid = await trigger(STEP1_FIELDS as any)
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
        nivel_independencia: data.nivel_independencia || undefined,
        nivel_complejidad: data.nivel_complejidad || undefined,
        nivel_sociabilidad: data.nivel_sociabilidad || undefined,
        apta_ninos: data.apta_ninos === 'SI' ? true : data.apta_ninos === 'NO' ? false : null,
        costo_estimado_mensual: data.costo_estimado_mensual || undefined,
        historial_vacunas: data.vacunas || [],
        ...(carnetFile && { carnet_vacunas: carnetFile }),
        historia_mascota: data.historia_mascota,
        info_adicional: data.info_adicional,
      })
      await qc.invalidateQueries({ queryKey: ['mascotas'] })
      sessionStorage.removeItem(DRAFT_KEY)
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

        <StepperHeader step={step} steps={STEPS} />

        <FormProvider {...methods}>
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
                  <label className="text-sm font-medium text-gray-700">Nivel de energía *</label>
                  <select className="input-field" {...register('nivel_energia')}>
                    <option value="">Seleccionar...</option>
                    <option value="BAJO">Bajo</option>
                    <option value="MEDIO">Medio</option>
                    <option value="ALTO">Alto</option>
                  </select>
                  {errors.nivel_energia && <p className="text-xs text-red-500">{errors.nivel_energia.message}</p>}
                </div>
                {/* ── Características para adopción (matching) ── */}
                <div className="border border-orange-100 rounded-xl p-4 bg-orange-50/40 flex flex-col gap-4">
                  <h3 className="text-sm font-semibold text-pettech-orange">Características para adopción *</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Nivel de independencia *</label>
                      <select className="input-field" {...register('nivel_independencia')}>
                        <option value="">Seleccionar...</option>
                        <option value="BAJO">Baja (necesita compañía constante)</option>
                        <option value="MEDIO">Media (puede estar solo moderadamente)</option>
                        <option value="ALTO">Alta (muy independiente)</option>
                      </select>
                      {errors.nivel_independencia && <p className="text-xs text-red-500">{errors.nivel_independencia.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Sociabilidad con otras mascotas *</label>
                      <select className="input-field" {...register('nivel_sociabilidad')}>
                        <option value="">Seleccionar...</option>
                        <option value="BAJO">Baja (prefiere estar solo)</option>
                        <option value="MEDIO">Media (se adapta)</option>
                        <option value="ALTO">Alta (muy sociable)</option>
                      </select>
                      {errors.nivel_sociabilidad && <p className="text-xs text-red-500">{errors.nivel_sociabilidad.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Complejidad de cuidado *</label>
                      <select className="input-field" {...register('nivel_complejidad')}>
                        <option value="">Seleccionar...</option>
                        <option value="BAJO">Baja (ideal para principiantes)</option>
                        <option value="MEDIO">Media (algo de experiencia)</option>
                        <option value="ALTO">Alta (requiere experiencia)</option>
                      </select>
                      {errors.nivel_complejidad && <p className="text-xs text-red-500">{errors.nivel_complejidad.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">¿Apta para niños? *</label>
                      <select className="input-field" {...register('apta_ninos')}>
                        <option value="">Seleccionar...</option>
                        <option value="SI">Sí</option>
                        <option value="NO">No</option>
                      </select>
                      {errors.apta_ninos && <p className="text-xs text-red-500">{errors.apta_ninos.message}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Costo estimado de cuidado mensual *</label>
                    <select className="input-field" {...register('costo_estimado_mensual')}>
                      <option value="">Seleccionar...</option>
                      <option value="MENOS_1SMLV">Menos de 1 SMLV</option>
                      <option value="1_2SMLV">1–2 SMLV</option>
                      <option value="2_4SMLV">2–4 SMLV</option>
                      <option value="MAS_4SMLV">Más de 4 SMLV</option>
                    </select>
                    {errors.costo_estimado_mensual && <p className="text-xs text-red-500">{errors.costo_estimado_mensual.message}</p>}
                  </div>
                </div>
                {/* Foto */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Foto</label>
                  <div className="flex items-center gap-4">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Vista previa"
                        className="w-16 h-16 rounded-lg object-cover border-2 border-pettech-orange"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-pettech-orange border border-pettech-orange rounded-lg px-3 py-1.5 hover:bg-pettech-orange/10 transition-colors w-fit">
                        <Upload className="w-3.5 h-3.5" />
                        {preview ? 'Cambiar foto' : 'Subir foto'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                      </label>
                      {preview && (
                        <button
                          type="button"
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors text-left"
                          onClick={() => { setFotoFile(null); setPreview(null) }}
                        >
                          Quitar foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                  <VacunaFieldArray />
                  <CarnetUpload carnetFile={carnetFile} onChange={setCarnetFile} />

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
                  <Button type="submit" loading={loading}>
                    {loading ? (fotoFile ? 'Subiendo imagen...' : 'Registrando...') : 'Registrar mascota'}
                  </Button>
                </div>
              </div>
            )}

          </form>
          </div>
        </FormProvider>
      </main>
    </div>
  )
}