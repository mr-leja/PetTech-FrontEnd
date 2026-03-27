import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/shared/components/Input'

export default function OtrasMascotasFieldArray() {
  const { register, control, formState: { errors } } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'otras_mascotas' })

  const errores = (errors.otras_mascotas as any)

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Mascotas actuales</h3>
        <button
          type="button"
          onClick={() => append({ especie: '', cantidad: 1, edad_aprox: '', vacunadas: false, esterilizadas: false })}
          className="flex items-center gap-1 text-xs text-pettech-orange hover:underline"
        >
          <Plus className="w-3 h-3" /> Agregar
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">Agrega tus mascotas actuales</p>
      )}

      {fields.map((field, idx) => (
        <div key={field.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Input
                label="Especie"
                placeholder="ej. perro, gato"
                error={errores?.[idx]?.especie?.message}
                {...register(`otras_mascotas.${idx}.especie`)}
              />
              <Input
                label="Cantidad"
                type="number"
                min={1}
                onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                error={errores?.[idx]?.cantidad?.message}
                {...register(`otras_mascotas.${idx}.cantidad`)}
              />
              <Input
                label="Edad aprox."
                placeholder="ej. 2 años"
                {...register(`otras_mascotas.${idx}.edad_aprox`)}
              />
              <div className="flex flex-col gap-2 justify-end pb-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`vac_${idx}`}
                    className="w-3 h-3 accent-pettech-orange"
                    {...register(`otras_mascotas.${idx}.vacunadas`)}
                  />
                  <label htmlFor={`vac_${idx}`} className="text-xs text-gray-600">Vacunadas</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`est_${idx}`}
                    className="w-3 h-3 accent-pettech-orange"
                    {...register(`otras_mascotas.${idx}.esterilizadas`)}
                  />
                  <label htmlFor={`est_${idx}`} className="text-xs text-gray-600">Esterilizadas</label>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-red-400 hover:text-red-600 mt-6"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
