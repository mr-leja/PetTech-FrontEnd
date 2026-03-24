import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { authApi } from '../api/authApi'
import { useAuthStore } from '@/shared/store/authStore'
import { Input } from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import { PawPrint } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data)
      setAuth(res.access, res.refresh, {
        id: res.id,
        email: res.email,
        nombre: res.nombre,
        rol: res.rol,
        perfil_completo: res.perfil_completo,
      })
      toast.success(`¡Bienvenido, ${res.email}!`)
      navigate('/dashboard')
    } catch {
      toast.error('Correo o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pettech-cream flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <PawPrint className="w-12 h-12 text-pettech-orange mb-3" />
          <h1 className="text-2xl text-pettech-orange">PetTech</h1>
          <p className="text-gray-500 text-sm">Adopciones responsables</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="hola@ejemplo.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="Tu contraseña"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" loading={loading} className="w-full mt-2">
            Iniciar sesión
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-pettech-orange hover:underline font-medium">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
