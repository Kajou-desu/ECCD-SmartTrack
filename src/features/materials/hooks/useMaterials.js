import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const objectUrlsRef = useRef(new Set());

  const { data: queryData, isLoading } = useMaterialsQuery();
  const [materials, setMaterials] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const loading = isLoading;
  const [error, setError] = useState("");

  if (queryData && !initialized) {
    setInitialized(true);
    setMaterials(queryData.materials);
    if (queryData.usedMock) {
      setError("Unable to load live materials. Displaying cached materials instead.");
    }
  }

  const [searchQuery, setSearchQuery] = useState("");

  const [modalType, setModalType] = useState(MATERIAL_MODAL.NONE);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [toast, setToast] = useState(null);

  // Revoke every object URL created for uploaded files when the page unmounts.
  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

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

  const createFileUrl = useCallback((file) => {
    if (!(file instanceof File)) return null;

    const fileUrl = URL.createObjectURL(file);

    objectUrlsRef.current.add(fileUrl);

    return fileUrl;
  }, []);

  const revokeFileUrl = useCallback((fileUrl) => {
    if (!fileUrl || !objectUrlsRef.current.has(fileUrl)) return;

    URL.revokeObjectURL(fileUrl);
    objectUrlsRef.current.delete(fileUrl);
  }, []);

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
        const created = await apiClient.createMaterial(newMaterial); // MOCK_FALLBACK
        setMaterials((current) => [created, ...current]);
        queryClient.invalidateQueries({ queryKey: ["materials"] });
        closeModal();
        showToast("success", `"${created.title ?? newMaterial.title}" was added successfully.`);
      } catch (err) {
        console.warn("[MOCK_FALLBACK] createMaterial failed, applying locally:", err);
        const fileUrl = createFileUrl(newMaterial.file);
        const createdMaterial = {
          ...newMaterial,
          id: crypto.randomUUID(),
          fileName: newMaterial.file.name,
          fileUrl,
          createdAt: new Date().toISOString(),
        };
        setMaterials((current) => [createdMaterial, ...current]);
        closeModal();
        showToast("warning", `"${createdMaterial.title}" was added locally (not synced to server).`);
      }
    },
    [createFileUrl, queryClient, showToast, closeModal],
  );

  const confirmEdit = useCallback(
    async (updatedMaterial) => {
      try {
        const saved = await apiClient.updateMaterial(updatedMaterial.id, updatedMaterial); // MOCK_FALLBACK
        setMaterials((current) =>
          current.map((material) => (material.id === updatedMaterial.id ? saved : material)),
        );
        queryClient.invalidateQueries({ queryKey: ["materials"] });
        closeModal();
        showToast("success", `"${saved.title ?? updatedMaterial.title}" was updated successfully.`);
      } catch (err) {
        console.warn("[MOCK_FALLBACK] updateMaterial failed, applying locally:", err);
        setMaterials((current) =>
          current.map((material) => {
            if (material.id !== updatedMaterial.id) return material;

            const hasNewFile =
              updatedMaterial.file instanceof File &&
              updatedMaterial.file !== material.file;

            if (!hasNewFile) {
              return updatedMaterial;
            }

            const newFileUrl = createFileUrl(updatedMaterial.file);

            if (material.fileUrl) {
              revokeFileUrl(material.fileUrl);
            }

            return {
              ...updatedMaterial,
              fileUrl: newFileUrl,
              fileName: updatedMaterial.file.name,
            };
          }),
        );
        closeModal();
        showToast("warning", `"${updatedMaterial.title}" was updated locally (not synced to server).`);
      }
    },
    [createFileUrl, revokeFileUrl, queryClient, showToast, closeModal],
  );

  const confirmDelete = useCallback(async () => {
    if (!selectedMaterial) return;

    try {
      await apiClient.deleteMaterial(selectedMaterial.id); // MOCK_FALLBACK
      if (selectedMaterial.fileUrl) {
        revokeFileUrl(selectedMaterial.fileUrl);
      }
      setMaterials((current) =>
        current.filter((material) => material.id !== selectedMaterial.id),
      );
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      showToast("success", `"${selectedMaterial.title}" was deleted successfully.`);
      closeModal();
    } catch (err) {
      console.warn("[MOCK_FALLBACK] deleteMaterial failed, applying locally:", err);
      if (selectedMaterial.fileUrl) {
        revokeFileUrl(selectedMaterial.fileUrl);
      }
      setMaterials((current) =>
        current.filter((material) => material.id !== selectedMaterial.id),
      );
      showToast("warning", `"${selectedMaterial.title}" was deleted locally (not synced to server).`);
      closeModal();
    }
  }, [selectedMaterial, revokeFileUrl, queryClient, showToast, closeModal]);

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