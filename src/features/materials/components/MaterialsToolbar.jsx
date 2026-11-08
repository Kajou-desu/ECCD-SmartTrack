import PageHeader from "@components/shared/PageHeader";
import SearchInput from "@components/ui/SearchInput";
import { PrimaryButton } from "@components/ui/Button";
import { Plus } from "lucide-react";

const SESSION_FILTERS = [
  { value: "all", label: "All" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
];

export default function MaterialsToolbar({
  searchQuery,
  onSearchChange,
  onAddMaterial,
  sessionFilter = "all",
  onSessionFilterChange,
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <PageHeader
          title="Learning Materials"
          subtitle="Organize and view study resources and materials and student works"
        />
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <SearchInput
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search materials..."
          ariaLabel="Search learning materials"
        />

        <PrimaryButton
          label="Add Material"
          icon={<Plus className="h-5 w-5" />}
          onClick={onAddMaterial}
          ariaLabel="Add New Material"
        />
      </div>
      {onSessionFilterChange && (
        <div role="group" aria-label="Filter by session of the students who submitted work" className="flex w-full rounded-xl border border-slate-300 bg-white p-1 sm:w-auto">
          {SESSION_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={sessionFilter === value}
              onClick={() => onSessionFilterChange(value)}
              className={`flex-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                sessionFilter === value ? "bg-[#C2570C] text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
