import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { familiasApi } from '../api/familiasApi'
import { Input } from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import NavBar from '@/shared/components/NavBar'

const schema = z.object({
  nombre_familia: z.string().min(3, 'Mínimo 3 caracteres'),
  telefono: z.string().min(7, 'Teléfono inválido'),
  ciudad: z.string().min(2, 'Requerido'),
  departamento: z.string().min(2, 'Requerido'),
})
type FormData = z.infer<typeof schema>

export default function RegistrarFamiliaPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await familiasApi.crearFamilia(data)
      toast.success('Familia registrada.')
      navigate('/mi-familia/hogar')
    } catch {
      toast.error('Error al registrar la familia. ¿Ya tienes una familia registrada?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pettech-cream">
      <NavBar />
      <main className="max-w-lg mx-auto p-6">
        <div className="card p-8">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Datos de tu familia</h1>
          <p className="text-sm text-gray-500 mb-6">Esta información nos ayuda a encontrar la mascota ideal para ti.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Nombre de la familia" error={errors.nombre_familia?.message} {...register('nombre_familia')} />
            <Input label="Teléfono" type="tel" error={errors.telefono?.message} {...register('telefono')} />
            <Input label="Ciudad" error={errors.ciudad?.message} {...register('ciudad')} />
            <Input label="Departamento" error={errors.departamento?.message} {...register('departamento')} />
            <Button type="submit" loading={loading} className="w-full mt-2">Guardar y continuar</Button>
          </form>
        </div>
      </main>
    </div>
  )
}
