export function StudentTableSkeleton({ rows }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-272 w-full border-collapse animate-pulse text-left">
        <thead>
          <tr className="border-b-2 border-gray-300">
            {["w-28", "w-16", "w-12", "w-32", "w-20", "w-16", "w-16"].map(
              (width, index) => (
                <th key={index} className="p-4">
                  <div className={`h-3 rounded bg-gray-200 ${width}`} />
                </th>
              ),
            )}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />

                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="h-3 w-20 rounded bg-gray-100" />
                  </div>
                </div>
              </td>

              <td className="p-4">
                <div className="h-7 w-14 rounded-full bg-gray-200" />
              </td>

              <td className="p-4">
                <div className="h-8 w-24 rounded-full bg-gray-200" />
              </td>

              <td className="p-4">
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-24 rounded bg-gray-100" />
                </div>
              </td>

              <td className="p-4">
                <div className="h-4 w-36 rounded bg-gray-200" />
              </td>

              <td className="p-4">
                <div className="h-7 w-16 rounded-full bg-gray-200" />
              </td>

              <td className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-5 w-5 rounded bg-gray-200" />
                  <div className="h-5 w-5 rounded bg-gray-200" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
