import { X } from "lucide-react";
import Modal from "@components/ui/Modal";

// The popup that holds the account form (add and edit). The form scrolls inside
// it, so a long form (address, student picker) never pushes the page around.
export default function AccountFormModal({
  title,
  subtitle,
  onClose,
  closeOnEscape = true,
  disabled = false,
  children,
}) {
  return (
    <Modal
      onClose={disabled ? () => {} : onClose}
      closeOnEscape={closeOnEscape && !disabled}
      labelledBy="account-form-title"
      className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white shadow-2xl"
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 p-5">
        <div>
          <h2 id="account-form-title" className="text-sm font-black text-slate-800">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>}
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={disabled}
          aria-label="Close modal"
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={17} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
    </Modal>
  );
}
