import { useEffect, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../../components/ui/Button";

export function EditMaterial({ material, onCancel, onConfirm }) {
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState(material.title || "");
  const [description, setDescription] = useState(material.description || "");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const handleSubmit = (event) => {
    event.preventDefault();

    onConfirm({
      ...material,
      title: title.trim(),
      description: description.trim(),
      file: file || material.file,
    });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) setFile(selectedFile);
  };

  return (
    <div
      role="presentation"
      onClick={onCancel}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4"
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-material-title"
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2
              id="edit-material-title"
              className="text-lg font-bold text-slate-900"
            >
              Edit Material
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Update the learning material details.
            </p>
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

        <div className="space-y-5 p-5">
          <div>
            <label
              htmlFor="material-file"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              File
            </label>

            <input
              ref={fileInputRef}
              id="material-file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 p-3 text-left transition hover:border-orange-400 hover:bg-orange-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                {file ? (
                  <Upload className="h-5 w-5 text-orange-500" />
                ) : (
                  <FileText className="h-5 w-5 text-slate-500" />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {file?.name || material.fileName || "Current PDF file"}
                </p>

                <p className="text-xs text-slate-500">
                  Click to replace the file
                </p>
              </div>
            </button>
          </div>

          <div>
            <label
              htmlFor="material-title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Title
            </label>

            <input
              id="material-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter material title"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="material-description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Description
            </label>

            <textarea
              id="material-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Enter material description"
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 p-4">
          <SecondaryButton label="Cancel" type="button" onClick={onCancel} />

          <PrimaryButton label="Save Changes" type="submit" />
        </div>
      </form>
    </div>
  );
}
