import type { Mascota } from '../api/mascotasApi'
import { PawPrint } from 'lucide-react'

const ESTADO_LABEL: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  EN_PROCESO: 'En proceso',
  ADOPTADO: 'Adoptado',
  NO_DISPONIBLE: 'No disponible',
}

const ESPECIE_EMOJI: Record<string, string> = {
  PERRO: '🐶',
  GATO: '🐱',
  OTRO: '🐾',
}

export default function MascotaCard({
  mascota,
  onClick,
}: {
  mascota: Mascota
  onClick: () => void
}) {
  const estadoClass = `badge-${mascota.estado.toLowerCase().replace('_', '_')}`

  return (
    <div
      className="card cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      onClick={onClick}
    >
      {/* Foto */}
      <div className="aspect-square bg-pettech-cream overflow-hidden">
        {mascota.foto_url ? (
          <img src={mascota.foto_url} alt={mascota.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">{ESPECIE_EMOJI[mascota.especie] ?? '🐾'}</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-800 truncate">{mascota.nombre}</h3>
          <span className={estadoClass}>{ESTADO_LABEL[mascota.estado]}</span>
        </div>
        <p className="text-sm text-gray-500">{mascota.especie} • {mascota.raza || 'Mestizo'}</p>
        <p className="text-sm text-gray-400 mt-0.5">
          {mascota.edad_anios === 0 ? 'Cachorro' : `${mascota.edad_anios} año${mascota.edad_anios !== 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  )
}
