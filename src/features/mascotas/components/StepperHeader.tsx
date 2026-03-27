import { Check } from 'lucide-react'

interface Props {
  step: number
  steps: string[]
}

export default function StepperHeader({ step, steps }: Props) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {steps.map((label, i) => {
        const num = i + 1
        const done = step > num
        const active = step === num
        return (
          <div key={label} className="contents">
            {i > 0 && <div className="flex-1 h-px bg-gray-200" />}
            <div className={`flex items-center gap-2 ${active || done ? 'text-pettech-orange' : 'text-gray-400'}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  done
                    ? 'bg-pettech-orange border-pettech-orange text-white'
                    : active
                    ? 'border-pettech-orange text-pettech-orange'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {done ? <Check className="w-3 h-3" /> : num}
              </div>
              <span className="text-sm font-medium">{label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
