import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import ListadoMascotasPage from '@/features/mascotas/pages/ListadoMascotasPage'
import RegistrarMascotaPage from '@/features/mascotas/pages/RegistrarMascotaPage'
import RegistrarFamiliaPage from '@/features/familias/pages/RegistrarFamiliaPage'
import CondicionesHogarPage from '@/features/familias/pages/CondicionesHogarPage'
import PrivateRoute from '@/shared/components/PrivateRoute'
import AdminRoute from '@/shared/components/AdminRoute'

export default function AppRouter() {
  const token = useAuthStore((s) => s.token)

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/registro" element={!token ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />

      {/* Rutas privadas */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/mascotas" element={<ListadoMascotasPage />} />
        <Route path="/mi-familia" element={<RegistrarFamiliaPage />} />
        <Route path="/mi-familia/hogar" element={<CondicionesHogarPage />} />
      </Route>

      {/* Rutas de admin */}
      <Route element={<AdminRoute />}>
        <Route path="/mascotas/nueva" element={<RegistrarMascotaPage />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
