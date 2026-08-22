import { useRef, useState } from "react";
import Modal from "@components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import { isPdfFile } from "@features/materials/utils/fileValidation";
import { FileText, Upload, X } from "lucide-react";

export default function AddMaterial({ onCancel, onConfirm }) {
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!file) {
      setFileError("Please choose a PDF file.");
      fileInputRef.current?.click();
      return;
    }

    onConfirm({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      file,
    });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!isPdfFile(selectedFile)) {
      event.target.value = "";
      setFileError("Only PDF files are supported.");
      return;
    }

    setFileError("");
    setFile(selectedFile);
  };

  return (
    <Modal onClose={onCancel} labelledBy="add-material-title">
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2
              id="add-material-title"
              className="text-lg font-bold text-slate-900"
            >
              Add Material
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Add new learning materials.
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

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <div>
            <label
              htmlFor="material-file"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              File
              <span className="text-red-600">*</span>
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
                  {file?.name || "Choose a PDF file"}
                </p>

                <p className="text-xs text-slate-500">PDF files only</p>
              </div>
            </button>

            {fileError && (
              <p role="alert" className="mt-2 text-xs text-red-600">
                {fileError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="material-title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Title
              <span className="text-red-600">*</span>
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
              htmlFor="material-category"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Category
              <span className="text-red-600">*</span>
            </label>

            <input
              id="material-category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Enter material category"
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
              <span className="text-red-600">*</span>
            </label>

            <textarea
              id="material-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Enter material description"
              rows={4}
              required
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 p-4">
          <SecondaryButton label="Cancel" type="button" onClick={onCancel} />
          <PrimaryButton label="Add Material" type="submit" />
        </div>
      </form>
    </Modal>
  );
}
