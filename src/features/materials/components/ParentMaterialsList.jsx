import ParentMaterialCard from "@features/materials/components/ParentMaterialCard";
import ParentEmptyMaterialsState from "@features/materials/components/ParentEmptyMaterialsState";
import NoSearchResults from "@features/materials/components/NoSearchResults";

export default function ParentMaterialsList({
  materials,
  filteredMaterials,
  searchQuery,
  onClearSearch,
  onView,
}) {
  if (materials.length === 0) {
    return <ParentEmptyMaterialsState />;
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
