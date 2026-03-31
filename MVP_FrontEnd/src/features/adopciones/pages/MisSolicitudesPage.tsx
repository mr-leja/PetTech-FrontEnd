import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PawPrint, ClipboardList, X } from 'lucide-react'
import toast from 'react-hot-toast'
import NavBar from '@/shared/components/NavBar'
import Spinner from '@/shared/components/Spinner'
import { solicitudesApi, type SolicitudAdopcion } from '../api/solicitudesApi'

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'En revisión',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
}

const ESTADO_BADGE: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  APROBADA: 'bg-green-100 text-green-700 border border-green-200',
  RECHAZADA: 'bg-red-100 text-red-600 border border-red-200',
}

const ESPECIE_EMOJI: Record<string, string> = {
  PERRO: '🐶',
  GATO: '🐱',
  CONEJO: '🐰',
  HAMSTER: '🐹',
}

function SolicitudCard({
  solicitud,
  confirmandoId,
  cancelandoId,
  onCancelarClick,
  onCancelarConfirm,
  onCancelarAbort,
}: {
  solicitud: SolicitudAdopcion
  confirmandoId: number | null
  cancelandoId: number | null
  onCancelarClick: (id: number) => void
  onCancelarConfirm: (id: number) => void
  onCancelarAbort: () => void
}) {
  const confirmando = confirmandoId === solicitud.id
  const cancelando = cancelandoId === solicitud.id

  return (
    <div className="card overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Foto mascota */}
        <div className="w-16 h-16 rounded-xl bg-pettech-cream overflow-hidden shrink-0">
          {solicitud.mascota_foto_url ? (
            <img
              src={solicitud.mascota_foto_url}
              alt={solicitud.mascota_nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {ESPECIE_EMOJI[solicitud.mascota_especie] ?? '🐾'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-semibold text-gray-800">{solicitud.mascota_nombre}</h3>
              <p className="text-sm text-gray-500">
                {solicitud.mascota_especie}
                {solicitud.mascota_raza ? ` · ${solicitud.mascota_raza}` : ''}
              </p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${ESTADO_BADGE[solicitud.estado]}`}>
              {ESTADO_LABEL[solicitud.estado]}
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            Enviada el {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-CO', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          </p>

          {/* Mensaje enviado */}
          {solicitud.mensaje && (
            <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-400 mb-0.5">Tu mensaje</p>
              <p className="text-sm text-gray-700">{solicitud.mensaje}</p>
            </div>
          )}

          {/* Respuesta del admin si hay decisión */}
          {solicitud.estado !== 'PENDIENTE' && (
            <div className={`mt-2 rounded-lg px-3 py-2 ${solicitud.estado === 'APROBADA' ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-xs text-gray-400 mb-0.5">
                {solicitud.estado === 'APROBADA' ? '¡Felicidades! Solicitud aprobada' : 'Solicitud rechazada'}
                {solicitud.fecha_decision && ` · ${new Date(solicitud.fecha_decision).toLocaleDateString('es-CO')}`}
              </p>
              {solicitud.notas_admin && (
                <p className="text-sm text-gray-700">{solicitud.notas_admin}</p>
              )}
            </div>
          )}

          {/* Botón / confirmación cancelar — solo para PENDIENTE */}
          {solicitud.estado === 'PENDIENTE' && (
            <div className="mt-3">
              {confirmando ? (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <p className="text-xs text-red-700 flex-1">
                    ¿Confirmas que deseas cancelar esta solicitud? La mascota volverá a estar disponible.
                  </p>
                  <button
                    onClick={() => onCancelarConfirm(solicitud.id)}
                    disabled={cancelando}
                    className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors shrink-0"
                  >
                    {cancelando ? 'Cancelando...' : 'Sí, cancelar'}
                  </button>
                  <button
                    onClick={onCancelarAbort}
                    disabled={cancelando}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onCancelarClick(solicitud.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium underline underline-offset-2 transition-colors"
                >
                  Cancelar solicitud
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MisSolicitudesPage() {
  const qc = useQueryClient()
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null)
  const [cancelandoId, setCancelandoId] = useState<number | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['solicitudes', 'mias'],
    queryFn: () => solicitudesApi.listar(),
    refetchInterval: 30_000,
  })

  const handleCancelarClick = (id: number) => setConfirmandoId(id)
  const handleCancelarAbort = () => setConfirmandoId(null)

  const handleCancelarConfirm = async (id: number) => {
    setCancelandoId(id)
    try {
      await solicitudesApi.cancelar(id)
      await qc.invalidateQueries({ queryKey: ['solicitudes', 'mias'] })
      await qc.invalidateQueries({ queryKey: ['mascotas'] })
      toast.success('Solicitud cancelada. La mascota vuelve a estar disponible.')
    } catch {
      toast.error('No se pudo cancelar la solicitud.')
    } finally {
      setCancelandoId(null)
      setConfirmandoId(null)
    }
  }

  const enRevision = data?.results.filter((s) => s.estado === 'PENDIENTE') ?? []
  const resueltas = data?.results.filter((s) => s.estado !== 'PENDIENTE') ?? []

  return (
    <div className="min-h-screen bg-pettech-cream">
      <NavBar />
      <main className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList className="w-6 h-6 text-pettech-orange" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Mis solicitudes</h1>
            <p className="text-sm text-gray-500">{data?.count ?? 0} solicitudes enviadas</p>
          </div>
        </div>

        {isLoading && <Spinner />}
        {error && <p className="text-red-500 text-center">Error al cargar las solicitudes.</p>}

        {!isLoading && !error && data?.results.length === 0 && (
          <div className="card p-10 text-center">
            <PawPrint className="w-12 h-12 text-pettech-orange opacity-40 mx-auto mb-4" />
            <h2 className="text-base font-semibold text-gray-700 mb-1">Aún no tienes solicitudes</h2>
            <p className="text-sm text-gray-500">
              Cuando envíes una solicitud de adopción aparecerá aquí con su estado.
            </p>
          </div>
        )}

        {/* En revisión */}
        {enRevision.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
              En revisión ({enRevision.length})
            </h2>
            <div className="flex flex-col gap-3">
              {enRevision.map((s) => (
                <SolicitudCard
                  key={s.id}
                  solicitud={s}
                  confirmandoId={confirmandoId}
                  cancelandoId={cancelandoId}
                  onCancelarClick={handleCancelarClick}
                  onCancelarConfirm={handleCancelarConfirm}
                  onCancelarAbort={handleCancelarAbort}
                />
              ))}
            </div>
          </section>
        )}

        {/* Resueltas */}
        {resueltas.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
              Resueltas ({resueltas.length})
            </h2>
            <div className="flex flex-col gap-3">
              {resueltas.map((s) => (
                <SolicitudCard
                  key={s.id}
                  solicitud={s}
                  confirmandoId={confirmandoId}
                  cancelandoId={cancelandoId}
                  onCancelarClick={handleCancelarClick}
                  onCancelarConfirm={handleCancelarConfirm}
                  onCancelarAbort={handleCancelarAbort}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
