export function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6">
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-4 text-sm text-gray-600">{message}</p>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
            Cancel
          </button>

          <button type="button" onClick={onConfirm} className="rounded-lg bg-[#C2570C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a94709]">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
