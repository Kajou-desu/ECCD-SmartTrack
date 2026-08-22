import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MATERIALS_DATA } from "@data/mockData";

// Simulates the latency of a real materials API so the loading state is
// exercised consistently with other data-driven pages (see useStudents,
// useAttendance). Swapping this for a real request later only touches this
// hook - pages and components stay the same.
function fetchMaterials() {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(MATERIALS_DATA), 300);
  });
}

export const MATERIAL_MODAL = {
  NONE: null,
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  UPLOAD: "upload",
};

export function useMaterials() {
  const objectUrlsRef = useRef(new Set());

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [modalType, setModalType] = useState(MATERIAL_MODAL.NONE);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadMaterials = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchMaterials();
        if (!isMounted) return;
        setMaterials(data);
      } catch {
        if (!isMounted) return;
        setError("Unable to load learning materials. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMaterials();

    return () => {
      isMounted = false;
    };
  }, []);

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
    (newMaterial) => {
      const fileUrl = createFileUrl(newMaterial.file);

      if (!fileUrl) {
        showToast("error", "Please select a valid PDF file.");
        return;
      }

      const createdMaterial = {
        ...newMaterial,
        id: crypto.randomUUID(),
        fileName: newMaterial.file.name,
        fileUrl,
        createdAt: new Date().toISOString(),
      };

      setMaterials((current) => [createdMaterial, ...current]);
      closeModal();
      showToast("success", `"${createdMaterial.title}" was added successfully.`);
    },
    [createFileUrl, showToast, closeModal],
  );

  const confirmEdit = useCallback(
    (updatedMaterial) => {
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
      showToast("success", `"${updatedMaterial.title}" was updated successfully.`);
    },
    [createFileUrl, revokeFileUrl, showToast, closeModal],
  );

  const confirmDelete = useCallback(() => {
    if (!selectedMaterial) return;

    if (selectedMaterial.fileUrl) {
      revokeFileUrl(selectedMaterial.fileUrl);
    }

    setMaterials((current) =>
      current.filter((material) => material.id !== selectedMaterial.id),
    );

    showToast("success", `"${selectedMaterial.title}" was deleted successfully.`);
    closeModal();
  }, [selectedMaterial, revokeFileUrl, showToast, closeModal]);

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