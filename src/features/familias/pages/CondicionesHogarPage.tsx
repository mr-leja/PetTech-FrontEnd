import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { familiasApi, Familia } from '../api/familiasApi'
import NavBar from '@/shared/components/NavBar'
import Button from '@/shared/components/Button'
import { useAuthStore } from '@/shared/store/authStore'
import { User, Home, PawPrint, CheckCircle } from 'lucide-react'

function calcularEdad(fechaNac: string): number {
  const today = new Date()
  const birth = new Date(fechaNac)
  return (
    today.getFullYear() -
    birth.getFullYear() -
    (today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
      ? 1
      : 0)
  )
}

const TIPO_VIVIENDA_LABEL: Record<string, string> = {
  CASA: 'Casa',
  APARTAMENTO: 'Apartamento',
  FINCA: 'Finca',
  OTRO: 'Otro',
}
const PROPIEDAD_LABEL: Record<string, string> = {
  PROPIA: 'Propia',
  ALQUILADA: 'Alquilada',
}
const TAMANO_LABEL: Record<string, string> = {
  PEQUENO: 'Pequeño (< 50 m²)',
  MEDIANO: 'Mediano (50–120 m²)',
  GRANDE: 'Grande (> 120 m²)',
}
const INGRESOS_LABEL: Record<string, string> = {
  MENOS_1SMLV: 'Menos de 1 SMLV',
  '1_2SMLV': '1–2 SMLV',
  '2_4SMLV': '2–4 SMLV',
  MAS_4SMLV: 'Más de 4 SMLV',
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-800">{value || '—'}</span>
    </div>
  )
}

export default function PerfilAdoptantePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(true)
  const [familia, setFamilia] = useState<Familia | null>(null)

  useEffect(() => {
    familiasApi
      .miFamilia()
      .then(({ familia: f, tiene_familia }) => {
        if (tiene_familia) setFamilia(f)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-pettech-cream">
        <NavBar />
        <main className="max-w-2xl mx-auto p-6 flex justify-center pt-20">
          <div className="text-gray-400 text-sm">Cargando perfil...</div>
        </main>
      </div>
    )
  }

  if (!familia) {
    return (
      <div className="min-h-screen bg-pettech-cream">
        <NavBar />
        <main className="max-w-lg mx-auto p-6 pt-12">
          <div className="card p-8 text-center">
            <PawPrint className="w-12 h-12 text-pettech-orange mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              Completa tu perfil de adoptante
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Para poder adoptar una mascota, necesitamos conocerte un poco más.
            </p>
            <Button onClick={() => navigate('/perfil-adoptante/registrar')} className="w-full">
              Registrar mi perfil
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const condiciones = familia.condiciones_hogar

  return (
    <div className="min-h-screen bg-pettech-cream">
      <NavBar />
      <main className="max-w-2xl mx-auto p-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Perfil del adoptante</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Perfil completo</span>
          </div>
        </div>

        {/* Información personal */}
        <div className="card p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-pettech-orange" />
            <h2 className="text-base font-semibold text-gray-800">Información personal</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Nombre completo" value={familia.nombre_familia} />
            <InfoRow label="Cédula" value={familia.cedula} />
            <InfoRow
              label="Fecha de nacimiento"
              value={
                familia.fecha_nacimiento
                  ? `${new Date(familia.fecha_nacimiento + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })} (${calcularEdad(familia.fecha_nacimiento)} años)`
                  : '—'
              }
            />
            <InfoRow label="Teléfono" value={familia.telefono} />
            <InfoRow label="Ciudad" value={familia.ciudad} />
            <InfoRow label="Departamento" value={familia.departamento} />
            <div className="col-span-2">
              <InfoRow label="Dirección" value={familia.direccion} />
            </div>
            {familia.redes_sociales && (
              <div className="col-span-2">
                <InfoRow label="Redes sociales" value={familia.redes_sociales} />
              </div>
            )}
          </div>
        </div>

        {/* Condiciones del hogar */}
        {condiciones && (
          <>
            <div className="card p-6 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-pettech-orange" />
                <h2 className="text-base font-semibold text-gray-800">Condiciones del hogar</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow
                  label="Tipo de vivienda"
                  value={TIPO_VIVIENDA_LABEL[condiciones.tipo_vivienda]}
                />
                <InfoRow
                  label="Propiedad"
                  value={PROPIEDAD_LABEL[condiciones.propiedad_vivienda] ?? '—'}
                />
                <InfoRow
                  label="Tamaño del hogar"
                  value={TAMANO_LABEL[condiciones.tamano_hogar] ?? '—'}
                />
                <InfoRow label="Personas en casa" value={condiciones.numero_personas} />
                <InfoRow
                  label="Niños en el hogar"
                  value={condiciones.tiene_ninos ? 'Sí' : 'No'}
                />
                <InfoRow
                  label="Patio o jardín"
                  value={condiciones.tiene_patio ? 'Sí' : 'No'}
                />
                <InfoRow
                  label="Horas solo al día"
                  value={`${condiciones.tiempo_solo_horas} h`}
                />
                <InfoRow
                  label="Ingresos estimados"
                  value={INGRESOS_LABEL[condiciones.ingresos_estimados] ?? condiciones.ingresos_estimados}
                />
              </div>
            </div>

            <div className="card p-6 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <PawPrint className="w-5 h-5 text-pettech-orange" />
                <h2 className="text-base font-semibold text-gray-800">Mascotas y experiencia</h2>
              </div>
              <div className="flex flex-col gap-4">
                {condiciones.tiene_mascotas_actualmente &&
                  condiciones.otras_mascotas.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-2">
                        Mascotas actuales
                      </span>
                      <div className="flex flex-col gap-2">
                        {condiciones.otras_mascotas.map((m, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-100">
                            <div className="font-medium text-gray-700">
                              {m.especie} × {m.cantidad}
                            </div>
                            {m.edad_aprox && (
                              <div className="text-gray-500 text-xs mt-0.5">
                                Edad: {m.edad_aprox}
                              </div>
                            )}
                            <div className="flex gap-3 mt-1">
                              {m.vacunadas && (
                                <span className="text-xs text-green-600">✓ Vacunada/s</span>
                              )}
                              {m.esterilizadas && (
                                <span className="text-xs text-green-600">✓ Esterilizada/s</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                {condiciones.experiencia_mascotas && (
                  <InfoRow label="Experiencia previa" value={condiciones.experiencia_mascotas} />
                )}
                <InfoRow label="Motivación para adoptar" value={condiciones.motivacion} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

