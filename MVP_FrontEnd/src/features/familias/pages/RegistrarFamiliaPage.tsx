import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { familiasApi } from '../api/familiasApi'
import { Input } from '@/shared/components/Input'

const DRAFT_KEY = 'pettech_familia_draft'

function loadDraft(): Partial<FormData> | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
import Button from '@/shared/components/Button'
import NavBar from '@/shared/components/NavBar'
import { useAuthStore } from '@/shared/store/authStore'
import OtrasMascotasFieldArray from '../components/OtrasMascotasFieldArray'
import { CheckCircle, Upload } from 'lucide-react'

const schema = z.object({
  // Paso 2 - Información básica
  nombre_familia: z.string().min(3, 'Mínimo 3 caracteres'),
  cedula: z.string().min(5, 'Cédula inválida'),
  fecha_nacimiento: z
    .string()
    .min(1, 'Ingresa tu fecha de nacimiento')
    .refine((v) => {
      if (!v) return false
      const today = new Date()
      const birth = new Date(v)
      const age =
        today.getFullYear() -
        birth.getFullYear() -
        (today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
          ? 1
          : 0)
      return age >= 18
    }, 'Debes ser mayor de edad (18 años o más)'),
  telefono: z.string().min(7, 'Teléfono inválido'),
  ciudad: z.string().min(2, 'Requerido'),
  departamento: z.string().min(2, 'Requerido'),
  redes_sociales: z.string().optional(),
  // Paso 3 - Hogar y experiencia
  tipo_vivienda: z.enum(['CASA', 'APARTAMENTO', 'FINCA', 'OTRO']),
  propiedad_vivienda: z.enum(['PROPIA', 'ALQUILADA']),
  tiene_patio: z.boolean(),
  numero_personas: z.coerce.number().min(1, 'Mínimo 1 persona'),
  tiene_ninos: z.boolean(),
  tamano_hogar: z.enum(['PEQUENO', 'MEDIANO', 'GRANDE']),
  tiene_mascotas_actualmente: z.boolean(),
  otras_mascotas: z.array(
    z.object({
      especie: z.string().min(1, 'Ingresa la especie'),
      cantidad: z.coerce.number().min(1, 'Mínimo 1'),
      edad_aprox: z.string().optional(),
      vacunadas: z.boolean(),
      esterilizadas: z.boolean(),
    })
  ),
  tiempo_solo_horas: z.coerce.number().min(0).max(24, 'Máximo 24 horas'),
  ingresos_estimados: z.string().min(1, 'Selecciona una opción'),
  experiencia_mascotas: z.string().min(10, 'Cuéntanos tu experiencia (mínimo 10 caracteres)'),
  motivacion: z.string().min(10, 'Cuéntanos tu motivación (mínimo 10 caracteres)'),
  acuerdo_responsabilidad: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar el acuerdo de responsabilidad.' }),
  }),
})

type FormData = z.infer<typeof schema>

const STEP2_FIELDS: (keyof FormData)[] = [
  'nombre_familia', 'cedula', 'fecha_nacimiento', 'telefono', 'ciudad', 'departamento',
]

const STEPS = ['Cuenta', 'Información básica', 'Hogar y experiencia']

export default function RegistrarFamiliaPage() {
  const navigate = useNavigate()
  const updateUser = useAuthStore((s) => s.updateUser)
  const [step, setStep] = useState(1) // 1=básica, 2=hogar
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoEliminada, setFotoEliminada] = useState(false)

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tiene_patio: false,
      tiene_ninos: false,
      tiene_mascotas_actualmente: false,
      otras_mascotas: [],
      tipo_vivienda: 'CASA',
      propiedad_vivienda: 'PROPIA',
      tamano_hogar: 'MEDIANO',
      ingresos_estimados: '',
      tiempo_solo_horas: 0,
    },
  })

  const { register, handleSubmit, trigger, watch, reset, formState: { errors } } = methods

  const tieneMascotas = watch('tiene_mascotas_actualmente')

  // Persistir borrador en sessionStorage solo si NO estamos editando
  const watchedValues = watch()
  useEffect(() => {
    if (isEditing) return
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(watchedValues))
    } catch {}
  }, [isEditing, JSON.stringify(watchedValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    familiasApi.miFamilia().then(({ familia: f, tiene_familia }) => {
      if (!tiene_familia || !f) {
        // Restaurar borrador si existe
        const draft = loadDraft()
        if (draft) reset({ ...draft } as any)
        return
      }
      setIsEditing(true)
      const c = f.condiciones_hogar
      if (f.foto_perfil_url) setFotoPreview(f.foto_perfil_url)
      reset({
        nombre_familia: f.nombre_familia,
        cedula: f.cedula,
        fecha_nacimiento: f.fecha_nacimiento,
        telefono: f.telefono,
        ciudad: f.ciudad,
        departamento: f.departamento,
        redes_sociales: f.redes_sociales ?? '',
        tipo_vivienda: c?.tipo_vivienda ?? 'CASA',
        propiedad_vivienda: c?.propiedad_vivienda ?? 'PROPIA',
        tiene_patio: c?.tiene_patio ?? false,
        numero_personas: c?.numero_personas ?? 1,
        tiene_ninos: c?.tiene_ninos ?? false,
        tamano_hogar: c?.tamano_hogar ?? 'MEDIANO',
        tiene_mascotas_actualmente: c?.tiene_mascotas_actualmente ?? false,
        otras_mascotas: c?.otras_mascotas ?? [],
        tiempo_solo_horas: c?.tiempo_solo_horas ?? 0,
        ingresos_estimados: c?.ingresos_estimados ?? '',
        experiencia_mascotas: c?.experiencia_mascotas ?? '',
        motivacion: c?.motivacion ?? '',
        acuerdo_responsabilidad: true,
      })
    }).catch(() => {})
  }, [])

  const handleNext = async () => {
    const valid = await trigger(STEP2_FIELDS)
    if (valid) setStep(2)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      if (isEditing) {
        await familiasApi.actualizarFamilia({
          nombre_familia: data.nombre_familia,
          cedula: data.cedula,
          fecha_nacimiento: data.fecha_nacimiento,
          telefono: data.telefono,
          ciudad: data.ciudad,
          departamento: data.departamento,
          redes_sociales: data.redes_sociales,
          ...(fotoPerfil ? { foto_perfil: fotoPerfil } : fotoEliminada ? { borrar_foto_perfil: true } : {}),
        })
        await familiasApi.actualizarCondicionesHogar({
          tipo_vivienda: data.tipo_vivienda,
          propiedad_vivienda: data.propiedad_vivienda,
          tiene_patio: data.tiene_patio,
          numero_personas: data.numero_personas,
          tiene_ninos: data.tiene_ninos,
          tamano_hogar: data.tamano_hogar,
          tiene_mascotas_actualmente: data.tiene_mascotas_actualmente,
          otras_mascotas: data.otras_mascotas,
          tiempo_solo_horas: data.tiempo_solo_horas,
          ingresos_estimados: data.ingresos_estimados,
          experiencia_mascotas: data.experiencia_mascotas,
          motivacion: data.motivacion,
        })
        toast.success('Perfil actualizado correctamente.')
      } else {
        const fd = new FormData()
        fd.append('nombre_familia', data.nombre_familia)
        fd.append('cedula', data.cedula)
        fd.append('fecha_nacimiento', data.fecha_nacimiento)
        fd.append('telefono', data.telefono)
        fd.append('ciudad', data.ciudad)
        fd.append('departamento', data.departamento)
        if (data.redes_sociales) fd.append('redes_sociales', data.redes_sociales)
        if (fotoPerfil) fd.append('foto_perfil', fotoPerfil)
        await familiasApi.crearFamilia(fd)
        await familiasApi.registrarCondicionesHogar({
          tipo_vivienda: data.tipo_vivienda,
          propiedad_vivienda: data.propiedad_vivienda,
          tiene_patio: data.tiene_patio,
          numero_personas: data.numero_personas,
          tiene_ninos: data.tiene_ninos,
          tamano_hogar: data.tamano_hogar,
          tiene_mascotas_actualmente: data.tiene_mascotas_actualmente,
          otras_mascotas: data.otras_mascotas,
          tiempo_solo_horas: data.tiempo_solo_horas,
          ingresos_estimados: data.ingresos_estimados,
          experiencia_mascotas: data.experiencia_mascotas,
          motivacion: data.motivacion,
          acuerdo_responsabilidad: data.acuerdo_responsabilidad,
        })
        updateUser({ perfil_completo: true })
        toast.success('¡Perfil de adoptante completado!')
      }
      sessionStorage.removeItem(DRAFT_KEY)
      navigate('/perfil-adoptante')
    } catch {
      toast.error('Error al guardar. Verifica los datos e inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pettech-cream">
      <NavBar />
      <main className="max-w-2xl mx-auto p-6">
      <FormProvider {...methods}>
        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                    i < step
                      ? 'bg-green-500 border-green-500 text-white'
                      : i === step
                      ? 'border-pettech-orange bg-pettech-orange text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-medium ${
                    i === step ? 'text-pettech-orange' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-16 h-0.5 mb-5 mx-1 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Paso 2: Información básica */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">Información básica</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Cuéntanos sobre ti para encontrar la mascota ideal.
                  </p>
                </div>

                <Input
                  label="Nombre completo"
                  error={errors.nombre_familia?.message}
                  {...register('nombre_familia')}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Número de cédula"
                    error={errors.cedula?.message}
                    {...register('cedula')}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                    <input
                      type="date"
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      className="input-field"
                      {...register('fecha_nacimiento')}
                    />
                    {errors.fecha_nacimiento && (
                      <p className="text-xs text-red-500">{errors.fecha_nacimiento.message}</p>
                    )}
                  </div>
                </div>

                <Input
                  label="Teléfono"
                  type="tel"
                  onKeyDown={(e) => {
                    const allowed = ['0','1','2','3','4','5','6','7','8','9','+','-',' ','Backspace','Delete','ArrowLeft','ArrowRight','Tab']
                    if (!allowed.includes(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault()
                  }}
                  error={errors.telefono?.message}
                  {...register('telefono')}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Ciudad"
                    error={errors.ciudad?.message}
                    {...register('ciudad')}
                  />
                  <Input
                    label="Departamento"
                    error={errors.departamento?.message}
                    {...register('departamento')}
                  />
                </div>

                <Input
                  label="Redes sociales"
                  placeholder="@usuario o URL de perfil"
                  error={errors.redes_sociales?.message}
                  {...register('redes_sociales')}
                />

                {/* Foto de perfil */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Foto de perfil</label>
                  <div className="flex items-center gap-4">
                    {fotoPreview ? (
                      <img
                        src={fotoPreview}
                        alt="Vista previa"
                        className="w-16 h-16 rounded-full object-cover border-2 border-pettech-orange"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-pettech-orange border border-pettech-orange rounded-lg px-3 py-1.5 hover:bg-pettech-orange/10 transition-colors w-fit">
                        <Upload className="w-3.5 h-3.5" />
                        {fotoPreview ? 'Cambiar foto' : 'Subir foto'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const allowed = ['image/jpeg', 'image/png', 'image/webp']
                            if (!allowed.includes(file.type)) {
                              toast.error('Solo se permiten imágenes JPEG, PNG o WebP.')
                              return
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('La imagen no puede superar 5 MB.')
                              return
                            }
                            setFotoEliminada(false)
                            setFotoPerfil(file)
                            setFotoPreview(URL.createObjectURL(file))
                          }}
                        />
                      </label>
                      {fotoPreview && (
                        <button
                          type="button"
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors text-left"
                          onClick={() => { setFotoPerfil(null); setFotoPreview(null); setFotoEliminada(true) }}
                        >
                          Quitar foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <Button type="button" onClick={handleNext} className="w-full mt-2">
                  Continuar
                </Button>
              </div>
            )}

            {/* Paso 3: Hogar y experiencia */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div className="mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">Hogar y experiencia</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Nos ayuda a verificar que el hogar es ideal para una mascota.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Tipo de vivienda</label>
                    <select className="input-field" {...register('tipo_vivienda')}>
                      <option value="CASA">Casa</option>
                      <option value="APARTAMENTO">Apartamento</option>
                      <option value="FINCA">Finca</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Propiedad</label>
                    <select className="input-field" {...register('propiedad_vivienda')}>
                      <option value="PROPIA">Propia</option>
                      <option value="ALQUILADA">Alquilada</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Tamaño del hogar</label>
                    <select className="input-field" {...register('tamano_hogar')}>
                      <option value="PEQUENO">Pequeño (&lt; 50 m²)</option>
                      <option value="MEDIANO">Mediano (50–120 m²)</option>
                      <option value="GRANDE">Grande (&gt; 120 m²)</option>
                    </select>
                  </div>
                  <Input
                    label="Personas en casa"
                    type="number"
                    min={1}
                    onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                    error={errors.numero_personas?.message}
                    {...register('numero_personas')}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Ingresos estimados del hogar
                  </label>
                  <select className="input-field" {...register('ingresos_estimados')}>
                    <option value="">Selecciona...</option>
                    <option value="MENOS_1SMLV">Menos de 1 SMLV</option>
                    <option value="1_2SMLV">1–2 SMLV</option>
                    <option value="2_4SMLV">2–4 SMLV</option>
                    <option value="MAS_4SMLV">Más de 4 SMLV</option>
                  </select>
                  {errors.ingresos_estimados && (
                    <p className="text-xs text-red-500">{errors.ingresos_estimados.message}</p>
                  )}
                </div>

                <Input
                  label="Horas que queda sola la mascota al día"
                  type="number"
                  min={0}
                  max={24}
                  onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                  error={errors.tiempo_solo_horas?.message}
                  {...register('tiempo_solo_horas')}
                />

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="patio"
                      className="w-4 h-4 accent-pettech-orange"
                      {...register('tiene_patio')}
                    />
                    <label htmlFor="patio" className="text-sm text-gray-700">
                      ¿Tienes patio o jardín?
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="ninos"
                      className="w-4 h-4 accent-pettech-orange"
                      {...register('tiene_ninos')}
                    />
                    <label htmlFor="ninos" className="text-sm text-gray-700">
                      ¿Hay niños en el hogar?
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="mascotas_act"
                      className="w-4 h-4 accent-pettech-orange"
                      {...register('tiene_mascotas_actualmente')}
                    />
                    <label htmlFor="mascotas_act" className="text-sm text-gray-700">
                      ¿Tienes mascotas actualmente?
                    </label>
                  </div>
                </div>

                {/* Mascotas actuales */}
                {tieneMascotas && (
                  <OtrasMascotasFieldArray />
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Experiencia con mascotas
                  </label>
                  <textarea
                    className="input-field min-h-[80px]"
                    placeholder="Cuéntanos sobre tu experiencia previa..."
                    {...register('experiencia_mascotas')}
                  />
                  {errors.experiencia_mascotas && (
                    <p className="text-xs text-red-500">{errors.experiencia_mascotas.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    ¿Por qué quieres adoptar?
                  </label>
                  <textarea
                    className="input-field min-h-[80px]"
                    placeholder="Cuéntanos tu motivación..."
                    {...register('motivacion')}
                  />
                  {errors.motivacion && (
                    <p className="text-xs text-red-500">{errors.motivacion.message}</p>
                  )}
                </div>

                <div className="bg-pettech-yellow/20 border border-pettech-yellow rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="acuerdo"
                      className="w-4 h-4 mt-0.5 accent-pettech-orange"
                      {...register('acuerdo_responsabilidad')}
                    />
                    <label htmlFor="acuerdo" className="text-sm text-gray-700">
                      Acepto el{' '}
                      <strong>acuerdo de responsabilidad</strong>: me comprometo a brindar cuidado y
                      amor a la mascota adoptada.
                    </label>
                  </div>
                  {errors.acuerdo_responsabilidad && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.acuerdo_responsabilidad.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                  <Button type="submit" loading={loading} className="flex-1">
                    {isEditing ? 'Guardar cambios' : 'Guardar perfil'}
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

