import { Search, X } from "lucide-react";

export default function AttendanceControls({
  filterStatus,
  setFilterStatus,
  filterTime,
  setFilterTime,
  searchQuery,
  setSearchQuery,
}) {
  const STATUS_OPTIONS = [
    { key: "all", label: "All" },
    { key: "present", label: "Present" },
    { key: "absent", label: "Absent" },
    { key: "excused", label: "Excused" },
  ];

  const TIME_OPTIONS = [
    { key: "all", label: "All" },
    { key: "am", label: "AM" },
    { key: "pm", label: "PM" },
  ];

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-0 flex-1 sm:min-w-55 sm:flex-none">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search student..."
          aria-label="Search student by name"
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#C2570C] focus:ring-2 focus:ring-[#C2570C]/20 sm:w-55"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilterStatus(option.key)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                filterStatus === option.key ? "bg-[#C2570C] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilterTime(option.key)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                filterTime === option.key ? "bg-[#C2570C] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
