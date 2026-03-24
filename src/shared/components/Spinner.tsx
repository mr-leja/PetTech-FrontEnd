export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return (
    <div className="flex justify-center items-center py-8">
      <div
        className={`${sizeClass} border-4 border-pettech-orange border-t-transparent rounded-full animate-spin`}
      />
    </div>
  )
}
