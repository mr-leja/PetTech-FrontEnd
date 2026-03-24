import { X, PawPrint, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import type { Mascota } from '../api/mascotasApi'

const ESTADO_LABEL: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  EN_PROCESO: 'En proceso',
  ADOPTADO: 'Adoptado',
  NO_DISPONIBLE: 'No disponible',
}

const TAMANO_LABEL: Record<string, string> = {
  PEQUENO: 'Pequeño',
  MEDIANO: 'Mediano',
  GRANDE: 'Grande',
}

const SEXO_LABEL: Record<string, string> = {
  MACHO: 'Macho',
  HEMBRA: 'Hembra',
}

const ENERGIA_LABEL: Record<string, string> = {
  BAJO: 'Bajo',
  MEDIO: 'Medio',
  ALTO: 'Alto',
}

const ESPECIE_LABEL: Record<string, string> = {
  PERRO: 'Perro',
  GATO: 'Gato',
  CONEJO: 'Conejo',
  HAMSTER: 'Hámster',
}

function formatEdad(mascota: Mascota) {
  if (mascota.edad_anios === 0) return 'Cachorro'
  return mascota.edad_unidad === 'MESES'
    ? `${mascota.edad_anios} mes${mascota.edad_anios !== 1 ? 'es' : ''}`
    : `${mascota.edad_anios} año${mascota.edad_anios !== 1 ? 's' : ''}`
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{value}</p>
    </div>
  )
}

export default function MascotaDetalleModal({
  mascota,
  onClose,
}: {
  mascota: Mascota
  onClose: () => void
}) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{mascota.nombre}</h2>
          <div className="flex items-center gap-1">
            {user?.rol === 'ADMIN' && (
              <button
                onClick={() => { onClose(); navigate(`/mascotas/${mascota.id}/editar`) }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                title="Editar mascota"
              >
                <Pencil className="w-4 h-4 text-pettech-orange" />
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Foto */}
        <div className="aspect-video bg-pettech-cream overflow-hidden">
          {mascota.foto_url ? (
            <img src={mascota.foto_url} alt={mascota.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PawPrint className="w-16 h-16 text-pettech-orange opacity-30" />
            </div>
          )}
        </div>

        {/* Detalles */}
        <div className="p-5 flex flex-col gap-4">
          {/* Estado + especie */}
          <div className="flex items-center gap-2">
            <span className={`badge-${mascota.estado.toLowerCase().replace('_', '_')}`}>
              {ESTADO_LABEL[mascota.estado]}
            </span>
            <span className="text-sm text-gray-500">
              {ESPECIE_LABEL[mascota.especie] ?? mascota.especie}
              {mascota.raza ? ` • ${mascota.raza}` : ' • Mestizo'}
            </span>
          </div>

          {/* Info básica en grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Edad</p>
              <p className="font-medium">{formatEdad(mascota)}</p>
            </div>
            {mascota.sexo && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Sexo</p>
                <p className="font-medium">{SEXO_LABEL[mascota.sexo] ?? mascota.sexo}</p>
              </div>
            )}
            {mascota.tamano && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Tamaño</p>
                <p className="font-medium">{TAMANO_LABEL[mascota.tamano] ?? mascota.tamano}</p>
              </div>
            )}
            {mascota.peso != null && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Peso</p>
                <p className="font-medium">{mascota.peso} kg</p>
              </div>
            )}
            {mascota.fecha_nacimiento && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Fecha de nacimiento</p>
                <p className="font-medium">{new Date(mascota.fecha_nacimiento).toLocaleDateString('es-CO')}</p>
              </div>
            )}
            {mascota.nivel_energia && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Nivel de energía</p>
                <p className="font-medium">{ENERGIA_LABEL[mascota.nivel_energia] ?? mascota.nivel_energia}</p>
              </div>
            )}
          </div>

          {/* Campos de texto */}
          <Field label="Historia de la mascota" value={mascota.historia_mascota || mascota.descripcion} />

          {/* Vacunas */}
          {Array.isArray(mascota.historial_vacunas) && mascota.historial_vacunas.length > 0 && (
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Historial de vacunas</p>
              <div className="flex flex-col gap-2">
                {mascota.historial_vacunas.map((v, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <p className="font-medium text-gray-700">💉 {v.nombre}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Aplicada: {new Date(v.fecha_aplicacion).toLocaleDateString('es-CO')}
                    </p>
                    {v.proxima_dosis && (
                      <p className="text-gray-500 text-xs">Próxima: {new Date(v.proxima_dosis).toLocaleDateString('es-CO')}</p>
                    )}
                    {v.veterinario && <p className="text-gray-500 text-xs">Veterinario: {v.veterinario}</p>}
                    {v.lote && <p className="text-gray-500 text-xs">Lote: {v.lote}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {mascota.carnet_vacunas_url && (
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Carnet de vacunas</p>
              <a
                href={mascota.carnet_vacunas_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-pettech-orange hover:underline flex items-center gap-1"
              >
                📎 Ver carnet
              </a>
            </div>
          )}

          <Field label="Información adicional" value={mascota.info_adicional} />

          <div className="text-xs text-gray-400 pt-2 border-t border-gray-50">
            Registrado el {new Date(mascota.fecha_ingreso).toLocaleDateString('es-CO')}
          </div>
        </div>
      </div>
    </div>
  )
}

