import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Heart, PawPrint, User, Calendar, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { solicitudesApi, type Adopcion } from '../api/solicitudesApi'
import Spinner from '@/shared/components/Spinner'

const ESPECIE_LABEL: Record<string, string> = {
  PERRO: 'Perro',
  GATO: 'Gato',
  AVE: 'Ave',
  CONEJO: 'Conejo',
  OTRO: 'Otro',
}

const SEXO_LABEL: Record<string, string> = {
  MACHO: 'Macho',
  HEMBRA: 'Hembra',
  DESCONOCIDO: 'Desconocido',
}

const TAMANO_LABEL: Record<string, string> = {
  PEQUENO: 'Pequeño',
  MEDIANO: 'Mediano',
  GRANDE: 'Grande',
}

function DataItem({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0 && value !== false) return null
  return (
    <div>
      <dt className="text-xs text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-gray-800 font-medium">{value}</dd>
    </div>
  )
}

function EdadTexto({ anios, unidad }: { anios: number; unidad: string }) {
  const u = unidad === 'MESES' ? (anios === 1 ? 'mes' : 'meses') : anios === 1 ? 'año' : 'años'
  return <>{anios} {u}</>
}

function AdopcionRow({ adopcion }: { adopcion: Adopcion }) {
  const [expanded, setExpanded] = useState(false)

  const fechaAdopcion = new Date(adopcion.fecha_adopcion).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const fechaSolicitud = new Date(adopcion.solicitud_fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      {/* Cabecera — siempre visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        {/* Foto mascota */}
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          {adopcion.mascota_foto_url ? (
            <img src={adopcion.mascota_foto_url} alt={adopcion.mascota_nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PawPrint className="w-7 h-7 text-gray-300" />
            </div>
          )}
        </div>

        {/* Info resumida */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{adopcion.mascota_nombre}</span>
            <span className="text-xs text-gray-500">
              {ESPECIE_LABEL[adopcion.mascota_especie] ?? adopcion.mascota_especie}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              <Heart className="w-3 h-3" />
              Adoptado
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate mt-0.5">
            Adoptado por <span className="font-medium text-gray-700">{adopcion.familia_nombre}</span>
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3" />
            {fechaAdopcion}
          </p>
        </div>

        {/* Toggle */}
        <div className="text-gray-400 flex-shrink-0">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Detalle expandido */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-5 bg-gray-50">

          {/* Mascota */}
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <PawPrint className="w-3.5 h-3.5" />
              Datos de la mascota
            </h3>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <DataItem label="Nombre" value={adopcion.mascota_nombre} />
              <DataItem label="Especie" value={ESPECIE_LABEL[adopcion.mascota_especie] ?? adopcion.mascota_especie} />
              <DataItem label="Raza" value={adopcion.mascota_raza} />
              <DataItem label="Edad" value={<EdadTexto anios={adopcion.mascota_edad_anios} unidad={adopcion.mascota_edad_unidad} />} />
              <DataItem label="Sexo" value={SEXO_LABEL[adopcion.mascota_sexo] ?? adopcion.mascota_sexo} />
              <DataItem label="Tamaño" value={TAMANO_LABEL[adopcion.mascota_tamano] ?? adopcion.mascota_tamano} />
            </dl>
            {adopcion.mascota_descripcion && (
              <p className="mt-2 text-sm text-gray-600 italic">"{adopcion.mascota_descripcion}"</p>
            )}
          </section>

          {/* Adoptante */}
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <User className="w-3.5 h-3.5" />
              Datos del adoptante
            </h3>
            <div className="flex items-center gap-3 mb-3">
              {adopcion.familia_foto_perfil_url ? (
                <img
                  src={adopcion.familia_foto_perfil_url}
                  alt={adopcion.familia_nombre}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-pettech-orange" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm">{adopcion.familia_nombre}</p>
                <p className="text-xs text-gray-500">{adopcion.familia_email}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <DataItem label="Cédula" value={adopcion.familia_cedula} />
              <DataItem label="Teléfono" value={adopcion.familia_telefono} />
              <DataItem label="Ciudad" value={adopcion.familia_ciudad} />
              <DataItem label="Departamento" value={adopcion.familia_departamento} />
            </dl>
          </section>

          {/* Fechas e historial */}
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <Calendar className="w-3.5 h-3.5" />
              Historial
            </h3>
            <dl className="grid grid-cols-2 gap-3">
              <DataItem label="Fecha de solicitud" value={fechaSolicitud} />
              <DataItem label="Fecha de adopción" value={fechaAdopcion} />
            </dl>
            {adopcion.solicitud_mensaje && (
              <div className="mt-3 bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Mensaje del adoptante</p>
                <p className="text-sm text-gray-700">{adopcion.solicitud_mensaje}</p>
              </div>
            )}
            {adopcion.solicitud_notas_admin && (
              <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-500 mb-1">Notas del administrador</p>
                <p className="text-sm text-green-700">{adopcion.solicitud_notas_admin}</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default function GestionAdopcionesPage() {
  const [busqueda, setBusqueda] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adopciones', 'todas'],
    queryFn: () => solicitudesApi.listarAdopciones(),
  })

  const adopcionesFiltradas = data?.results.filter((a) => {
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase()
    return (
      a.mascota_nombre.toLowerCase().includes(q) ||
      a.familia_nombre.toLowerCase().includes(q) ||
      a.familia_email.toLowerCase().includes(q) ||
      (a.mascota_raza ?? '').toLowerCase().includes(q)
    )
  }) ?? []

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-pettech-orange" />
          Historial de adopciones
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Registro completo de todas las adopciones realizadas.
        </p>
      </div>

      {/* Buscador */}
      {!isLoading && !isError && (data?.count ?? 0) > 0 && (
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por mascota, adoptante o raza…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pettech-orange/30 focus:border-pettech-orange"
          />
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
          No se pudieron cargar las adopciones. Intenta de nuevo más tarde.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {adopcionesFiltradas.length === 0 ? (
            <div className="text-center py-16">
              <PawPrint className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              {busqueda ? (
                <p className="text-gray-500">Sin resultados para "{busqueda}".</p>
              ) : (
                <>
                  <p className="text-gray-500 font-medium">Aún no hay adopciones registradas.</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Cuando apruebes una solicitud, aparecerá aquí en el historial.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                {adopcionesFiltradas.length} {adopcionesFiltradas.length === 1 ? 'adopción' : 'adopciones'}
                {busqueda && ` para "${busqueda}"`}
              </p>
              {adopcionesFiltradas.map((adopcion) => (
                <AdopcionRow key={adopcion.id} adopcion={adopcion} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
