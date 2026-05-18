export function LibroSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Selector cursos */}
      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 w-16 bg-gray-200 rounded-xl" />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-5 w-20 bg-gray-100 rounded" />
        ))}
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="h-6 bg-gray-100 rounded w-1/3 mb-4" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-50 rounded mb-2" />
        ))}
      </div>
    </div>
  )
}
