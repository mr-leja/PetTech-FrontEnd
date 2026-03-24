import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PawPrint, Users, Heart, Home, Clock, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/shared/store/authStore'
import { mascotasApi } from '@/features/mascotas/api/mascotasApi'
import { familiasApi } from '@/features/familias/api/familiasApi'
import NavBar from '@/shared/components/NavBar'
import Spinner from '@/shared/components/Spinner'

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`card p-6 flex items-center gap-4 border-l-4 ${color}`}>
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.rol === 'ADMIN'
  const displayName = user?.nombre || user?.email?.split('@')[0] || ''

  const { data: mascotas, isLoading: loadingMascotas } = useQuery({
    queryKey: ['mascotas', 'dashboard'],
    queryFn: () => mascotasApi.listar(),
  })

  const { data: familiasData, isLoading: loadingFamilias } = useQuery({
    queryKey: ['familias', 'dashboard'],
    queryFn: () => familiasApi.listarFamilias(),
    enabled: isAdmin,
  })

  const disponibles = mascotas?.results.filter((m) => m.estado === 'DISPONIBLE').length ?? 0
  const adoptados = mascotas?.results.filter((m) => m.estado === 'ADOPTADO').length ?? 0
  const enProceso = mascotas?.results.filter((m) => m.estado === 'EN_PROCESO').length ?? 0

  return (
    <div className="min-h-screen bg-pettech-cream">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            ¡Hola, {displayName}! 🐾
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? 'Panel de administración PetTech' : 'Bienvenido a PetTech Adopciones'}
          </p>
        </div>

        {/* Stats — Admin view */}
        {isAdmin && (
          <>
            {(loadingMascotas || loadingFamilias) && <Spinner />}
            {!loadingMascotas && !loadingFamilias && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                  label="Total mascotas"
                  value={mascotas?.count ?? 0}
                  icon={<PawPrint className="w-6 h-6 text-pettech-orange" />}
                  color="border-pettech-orange"
                />
                <StatCard
                  label="Disponibles"
                  value={disponibles}
                  icon={<Heart className="w-6 h-6 text-green-500" />}
                  color="border-green-400"
                />
                <StatCard
                  label="En proceso"
                  value={enProceso}
                  icon={<Home className="w-6 h-6 text-yellow-500" />}
                  color="border-yellow-400"
                />
                <StatCard
                  label="Familias registradas"
                  value={familiasData?.count ?? 0}
                  icon={<Users className="w-6 h-6 text-blue-500" />}
                  color="border-blue-400"
                />
              </div>
            )}
          </>
        )}

        {/* Contadores adopciones — vista Familia */}
        {!isAdmin && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatCard
              label="Adopciones realizadas"
              value={0}
              icon={<CheckCircle className="w-6 h-6 text-green-500" />}
              color="border-green-400"
            />
            <StatCard
              label="Adopciones en proceso"
              value={0}
              icon={<Clock className="w-6 h-6 text-yellow-500" />}
              color="border-yellow-400"
            />
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            to="/mascotas"
            className="card p-6 hover:shadow-md transition-shadow flex flex-col gap-3 group"
          >
            <PawPrint className="w-8 h-8 text-pettech-orange group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="font-semibold text-gray-800">Ver mascotas</h3>
              <p className="text-sm text-gray-500">{disponibles} disponibles para adopción</p>
            </div>
          </Link>



          {isAdmin && (
            <Link
              to="/mascotas/nueva"
              className="card p-6 hover:shadow-md transition-shadow flex flex-col gap-3 group bg-pettech-orange/5"
            >
              <PawPrint className="w-8 h-8 text-pettech-orange group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-semibold text-gray-800">Registrar mascota</h3>
                <p className="text-sm text-gray-500">Agregar nueva mascota al sistema</p>
              </div>
            </Link>
          )}
        </div>

        {/* Perfil incompleto banner para FAMILIA */}
        {!isAdmin && !user?.perfil_completo && (
          <div className="mt-6 bg-pettech-yellow/20 border border-pettech-yellow rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Completa tu perfil de familia</p>
              <p className="text-sm text-gray-500">Registra los datos de tu familia y hogar para postularte a una adopción.</p>
            </div>
            <Link to="/perfil-adoptante/registrar" className="btn-primary text-sm whitespace-nowrap ml-4">Completar ahora</Link>
          </div>
        )}
      </main>
    </div>
  )
}
