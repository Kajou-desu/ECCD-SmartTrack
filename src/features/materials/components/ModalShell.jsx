import { X } from "lucide-react";

export function ModalShell({ title, onClose, children, size = "max-w-2xl" }) {
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
