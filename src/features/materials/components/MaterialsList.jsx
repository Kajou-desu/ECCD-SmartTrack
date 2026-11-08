import LearningMaterialCard from "@features/materials/components/MaterialCard";
import EmptyMaterialsState from "@features/materials/components/EmptyMaterialsState";
import NoSearchResults from "@features/materials/components/NoSearchResults";

export default function MaterialsList({
  materials,
  filteredMaterials,
  searchQuery,
  sessionFilter = "all",
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
      <div role="status" className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-base font-bold text-slate-900">No student work for the {sessionFilter} session</h2>
        <p className="mt-2 text-sm text-slate-600">
          Materials appear here once a {sessionFilter} student has submitted work for them.
        </p>
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
    </section>
  );
}
