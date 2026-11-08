import LearningMaterialCard from "@features/materials/components/MaterialCard";
import EmptyMaterialsState from "@features/materials/components/EmptyMaterialsState";
import NoSearchResults from "@features/materials/components/NoSearchResults";

const SESSION_FILTERS = [
  { value: "all", label: "All" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
];

function StudentWorksHeader({ sessionFilter, onSessionFilterChange }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-lg font-bold text-slate-900">Student Works</h2>
      <div role="group" aria-label="Filter student works by session" className="flex w-full rounded-xl border border-slate-300 bg-white p-1 sm:w-auto">
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
    </div>
  );
}

export default function MaterialsList({
  materials,
  filteredMaterials,
  searchQuery,
  sessionFilter = "all",
  onSessionFilterChange,
  onClearSearch,
  onAddMaterial,
  onView,
  onUpload,
  onViewWorks,
  onEdit,
  onDelete,
}) {
  if (materials.length === 0) {
    return <EmptyMaterialsState onAddMaterial={onAddMaterial} />;
  }

  if (filteredMaterials.length === 0 && sessionFilter !== "all" && !searchQuery.trim()) {
    return (
      <section aria-label="Student works" className="flex flex-col gap-4">
        <StudentWorksHeader
          sessionFilter={sessionFilter}
          onSessionFilterChange={onSessionFilterChange}
        />
        <div role="status" className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-base font-bold text-slate-900">No student work for the {sessionFilter} session</h2>
          <p className="mt-2 text-sm text-slate-600">
            Materials appear here once a {sessionFilter} student has submitted work for them.
          </p>
        </div>
      </section>
    );
  }

  if (filteredMaterials.length === 0) {
    return (
      <section aria-label="Student works" className="flex flex-col gap-4">
        <StudentWorksHeader
          sessionFilter={sessionFilter}
          onSessionFilterChange={onSessionFilterChange}
        />
        <NoSearchResults query={searchQuery} onClearSearch={onClearSearch} />
      </section>
    );
  }

  return (
    <section aria-label="Student works" className="flex flex-col gap-4">
      <StudentWorksHeader
        sessionFilter={sessionFilter}
        onSessionFilterChange={onSessionFilterChange}
      />
      <div
        aria-label="Available learning materials"
        className="grid grid-cols-2 gap-2 sm:gap-6 sm:px-8 lg:grid-cols-3 xl:grid-cols-4"
      >
        {filteredMaterials.map((material) => (
          <LearningMaterialCard
            key={material.id}
            material={material}
            onView={() => onView(material)}
            onUpload={() => onUpload(material)}
            onViewWorks={() => onViewWorks(material)}
            onEdit={() => onEdit(material)}
            onDelete={() => onDelete(material)}
          />
        ))}
      </div>
    </section>
  );
}
