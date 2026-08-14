import { Search, X, SquareArrowRightExit } from "lucide-react";

export default function StudentFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  setFilterStatus,
  filterSession,
  setFilterSession,
  onExport,
  statusOptions = [],
  sessionOptions = [],
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          type="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search students..."
          aria-label="Search students"
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#C2570C] focus:ring-2 focus:ring-orange-100"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex w-full items-center gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-1 sm:w-auto">
        {statusOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilterStatus(option.key)}
            className={`flex-1 cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition sm:flex-none ${
              filterStatus === option.key ? "bg-[#C2570C] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex w-full items-center gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-1 sm:w-auto">
        {sessionOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilterSession(option.key)}
            className={`flex-1 cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition sm:flex-none ${
              filterSession === option.key ? "bg-[#C2570C] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onExport}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#C2570C] p-2.5 font-semibold text-white transition hover:bg-[#a94709] disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
        aria-label="Export students"
      >
        <SquareArrowRightExit className="h-4 w-4" />
        <span>Export</span>
      </button>
    </div>
  );
}
