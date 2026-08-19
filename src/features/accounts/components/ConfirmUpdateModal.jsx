import { Loader2, Pencil, X } from "lucide-react";

export default function ConfirmUpdateModal({
  onConfirm,
  onClose,
  loading = false,
}) {
  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-black text-slate-800">
            Confirm Account Changes
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-100 bg-amber-50 text-amber-500">
            <Pencil size={19} />
          </div>

          <h3 className="mt-4 text-sm font-black text-slate-800">
            Update this account?
          </h3>

          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
            The selected profile details and role assignment will be updated.
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}

              {loading ? "Updating..." : "Confirm Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
