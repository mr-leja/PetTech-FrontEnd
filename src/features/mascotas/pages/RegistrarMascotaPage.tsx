import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { mascotasApi } from '../api/mascotasApi'
import { Input } from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import NavBar from '@/shared/components/NavBar'
import { ArrowLeft, Upload } from 'lucide-react'

const schema = z.object({
  nombre: z.string().min(2, 'Requerido'),
  especie: z.enum(['PERRO', 'GATO', 'OTRO']),
  raza: z.string().optional(),
  edad_anios: z.coerce.number().min(0).max(30),
  descripcion: z.string().optional(),
  estado: z.enum(['DISPONIBLE', 'EN_PROCESO', 'ADOPTADO', 'NO_DISPONIBLE']).default('DISPONIBLE'),
})

type FormData = z.infer<typeof schema>

export default function RegistrarMascotaPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { especie: 'PERRO', estado: 'DISPONIBLE', edad_anios: 0 },
  })

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await mascotasApi.crear({ ...data, ...(fotoFile && { foto: fotoFile }) })
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
        <div className="card p-8">
          <h1 className="text-xl font-semibold text-gray-800 mb-6">Registrar nueva mascota</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre" error={errors.nombre?.message} {...register('nombre')} />
              <Input label="Edad (años)" type="number" min={0} max={30} error={errors.edad_anios?.message} {...register('edad_anios')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Especie</label>
                <select className="input-field" {...register('especie')}>
                  <option value="PERRO">Perro</option>
                  <option value="GATO">Gato</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <select className="input-field" {...register('estado')}>
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="EN_PROCESO">En proceso</option>
                  <option value="NO_DISPONIBLE">No disponible</option>
                </select>
              </div>
            </div>
            <Input label="Raza (opcional)" placeholder="Labrador, Persa, ..." {...register('raza')} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                className="input-field min-h-[100px]"
                placeholder="Cuéntanos sobre la mascota..."
                {...register('descripcion')}
              />
            </div>
            {/* Foto upload */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Foto (opcional)</label>
              <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-pettech-orange transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">{fotoFile ? fotoFile.name : 'Subir foto'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </label>
              {preview && <img src={preview} alt="preview" className="w-32 h-32 object-cover rounded-lg" />}
            </div>
            <Button type="submit" loading={loading} className="w-full mt-2">Registrar mascota</Button>
          </form>
        </div>
      </main>
    </div>
  )
}
