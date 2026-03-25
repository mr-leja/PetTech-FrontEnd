import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { authApi } from '../api/authApi'
import { familiasApi } from '@/features/familias/api/familiasApi'
import { useAuthStore } from '@/shared/store/authStore'
import { Input } from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import { PawPrint, CheckCircle } from 'lucide-react'

// --- Schemas per step ---
const step1Schema = z
  .object({
    email: z.string().email('Correo inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirm: z.string(),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  })

const step2Schema = z.object({
  nombre_familia: z.string().min(3, 'Mínimo 3 caracteres'),
  telefono: z.string().min(7, 'Teléfono inválido'),
  ciudad: z.string().min(2, 'Requerido'),
  departamento: z.string().min(2, 'Requerido'),
})

const step3Schema = z.object({
  tipo_vivienda: z.enum(['CASA', 'APARTAMENTO', 'FINCA', 'OTRO']),
  tiene_patio: z.boolean(),
  numero_personas: z.coerce.number().min(1, 'Mínimo 1 persona'),
  tiene_mascotas_actualmente: z.boolean(),
  experiencia_mascotas: z.string().optional(),
  acuerdo_responsabilidad: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar el acuerdo' }) }),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>

const STEPS = ['Cuenta', 'Tu familia', 'Tu hogar']

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const updateUser = useAuthStore((s) => s.updateUser)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })
  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { tiene_patio: false, tiene_mascotas_actualmente: false, acuerdo_responsabilidad: true },
  })

  // Step 1: create account
  const handleStep1 = async (data: Step1Data) => {
    setLoading(true)
    try {
      await authApi.registro(data)
      // Auto login
      const loginRes = await authApi.login({ email: data.email, password: data.password })
      setAuth(loginRes.access, loginRes.refresh, {
        id: loginRes.id,
        email: loginRes.email,
        nombre: loginRes.nombre,
        rol: loginRes.rol,
        perfil_completo: loginRes.perfil_completo,
      })
      toast.success('Cuenta creada. Completa tu perfil.')
      setStep(1)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(typeof msg === 'string' ? msg : 'Error al crear la cuenta. Intenta con otro correo.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: register familia (HU-04)
  const handleStep2 = async (data: Step2Data) => {
    setLoading(true)
    try {
      await familiasApi.crearFamilia(data)
      toast.success('Familia registrada.')
      setStep(2)
    } catch {
      toast.error('Error al registrar la familia.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: condiciones hogar (HU-05)
  const handleStep3 = async (data: Step3Data) => {
    setLoading(true)
    try {
      await familiasApi.registrarCondicionesHogar(data)
      updateUser({ perfil_completo: true })
      toast.success('¡Perfil completo! Bienvenido a PetTech 🐾')
      navigate('/dashboard')
    } catch {
      toast.error('Error al registrar condiciones del hogar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pettech-cream flex items-center justify-center p-4">
      <div className="card w-full max-w-lg p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <PawPrint className="w-10 h-10 text-pettech-orange mb-2" />
          <h1 className="text-xl text-pettech-orange">Crea tu cuenta en PetTech</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${ i < step ? 'bg-pettech-orange text-white'
                      : i === step ? 'bg-pettech-orange text-white ring-4 ring-pettech-orange/30'
                      : 'bg-gray-200 text-gray-500'}
                  `}
                >
                  {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
                </div>
                <span className="text-xs mt-1 text-gray-500 whitespace-nowrap">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-pettech-orange' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 0 && (
          <form onSubmit={form1.handleSubmit(handleStep1)} className="flex flex-col gap-4">
            <Input label="Correo electrónico" type="email" error={form1.formState.errors.email?.message} {...form1.register('email')} />
            <Input label="Contraseña" type="password" error={form1.formState.errors.password?.message} {...form1.register('password')} />
            <Input label="Confirmar contraseña" type="password" error={form1.formState.errors.password_confirm?.message} {...form1.register('password_confirm')} />
            <Button type="submit" loading={loading} className="w-full mt-2">Siguiente</Button>
            <p className="text-center text-sm text-gray-500">
              ¿Ya tienes cuenta? <Link to="/login" className="text-pettech-orange hover:underline">Inicia sesión</Link>
            </p>
          </form>
        )}

        {/* Step 2: Datos familia (HU-04) */}
        {step === 1 && (
          <form onSubmit={form2.handleSubmit(handleStep2)} className="flex flex-col gap-4">
            <Input label="Nombre de la familia" placeholder="Familia Pérez" error={form2.formState.errors.nombre_familia?.message} {...form2.register('nombre_familia')} />
            <Input label="Teléfono" type="tel" placeholder="300 123 4567" onKeyDown={(e) => { const allowed = ['0','1','2','3','4','5','6','7','8','9','+','-',' ','Backspace','Delete','ArrowLeft','ArrowRight','Tab']; if (!allowed.includes(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault() }} error={form2.formState.errors.telefono?.message} {...form2.register('telefono')} />
            <Input label="Ciudad" placeholder="Bogotá" error={form2.formState.errors.ciudad?.message} {...form2.register('ciudad')} />
            <Input label="Departamento" placeholder="Cundinamarca" error={form2.formState.errors.departamento?.message} {...form2.register('departamento')} />
            <Button type="submit" loading={loading} className="w-full mt-2">Siguiente</Button>
          </form>
        )}

        {/* Step 3: Condiciones del hogar (HU-05) */}
        {step === 2 && (
          <form onSubmit={form3.handleSubmit(handleStep3)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Tipo de vivienda</label>
              <select className="input-field" {...form3.register('tipo_vivienda')}>
                <option value="CASA">Casa</option>
                <option value="APARTAMENTO">Apartamento</option>
                <option value="FINCA">Finca</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <Input label="Número de personas en el hogar" type="number" min={1} onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} error={form3.formState.errors.numero_personas?.message} {...form3.register('numero_personas')} />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="patio" className="w-4 h-4 accent-pettech-orange" {...form3.register('tiene_patio')} />
              <label htmlFor="patio" className="text-sm text-gray-700">¿Tienes patio o jardín?</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="mascotas_act" className="w-4 h-4 accent-pettech-orange" {...form3.register('tiene_mascotas_actualmente')} />
              <label htmlFor="mascotas_act" className="text-sm text-gray-700">¿Tienes mascotas actualmente?</label>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Experiencia con mascotas</label>
              <textarea className="input-field min-h-[80px]" placeholder="Cuéntanos tu experiencia..." {...form3.register('experiencia_mascotas')} />
            </div>
            <div className="bg-pettech-yellow/20 border border-pettech-yellow rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" id="acuerdo" className="w-4 h-4 mt-0.5 accent-pettech-orange" {...form3.register('acuerdo_responsabilidad')} />
                <label htmlFor="acuerdo" className="text-sm text-gray-700">
                  Acepto el <strong>acuerdo de responsabilidad</strong>: me comprometo a brindar cuidado, alimentación, atención veterinaria y amor a la mascota adoptada.
                </label>
              </div>
              {form3.formState.errors.acuerdo_responsabilidad && (
                <p className="text-xs text-red-500 mt-1">{form3.formState.errors.acuerdo_responsabilidad.message}</p>
              )}
            </div>
            <Button type="submit" loading={loading} className="w-full mt-2">Completar registro</Button>
          </form>
        )}
      </div>
    </div>
  )
}
