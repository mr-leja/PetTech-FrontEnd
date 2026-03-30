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
  email: z
    .string({ required_error: 'El correo es obligatorio.' })
    .trim()
    .min(5, 'El correo es demasiado corto.')
    .max(254, 'El correo no puede superar 254 caracteres.')
    .email('Ingresa un correo electrónico válido.'),
  password: z.string().min(8, 'Mínimo 8 caracteres.'),
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
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onBlur' })

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
    } catch (err: unknown) {
      toast.error('Las credenciales son incorrectas, vuelve a intentarlo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — imagen */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/mascota-auth.jpg"
          alt="Mascota PetTech"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay con gradiente de marca */}
        <div className="absolute inset-0 bg-gradient-to-br from-pettech-orange/70 to-pettech-yellow/40" />
        {/* Texto sobre la imagen */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="flex items-center gap-3 mb-4">
            <PawPrint className="w-10 h-10" />
            <span className="text-3xl font-bold tracking-tight">PetTech</span>
          </div>
          <p className="text-xl font-semibold leading-snug mb-2">
            Conectamos mascotas<br />con familias que las aman.
          </p>
          <p className="text-sm text-white/80">
            Adopciones responsables — porque cada mascota merece un hogar.
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 bg-pettech-cream flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo móvil (solo visible en pantallas pequeñas) */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <PawPrint className="w-12 h-12 text-pettech-orange mb-2" />
            <h1 className="text-2xl font-bold text-pettech-orange">PetTech</h1>
            <p className="text-gray-500 text-sm">Adopciones responsables</p>
          </div>

          <div className="card p-8">
            <div className="flex flex-col items-center mb-8">
             
      <h1 className="text-2xl text-pettech-orange">Bienvenid@</h1>
              <p className="text-gray-500 text-sm mt-1">Inicia sesión en tu cuenta</p>
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
      </div>
    </div>
  )
}

