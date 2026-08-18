import { PrimaryButton } from "../../../components/ui/Button";
import SearchInput from "../../../components/ui/SearchInput";
import { Download } from "lucide-react";

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
      <SearchInput
        id="search-student-record"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search student..."
        ariaLabel="Search student by name"
      />

      <div className="flex w-full items-center gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-1 sm:w-auto">
        {statusOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilterStatus(option.key)}
            className={`flex-1 cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition sm:flex-none ${
              filterStatus === option.key
                ? "bg-[#C2570C] text-white"
                : "text-gray-600 hover:bg-gray-100"
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
              filterSession === option.key
                ? "bg-[#C2570C] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <PrimaryButton
        icon={<Download className="h-5 w-5" />}
        label="Export"
        onClick={onExport}
        ariaLabel="Export Student Record"
      />
    </div>
  );
}
