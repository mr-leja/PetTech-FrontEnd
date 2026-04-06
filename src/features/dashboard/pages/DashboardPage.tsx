import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PawPrint, Users, Heart, Home, Clock, CheckCircle, ClipboardList } from 'lucide-react'
import { useAuthStore } from '@/shared/store/authStore'
import { mascotasApi } from '@/features/mascotas/api/mascotasApi'
import { familiasApi } from '@/features/familias/api/familiasApi'
import { solicitudesApi } from '@/features/adopciones/api/solicitudesApi'
import NavBar from '@/shared/components/NavBar'
import Spinner from '@/shared/components/Spinner'
import StatCard from '@/shared/components/StatCard'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.rol === 'ADMIN'
  const displayName = user?.nombre || user?.email?.split('@')[0] || ''

  const { data: mascotas, isLoading: loadingMascotas } = useQuery({
    queryKey: ['mascotas', 'dashboard'],
    queryFn: () => mascotasApi.listar(),
    refetchInterval: 30_000,
    staleTime: 0,
  })

  const { data: familiasData, isLoading: loadingFamilias } = useQuery({
    queryKey: ['familias', 'dashboard'],
    queryFn: () => familiasApi.listarFamilias(),
    enabled: isAdmin,
    refetchInterval: 30_000,
    staleTime: 0,
  })

  const { data: contadores } = useQuery({
    queryKey: ['solicitudes', 'contadores'],
    queryFn: () => solicitudesApi.misContadores(),
    enabled: !isAdmin,
    refetchInterval: 30_000,
    staleTime: 0,
  })

  const disponibles = mascotas?.results.filter((m) => m.estado === 'DISPONIBLE').length ?? 0
  const adoptados = mascotas?.results.filter((m) => m.estado === 'ADOPTADO').length ?? 0
  const enProceso = mascotas?.results.filter((m) => m.estado === 'EN_PROCESO').length ?? 0

  return (
    <div className="min-h-screen bg-pettech-cream relative overflow-hidden">
      <NavBar />
      <img
        src="/mascotas-banner.png"
        alt="Mascotas"
        className="hidden lg:block absolute right-0 bottom-0 h-[340px] w-[260px] object-contain object-bottom pointer-events-none select-none opacity-40"
      />
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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
                <StatCard
                  label="Adopciones exitosas"
                  value={adoptados}
                  icon={<CheckCircle className="w-6 h-6 text-purple-500" />}
                  color="border-purple-400"
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
              value={contadores?.adopciones_realizadas ?? 0}
              icon={<CheckCircle className="w-6 h-6 text-green-500" />}
              color="border-green-400"
            />
            <StatCard
              label="Adopciones en proceso"
              value={contadores?.adopciones_en_proceso ?? 0}
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

          {!isAdmin && (
            <Link
              to="/mis-solicitudes"
              className="card p-6 hover:shadow-md transition-shadow flex flex-col gap-3 group"
            >
              <ClipboardList className="w-8 h-8 text-pettech-orange group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-semibold text-gray-800">Mis solicitudes</h3>
                <p className="text-sm text-gray-500">
                  {(contadores?.adopciones_en_proceso ?? 0) > 0
                    ? `${contadores!.adopciones_en_proceso} en revisión`
                    : 'Consulta el estado de tus solicitudes'}
                </p>
              </div>
            </Link>
          )}

          {!isAdmin && (
            <Link
              to="/mis-adopciones"
              className="card p-6 hover:shadow-md transition-shadow flex flex-col gap-3 group"
            >
              <Heart className="w-8 h-8 text-pettech-orange group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-semibold text-gray-800">Mis adopciones</h3>
                <p className="text-sm text-gray-500">
                  {(contadores?.adopciones_realizadas ?? 0) > 0
                    ? `${contadores!.adopciones_realizadas} ${contadores!.adopciones_realizadas === 1 ? 'adopción realizada' : 'adopciones realizadas'}`
                    : 'Consulta tus adopciones completadas'}
                </p>
              </div>
            </Link>
          )}



          {isAdmin && (
            <>
              <Link
                to="/mascotas/nueva"
                className="card p-6 hover:shadow-md transition-shadow flex flex-col gap-3 group"
              >
                <PawPrint className="w-8 h-8 text-pettech-orange group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="font-semibold text-gray-800">Registrar mascota</h3>
                  <p className="text-sm text-gray-500">Agregar nueva mascota al sistema</p>
                </div>
              </Link>
              <Link
                to="/solicitudes"
                className="card p-6 hover:shadow-md transition-shadow flex flex-col gap-3 group"
              >
                <ClipboardList className="w-8 h-8 text-pettech-orange group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="font-semibold text-gray-800">Gestionar solicitudes</h3>
                  <p className="text-sm text-gray-500">Aprobar o rechazar solicitudes de adopción</p>
                </div>
              </Link>
              <Link
                to="/adopciones"
                className="card p-6 hover:shadow-md transition-shadow flex flex-col gap-3 group"
              >
                <Heart className="w-8 h-8 text-pettech-orange group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="font-semibold text-gray-800">Historial de adopciones</h3>
                  <p className="text-sm text-gray-500">Ver registro completo de adopciones</p>
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Perfil incompleto banner para FAMILIA */}
        {!isAdmin && !user?.perfil_completo && (
          <div className="mt-6 bg-pettech-yellow/20 border border-pettech-yellow rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Completa tu perfil</p>
              <p className="text-sm text-gray-500">Registra tus datos personales y de hogar para postularte a una adopción.</p>
            </div>
            <Link to="/perfil-adoptante/registrar" className="btn-primary text-sm whitespace-nowrap ml-4">Completar ahora</Link>
          </div>
        )}
      </main>
    </div>
  )
}
