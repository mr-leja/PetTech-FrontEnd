import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { PawPrint, Syringe, ChevronLeft, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { calendarioApi, type EntradaCalendario } from '../api/calendarioApi'
import { parseLocalDate, formatFecha, getEstado, type EstadoVacuna } from '../domain/calendarioDomain'
import NavBar from '@/shared/components/NavBar'
import Spinner from '@/shared/components/Spinner'

const ESPECIE_LABEL: Record<string, string> = {
  PERRO: 'Perro',
  GATO: 'Gato',
  CONEJO: 'Conejo',
  AVE: 'Ave',
  HAMSTER: 'Hámster',
  OTRO: 'Otro',
}

// ─── Helpers ────────────────────────────────────────────────────────────────
// parseLocalDate, formatFecha, getEstado → ver domain/calendarioDomain.ts

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: EstadoVacuna }) {
  if (estado === 'completada') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
        <CheckCircle2 className="w-3 h-3" />
        Completada
      </span>
    )
  }
  if (estado === 'vencida') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <AlertCircle className="w-3 h-3" />
        Vencida
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      <Clock className="w-3 h-3" />
      Próxima
    </span>
  )
}

function VacunaRow({ entrada }: { entrada: EntradaCalendario }) {
  const estado = getEstado(entrada)
  const rowBg =
    estado === 'completada'
      ? 'bg-gray-50 opacity-70'
      : estado === 'vencida'
      ? 'bg-red-50 border-l-4 border-red-400'
      : 'bg-white border-l-4 border-green-400'

  return (
    <div className={`rounded-lg p-4 shadow-sm ${rowBg}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Syringe className="w-4 h-4 text-pettech-orange flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {entrada.nombre_vacuna}
              {entrada.es_refuerzo && (
                <span className="ml-2 text-xs text-purple-600 font-medium">(Refuerzo)</span>
              )}
            </p>
            {entrada.descripcion && (
              <p className="text-xs text-gray-500 mt-0.5">{entrada.descripcion}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <EstadoBadge estado={estado} />
          <p className="text-xs text-gray-500">{formatFecha(entrada.fecha_sugerida)}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function CalendarioVacunacionPage() {
  const { adopcionId } = useParams<{ adopcionId: string }>()
  const id = Number(adopcionId)

  const { data: calendario, isLoading, isError } = useQuery({
    queryKey: ['calendario', id],
    queryFn: () => calendarioApi.obtener(id),
    enabled: !isNaN(id),
    staleTime: 0,
  })

  const proximas = calendario?.entradas.filter((e) => getEstado(e) === 'proxima').length ?? 0
  const vencidas = calendario?.entradas.filter((e) => getEstado(e) === 'vencida').length ?? 0

  return (
    <div className="min-h-screen bg-pettech-cream">
      <NavBar />
      <main className="max-w-2xl mx-auto p-6">

        {/* Volver */}
        <Link
          to="/mis-adopciones"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-pettech-orange mb-5"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a mis adopciones
        </Link>

        {isLoading && <Spinner />}

        {isError && (
          <div className="card p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-gray-600">No se pudo cargar el calendario. Intenta de nuevo.</p>
          </div>
        )}

        {!isLoading && !isError && calendario && (
          <>
            {/* Encabezado mascota */}
            <div className="card overflow-hidden mb-6">
              <div className="flex items-center gap-4 p-5">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {calendario.mascota_foto_url ? (
                    <img
                      src={calendario.mascota_foto_url}
                      alt={calendario.mascota_nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PawPrint className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{calendario.mascota_nombre}</h1>
                  <p className="text-sm text-gray-500">
                    {ESPECIE_LABEL[calendario.mascota_especie] ?? calendario.mascota_especie}
                    {' · '}Calendario de vacunación
                  </p>
                </div>
              </div>

              {/* Resumen */}
              <div className="border-t border-gray-100 px-5 py-3 flex gap-4 text-sm">
                <span className="text-green-700 font-medium">{proximas} próximas</span>
                {vencidas > 0 && (
                  <span className="text-red-600 font-medium">{vencidas} vencidas</span>
                )}
                <span className="text-gray-500 ml-auto">
                  {calendario.entradas.length} vacunas en total
                </span>
              </div>
            </div>

            {/* Lista de vacunas */}
            {calendario.entradas.length === 0 ? (
              <div className="card p-10 text-center">
                <PawPrint className="w-12 h-12 text-pettech-orange opacity-40 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  No hay vacunas registradas en este calendario.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {calendario.entradas.map((entrada) => (
                  <VacunaRow key={entrada.id} entrada={entrada} />
                ))}
              </div>
            )}

            {/* Nota orientativa */}
            <div className="mt-6 flex gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Importante:</strong> {calendario.notas || 'Este calendario es orientativo. Consulta siempre con un veterinario para ajustar el esquema de vacunación.'}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
