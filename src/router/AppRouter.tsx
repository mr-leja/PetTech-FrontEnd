import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { registerNavigate } from '@/shared/services/navigationService'

function RouterSync() {
  const navigate = useNavigate()
  useEffect(() => { registerNavigate(navigate) }, [navigate])
  return null
}
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import ListadoMascotasPage from '@/features/mascotas/pages/ListadoMascotasPage'
import RegistrarMascotaPage from '@/features/mascotas/pages/RegistrarMascotaPage'
import EditarMascotaPage from '@/features/mascotas/pages/EditarMascotaPage'
import RegistrarAdoptantePage from '@/features/familias/pages/RegistrarFamiliaPage'
import PerfilAdoptantePage from '@/features/familias/pages/CondicionesHogarPage'
import GestionSolicitudesPage from '@/features/adopciones/pages/GestionSolicitudesPage'
import MisSolicitudesPage from '@/features/adopciones/pages/MisSolicitudesPage'
import AdopcionesRealizadasPage from '@/features/adopciones/pages/AdopcionesRealizadasPage'
import GestionAdopcionesPage from '@/features/adopciones/pages/GestionAdopcionesPage'
import CalendarioVacunacionPage from '@/features/adopciones/pages/CalendarioVacunacionPage'
import PrivateRoute from '@/shared/components/PrivateRoute'
import AdminRoute from '@/shared/components/AdminRoute'

export default function AppRouter() {
  const token = useAuthStore((s) => s.token)

  return (
    <>
    <RouterSync />
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/registro" element={!token ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />

      {/* Rutas privadas */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/mascotas" element={<ListadoMascotasPage />} />
        <Route path="/perfil-adoptante" element={<PerfilAdoptantePage />} />
        <Route path="/perfil-adoptante/registrar" element={<RegistrarAdoptantePage />} />
        <Route path="/mis-solicitudes" element={<MisSolicitudesPage />} />
        <Route path="/mis-adopciones" element={<AdopcionesRealizadasPage />} />
        <Route path="/mis-adopciones/:adopcionId/calendario" element={<CalendarioVacunacionPage />} />
      </Route>

      {/* Rutas de admin */}
      <Route element={<AdminRoute />}>
        <Route path="/mascotas/nueva" element={<RegistrarMascotaPage />} />
        <Route path="/mascotas/:id/editar" element={<EditarMascotaPage />} />
        <Route path="/solicitudes" element={<GestionSolicitudesPage />} />
        <Route path="/adopciones" element={<GestionAdopcionesPage />} />
        <Route path="/adopciones/:adopcionId/calendario" element={<CalendarioVacunacionPage />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
