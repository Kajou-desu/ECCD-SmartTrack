import { AlertCircle, X } from "lucide-react";

export default function ErrorMsg({ message, onClose }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{message}</span>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss alert"
        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-amber-600 transition hover:bg-amber-100 hover:text-amber-800"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
