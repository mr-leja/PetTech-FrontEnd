import type { Mascota } from '../api/mascotasApi'
import { PawPrint, Trash2 } from 'lucide-react'

const ESTADO_LABEL: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  EN_PROCESO: 'En proceso',
  ADOPTADO: 'Adoptado',
  NO_DISPONIBLE: 'No disponible',
}

const ESPECIE_EMOJI: Record<string, string> = {
  PERRO: '🐶',
  GATO: '🐱',
  CONEJO: '🐰',
  HAMSTER: '🐹',
}

export default function MascotaCard({
  mascota,
  onClick,
  isAdmin,
  onDeleteClick,
}: {
  mascota: Mascota
  onClick: () => void
  isAdmin?: boolean
  onDeleteClick?: (e: React.MouseEvent, id: number) => void
}) {
  const estadoClass = `badge-${mascota.estado.toLowerCase().replace('_', '_')}`

  return (
    <div
      className="card cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative"
      onClick={onClick}
    >
      {isAdmin && onDeleteClick && (
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteClick(e, mascota.id) }}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 rounded-full shadow hover:bg-red-50 transition-colors"
          title="Eliminar mascota"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </button>
      )}
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
          {mascota.edad_anios === 0
            ? 'Cachorro'
            : mascota.edad_unidad === 'MESES'
              ? `${mascota.edad_anios} mes${mascota.edad_anios !== 1 ? 'es' : ''}`
              : `${mascota.edad_anios} año${mascota.edad_anios !== 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  )
}
