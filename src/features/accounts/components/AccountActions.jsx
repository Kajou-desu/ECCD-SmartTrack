import { Eye, Pencil, Trash2 } from "lucide-react";
import { getAccountId } from "../utils/accountUtils.js";

export default function AccountActions({
  account,
  onView,
  onEdit,
  onDelete,
  disabled = false,
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => onView(account)}
        disabled={disabled}
        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Eye size={13} />
        View
      </button>

      <button
        type="button"
        onClick={() => onEdit(account)}
        disabled={disabled}
        className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-600 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Pencil size={13} />
        Edit
      </button>

      <button
        type="button"
        onClick={() => onDelete(account)}
        disabled={disabled || !getAccountId(account)}
        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={13} />
        Remove
      </button>
    </div>
  );
}
