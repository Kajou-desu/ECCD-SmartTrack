import useParentMaterials from "@features/materials/hooks/useParentMaterials";
import ParentMaterialsToolbar from "@features/materials/components/ParentMaterialsToolbar";
import ParentMaterialsList from "@features/materials/components/ParentMaterialsList";
import MaterialsLoadingState from "@features/materials/components/MaterialsLoadingState";
import ErrorMsg from "@components/ui/ErrorMsg";

export default function ParentMaterials() {
  const { materials, filteredMaterials, searchQuery, setSearchQuery, loading, error, retry } =
    useParentMaterials();

  const handleView = (material) => {
    const fileUrl = material.pdfUrl || material.fileUrl || material.url;
    if (!fileUrl) return;
    window.open(fileUrl, "_blank", "noopener");
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-[#f8f9ff] p-4 sm:p-6">
      <div className="flex flex-col gap-6">
        <ParentMaterialsToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {error && <ErrorMsg message={error} onClose={retry} />}

        {loading ? (
          <MaterialsLoadingState />
        ) : (
          <ParentMaterialsList
            materials={materials}
            filteredMaterials={filteredMaterials}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery("")}
            onView={handleView}
          />
        )}
      </div>
    </main>
  );
}
