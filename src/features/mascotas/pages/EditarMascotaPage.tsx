import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import Spinner from '@/shared/components/Spinner'
import StepperHeader from '../components/StepperHeader'
import VacunaFieldArray, { CarnetUpload } from '../components/VacunaFieldArray'
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react'

const TODAY = getTodayDate()

const schema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  especie: z.enum(['PERRO', 'GATO', 'CONEJO']),
  raza: z.string().min(1, 'Requerido'),
  edad: z.coerce.number().min(0, 'Debe ser ≥ 0'),
  edad_unidad: z.enum(['ANIOS', 'MESES']),
  fecha_nacimiento: z.string().optional().refine(
    (v) => !v || new Date(v) <= new Date(),
    'La fecha no puede ser futura'
  ),
  tamano: z.string().min(1, 'Selecciona un tamaño'),
  peso: z.string().min(1, 'Requerido'),
  sexo: z.string().min(1, 'Selecciona el sexo'),
  estado: z.enum(['DISPONIBLE', 'EN_PROCESO', 'NO_DISPONIBLE', 'ADOPTADO']),
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

type FormData = z.infer<typeof schema>

const STEPS = ['Información básica', 'Información de salud']

export default function EditarMascotaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [estadoOriginal, setEstadoOriginal] = useState<string>('')

  const {
    fotoFile, setPreview, fotoEliminada, setFotoEliminada,
    carnetFile, setCarnetFile, step, setStep, handleFoto, removeFoto,
    preview,
  } = useMascotaForm()

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      especie: 'PERRO', estado: 'DISPONIBLE', edad: 0, edad_unidad: 'ANIOS',
      tamano: '', sexo: '', vacunas: [],
      nivel_energia: '', nivel_independencia: '', nivel_complejidad: '',
      nivel_sociabilidad: '', apta_ninos: '', costo_estimado_mensual: '',
    },
  })

  const { register, handleSubmit, trigger, reset, formState: { errors } } = methods

  useEffect(() => {
    if (!id) return
    mascotasApi.obtener(parseInt(id)).then((m) => {
      reset({
        nombre: m.nombre,
        especie: m.especie,
        raza: m.raza || '',
        edad: m.edad_anios,
        edad_unidad: m.edad_unidad,
        fecha_nacimiento: m.fecha_nacimiento ?? '',
        tamano: m.tamano || '',
        peso: m.peso != null ? String(m.peso) : '',
        sexo: m.sexo || '',
        estado: m.estado,
        nivel_energia: m.nivel_energia || '',
        nivel_independencia: (m.nivel_independencia as any) || '',
        nivel_complejidad: (m.nivel_complejidad as any) || '',
        nivel_sociabilidad: (m.nivel_sociabilidad as any) || '',
        apta_ninos: m.apta_ninos === true ? 'SI' : m.apta_ninos === false ? 'NO' : '',
        costo_estimado_mensual: (m.costo_estimado_mensual as any) || '',
        vacunas: m.historial_vacunas ?? [],
        historia_mascota: m.historia_mascota || '',
        info_adicional: m.info_adicional || '',
      })
      if (m.foto_url) setPreview(m.foto_url)
      setEstadoOriginal(m.estado)
      setLoadingData(false)
    }).catch(() => {
      toast.error('No se pudo cargar la mascota.')
      navigate('/mascotas')
    })
  }, [id])

  const goToStep2 = async () => {
    const valid = await trigger(STEP1_FIELDS as any)
    if (valid) setStep(2)
  }

  const onSubmit = async (data: FormData) => {
    if (!id) return
    setLoading(true)
    try {
      await mascotasApi.actualizar(parseInt(id), {
        nombre: data.nombre,
        especie: data.especie,
        raza: data.raza,
        edad_anios: data.edad,
        edad_unidad: data.edad_unidad,
        fecha_nacimiento: data.fecha_nacimiento || undefined,
        tamano: data.tamano,
        peso: data.peso ? parseFloat(data.peso) : undefined,
        sexo: data.sexo,
        estado: data.estado,
        ...(fotoFile ? { foto: fotoFile } : fotoEliminada ? { borrar_foto: true } : {}),
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
      toast.success('Mascota actualizada correctamente.')
      navigate('/mascotas')
    } catch {
      toast.error('Error al actualizar la mascota.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-pettech-cream">
        <NavBar />
        <main className="max-w-2xl mx-auto p-6 flex justify-center pt-20">
          <Spinner />
        </main>
      </div>
    )
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

            {/* PASO 1 */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Información básica</h2>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Nombre" required error={errors.nombre?.message} {...register('nombre')} />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Especie <span className="text-red-500">*</span></label>
                    <select className="input-field" {...register('especie')}>
                      {ESPECIES.map((e) => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Raza" required placeholder="Labrador, Persa..." error={errors.raza?.message} {...register('raza')} />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Estado</label>
                    <select
                      className="input-field disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                      disabled={estadoOriginal === 'ADOPTADO' || estadoOriginal === 'EN_PROCESO'}
                      {...register('estado')}
                    >
                      <option value="DISPONIBLE">Disponible</option>
                      <option value="EN_PROCESO">En proceso</option>
                      <option value="NO_DISPONIBLE">No disponible</option>
                      <option value="ADOPTADO">Adoptado</option>
                    </select>
                    {estadoOriginal === 'ADOPTADO' && (
                      <p className="text-xs text-amber-600 mt-1">
                        Esta mascota ya fue adoptada. No se puede cambiar su estado.
                      </p>
                    )}
                    {estadoOriginal === 'EN_PROCESO' && (
                      <p className="text-xs text-amber-600 mt-1">
                        Hay una solicitud de adopción en proceso. No se puede cambiar el estado.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Edad <span className="text-red-500">*</span></label>
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
                    <label className="text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                    <input type="date" className="input-field" max={TODAY} {...register('fecha_nacimiento')} />
                    {errors.fecha_nacimiento && <p className="text-xs text-red-500">{errors.fecha_nacimiento.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Tamaño <span className="text-red-500">*</span></label>
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
                    label="Peso en kg"
                    required
                    type="number"
                    step="0.1"
                    min={0}
                    placeholder="Ej: 5.5"
                    onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                    error={errors.peso?.message}
                    {...register('peso')}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Sexo <span className="text-red-500">*</span></label>
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

            {/* PASO 2 */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Información de salud</h2>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Nivel de energía <span className="text-red-500">*</span></label>
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
                      <label className="text-sm font-medium text-gray-700">Nivel de independencia <span className="text-red-500">*</span></label>
                      <select className="input-field" {...register('nivel_independencia')}>
                        <option value="">Seleccionar...</option>
                        <option value="BAJO">Baja (necesita compañía constante)</option>
                        <option value="MEDIO">Media (puede estar solo moderadamente)</option>
                        <option value="ALTO">Alta (muy independiente)</option>
                      </select>
                      {errors.nivel_independencia && <p className="text-xs text-red-500">{errors.nivel_independencia.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Sociabilidad con otras mascotas <span className="text-red-500">*</span></label>
                      <select className="input-field" {...register('nivel_sociabilidad')}>
                        <option value="">Seleccionar...</option>
                        <option value="BAJO">Baja (prefiere estar solo)</option>
                        <option value="MEDIO">Media (se adapta)</option>
                        <option value="ALTO">Alta (muy sociable)</option>
                      </select>
                      {errors.nivel_sociabilidad && <p className="text-xs text-red-500">{errors.nivel_sociabilidad.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Complejidad de cuidado <span className="text-red-500">*</span></label>
                      <select className="input-field" {...register('nivel_complejidad')}>
                        <option value="">Seleccionar...</option>
                        <option value="BAJO">Baja (ideal para principiantes)</option>
                        <option value="MEDIO">Media (algo de experiencia)</option>
                        <option value="ALTO">Alta (requiere experiencia)</option>
                      </select>
                      {errors.nivel_complejidad && <p className="text-xs text-red-500">{errors.nivel_complejidad.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">¿Apta para niños? <span className="text-red-500">*</span></label>
                      <select className="input-field" {...register('apta_ninos')}>
                        <option value="">Seleccionar...</option>
                        <option value="SI">Sí</option>
                        <option value="NO">No</option>
                      </select>
                      {errors.apta_ninos && <p className="text-xs text-red-500">{errors.apta_ninos.message}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Costo estimado de cuidado mensual <span className="text-red-500">*</span></label>
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
                          onClick={removeFoto}
                        >
                          Quitar foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                                <VacunaFieldArray />

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Carnet de vacunas</label>
                    <CarnetUpload carnetFile={carnetFile} onChange={setCarnetFile} />
                  </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Historia de la mascota</label>
                  <textarea className="input-field min-h-[100px]" placeholder="Personalidad y comportamiento..." {...register('historia_mascota')} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Información adicional</label>
                  <textarea className="input-field min-h-[80px]" placeholder="Desparasitado, esterilizado/a, alergias..." {...register('info_adicional')} />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-4 h-4" /> Anterior
                  </button>
                  <Button type="submit" loading={loading}>
                    {loading ? (fotoFile ? 'Subiendo imagen...' : 'Guardando...') : 'Guardar cambios'}
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
