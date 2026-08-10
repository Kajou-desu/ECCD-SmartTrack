export function StudentTableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(7)].map((_, index) => (
        <div
          key={index}
          className="flex gap-4 p-4 bg-gray-100 rounded-lg animate-pulse border border-gray-200"
        >
          {/* Avatar */}
          <div className="w-10 h-10 bg-gray-300 rounded-full shrink-0" />

          {/* Name & ID */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-4 bg-gray-300 rounded w-2/5" />
            <div className="h-3 bg-gray-300 rounded w-1/4" />
          </div>

          {/* Age */}
          <div className="h-8 w-20 bg-gray-300 rounded shrink-0" />

          {/* Birthday */}
          <div className="h-4 w-24 bg-gray-300 rounded shrink-0" />

          {/* Guardian */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-3 bg-gray-300 rounded w-1/2" />
          </div>

          {/* Address */}
          <div className="h-4 w-32 bg-gray-300 rounded shrink-0" />

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            <div className="h-5 w-5 bg-gray-300 rounded" />
            <div className="h-5 w-5 bg-gray-300 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
