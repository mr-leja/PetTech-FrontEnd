import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { familiasApi } from '../api/familiasApi'
import Button from '@/shared/components/Button'
import NavBar from '@/shared/components/NavBar'
import { Input } from '@/shared/components/Input'
import { useAuthStore } from '@/shared/store/authStore'

const schema = z.object({
  tipo_vivienda: z.enum(['CASA', 'APARTAMENTO', 'FINCA', 'OTRO']),
  tiene_patio: z.boolean(),
  numero_personas: z.coerce.number().min(1, 'Mínimo 1 persona'),
  tiene_mascotas_actualmente: z.boolean(),
  experiencia_mascotas: z.string().optional(),
  acuerdo_responsabilidad: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar el acuerdo de responsabilidad.' }),
  }),
})
type FormData = z.infer<typeof schema>

export default function CondicionesHogarPage() {
  const navigate = useNavigate()
  const updateUser = useAuthStore((s) => s.updateUser)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tiene_patio: false, tiene_mascotas_actualmente: false, acuerdo_responsabilidad: true },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await familiasApi.registrarCondicionesHogar(data)
      updateUser({ perfil_completo: true })
      toast.success('¡Perfil completo!')
      navigate('/dashboard')
    } catch {
      toast.error('Error. ¿Ya registraste las condiciones de tu hogar?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pettech-cream">
      <NavBar />
      <main className="max-w-lg mx-auto p-6">
        <div className="card p-8">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Condiciones de tu hogar</h1>
          <p className="text-sm text-gray-500 mb-6">Esta información nos ayuda a verificar que el hogar es ideal para una mascota.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Tipo de vivienda</label>
              <select className="input-field" {...register('tipo_vivienda')}>
                <option value="CASA">Casa</option>
                <option value="APARTAMENTO">Apartamento</option>
                <option value="FINCA">Finca</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <Input label="Número de personas" type="number" min={1} error={errors.numero_personas?.message} {...register('numero_personas')} />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="patio" className="w-4 h-4 accent-pettech-orange" {...register('tiene_patio')} />
              <label htmlFor="patio" className="text-sm text-gray-700">¿Tienes patio o jardín?</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="mascotas_act" className="w-4 h-4 accent-pettech-orange" {...register('tiene_mascotas_actualmente')} />
              <label htmlFor="mascotas_act" className="text-sm text-gray-700">¿Tienes mascotas actualmente?</label>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Experiencia con mascotas</label>
              <textarea className="input-field min-h-[80px]" placeholder="Cuéntanos..." {...register('experiencia_mascotas')} />
            </div>
            <div className="bg-pettech-yellow/20 border border-pettech-yellow rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" id="acuerdo" className="w-4 h-4 mt-0.5 accent-pettech-orange" {...register('acuerdo_responsabilidad')} />
                <label htmlFor="acuerdo" className="text-sm text-gray-700">
                  Acepto el <strong>acuerdo de responsabilidad</strong>: me comprometo a brindar cuidado y amor a la mascota adoptada.
                </label>
              </div>
              {errors.acuerdo_responsabilidad && (
                <p className="text-xs text-red-500 mt-1">{errors.acuerdo_responsabilidad.message}</p>
              )}
            </div>
            <Button type="submit" loading={loading} className="w-full mt-2">Guardar</Button>
          </form>
        </div>
      </main>
    </div>
  )
}
