import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { useToast } from "@hooks/useToast.js";
import Modal from "@components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import { FileText, Upload, X } from "lucide-react";
import { formatFileSize, isFileSizeValid, isPdfFile, MAX_MATERIAL_FILE_SIZE_BYTES } from "@features/materials/utils/fileValidation.js";

// A blank/placeholder theme (see dashboard.controller.js's getDailyTheme
// fallback) has title "No theme set for today" and every other field
// empty — that's not something to prefill into an edit form.
const PLACEHOLDER_TITLE = "No theme set for today";

export default function EditDailyThemeModal({ theme, onCancel, onConfirm }) {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const { data: materialData, isLoading: materialsLoading } = useQuery({
    queryKey: ["materials"],
    queryFn: () => apiClient.getMaterials(),
  });
  const materials = Array.isArray(materialData)
    ? materialData
    : Array.isArray(materialData?.materials)
      ? materialData.materials
      : [];
  const isPlaceholder = !theme || theme.title === PLACEHOLDER_TITLE;

  const [letter, setLetter] = useState(isPlaceholder ? "" : theme.letter || "");
  const [label, setLabel] = useState(isPlaceholder ? "" : theme.label || "");
  const [subtitle, setSubtitle] = useState(isPlaceholder ? "" : theme.subtitle || "");
  const [title, setTitle] = useState(isPlaceholder ? "" : theme.title || "");
  const [description, setDescription] = useState(isPlaceholder ? "" : theme.description || "");
  const [objectivesText, setObjectivesText] = useState(
    isPlaceholder ? "" : (theme.objectives ?? []).join("\n"),
  );
  const initialMaterialId = theme?.materialId ?? theme?.material?.id;
  const [materialMode, setMaterialMode] = useState(initialMaterialId ? "existing" : "none");
  const [materialId, setMaterialId] = useState(initialMaterialId ? String(initialMaterialId) : "");
  const [newMaterial, setNewMaterial] = useState({ title: "", category: "", description: "", file: null });
  const [materialError, setMaterialError] = useState("");
  const [isCreatingMaterial, setIsCreatingMaterial] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const objectives = objectivesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    onConfirm({
      letter: letter.trim(),
      label: label.trim(),
      subtitle: subtitle.trim(),
      title: title.trim(),
      description: description.trim(),
      objectives,
      materialId: materialMode === "existing" && materialId ? Number(materialId) : null,
    });
  };

  const handleCreateMaterial = async () => {
    if (!newMaterial.title.trim() || !newMaterial.category.trim() || !newMaterial.description.trim()) {
      setMaterialError("Enter a title, category, and description for the activity.");
      return;
    }
    if (!newMaterial.file) {
      setMaterialError("Choose a PDF activity file.");
      return;
    }
    if (!isPdfFile(newMaterial.file) || !isFileSizeValid(newMaterial.file, MAX_MATERIAL_FILE_SIZE_BYTES)) {
      setMaterialError(`Choose a PDF file up to ${formatFileSize(MAX_MATERIAL_FILE_SIZE_BYTES)}.`);
      return;
    }

    setMaterialError("");
    setIsCreatingMaterial(true);
    try {
      const created = await apiClient.createMaterial(newMaterial);
      await queryClient.invalidateQueries({ queryKey: ["materials"] });
      setMaterialId(String(created.id));
      setMaterialMode("existing");
      setNewMaterial({ title: "", category: "", description: "", file: null });
      showToast("success", "Activity material was created.");
    } catch (error) {
      const message = error.message || "Could not create the activity material.";
      setMaterialError(message);
      showToast("error", message);
    } finally {
      setIsCreatingMaterial(false);
    }
  };

  return (
    <Modal onClose={onCancel} labelledBy="daily-theme-form-title">
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 id="daily-theme-form-title" className="text-base font-bold text-slate-900">
              Today's Theme
            </h2>
            <p className="mt-1 text-sm text-slate-600">Set or edit today's lesson theme.</p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close modal"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="theme-letter" className="mb-2 block text-sm font-semibold text-slate-700">
                Letter
                <span className="text-red-600">*</span>
              </label>
              <input
                id="theme-letter"
                type="text"
                value={letter}
                onChange={(event) => setLetter(event.target.value)}
                placeholder="A"
                required
                maxLength={10}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label htmlFor="theme-label" className="mb-2 block text-sm font-semibold text-slate-700">
                Label
                <span className="text-red-600">*</span>
              </label>
              <input
                id="theme-label"
                type="text"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Apple"
                required
                maxLength={100}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="theme-subtitle" className="mb-2 block text-sm font-semibold text-slate-700">
              Subtitle
            </label>
            <input
              id="theme-subtitle"
              type="text"
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              placeholder="e.g. Fruits we eat"
              maxLength={200}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label htmlFor="theme-title" className="mb-2 block text-sm font-semibold text-slate-700">
              Lesson Title
              <span className="text-red-600">*</span>
            </label>
            <input
              id="theme-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Letter A Day"
              required
              maxLength={200}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label htmlFor="theme-description" className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              id="theme-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What will the class explore today?"
              rows={3}
              maxLength={2000}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label htmlFor="theme-objectives" className="mb-2 block text-sm font-semibold text-slate-700">
              Objectives
            </label>
            <textarea
              id="theme-objectives"
              value={objectivesText}
              onChange={(event) => setObjectivesText(event.target.value)}
              placeholder={"One objective per line, e.g.\nRecognize the letter A\nName 3 fruits"}
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            <p className="mt-1 text-xs text-slate-500">One objective per line.</p>
          </div>

          <fieldset className="space-y-3 border-t border-slate-200 pt-5">
            <legend className="mb-3 text-sm font-semibold text-slate-700">Activity material</legend>
            <div className="flex flex-wrap gap-4 text-sm">
              {[
                ["none", "No material"],
                ["existing", "Select existing"],
                ["new", "Upload new"],
              ].map(([value, text]) => (
                <label key={value} className="flex cursor-pointer items-center gap-2 text-slate-700">
                  <input
                    type="radio"
                    name="theme-material-mode"
                    value={value}
                    checked={materialMode === value}
                    onChange={() => {
                      setMaterialMode(value);
                      setMaterialError("");
                    }}
                    className="accent-orange-600"
                  />
                  {text}
                </label>
              ))}
            </div>

            {materialMode === "existing" && (
              <div>
                <label htmlFor="theme-material" className="mb-2 block text-sm font-medium text-slate-700">
                  Choose activity
                </label>
                <select
                  id="theme-material"
                  value={materialId}
                  onChange={(event) => setMaterialId(event.target.value)}
                  required
                  disabled={materialsLoading}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">{materialsLoading ? "Loading materials..." : "Select a material"}</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>{material.title}</option>
                  ))}
                </select>
                {!materialsLoading && materials.length === 0 && (
                  <p className="mt-1 text-xs text-slate-500">No materials yet. Upload a new activity instead.</p>
                )}
              </div>
            )}

            {materialMode === "new" && (
              <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                <input
                  aria-label="Activity title"
                  value={newMaterial.title}
                  onChange={(event) => setNewMaterial({ ...newMaterial, title: event.target.value })}
                  placeholder="Activity title"
                  maxLength={200}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                <input
                  aria-label="Activity category"
                  value={newMaterial.category}
                  onChange={(event) => setNewMaterial({ ...newMaterial, category: event.target.value })}
                  placeholder="Category, e.g. Literacy"
                  maxLength={100}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                <textarea
                  aria-label="Activity description"
                  value={newMaterial.description}
                  onChange={(event) => setNewMaterial({ ...newMaterial, description: event.target.value })}
                  placeholder="Activity description"
                  rows={2}
                  maxLength={2000}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <FileText size={18} />
                  <span className="min-w-0 flex-1 truncate">{newMaterial.file?.name || "Choose PDF activity"}</span>
                  <Upload size={16} />
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(event) => setNewMaterial({ ...newMaterial, file: event.target.files?.[0] ?? null })}
                    className="sr-only"
                  />
                </label>
                <SecondaryButton
                  label={isCreatingMaterial ? "Uploading..." : "Create activity material"}
                  type="button"
                  onClick={handleCreateMaterial}
                  disabled={isCreatingMaterial}
                />
              </div>
            )}
            {materialError && <p role="alert" className="text-sm text-red-600">{materialError}</p>}
          </fieldset>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 p-4">
          <SecondaryButton label="Cancel" type="button" onClick={onCancel} />
          <PrimaryButton label="Save Theme" type="submit" />
        </div>
      </form>
    </Modal>
  );
}
