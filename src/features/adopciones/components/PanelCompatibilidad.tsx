import { Scale } from 'lucide-react'
import type { SolicitudAdopcion } from '../api/solicitudesApi'
import { TAMANO_LABEL, NIVEL_LABEL, INGRESOS_LABEL, TIPO_VIVIENDA_LABEL, PROPIEDAD_LABEL } from '@/shared/constants/labels'

export { TIPO_VIVIENDA_LABEL, PROPIEDAD_LABEL }

const COSTO_LABEL: Record<string, string> = {
  MENOS_1SMLV: '< 1 SMLV/mes',
  '1_2SMLV': '1–2 SMLV/mes',
  '2_4SMLV': '2–4 SMLV/mes',
  MAS_4SMLV: '> 4 SMLV/mes',
}

const NIVEL_NUM: Record<string, number> = { BAJO: 1, MEDIO: 2, ALTO: 3 }
const TAMANO_NUM: Record<string, number> = { PEQUENO: 1, MEDIANO: 2, GRANDE: 3 }
const INGRESOS_NUM: Record<string, number> = { MENOS_1SMLV: 1, '1_2SMLV': 2, '2_4SMLV': 3, MAS_4SMLV: 4 }

type Compat = boolean | 'partial' | null

function CompatRow({ criterio, mascota, familia, compatible }: {
  criterio: string; mascota: string; familia: string; compatible: Compat
}) {
  const badge =
    compatible === true ? 'bg-green-100 text-green-700'
    : compatible === 'partial' ? 'bg-yellow-100 text-yellow-700'
    : compatible === false ? 'bg-red-100 text-red-600'
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

export function PanelCompatibilidad({ solicitud }: { solicitud: SolicitudAdopcion }) {
  const ch = solicitud.condiciones_hogar

  const tamanoOk: Compat = (() => {
    const mNum = TAMANO_NUM[solicitud.mascota_tamano]
    const hNum = TAMANO_NUM[ch?.tamano_hogar ?? '']
    if (mNum == null || hNum == null) return null
    if (mNum < hNum) return true
    if (mNum === hNum) return 'partial'
    return false
  })()

  const soledadOk: Compat = solicitud.mascota_nivel_independencia && ch?.tiempo_solo_horas != null
    ? !(NIVEL_NUM[solicitud.mascota_nivel_independencia] === 1 && ch.tiempo_solo_horas > 6)
    : null

  const tieneExperiencia = ch?.experiencia_mascotas && ch.experiencia_mascotas.trim().length > 10
  const complejidadOk: Compat = solicitud.mascota_nivel_complejidad
    ? !(NIVEL_NUM[solicitud.mascota_nivel_complejidad] === 3 && !tieneExperiencia)
    : null

  const sociabilidadOk: Compat = solicitud.mascota_nivel_sociabilidad
    ? NIVEL_NUM[solicitud.mascota_nivel_sociabilidad] > 1 || !ch?.tiene_mascotas_actualmente
    : null

  const ninosOk: Compat = solicitud.mascota_apta_ninos != null && ch?.tiene_ninos != null
    ? !ch.tiene_ninos || solicitud.mascota_apta_ninos === true
    : null

  const costoOk: Compat = solicitud.mascota_costo_estimado_mensual && ch?.ingresos_estimados
    ? INGRESOS_NUM[ch.ingresos_estimados] >= INGRESOS_NUM[solicitud.mascota_costo_estimado_mensual]
    : null

  const total: Compat[] = [tamanoOk, soledadOk, complejidadOk, sociabilidadOk, ninosOk, costoOk]
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

      <div className="grid grid-cols-[1fr_1fr_1fr_52px] gap-2 mb-1">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Criterio</span>
        <span className="text-xs font-semibold text-pettech-orange uppercase tracking-wide">Mascota</span>
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Adoptante</span>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">OK</span>
      </div>

      <CompatRow criterio="Tamaño vs hogar"
        mascota={TAMANO_LABEL[solicitud.mascota_tamano] ?? solicitud.mascota_tamano}
        familia={TAMANO_LABEL[ch?.tamano_hogar ?? ''] ?? ch?.tamano_hogar ?? ''}
        compatible={tamanoOk} />
      <CompatRow criterio="Independencia vs horas sola"
        mascota={NIVEL_LABEL[solicitud.mascota_nivel_independencia] ?? '—'}
        familia={ch?.tiempo_solo_horas != null ? `${ch.tiempo_solo_horas}h/día` : '—'}
        compatible={soledadOk} />
      <CompatRow criterio="Complejidad vs experiencia"
        mascota={NIVEL_LABEL[solicitud.mascota_nivel_complejidad] ?? '—'}
        familia={tieneExperiencia ? 'Con experiencia' : ch ? 'Sin experiencia' : '—'}
        compatible={complejidadOk} />
      <CompatRow criterio="Sociabilidad vs otras mascotas"
        mascota={NIVEL_LABEL[solicitud.mascota_nivel_sociabilidad] ?? '—'}
        familia={ch ? (ch.tiene_mascotas_actualmente ? 'Tiene mascotas' : 'Sin mascotas') : '—'}
        compatible={sociabilidadOk} />
      <CompatRow criterio="Apta para niños"
        mascota={solicitud.mascota_apta_ninos === true ? 'Sí' : solicitud.mascota_apta_ninos === false ? 'No' : '—'}
        familia={ch ? (ch.tiene_ninos ? 'Hay niños' : 'Sin niños') : '—'}
        compatible={ninosOk} />
      <CompatRow criterio="Costo vs ingresos"
        mascota={COSTO_LABEL[solicitud.mascota_costo_estimado_mensual] ?? '—'}
        familia={INGRESOS_LABEL[ch?.ingresos_estimados ?? ''] ?? '—'}
        compatible={costoOk} />
    </div>
  )
}
