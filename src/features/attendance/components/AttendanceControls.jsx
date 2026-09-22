import SearchInput from "@components/ui/SearchInput";

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
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchInput
        id="search-student-attendance"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search student..."
        ariaLabel="Search student by name"
      />

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex w-full min-w-0 items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 sm:w-auto">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilterStatus(option.key)}
              className={`min-w-0 flex-1 cursor-pointer rounded-md px-2 py-1.5 text-sm font-semibold transition sm:flex-none sm:px-3 ${
                filterStatus === option.key
                  ? "bg-[#C2570C] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex w-full min-w-0 items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 sm:w-auto">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilterTime(option.key)}
              className={`min-w-0 flex-1 cursor-pointer rounded-md px-2 py-1.5 text-sm font-semibold transition sm:flex-none sm:px-3 ${
                filterTime === option.key
                  ? "bg-[#C2570C] text-white"
                  : "text-gray-600 hover:bg-gray-100"
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
