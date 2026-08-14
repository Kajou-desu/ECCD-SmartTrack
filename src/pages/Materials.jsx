import { useEffect, useRef, useState, useCallback } from "react";
import { NotificationModal, Toast } from "../components/NotificationModal";
import { MATERIALS_DATA, getAllStudentsData } from "../data/mockData";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  FileText,
  MoreVertical,
  Upload,
  Search,
} from "lucide-react";

export default function Materials() {
  const menuRef = useRef(null);

  const [materials, setMaterials] = useState(MATERIALS_DATA);
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteMaterial, setDeleteMaterial] = useState(null);
  const [uploadMaterial, setUploadMaterial] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const [toast, setToast] = useState(null);

  const showNotification = useCallback((title, message) => {
    setNotification({ title, message });
  }, []);

  const showSuccess = useCallback((message) => {
    setToast({ type: "success", message });
  }, []);

  const showError = useCallback((message) => {
    setToast({ type: "error", message });
  }, []);

  const handleUploadClick = useCallback((material) => {
    setOpenMenu(null);
    setUploadMaterial(material);
  }, []);

  const handleCloseUpload = useCallback(() => {
    setUploadMaterial(null);
  }, []);

  // Close the action menu when the user clicks outside it.
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

  // Close menus, modals, and notifications with the Escape key.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      setOpenMenu(null);
      setDeleteMaterial(null);
      setUploadMaterial(null);
      setNotification(null);
      setToast(null);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleAddMaterial = useCallback(() => {
    setOpenMenu(null);

    showNotification(
      "Add Material",
      "The Add Material form will be connected here.",
    );
  }, [showNotification]);

  const handleViewMaterial = useCallback(
    (material) => {
      const pdfUrl = material.fileUrl || material.pdfUrl || material.url;

      setOpenMenu(null);

      if (!pdfUrl) {
        showError("This material does not have a PDF file assigned.");
        return;
      }

      const newWindow = window.open(pdfUrl, "_blank", "noopener,noreferrer");

      if (!newWindow) {
        showError(
          "The PDF could not be opened. Please allow pop-ups and try again.",
        );
      }
    },
    [showError],
  );

  const handleEditMaterial = useCallback(
    (material) => {
      setOpenMenu(null);

      showNotification(
        "Edit Material",
        `Edit functionality for "${material.title}" will be connected here.`,
      );
    },
    [showNotification],
  );

  const handleMenuClick = useCallback((event, materialId) => {
    event.stopPropagation();
    setOpenMenu((current) => (current === materialId ? null : materialId));
  }, []);

  const handleDeleteClick = useCallback((material) => {
    setOpenMenu(null);
    setDeleteMaterial(material);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeleteMaterial(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteMaterial) return;

    const deletedId = deleteMaterial.id;
    const deletedTitle = deleteMaterial.title;

    setMaterials((current) =>
      current.filter((material) => material.id !== deletedId),
    );

    setDeleteMaterial(null);
    showSuccess(`"${deletedTitle}" was deleted successfully.`);
  }, [deleteMaterial, showSuccess]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredMaterials = materials.filter((material) => {
    if (!normalizedSearch) return true;

    return [material.title, material.category, material.description].some(
      (value) => value?.toLowerCase().includes(normalizedSearch),
    );
  });

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-4 sm:p-6">
      <div className="flex w-full flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Learning Materials
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Access PDF resources and study materials
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <label htmlFor="material-search" className="sr-only">
                Search learning materials
              </label>

              <Search
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="material-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search materials..."
                className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />

              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear material search"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleAddMaterial}
              className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#C2570C] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 active:shadow-sm"
            >
              <Plus size={18} aria-hidden="true" />
              Add Material
            </button>
          </div>
        </header>

        {materials.length > 0 ? (
          <section
            aria-label="Available learning materials"
            className="w-full grid grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:px-8"
          >
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((material) => (
                <LearningMaterialCard
                  key={material.id}
                  material={material}
                  menuRef={openMenu === material.id ? menuRef : null}
                  isMenuOpen={openMenu === material.id}
                  onView={() => handleViewMaterial(material)}
                  onUpload={() => handleUploadClick(material)}
                  onEdit={() => handleEditMaterial(material)}
                  onDelete={() => handleDeleteClick(material)}
                  onMenuClick={(event) => handleMenuClick(event, material.id)}
                />
              ))
            ) : (
              <div className="col-span-full flex min-h-64 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100"
                  aria-hidden="true"
                >
                  <Search size={28} className="text-slate-500" />
                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-900">
                  No materials found
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  No learning materials match "{searchQuery}".
                </p>

                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-5 cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  Clear Search
                </button>
              </div>
            )}
          </section>
        ) : (
          <EmptyMaterialsState onAddMaterial={handleAddMaterial} />
        )}
      </div>

      {deleteMaterial && (
        <DeleteMaterialModal
          material={deleteMaterial}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}

      {uploadMaterial && (
        <UploadStudentWorkModal
          material={uploadMaterial}
          onClose={handleCloseUpload}
          onSuccess={showSuccess}
        />
      )}

      {notification && (
        <NotificationModal
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}

function LearningMaterialCard({
  material,
  menuRef,
  isMenuOpen,
  onView,
  onUpload,
  onEdit,
  onDelete,
  onMenuClick,
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Material cover and quick actions. */}
      <div className="relative h-75 sm:h-85 w-full overflow-hidden bg-linear-to-br from-slate-100 to-slate-200">
        <div
          className={`absolute inset-0 flex items-center justify-center text-6xl opacity-80 ${material.bgColor}`}
          aria-hidden="true"
        >
          {material.icon}
        </div>

        <span className="absolute left-3 top-3 inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-wider text-slate-700 shadow-sm">
          {material.category}
        </span>

        <div ref={menuRef} className="absolute right-2 top-2">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={`Open actions for ${material.title}`}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white/80 text-slate-700 shadow-sm transition hover:bg-white hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <MoreVertical size={18} aria-hidden="true" />
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-2 min-w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={onEdit}
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil size={16} aria-hidden="true" />
                Edit
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={onDelete}
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={16} aria-hidden="true" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h2 className="line-clamp-2 text-base font-bold text-slate-900">
            {material.title}
          </h2>

          <p className="mt-2 line-clamp-2 text-sm text-slate-600 hidden sm:inline">
            {material.description}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={onView}
            aria-label={`View ${material.title} PDF`}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#C2570C] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <FileText size={16} aria-hidden="true" />
            View PDF
          </button>

          <button
            type="button"
            onClick={onUpload}
            aria-label={`Upload completed student work for ${material.title}`}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <Upload size={16} aria-hidden="true" />
            Upload Works
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyMaterialsState({ onAddMaterial }) {
  return (
    <section className="flex min-h-96 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-lg bg-orange-50"
        aria-hidden="true"
      >
        <FileText size={32} className="text-orange-600" />
      </div>

      <h2 className="mt-4 text-lg font-bold text-slate-900">
        No learning materials yet
      </h2>

      <p className="mt-2 max-w-sm text-sm text-slate-600">
        Start building your resource library by adding your first learning
        material.
      </p>

      <button
        type="button"
        onClick={onAddMaterial}
        className="mt-6 flex cursor-pointer items-center gap-2 rounded-lg bg-[#C2570C] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
      >
        <Plus size={18} aria-hidden="true" />
        Add Material
      </button>
    </section>
  );
}

function DeleteMaterialModal({ material, onCancel, onConfirm }) {
  return (
    <ModalShell title="Delete Material" onClose={onCancel} size="max-w-sm">
      <div className="p-6">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50"
          aria-hidden="true"
        >
          <Trash2 size={24} className="text-red-600" />
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-700">
          Delete{" "}
          <span className="font-semibold text-slate-900">
            "{material.title}"
          </span>
          ? This action can't be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children, size = "max-w-2xl" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 p-4 sm:items-center sm:justify-center sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`flex max-h-dvh w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl ${size}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <h2
            id="modal-title"
            className="text-lg font-bold text-slate-900 sm:text-xl"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title} dialog`}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function UploadStudentWorkModal({ material, onClose, onSuccess }) {
  const [studentQuery, setStudentQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const students = getAllStudentsData();

  const suggestions = students
    .filter((record) => {
      const query = studentQuery.trim().toLowerCase();

      if (!query || selectedStudent) return false;

      const studentName = record.student?.name?.toLowerCase() || "";
      const studentId = record.student?.id?.toLowerCase() || "";

      return studentName.includes(query) || studentId.includes(query);
    })
    .slice(0, 5);

  const handleStudentChange = (event) => {
    setStudentQuery(event.target.value);
    setSelectedStudent(null);
    setShowSuggestions(true);
  };

  const handleSelectStudent = (record) => {
    const student = record.student;

    setSelectedStudent(student);
    setStudentQuery(`${student.name} (${student.id})`);
    setShowSuggestions(false);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files?.[0] || null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedStudent || !selectedFile) return;

    console.log({
      materialId: material.id,
      materialTitle: material.title,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      file: selectedFile,
    });

    onClose();
    onSuccess(`Work for "${material.title}" was uploaded successfully.`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-work-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-dvh w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h2
              id="upload-work-title"
              className="text-lg font-bold text-slate-900"
            >
              Upload Student Work
            </h2>

            <p className="mt-1 text-sm text-slate-600">{material.title}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close upload dialog"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="relative">
            <label
              htmlFor={`student-${material.id}`}
              className="block text-sm font-semibold text-slate-800"
            >
              From Student
            </label>

            <input
              id={`student-${material.id}`}
              type="text"
              value={studentQuery}
              onChange={handleStudentChange}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search by student name or ID"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showSuggestions && suggestions.length > 0}
              aria-controls={`student-suggestions-${material.id}`}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />

            {showSuggestions && suggestions.length > 0 ? (
              <div
                id={`student-suggestions-${material.id}`}
                role="listbox"
                className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
              >
                {suggestions.map((record) => {
                  const student = record.student;

                  return (
                    <button
                      key={student.id}
                      type="button"
                      role="option"
                      aria-selected={selectedStudent?.id === student.id}
                      onClick={() => handleSelectStudent(record)}
                      className="flex w-full cursor-pointer flex-col px-4 py-3 text-left transition hover:bg-orange-50 focus:bg-orange-50 focus:outline-none"
                    >
                      <span className="text-sm font-semibold text-slate-800">
                        {student.name}
                      </span>

                      <span className="mt-0.5 text-xs text-slate-500">
                        Student ID: {student.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {studentQuery && !selectedStudent && !suggestions.length ? (
              <p className="mt-2 text-xs text-red-600">
                No matching student found. Search by name or student ID.
              </p>
            ) : null}

            {selectedStudent ? (
              <p
                role="status"
                className="mt-2 text-xs font-medium text-green-700"
              >
                Selected: {selectedStudent.name}
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Select a student from the suggestions.
              </p>
            )}
          </div>

          <div className="mt-5">
            <label
              htmlFor={`student-work-${material.id}`}
              className="block text-sm font-semibold text-slate-800"
            >
              Completed Material
            </label>

            <input
              id={`student-work-${material.id}`}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              required
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-orange-700 hover:file:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <p className="mt-2 text-xs text-slate-500">
              Accepted files: PDF, PNG, JPG, and JPEG.
            </p>
          </div>

          {selectedFile ? (
            <div
              role="status"
              className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"
            >
              Selected file:{" "}
              <span className="font-semibold">{selectedFile.name}</span>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!selectedStudent || !selectedFile}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#C2570C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={16} aria-hidden="true" />
              Upload Work
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
