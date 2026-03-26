import { Link, useNavigate } from 'react-router-dom'
import { PawPrint, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/shared/store/authStore'
import toast from 'react-hot-toast'

export default function NavBar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    queryClient.clear()
    logout()
    toast.success('Sesión cerrada.')
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-pettech-orange">
          <PawPrint className="w-6 h-6" />
          <span>PetTech</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link to="/mascotas" className="text-gray-600 hover:text-pettech-orange transition-colors">Mascotas</Link>
          {user?.rol !== 'ADMIN' && (
            <>
              <Link to="/perfil-adoptante" className="text-gray-600 hover:text-pettech-orange transition-colors">Perfil del adoptante</Link>
              <Link to="/mis-solicitudes" className="text-gray-600 hover:text-pettech-orange transition-colors">Mis solicitudes</Link>
              <Link to="/mis-adopciones" className="text-gray-600 hover:text-pettech-orange transition-colors">Mis adopciones</Link>
            </>
          )}
          {user?.rol === 'ADMIN' && (
            <>
              <Link to="/mascotas/nueva" className="text-gray-600 hover:text-pettech-orange transition-colors">+ Mascota</Link>
              <Link to="/solicitudes" className="text-gray-600 hover:text-pettech-orange transition-colors">Solicitudes</Link>
              <Link to="/adopciones" className="text-gray-600 hover:text-pettech-orange transition-colors">Adopciones</Link>
            </>
          )}
        </nav>

        {/* User info + Logout */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs text-gray-500">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button className="sm:hidden p-2" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3 text-sm">
          <Link to="/mascotas" className="text-gray-600" onClick={() => setMobileOpen(false)}>Mascotas</Link>
          {user?.rol !== 'ADMIN' && (
            <>
              <Link to="/perfil-adoptante" className="text-gray-600" onClick={() => setMobileOpen(false)}>Perfil del adoptante</Link>
              <Link to="/mis-solicitudes" className="text-gray-600" onClick={() => setMobileOpen(false)}>Mis solicitudes</Link>
              <Link to="/mis-adopciones" className="text-gray-600" onClick={() => setMobileOpen(false)}>Mis adopciones</Link>
            </>
          )}
          {user?.rol === 'ADMIN' && (
            <>
              <Link to="/solicitudes" className="text-gray-600" onClick={() => setMobileOpen(false)}>Solicitudes</Link>
              <Link to="/adopciones" className="text-gray-600" onClick={() => setMobileOpen(false)}>Adopciones</Link>
            </>
          )}
          <button onClick={handleLogout} className="text-left text-red-500">Cerrar sesión</button>
        </div>
      )}
    </header>
  )
}
