import LearningMaterialCard from "@features/materials/components/MaterialCard";
import EmptyMaterialsState from "@features/materials/components/EmptyMaterialsState";
import NoSearchResults from "@features/materials/components/NoSearchResults";

export default function MaterialsList({
  materials,
  filteredMaterials,
  searchQuery,
  onClearSearch,
  onAddMaterial,
  onView,
  onUpload,
  onEdit,
  onDelete,
}) {
  if (materials.length === 0) {
    return <EmptyMaterialsState onAddMaterial={onAddMaterial} />;
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
          onEdit={() => onEdit(material)}
          onDelete={() => onDelete(material)}
        />
      ))}
    </section>
  );
}
