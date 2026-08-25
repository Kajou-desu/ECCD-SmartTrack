import { useState } from "react";
import Modal from "@components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import { isAllowedStudentWorkFile } from "@features/materials/utils/fileValidation";
import { FileText, Upload, X } from "lucide-react";

export default function UploadDocumentModal({ onCancel, onSave }) {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";
    if (!selectedFile) return;

    if (!isAllowedStudentWorkFile(selectedFile)) {
      setFileError("Only PDF, PNG, and JPEG files are accepted.");
      return;
    }

    setFileError("");
    setFile(selectedFile);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!file) {
      setFileError("Please choose a file to upload.");
      return;
    }
    onSave({
      id: `doc-${Date.now()}`,
      name: file.name,
      verified: false,
    });
  };

  return (
    <Modal onClose={onCancel} labelledBy="upload-document-title">
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2
              id="upload-document-title"
              className="text-lg font-bold text-slate-900"
            >
              Upload Document
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Add a birth certificate, immunization record, or enrollment form.
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

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <label
            htmlFor="upload-document-file"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            File
          </label>
          <input
            id="upload-document-file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() =>
              document.getElementById("upload-document-file")?.click()
            }
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
                {file?.name || "Choose a file"}
              </p>
              <p className="text-xs text-slate-500">PDF, PNG, or JPEG</p>
            </div>
          </button>

          {fileError && (
            <p role="alert" className="text-xs text-red-600">
              {fileError}
            </p>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 p-4">
          <SecondaryButton label="Cancel" type="button" onClick={onCancel} />
          <PrimaryButton label="Upload" type="submit" />
        </div>
      </form>
    </Modal>
  );
}
