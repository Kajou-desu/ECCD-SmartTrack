import { Loader2, Trash2, X } from "lucide-react";

export default function ConfirmDeleteModal({
  accountName,
  onConfirm,
  onClose,
  loading = false,
}) {
  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-black text-slate-800">
            Delete System Profile
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={17} />
          </button>
        </div>

        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500">
            <Trash2 size={19} />
          </div>

          <h3 className="mt-4 text-sm font-black text-slate-800">
            Permanently remove this account?
          </h3>

          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
            This will remove{" "}
            <span className="font-bold text-slate-700">{accountName}</span> from
            the system directory. This action cannot be undone.
          </p>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-xs font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}

              {loading ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
