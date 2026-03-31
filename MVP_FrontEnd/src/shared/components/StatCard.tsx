interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}

export default function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`card p-6 flex items-center gap-4 border-l-4 ${color}`}>
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}
