import ParentMaterialCard from "@features/materials/components/ParentMaterialCard";
import ParentEmptyMaterialsState from "@features/materials/components/ParentEmptyMaterialsState";
import NoSearchResults from "@features/materials/components/NoSearchResults";

export default function ParentMaterialsList({
  materials,
  filteredMaterials,
  searchQuery,
  statusFilter = "all",
  onClearSearch,
  onClearFilter,
  onView,
}) {
  if (materials.length === 0) {
    return <ParentEmptyMaterialsState />;
  }

  // Nothing left because of the status filter alone (e.g. every material is
  // done): say so in plain words instead of "no materials match ''".
  if (filteredMaterials.length === 0 && !searchQuery.trim() && statusFilter !== "all") {
    const pending = statusFilter === "pending";
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-base font-bold text-slate-900">
          {pending ? "Nothing pending" : "Nothing completed yet"}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {pending
            ? "Your child has handed in work for every material."
            : "No completed work has been handed in yet."}
        </p>
        {onClearFilter && (
          <button
            type="button"
            onClick={onClearFilter}
            className="mt-5 cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Show all materials
          </button>
        )}
      </div>
    );
  }

  if (filteredMaterials.length === 0) {
    return (
      <NoSearchResults query={searchQuery} onClearSearch={onClearSearch} />
    );
  }

  return (
    <section
      aria-label="Available learning materials"
      className="grid grid-cols-2 gap-2 sm:gap-6 sm:px-8 lg:grid-cols-3 xl:grid-cols-4"
    >
      {filteredMaterials.map((material) => (
        <ParentMaterialCard
          key={material.id}
          material={material}
          onView={() => onView(material)}
        />
      ))}
    </section>
  );
}
