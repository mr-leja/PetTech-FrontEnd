import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { mascotasApi } from '../api/mascotasApi'
import { Input } from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import NavBar from '@/shared/components/NavBar'
import Spinner from '@/shared/components/Spinner'
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
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  especie: z.enum(['PERRO', 'GATO', 'CONEJO', 'HAMSTER']),
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
  nivel_energia: z.enum(['BAJO', 'MEDIO', 'ALTO', '']).optional(),
  nivel_independencia: z.enum(['BAJO', 'MEDIO', 'ALTO', '']).optional(),
  nivel_complejidad: z.enum(['BAJO', 'MEDIO', 'ALTO', '']).optional(),
  nivel_sociabilidad: z.enum(['BAJO', 'MEDIO', 'ALTO', '']).optional(),
  apta_ninos: z.enum(['SI', 'NO', '']).optional(),
  costo_estimado_mensual: z.enum(['MENOS_1SMLV', '1_2SMLV', '2_4SMLV', 'MAS_4SMLV', '']).optional(),
  vacunas: z.array(vacunaSchema).optional(),
  historia_mascota: z.string().optional(),
  info_adicional: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const STEP1_FIELDS: (keyof FormData)[] = [
  'nombre', 'especie', 'raza', 'edad', 'edad_unidad',
  'fecha_nacimiento', 'tamano', 'peso', 'sexo', 'estado',
]

export default function EditarMascotaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fotoEliminada, setFotoEliminada] = useState(false)
  const [carnetFile, setCarnetFile] = useState<File | null>(null)
  const [step, setStep] = useState(1)

  const { register, handleSubmit, trigger, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      especie: 'PERRO', estado: 'DISPONIBLE', edad: 0, edad_unidad: 'ANIOS',
      tamano: '', sexo: '', vacunas: [],
      nivel_energia: '', nivel_independencia: '', nivel_complejidad: '',
      nivel_sociabilidad: '', apta_ninos: '', costo_estimado_mensual: '',
    },
  })

  const { fields: vacunaFields, append: appendVacuna, remove: removeVacuna } = useFieldArray({
    control,
    name: 'vacunas',
  })

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
      setLoadingData(false)
    }).catch(() => {
      toast.error('No se pudo cargar la mascota.')
      navigate('/mascotas')
    })
  }, [id])

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoEliminada(false)
    setFotoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const goToStep2 = async () => {
    const valid = await trigger(STEP1_FIELDS)
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

            {/* PASO 1 */}
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
                      <option value="ADOPTADO">Adoptado</option>
                    </select>
                  </div>
                </div>

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
                    <label className="text-sm font-medium text-gray-700">Fecha de nacimiento</label>
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

            {/* PASO 2 */}
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

                {/* ── Características para adopción (matching) ── */}
                <div className="border border-orange-100 rounded-xl p-4 bg-orange-50/40 flex flex-col gap-4">
                  <h3 className="text-sm font-semibold text-pettech-orange">Características para adopción</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Nivel de independencia</label>
                      <select className="input-field" {...register('nivel_independencia')}>
                        <option value="">Seleccionar...</option>
                        <option value="BAJO">Baja (necesita compañía constante)</option>
                        <option value="MEDIO">Media (puede estar solo moderadamente)</option>
                        <option value="ALTO">Alta (muy independiente)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Sociabilidad con otras mascotas</label>
                      <select className="input-field" {...register('nivel_sociabilidad')}>
                        <option value="">Seleccionar...</option>
                        <option value="BAJO">Baja (prefiere estar solo)</option>
                        <option value="MEDIO">Media (se adapta)</option>
                        <option value="ALTO">Alta (muy sociable)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Complejidad de cuidado</label>
                      <select className="input-field" {...register('nivel_complejidad')}>
                        <option value="">Seleccionar...</option>
                        <option value="BAJO">Baja (ideal para principiantes)</option>
                        <option value="MEDIO">Media (algo de experiencia)</option>
                        <option value="ALTO">Alta (requiere experiencia)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">¿Apta para niños?</label>
                      <select className="input-field" {...register('apta_ninos')}>
                        <option value="">Seleccionar...</option>
                        <option value="SI">Sí</option>
                        <option value="NO">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Costo estimado de cuidado mensual</label>
                    <select className="input-field" {...register('costo_estimado_mensual')}>
                      <option value="">Seleccionar...</option>
                      <option value="MENOS_1SMLV">Menos de 1 SMLV</option>
                      <option value="1_2SMLV">1–2 SMLV</option>
                      <option value="2_4SMLV">2–4 SMLV</option>
                      <option value="MAS_4SMLV">Más de 4 SMLV</option>
                    </select>
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
                          onClick={() => { setFotoFile(null); setPreview(null); setFotoEliminada(true) }}
                        >
                          Quitar foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Historial de vacunas</label>
                    <button
                      type="button"
                      onClick={() => appendVacuna({ nombre: '', fecha_aplicacion: '', proxima_dosis: '', veterinario: '', lote: '' })}
                      className="flex items-center gap-1 text-sm text-pettech-orange hover:underline font-medium"
                    >
                      <Plus className="w-4 h-4" /> Agregar vacuna
                    </button>
                  </div>

                  {vacunaFields.length === 0 && (
                    <p className="text-xs text-gray-400 italic">Sin vacunas registradas.</p>
                  )}

                  {vacunaFields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">Vacuna {index + 1}</span>
                        <button type="button" onClick={() => removeVacuna(index)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-600">Nombre *</label>
                          <input className="input-field" placeholder="Ej: Rabia" {...register(`vacunas.${index}.nombre`)} />
                          {errors.vacunas?.[index]?.nombre && <p className="text-xs text-red-500">{errors.vacunas[index]?.nombre?.message}</p>}
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-600">Fecha de aplicación *</label>
                          <input type="date" className="input-field" max={TODAY} {...register(`vacunas.${index}.fecha_aplicacion`)} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-600">Próxima dosis</label>
                          <input type="date" className="input-field" {...register(`vacunas.${index}.proxima_dosis`)} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-600">Veterinario / Clínica</label>
                          <input className="input-field" placeholder="Ej: Clínica Vet Salud" {...register(`vacunas.${index}.veterinario`)} />
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                          <label className="text-xs font-medium text-gray-600">Lote</label>
                          <input className="input-field" placeholder="Ej: ABC123" {...register(`vacunas.${index}.lote`)} />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Carnet de vacunas</label>
                    <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-pettech-orange transition-colors">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{carnetFile ? carnetFile.name : 'PDF o imagen del carnet'}</span>
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setCarnetFile(e.target.files?.[0] ?? null)} />
                    </label>
                  </div>
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
                  <Button type="submit" loading={loading}>Guardar cambios</Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
