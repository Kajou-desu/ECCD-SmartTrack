import {
  useMaterials,
  MATERIAL_MODAL,
} from "@features/materials/hooks/useMaterials";
import MaterialsToolbar from "@features/materials/components/MaterialsToolbar";
import MaterialsList from "@features/materials/components/MaterialsList";
import MaterialsLoadingState from "@features/materials/components/MaterialsLoadingState";
import AddMaterial from "@features/materials/components/AddMaterial";
import EditMaterial from "@features/materials/components/EditMaterial";
import DeleteMaterial from "@features/materials/components/DeleteMaterial";
import UploadStudentWork from "@features/materials/components/UploadStudentWork";
import ErrorMsg from "@components/ui/ErrorMsg";
import { Toast } from "@components/ui/NotificationModal";

export default function Materials() {
  const {
    materials,
    loading,
    error,
    dismissError,
    filteredMaterials,
    searchQuery,
    setSearchQuery,
    modalType,
    selectedMaterial,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openUploadModal,
    closeModal,
    viewMaterial,
    confirmAdd,
    confirmEdit,
    confirmDelete,
    handleUploadSuccess,
    toast,
    dismissToast,
  } = useMaterials();

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-[#f8f9ff] p-4 sm:p-6">
      <div className="flex flex-col gap-6">
        <MaterialsToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddMaterial={openCreateModal}
        />

        {error && <ErrorMsg message={error} onClose={dismissError} />}

        {loading ? (
          <MaterialsLoadingState />
        ) : (
          <MaterialsList
            materials={materials}
            filteredMaterials={filteredMaterials}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery("")}
            onAddMaterial={openCreateModal}
            onView={viewMaterial}
            onUpload={openUploadModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        )}
      </div>

      {modalType === MATERIAL_MODAL.CREATE && (
        <AddMaterial onCancel={closeModal} onConfirm={confirmAdd} />
      )}

      {modalType === MATERIAL_MODAL.EDIT && selectedMaterial && (
        <EditMaterial
          material={selectedMaterial}
          onCancel={closeModal}
          onConfirm={confirmEdit}
        />
      )}

      {modalType === MATERIAL_MODAL.DELETE && selectedMaterial && (
        <DeleteMaterial
          material={selectedMaterial}
          onCancel={closeModal}
          onConfirm={confirmDelete}
        />
      )}

      {modalType === MATERIAL_MODAL.UPLOAD && selectedMaterial && (
        <UploadStudentWork
          material={selectedMaterial}
          onClose={closeModal}
          onSuccess={handleUploadSuccess}
        />
      )}

      {toast && <Toast {...toast} onClose={dismissToast} />}
    </main>
  );
}
