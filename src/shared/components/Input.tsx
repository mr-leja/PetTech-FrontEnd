import type { InputHTMLAttributes } from 'react'
import { forwardRef, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id: providedId, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = providedId || generatedId

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">{label}</label>
      <input ref={ref} id={inputId} className="input-field" {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})
