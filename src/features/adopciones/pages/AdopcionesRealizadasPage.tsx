import { useQuery } from '@tanstack/react-query'
import { Heart, PawPrint, Calendar, MapPin, Info } from 'lucide-react'
import { solicitudesApi, type Adopcion } from '../api/solicitudesApi'
import NavBar from '@/shared/components/NavBar'
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

function EdadTexto({ anios, unidad }: { anios: number; unidad: string }) {
  const u = unidad === 'MESES' ? (anios === 1 ? 'mes' : 'meses') : anios === 1 ? 'año' : 'años'
  return <>{anios} {u}</>
}

function AdopcionCard({ adopcion }: { adopcion: Adopcion }) {
  const fechaAdopcion = new Date(adopcion.fecha_adopcion).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Foto mascota */}
        <div className="sm:w-48 sm:h-auto h-48 flex-shrink-0 bg-gray-100">
          {adopcion.mascota_foto_url ? (
            <img
              src={adopcion.mascota_foto_url}
              alt={adopcion.mascota_nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PawPrint className="w-16 h-16 text-gray-300" />
            </div>
          )}
        </div>

        {/* Detalle */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{adopcion.mascota_nombre}</h2>
              <p className="text-sm text-gray-500">
                {ESPECIE_LABEL[adopcion.mascota_especie] ?? adopcion.mascota_especie}
                {adopcion.mascota_raza ? ` · ${adopcion.mascota_raza}` : ''}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              <Heart className="w-3 h-3" />
              Adoptado
            </span>
          </div>

          {/* Ficha rápida */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">
              <EdadTexto anios={adopcion.mascota_edad_anios} unidad={adopcion.mascota_edad_unidad} />
            </span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
              {SEXO_LABEL[adopcion.mascota_sexo] ?? adopcion.mascota_sexo}
            </span>
            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
              {TAMANO_LABEL[adopcion.mascota_tamano] ?? adopcion.mascota_tamano}
            </span>
          </div>

          {adopcion.mascota_descripcion && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{adopcion.mascota_descripcion}</p>
          )}

          {/* Fecha y lugar */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Adoptado el {fechaAdopcion}
            </span>
            {adopcion.familia_ciudad && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {adopcion.familia_ciudad}{adopcion.familia_departamento ? `, ${adopcion.familia_departamento}` : ''}
              </span>
            )}
          </div>

          {/* Notas del admin */}
          {adopcion.solicitud_notas_admin && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-green-800 mb-0.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Nota del administrador
              </p>
              <p className="text-green-700">{adopcion.solicitud_notas_admin}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export default function AdopcionesRealizadasPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['adopciones', 'mias'],
    queryFn: () => solicitudesApi.listarAdopciones(),
  })

  return (
    <div className="min-h-screen bg-pettech-cream">
      <NavBar />
      <main className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-pettech-orange" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Mis adopciones</h1>
            <p className="text-sm text-gray-500">{data?.count ?? 0} adopciones realizadas</p>
          </div>
        </div>

        {isLoading && <Spinner />}

        {isError && (
          <p className="text-red-500 text-center">Error al cargar las adopciones.</p>
        )}

        {!isLoading && !isError && data?.results.length === 0 && (
          <div className="card p-10 text-center">
            <PawPrint className="w-12 h-12 text-pettech-orange opacity-40 mx-auto mb-4" />
            <h2 className="text-base font-semibold text-gray-700 mb-1">Aún no tienes adopciones</h2>
            <p className="text-sm text-gray-500">
              Cuando una solicitud sea aprobada, aparecerá aquí tu historia de adopción.
            </p>
          </div>
        )}

        {!isLoading && !isError && data && data.results.length > 0 && (
          <div className="flex flex-col gap-3">
            {data.results.map((adopcion) => (
              <AdopcionCard key={adopcion.id} adopcion={adopcion} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
