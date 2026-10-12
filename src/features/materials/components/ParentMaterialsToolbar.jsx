import SearchInput from "@components/ui/SearchInput";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

export default function ParentMaterialsToolbar({
  searchQuery,
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  counts,
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Learning Materials
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Educational resources shared by your child&apos;s teacher
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        {onStatusFilterChange && (
          <div
            role="group"
            aria-label="Filter materials by status"
            className="flex w-full items-center gap-1 rounded-lg border border-gray-300 bg-gray-100 p-1 sm:w-auto"
          >
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                aria-pressed={statusFilter === filter.key}
                onClick={() => onStatusFilterChange(filter.key)}
                className={`flex-1 cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition sm:flex-none ${
                  statusFilter === filter.key
                    ? "bg-[#C2570C] text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
                {counts ? ` (${counts[filter.key]})` : ""}
              </button>
            ))}
          </div>
        )}

        <SearchInput
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search materials..."
          ariaLabel="Search learning materials"
        />
      </div>
    </header>
  );
}
