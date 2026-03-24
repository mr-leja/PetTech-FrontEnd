import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, SlidersHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { mascotasApi, type Mascota } from '../api/mascotasApi'
import MascotaCard from '../components/MascotaCard'
import MascotaDetalleModal from '../components/MascotaDetalleModal'
import Spinner from '@/shared/components/Spinner'
import EmptyState from '@/shared/components/EmptyState'
import { useAuthStore } from '@/shared/store/authStore'
import NavBar from '@/shared/components/NavBar'

export default function ListadoMascotasPage() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [selected, setSelected] = useState<Mascota | null>(null)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['mascotas', filtroEstado, filtroEspecie],
    queryFn: () =>
      mascotasApi.listar({
        ...(filtroEstado && { estado: filtroEstado }),
        ...(filtroEspecie && { especie: filtroEspecie }),
      }),
  })

  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    setDeleteLoading(true)
    try {
      await mascotasApi.eliminar(deletingId)
      await qc.invalidateQueries({ queryKey: ['mascotas'] })
      toast.success('Mascota eliminada correctamente.')
      setSelected(null)
    } catch {
      toast.error('Error al eliminar la mascota.')
    } finally {
      setDeleteLoading(false)
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-pettech-cream">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Mascotas</h1>
            <p className="text-sm text-gray-500">{data?.count ?? 0} mascotas registradas</p>
          </div>
          {user?.rol === 'ADMIN' && (
            <Link to="/mascotas/nueva" className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Agregar mascota
            </Link>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros:</span>
          </div>
          <select
            className="input-field w-auto text-sm"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="ADOPTADO">Adoptado</option>
            <option value="NO_DISPONIBLE">No disponible</option>
          </select>
          <select
            className="input-field w-auto text-sm"
            value={filtroEspecie}
            onChange={(e) => setFiltroEspecie(e.target.value)}
          >
            <option value="">Todas las especies</option>
            <option value="PERRO">Perro</option>
            <option value="GATO">Gato</option>
            <option value="CONEJO">Conejo</option>
            <option value="HAMSTER">Hámster</option>
          </select>
        </div>

        {/* Content */}
        {isLoading && <Spinner />}
        {error && <p className="text-red-500 text-center">Error al cargar mascotas.</p>}
        {!isLoading && !error && data?.results.length === 0 && (
          <EmptyState message="No se encontraron mascotas con estos filtros." />
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {data?.results.map((m) => (
            <MascotaCard
              key={m.id}
              mascota={m}
              onClick={() => setSelected(m)}
              isAdmin={user?.rol === 'ADMIN'}
              onDeleteClick={(_e, id) => setDeletingId(id)}
            />
          ))}
        </div>
      </main>

      {selected && <MascotaDetalleModal mascota={selected} onClose={() => setSelected(null)} />}

      {/* Modal de confirmación de eliminación */}
      {deletingId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-800">¿Eliminar mascota?</h3>
            <p className="text-sm text-gray-600">
              Esta acción es irreversible. La mascota será eliminada permanentemente.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingId(null)}
                disabled={deleteLoading}
                className="btn-secondary text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
