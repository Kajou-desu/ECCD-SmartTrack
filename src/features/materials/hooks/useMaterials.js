import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { useMaterialsQuery } from "./useMaterialsQuery.js";

export const MATERIAL_MODAL = {
  NONE: null,
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  UPLOAD: "upload",
};

export function useMaterials() {
  const queryClient = useQueryClient();

  const { data: queryData, isLoading, isError, refetch } = useMaterialsQuery();
  const [materials, setMaterials] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const loading = isLoading;
  const [error, setError] = useState("");

  if (queryData && !initialized) {
    setInitialized(true);
    setMaterials(queryData.materials);
    if (error) setError("");
  }

  if (isError && !initialized) {
    setError("Unable to load materials. Please try again.");
  }

  const [searchQuery, setSearchQuery] = useState("");

  const [modalType, setModalType] = useState(MATERIAL_MODAL.NONE);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [toast, setToast] = useState(null);

  const filteredMaterials = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return materials;

    return materials.filter((material) =>
      [material.title, material.category, material.description].some(
        (value) => value?.toLowerCase().includes(query),
      ),
    );
  }, [materials, searchQuery]);

  const dismissError = useCallback(() => setError(""), []);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const closeModal = useCallback(() => {
    setModalType(MATERIAL_MODAL.NONE);
    setSelectedMaterial(null);
  }, []);

  const openCreateModal = useCallback(() => {
    setSelectedMaterial(null);
    setModalType(MATERIAL_MODAL.CREATE);
  }, []);

  const openEditModal = useCallback((material) => {
    setSelectedMaterial(material);
    setModalType(MATERIAL_MODAL.EDIT);
  }, []);

  const openDeleteModal = useCallback((material) => {
    setSelectedMaterial(material);
    setModalType(MATERIAL_MODAL.DELETE);
  }, []);

  const openUploadModal = useCallback((material) => {
    setSelectedMaterial(material);
    setModalType(MATERIAL_MODAL.UPLOAD);
  }, []);

  const viewMaterial = useCallback(
    (material) => {
      const fileUrl = material.fileUrl || material.pdfUrl || material.url;

      if (!fileUrl) {
        showToast("error", "This material does not have a PDF file assigned.");
        return;
      }

      const newWindow = window.open(fileUrl, "_blank");

      if (newWindow) {
        newWindow.opener = null;
        return;
      }

      showToast(
        "error",
        "The PDF could not be opened. Please allow pop-ups and try again.",
      );
    },
    [showToast],
  );

  const confirmAdd = useCallback(
    async (newMaterial) => {
      if (!(newMaterial.file instanceof File)) {
        showToast("error", "Please select a valid PDF file.");
        return;
      }

      try {
        const created = await apiClient.createMaterial(newMaterial);
        setMaterials((current) => [created, ...current]);
        queryClient.invalidateQueries({ queryKey: ["materials"] });
        closeModal();
        showToast("success", `"${created.title ?? newMaterial.title}" was added successfully.`);
      } catch (err) {
        showToast("error", err.message || "Failed to add material. Please try again.");
      }
    },
    [queryClient, showToast, closeModal],
  );

  const confirmEdit = useCallback(
    async (updatedMaterial) => {
      try {
        const saved = await apiClient.updateMaterial(updatedMaterial.id, updatedMaterial);
        setMaterials((current) =>
          current.map((material) => (material.id === updatedMaterial.id ? saved : material)),
        );
        queryClient.invalidateQueries({ queryKey: ["materials"] });
        closeModal();
        showToast("success", `"${saved.title ?? updatedMaterial.title}" was updated successfully.`);
      } catch (err) {
        showToast("error", err.message || "Failed to update material. Please try again.");
      }
    },
    [queryClient, showToast, closeModal],
  );

  const confirmDelete = useCallback(async () => {
    if (!selectedMaterial) return;

    try {
      await apiClient.deleteMaterial(selectedMaterial.id);
      setMaterials((current) =>
        current.filter((material) => material.id !== selectedMaterial.id),
      );
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      showToast("success", `"${selectedMaterial.title}" was deleted successfully.`);
      closeModal();
    } catch (err) {
      showToast("error", err.message || "Failed to delete material. Please try again.");
    }
  }, [selectedMaterial, queryClient, showToast, closeModal]);

  const handleUploadSuccess = useCallback(
    (message) => {
      showToast("success", message);
      closeModal();
    },
    [showToast, closeModal],
  );

  return {
    materials,
    loading,
    error,
    dismissError,
    retry: refetch,
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
  };
}

export default useMaterials;