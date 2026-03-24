import { X, PawPrint } from 'lucide-react'
import type { Mascota } from '../api/mascotasApi'

const ESTADO_LABEL: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  EN_PROCESO: 'En proceso',
  ADOPTADO: 'Adoptado',
  NO_DISPONIBLE: 'No disponible',
}

export default function MascotaDetalleModal({
  mascota,
  onClose,
}: {
  mascota: Mascota
  onClose: () => void
}) {
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
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
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
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className={`badge-${mascota.estado.toLowerCase().replace('_','_')}`}>
              {ESTADO_LABEL[mascota.estado]}
            </span>
            <span className="text-sm text-gray-500">{mascota.especie} • {mascota.raza || 'Mestizo'}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Edad</p>
              <p className="font-medium">{mascota.edad_anios === 0 ? 'Cachorro' : `${mascota.edad_anios} año${mascota.edad_anios !== 1 ? 's' : ''}`}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Especie</p>
              <p className="font-medium">{mascota.especie}</p>
            </div>
          </div>
          {mascota.descripcion && (
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Descripción</p>
              <p className="text-sm text-gray-700 leading-relaxed">{mascota.descripcion}</p>
            </div>
          )}
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-50">
            Registrado el {new Date(mascota.fecha_ingreso).toLocaleDateString('es-CO')}
          </div>
        </div>
      </div>
    </div>
  )
}
