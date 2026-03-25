import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import NavBar from '@/shared/components/NavBar'
import Spinner from '@/shared/components/Spinner'
import EmptyState from '@/shared/components/EmptyState'
import { solicitudesApi, type SolicitudAdopcion } from '../api/solicitudesApi'

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
}

const ESTADO_BADGE: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  APROBADA: 'bg-green-100 text-green-700',
  RECHAZADA: 'bg-red-100 text-red-700',
}

const TAMANO_LABEL: Record<string, string> = {
  PEQUENO: 'Pequeño',
  MEDIANO: 'Mediano',
  GRANDE: 'Grande',
}

const TIPO_VIVIENDA_LABEL: Record<string, string> = {
  CASA: 'Casa',
  APARTAMENTO: 'Apartamento',
  FINCA: 'Finca',
  OTRO: 'Otro',
}

const INGRESOS_LABEL: Record<string, string> = {
  MENOS_1SMLV: '< 1 SMLV',
  '1_2SMLV': '1–2 SMLV',
  '2_4SMLV': '2–4 SMLV',
  MAS_4SMLV: '> 4 SMLV',
}

function SolicitudRow({ solicitud }: { solicitud: SolicitudAdopcion }) {
  const [expanded, setExpanded] = useState(false)
  const [decisionLoading, setDecisionLoading] = useState(false)
  const [notasAdmin, setNotasAdmin] = useState('')
  const qc = useQueryClient()

  const handleDecision = async (accion: 'aprobar' | 'rechazar') => {
    setDecisionLoading(true)
    try {
      if (accion === 'aprobar') {
        await solicitudesApi.aprobar(solicitud.id, notasAdmin)
        toast.success(`Solicitud aprobada. ${solicitud.mascota_nombre} ha sido adoptado/a.`)
      } else {
        await solicitudesApi.rechazar(solicitud.id, notasAdmin)
        toast.success(`Solicitud rechazada. ${solicitud.mascota_nombre} vuelve a estar disponible.`)
      }
      await qc.invalidateQueries({ queryKey: ['solicitudes'] })
      await qc.invalidateQueries({ queryKey: ['mascotas'] })
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || 'Error al procesar la decisión.'
      toast.error(typeof msg === 'string' ? msg : 'Error al procesar la decisión.')
    } finally {
      setDecisionLoading(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      {/* Fila principal */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Foto mascota */}
        <div className="w-12 h-12 rounded-lg bg-pettech-cream overflow-hidden shrink-0">
          {solicitud.mascota_foto_url ? (
            <img
              src={solicitud.mascota_foto_url}
              alt={solicitud.mascota_nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">🐾</div>
          )}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-800">{solicitud.mascota_nombre}</span>
            <span className="text-gray-400 text-sm">→</span>
            <span className="text-gray-700 text-sm">{solicitud.familia_nombre}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ESTADO_BADGE[solicitud.estado]}`}>
              {ESTADO_LABEL[solicitud.estado]}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-CO')}
            </span>
          </div>
        </div>

        {/* Expand icon */}
        <div className="text-gray-400 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Detalle expandible */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 flex flex-col gap-4 bg-gray-50">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Datos mascota */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Mascota</p>
              <div className="flex flex-col gap-1 text-sm">
                <p><span className="text-gray-500">Nombre:</span> <span className="font-medium">{solicitud.mascota_nombre}</span></p>
                <p><span className="text-gray-500">Especie:</span> {solicitud.mascota_especie}</p>
              </div>
            </div>

            {/* Datos familia */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Adoptante</p>
              <div className="flex flex-col gap-1 text-sm">
                <p><span className="text-gray-500">Nombre:</span> <span className="font-medium">{solicitud.familia_nombre}</span></p>
                <p><span className="text-gray-500">Email:</span> {solicitud.familia_email}</p>
                <p><span className="text-gray-500">Teléfono:</span> {solicitud.familia_telefono}</p>
                <p><span className="text-gray-500">Ciudad:</span> {solicitud.familia_ciudad}</p>
              </div>
            </div>
          </div>

          {/* Condiciones del hogar */}
          {solicitud.condiciones_hogar && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Condiciones del hogar</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Tipo de vivienda</p>
                  <p className="font-medium">{TIPO_VIVIENDA_LABEL[solicitud.condiciones_hogar.tipo_vivienda] ?? solicitud.condiciones_hogar.tipo_vivienda}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Tamaño del hogar</p>
                  <p className="font-medium">{TAMANO_LABEL[solicitud.condiciones_hogar.tamano_hogar] ?? solicitud.condiciones_hogar.tamano_hogar}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Personas</p>
                  <p className="font-medium">{solicitud.condiciones_hogar.numero_personas}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Tiene patio</p>
                  <p className="font-medium">{solicitud.condiciones_hogar.tiene_patio ? 'Sí' : 'No'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Niños en casa</p>
                  <p className="font-medium">{solicitud.condiciones_hogar.tiene_ninos ? 'Sí' : 'No'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Ingresos</p>
                  <p className="font-medium">{INGRESOS_LABEL[solicitud.condiciones_hogar.ingresos_estimados] ?? solicitud.condiciones_hogar.ingresos_estimados || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Horas solo</p>
                  <p className="font-medium">{solicitud.condiciones_hogar.tiempo_solo_horas}h / día</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Mascotas actuales</p>
                  <p className="font-medium">{solicitud.condiciones_hogar.tiene_mascotas_actualmente ? 'Sí' : 'No'}</p>
                </div>
              </div>
              {solicitud.condiciones_hogar.experiencia_mascotas && (
                <div className="mt-2">
                  <p className="text-gray-400 text-xs">Experiencia con mascotas</p>
                  <p className="text-sm text-gray-700 mt-0.5">{solicitud.condiciones_hogar.experiencia_mascotas}</p>
                </div>
              )}
              {solicitud.condiciones_hogar.motivacion && (
                <div className="mt-2">
                  <p className="text-gray-400 text-xs">Motivación para adoptar</p>
                  <p className="text-sm text-gray-700 mt-0.5">{solicitud.condiciones_hogar.motivacion}</p>
                </div>
              )}
            </div>
          )}

          {/* Mensaje de la familia */}
          {solicitud.mensaje && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Mensaje de la familia</p>
              <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100">
                {solicitud.mensaje}
              </p>
            </div>
          )}

          {/* Notas admin si ya fue decidida */}
          {solicitud.notas_admin && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Notas del administrador</p>
              <p className="text-sm text-gray-700">{solicitud.notas_admin}</p>
            </div>
          )}

          {/* Acciones solo para solicitudes pendientes */}
          {solicitud.estado === 'PENDIENTE' && (
            <div className="flex flex-col gap-3 pt-2 border-t border-gray-200">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Notas <span className="text-gray-400">(opcional)</span>
                </label>
                <textarea
                  className="input-field w-full text-sm resize-none"
                  rows={2}
                  placeholder="Justificación de la decisión..."
                  value={notasAdmin}
                  onChange={(e) => setNotasAdmin(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDecision('rechazar')}
                  disabled={decisionLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg py-2 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Rechazar
                </button>
                <button
                  onClick={() => handleDecision('aprobar')}
                  disabled={decisionLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg py-2 text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprobar
                </button>
              </div>
            </div>
          )}

          {/* Fecha de decisión si ya fue resuelta */}
          {solicitud.fecha_decision && (
            <p className="text-xs text-gray-400">
              Decisión tomada el {new Date(solicitud.fecha_decision).toLocaleDateString('es-CO')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function GestionSolicitudesPage() {
  const [filtroEstado, setFiltroEstado] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['solicitudes'],
    queryFn: () => solicitudesApi.listar(),
  })

  const solicitudesFiltradas = data?.results.filter(
    (s) => !filtroEstado || s.estado === filtroEstado
  ) ?? []

  return (
    <div className="min-h-screen bg-pettech-cream">
      <NavBar />
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Solicitudes de adopción</h1>
            <p className="text-sm text-gray-500">{data?.count ?? 0} solicitudes registradas</p>
          </div>
        </div>

        {/* Filtro por estado */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Estado:</span>
          </div>
          <select
            className="input-field w-auto text-sm"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="APROBADA">Aprobada</option>
            <option value="RECHAZADA">Rechazada</option>
          </select>
        </div>

        {isLoading && <Spinner />}
        {error && <p className="text-red-500 text-center">Error al cargar las solicitudes.</p>}
        {!isLoading && !error && solicitudesFiltradas.length === 0 && (
          <EmptyState message="No hay solicitudes con el filtro seleccionado." />
        )}

        <div className="flex flex-col gap-3">
          {solicitudesFiltradas.map((s) => (
            <SolicitudRow key={s.id} solicitud={s} />
          ))}
        </div>
      </main>
    </div>
  )
}
