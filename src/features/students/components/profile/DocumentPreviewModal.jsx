import { CheckCircle2, FileText, X } from "lucide-react";
import Modal from "@components/ui/Modal";
import { getFileExtension } from "@features/materials/utils/fileValidation";

export default function DocumentPreviewModal({
  fileName,
  fileUrl,
  verified = false,
  onClose,
  footer,
}) {
  const extension = getFileExtension(fileName);
  const isPdf = extension === ".pdf";

  return (
    <Modal onClose={onClose} labelledBy="document-preview-title">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5">
        <div className="flex min-w-0 items-center gap-2">
          <h2
            id="document-preview-title"
            className="truncate text-lg font-bold text-slate-900"
          >
            {fileName}
          </h2>
          {verified && (
            <CheckCircle2
              size={18}
              className="shrink-0 text-green-600"
              aria-label="Document verified"
            />
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-50 p-4">
        {fileUrl ? (
          isPdf ? (
            <iframe
              src={fileUrl}
              title={fileName}
              className="h-[70vh] w-full rounded-lg border border-slate-200 bg-white"
            />
          ) : (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <FileText size={40} className="text-slate-300" />
            <p className="text-sm text-slate-500">
              Preview not available for this document.
            </p>
          </div>
        )}
      </div>

      {footer && (
        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 p-4">
          {footer}
        </div>
      )}
    </Modal>
  );
}
