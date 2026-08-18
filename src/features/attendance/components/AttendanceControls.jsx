import SearchInput from "../../../components/ui/SearchInput";

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
      <SearchInput
        id="search-student-attendance"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search student..."
        ariaLabel="Search student by name"
      />

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilterStatus(option.key)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                filterStatus === option.key
                  ? "bg-[#C2570C] text-white"
                  : "text-gray-600 hover:bg-gray-100"
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
