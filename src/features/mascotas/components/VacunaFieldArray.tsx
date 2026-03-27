import { Upload, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { getTodayDate } from '../formSchema'

const TODAY = getTodayDate()

export default function VacunaFieldArray() {
  const { register, control, formState: { errors } } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'vacunas' })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Historial de vacunas *</label>
        <button
          type="button"
          onClick={() => append({ nombre: '', fecha_aplicacion: '', proxima_dosis: '', veterinario: '', lote: '' })}
          className="flex items-center gap-1 text-sm text-pettech-orange hover:underline font-medium"
        >
          <Plus className="w-4 h-4" /> Agregar vacuna
        </button>
      </div>

      {(errors.vacunas as any)?.message && (
        <p className="text-xs text-red-500">{(errors.vacunas as any).message}</p>
      )}

      {fields.length === 0 && (
        <p className="text-xs text-gray-400 italic">Sin vacunas registradas. Haz clic en "Agregar vacuna".</p>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">Vacuna {index + 1}</span>
            <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Nombre *</label>
              <input className="input-field" placeholder="Ej: Rabia" {...register(`vacunas.${index}.nombre`)} />
              {(errors.vacunas as any)?.[index]?.nombre && (
                <p className="text-xs text-red-500">{(errors.vacunas as any)[index]?.nombre?.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Fecha de aplicación *</label>
              <input type="date" className="input-field" max={TODAY} {...register(`vacunas.${index}.fecha_aplicacion`)} />
              {(errors.vacunas as any)?.[index]?.fecha_aplicacion && (
                <p className="text-xs text-red-500">{(errors.vacunas as any)[index]?.fecha_aplicacion?.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Próxima dosis</label>
              <input type="date" className="input-field" {...register(`vacunas.${index}.proxima_dosis`)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Veterinario / Clínica</label>
              <input className="input-field" placeholder="Ej: Clínica Vet Salud" {...register(`vacunas.${index}.veterinario`)} />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-medium text-gray-600">Lote</label>
              <input className="input-field" placeholder="Ej: ABC123" {...register(`vacunas.${index}.lote`)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface CarnetUploadProps {
  carnetFile: File | null
  onChange: (file: File | null) => void
}

export function CarnetUpload({ carnetFile, onChange }: CarnetUploadProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Carnet de vacunas</label>
      <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-pettech-orange transition-colors">
        <Upload className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">
          {carnetFile ? carnetFile.name : 'PDF o imagen del carnet'}
        </span>
        <input
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  )
}
