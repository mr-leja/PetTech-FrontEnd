import { PawPrint } from 'lucide-react'

export default function EmptyState({ message = 'No hay resultados' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <PawPrint className="w-16 h-16 mb-4 text-pettech-orange opacity-30" />
      <p className="text-lg">{message}</p>
    </div>
  )
}
