import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import LearningMaterialCard from "../features/materials/components/MaterialCard";
import EmptyMaterialsState from "../features/materials/components/EmptyMaterialsState";
import AddMaterial from "../features/materials/components/AddMaterial";
import EditMaterial from "../features/materials/components/EditMaterial";
import DeleteMaterial from "../features/materials/components/DeleteMaterial";
import UploadStudentWork from "../features/materials/components/UploadStudentWork";
import SearchInput from "../components/ui/SearchInput";
import { PrimaryButton } from "../components/ui/Button";
import { Toast } from "../components/ui/NotificationModal";
import { MATERIALS_DATA } from "../data/mockData";

export default function Materials() {
  const menuRef = useRef(null);
  const objectUrlsRef = useRef(new Set());

  const [materials, setMaterials] = useState(MATERIALS_DATA);
  const [openMenu, setOpenMenu] = useState(null);
  const [addMaterial, setAddMaterial] = useState(null);
  const [editMaterial, setEditMaterial] = useState(null);
  const [deleteMaterial, setDeleteMaterial] = useState(null);
  const [uploadMaterial, setUploadMaterial] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  const filteredMaterials = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return materials;

    return materials.filter((material) =>
      [material.title, material.category, material.description].some((value) =>
        value?.toLowerCase().includes(query),
      ),
    );
  }, [materials, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      setOpenMenu(null);
      setAddMaterial(null);
      setEditMaterial(null);
      setDeleteMaterial(null);
      setUploadMaterial(null);
      setToast(null);
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      objectUrls.clear();
    };
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const createFileUrl = (file) => {
    if (!(file instanceof File)) return null;

    const fileUrl = URL.createObjectURL(file);

    objectUrlsRef.current.add(fileUrl);

    return fileUrl;
  };

  const revokeFileUrl = (fileUrl) => {
    if (!fileUrl || !objectUrlsRef.current.has(fileUrl)) return;

    URL.revokeObjectURL(fileUrl);
    objectUrlsRef.current.delete(fileUrl);
  };

  const handleViewMaterial = (material) => {
    const fileUrl = material.fileUrl || material.pdfUrl || material.url;

    setOpenMenu(null);

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
  };

  const handleConfirmAdd = (newMaterial) => {
    const fileUrl = createFileUrl(newMaterial.file);

    if (!fileUrl) {
      showToast("error", "Please select a valid PDF file.");
      return;
    }

    const createdMaterial = {
      ...newMaterial,
      id: crypto.randomUUID(),
      fileName: newMaterial.file.name,
      fileUrl: createFileUrl(newMaterial.file),
      createdAt: new Date().toISOString(),
    };

    setMaterials((currentMaterials) => [createdMaterial, ...currentMaterials]);

    setAddMaterial(null);

    showToast("success", `"${createdMaterial.title}" was added successfully.`);
  };

  const handleConfirmEdit = (updatedMaterial) => {
    setMaterials((currentMaterials) =>
      currentMaterials.map((material) => {
        if (material.id !== updatedMaterial.id) {
          return material;
        }

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

    setEditMaterial(null);

    showToast(
      "success",
      `"${updatedMaterial.title}" was updated successfully.`,
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteMaterial) return;

    if (deleteMaterial.fileUrl) {
      revokeFileUrl(deleteMaterial.fileUrl);
    }

    setMaterials((currentMaterials) =>
      currentMaterials.filter((material) => material.id !== deleteMaterial.id),
    );

    showToast("success", `"${deleteMaterial.title}" was deleted successfully.`);

    setDeleteMaterial(null);
  };

  const handleMenuClick = (event, materialId) => {
    event.stopPropagation();

    setOpenMenu((current) => (current === materialId ? null : materialId));
  };

  const handleAddMaterial = () => {
    setAddMaterial(true);
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-[#f8f9ff] p-4 sm:p-6">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Learning Materials
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Access PDF resources and study materials
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <SearchInput
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search materials..."
            />

            <PrimaryButton
              label="Add Material"
              icon={<Plus className="h-5 w-5" />}
              onClick={handleAddMaterial}
              ariaLabel="Add New Material"
            />
          </div>
        </header>

        {materials.length === 0 ? (
          <EmptyMaterialsState onAddMaterial={handleAddMaterial} />
        ) : filteredMaterials.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <Search size={28} className="text-slate-500" />

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No materials found
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              No learning materials match "{searchQuery}".
            </p>

            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <section
            aria-label="Available learning materials"
            className="grid grid-cols-2 gap-2 sm:gap-6 sm:px-8 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredMaterials.map((material) => (
              <LearningMaterialCard
                key={material.id}
                material={material}
                menuRef={openMenu === material.id ? menuRef : null}
                isMenuOpen={openMenu === material.id}
                onView={() => handleViewMaterial(material)}
                onUpload={() => {
                  setOpenMenu(null);
                  setUploadMaterial(material);
                }}
                onEdit={() => {
                  setOpenMenu(null);
                  setEditMaterial(material);
                }}
                onDelete={() => {
                  setOpenMenu(null);
                  setDeleteMaterial(material);
                }}
                onMenuClick={(event) => handleMenuClick(event, material.id)}
              />
            ))}
          </section>
        )}
      </div>

      {addMaterial && (
        <AddMaterial
          onCancel={() => setAddMaterial(null)}
          onConfirm={handleConfirmAdd}
        />
      )}

      {editMaterial && (
        <EditMaterial
          material={editMaterial}
          onCancel={() => setEditMaterial(null)}
          onConfirm={handleConfirmEdit}
        />
      )}

      {deleteMaterial && (
        <DeleteMaterial
          material={deleteMaterial}
          onCancel={() => setDeleteMaterial(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {uploadMaterial && (
        <UploadStudentWork
          material={uploadMaterial}
          onClose={() => setUploadMaterial(null)}
          onSuccess={(message) => showToast("success", message)}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </main>
  );
}
