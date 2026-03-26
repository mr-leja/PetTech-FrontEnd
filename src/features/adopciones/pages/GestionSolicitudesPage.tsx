import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, SlidersHorizontal, ChevronDown, ChevronUp, PawPrint, User, Scale } from 'lucide-react'
import toast from 'react-hot-toast'
import NavBar from '@/shared/components/NavBar'
import Spinner from '@/shared/components/Spinner'
import EmptyState from '@/shared/components/EmptyState'
import { solicitudesApi, type SolicitudAdopcion } from '../api/solicitudesApi'
import { TAMANO_LABEL, NIVEL_LABEL, ENERGIA_LABEL, INGRESOS_LABEL } from '@/shared/constants/labels'

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

// TAMANO_LABEL, NIVEL_LABEL, ENERGIA_LABEL, INGRESOS_LABEL importados desde @/shared/constants/labels

const SEXO_LABEL: Record<string, string> = {
  MACHO: 'Macho', HEMBRA: 'Hembra',
}

const TIPO_VIVIENDA_LABEL: Record<string, string> = {
  CASA: 'Casa', APARTAMENTO: 'Apartamento', FINCA: 'Finca', OTRO: 'Otro',
}

const PROPIEDAD_LABEL: Record<string, string> = {
  PROPIA: 'Propia', ALQUILADA: 'Alquilada',
}



const COSTO_LABEL: Record<string, string> = {
  MENOS_1SMLV: '< 1 SMLV/mes',
  '1_2SMLV': '1–2 SMLV/mes',
  '2_4SMLV': '2–4 SMLV/mes',
  MAS_4SMLV: '> 4 SMLV/mes',
}

// Orden numérico para comparaciones
const NIVEL_NUM: Record<string, number> = { BAJO: 1, MEDIO: 2, ALTO: 3 }
const TAMANO_NUM: Record<string, number> = { PEQUENO: 1, MEDIANO: 2, GRANDE: 3 }
const INGRESOS_NUM: Record<string, number> = { MENOS_1SMLV: 1, '1_2SMLV': 2, '2_4SMLV': 3, MAS_4SMLV: 4 }

function CompatRow({
  criterio, mascota, familia, compatible,
}: {
  criterio: string
  mascota: string
  familia: string
  compatible: boolean | 'partial' | null
}) {
  const badge =
    compatible === true
      ? 'bg-green-100 text-green-700'
      : compatible === 'partial'
      ? 'bg-yellow-100 text-yellow-700'
      : compatible === false
      ? 'bg-red-100 text-red-600'
      : 'bg-gray-100 text-gray-500'
  const icon = compatible === true ? '✓' : compatible === 'partial' ? '~' : compatible === false ? '✗' : '?'
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_52px] items-center gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{criterio}</span>
      <span className="text-xs font-medium text-pettech-orange">{mascota || '—'}</span>
      <span className="text-xs font-medium text-blue-700">{familia || '—'}</span>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-center ${badge}`}>{icon}</span>
    </div>
  )
}

function PanelCompatibilidad({ solicitud }: { solicitud: SolicitudAdopcion }) {
  const ch = solicitud.condiciones_hogar

  // Criterio 1: Tamaño mascota vs tamaño hogar
  // pequeño < hogar → verde | igual → amarillo | mascota > hogar → rojo
  const tamanoOk: boolean | 'partial' | null = (() => {
    const mNum = TAMANO_NUM[solicitud.mascota_tamano]
    const hNum = TAMANO_NUM[ch?.tamano_hogar ?? '']
    if (mNum == null || hNum == null) return null
    if (mNum < hNum) return true
    if (mNum === hNum) return 'partial'
    return false
  })()

  // Criterio 2: Independencia (tiempo solo tolerado por mascota) vs horas que pasa sola
  const soledadOk = solicitud.mascota_nivel_independencia && ch?.tiempo_solo_horas != null
    ? !(NIVEL_NUM[solicitud.mascota_nivel_independencia] === 1 && ch.tiempo_solo_horas > 6)
    : null

  // Criterio 3: Complejidad mascota vs experiencia declarada (texto → si no tiene experiencia = BAJO)
  const tieneExperiencia = ch?.experiencia_mascotas && ch.experiencia_mascotas.trim().length > 10
  const complejidadOk = solicitud.mascota_nivel_complejidad
    ? !(NIVEL_NUM[solicitud.mascota_nivel_complejidad] === 3 && !tieneExperiencia)
    : null

  // Criterio 4: Sociabilidad mascota vs tiene mascotas actualmente
  const sociabilidadOk = solicitud.mascota_nivel_sociabilidad
    ? NIVEL_NUM[solicitud.mascota_nivel_sociabilidad] > 1 || !ch?.tiene_mascotas_actualmente
    : null

  // Criterio 5: Apta para niños vs tiene niños en casa
  const ninosOk = solicitud.mascota_apta_ninos != null && ch?.tiene_ninos != null
    ? !ch.tiene_ninos || solicitud.mascota_apta_ninos === true
    : null

  // Criterio 6: Costo estimado vs ingresos familia
  const costoOk = solicitud.mascota_costo_estimado_mensual && ch?.ingresos_estimados
    ? INGRESOS_NUM[ch.ingresos_estimados] >= INGRESOS_NUM[solicitud.mascota_costo_estimado_mensual]
    : null

  const total: (boolean | 'partial' | null)[] = [tamanoOk, soledadOk, complejidadOk, sociabilidadOk, ninosOk, costoOk]
  const conocidos = total.filter((v) => v !== null)
  const compatibles = total.filter((v) => v === true).length
  const scoreColor =
    conocidos.length === 0 ? 'text-gray-400'
    : compatibles / conocidos.length >= 0.75 ? 'text-green-600'
    : compatibles / conocidos.length >= 0.5 ? 'text-yellow-600'
    : 'text-red-600'

  return (
    <div className="p-4 border-b border-gray-200 bg-orange-50/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-pettech-orange" />
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Análisis de compatibilidad</p>
        </div>
        {conocidos.length > 0 && (
          <span className={`text-xs font-bold ${scoreColor}`}>
            {compatibles}/{conocidos.length} criterios compatibles
          </span>
        )}
      </div>

      {/* Header */}
      <div className="grid grid-cols-[1fr_1fr_1fr_52px] gap-2 mb-1">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Criterio</span>
        <span className="text-xs font-semibold text-pettech-orange uppercase tracking-wide">Mascota</span>
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Adoptante</span>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">OK</span>
      </div>

      <CompatRow
        criterio="Tamaño vs hogar"
        mascota={TAMANO_LABEL[solicitud.mascota_tamano] ?? solicitud.mascota_tamano}
        familia={TAMANO_LABEL[ch?.tamano_hogar ?? ''] ?? ch?.tamano_hogar ?? ''}
        compatible={tamanoOk}
      />
      <CompatRow
        criterio="Independencia vs horas sola"
        mascota={NIVEL_LABEL[solicitud.mascota_nivel_independencia] ?? '—'}
        familia={ch?.tiempo_solo_horas != null ? `${ch.tiempo_solo_horas}h/día` : '—'}
        compatible={soledadOk}
      />
      <CompatRow
        criterio="Complejidad vs experiencia"
        mascota={NIVEL_LABEL[solicitud.mascota_nivel_complejidad] ?? '—'}
        familia={tieneExperiencia ? 'Con experiencia' : ch ? 'Sin experiencia' : '—'}
        compatible={complejidadOk}
      />
      <CompatRow
        criterio="Sociabilidad vs otras mascotas"
        mascota={NIVEL_LABEL[solicitud.mascota_nivel_sociabilidad] ?? '—'}
        familia={ch ? (ch.tiene_mascotas_actualmente ? 'Tiene mascotas' : 'Sin mascotas') : '—'}
        compatible={sociabilidadOk}
      />
      <CompatRow
        criterio="Apta para niños"
        mascota={solicitud.mascota_apta_ninos === true ? 'Sí' : solicitud.mascota_apta_ninos === false ? 'No' : '—'}
        familia={ch ? (ch.tiene_ninos ? 'Hay niños' : 'Sin niños') : '—'}
        compatible={ninosOk}
      />
      <CompatRow
        criterio="Costo vs ingresos"
        mascota={COSTO_LABEL[solicitud.mascota_costo_estimado_mensual] ?? '—'}
        familia={INGRESOS_LABEL[ch?.ingresos_estimados ?? ''] ?? '—'}
        compatible={costoOk}
      />
    </div>
  )
}

function DataItem({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="font-medium text-sm text-gray-800">{value}</p>
    </div>
  )
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

  const formatEdad = () => {
    if (!solicitud.mascota_edad_anios) return null
    return solicitud.mascota_edad_unidad === 'MESES'
      ? `${solicitud.mascota_edad_anios} mes${solicitud.mascota_edad_anios !== 1 ? 'es' : ''}`
      : `${solicitud.mascota_edad_anios} año${solicitud.mascota_edad_anios !== 1 ? 's' : ''}`
  }

  return (
    <div className="card overflow-hidden">
      {/* Fila principal */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-12 h-12 rounded-lg bg-pettech-cream overflow-hidden shrink-0">
          {solicitud.mascota_foto_url ? (
            <img src={solicitud.mascota_foto_url} alt={solicitud.mascota_nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">🐾</div>
          )}
        </div>
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
        <div className="text-gray-400 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Detalle expandible */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50">

          {/* ── SECCIÓN MASCOTA ── */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <PawPrint className="w-4 h-4 text-pettech-orange" />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Mascota</p>
            </div>
            <div className="flex gap-4">
              {/* Foto grande */}
              <div className="w-24 h-24 rounded-xl bg-pettech-cream overflow-hidden shrink-0">
                {solicitud.mascota_foto_url ? (
                  <img src={solicitud.mascota_foto_url} alt={solicitud.mascota_nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1">
                <DataItem label="Nombre" value={solicitud.mascota_nombre} />
                <DataItem label="Especie" value={solicitud.mascota_especie} />
                <DataItem label="Raza" value={solicitud.mascota_raza || 'Mestizo'} />
                <DataItem label="Edad" value={formatEdad()} />
                <DataItem label="Sexo" value={solicitud.mascota_sexo ? SEXO_LABEL[solicitud.mascota_sexo] : null} />
                <DataItem label="Tamaño" value={solicitud.mascota_tamano ? TAMANO_LABEL[solicitud.mascota_tamano] : null} />
                <DataItem label="Nivel de energía" value={solicitud.mascota_nivel_energia ? ENERGIA_LABEL[solicitud.mascota_nivel_energia] : null} />
              </div>
            </div>
            {(solicitud.mascota_historia || solicitud.mascota_descripcion) && (
              <div className="mt-3">
                <p className="text-gray-400 text-xs mb-1">Historia / descripción</p>
                <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100">
                  {solicitud.mascota_historia || solicitud.mascota_descripcion}
                </p>
              </div>
            )}
          </div>

          {/* ── PANEL COMPATIBILIDAD ── */}
          <PanelCompatibilidad solicitud={solicitud} />

          {/* ── SECCIÓN ADOPTANTE ── */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-pettech-orange" />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Adoptante</p>
            </div>
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-pettech-cream overflow-hidden shrink-0">
                {solicitud.familia_foto_perfil_url ? (
                  <img src={solicitud.familia_foto_perfil_url} alt={solicitud.familia_nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1">
                <DataItem label="Nombre" value={solicitud.familia_nombre} />
                <DataItem label="Cédula" value={solicitud.familia_cedula} />
                <DataItem label="Email" value={solicitud.familia_email} />
                <DataItem label="Teléfono" value={solicitud.familia_telefono} />
                <DataItem label="Ciudad" value={solicitud.familia_ciudad} />
                <DataItem label="Departamento" value={solicitud.familia_departamento} />
                {solicitud.familia_direccion && (
                  <div className="col-span-2">
                    <DataItem label="Dirección" value={solicitud.familia_direccion} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── MENSAJE Y NOTAS ── */}
          <div className="p-4 flex flex-col gap-3">
            {solicitud.mensaje && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Mensaje de la familia</p>
                <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100">{solicitud.mensaje}</p>
              </div>
            )}

            {solicitud.notas_admin && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Notas del administrador</p>
                <p className="text-sm text-gray-700">{solicitud.notas_admin}</p>
              </div>
            )}

            {/* Acciones */}
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

            {solicitud.fecha_decision && (
              <p className="text-xs text-gray-400">
                Decisión tomada el {new Date(solicitud.fecha_decision).toLocaleDateString('es-CO')}
              </p>
            )}
          </div>
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
    refetchInterval: 30_000,
    staleTime: 0,
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
