import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export function NotificationModal({
  title = "Notification",
  message,
  onClose,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="presentation"
      onMouseDown={onClose}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="flex min-w-0 gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50"
              aria-hidden="true"
            >
              <Info size={20} className="text-blue-600" />
            </div>

            <div>
              <h2
                id="notification-title"
                className="text-base font-bold text-slate-900"
              >
                {title}
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}

export function Toast({ type = "success", message, onClose }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [onClose]);

  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={`fixed bottom-4 right-4 z-70 flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-xl border p-4 shadow-xl ${
        isError ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isError ? "bg-red-100" : "bg-green-100"
        }`}
        aria-hidden="true"
      >
        {isError ? (
          <AlertCircle size={20} className="text-red-600" />
        ) : (
          <CheckCircle2 size={20} className="text-green-600" />
        )}
      </div>

      <p
        className={`flex-1 pt-1 text-sm font-medium ${
          isError ? "text-red-800" : "text-green-800"
        }`}
      >
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-400 ${
          isError
            ? "text-red-500 hover:bg-red-100"
            : "text-green-600 hover:bg-green-100"
        }`}
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
