import Modal from "@components/ui/Modal";
import { Loader2, Trash2 } from "lucide-react";
import { formatUsDate } from "@utils/usDate.js";

// Asks before attendance records are deleted. `count` is how many records the
// server found for the selected students on `date`, which can be fewer than the
// students selected (a student with no record yet has nothing to delete).
export default function DeleteAttendanceDialog({ date, students, count, busy, onConfirm, onCancel }) {
  return (
    <Modal onClose={busy ? () => {} : onCancel} labelledBy="delete-attendance-title">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50" aria-hidden="true">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <div>
            <h2 id="delete-attendance-title" className="text-base font-bold text-slate-900">
              Delete attendance records?
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {count} attendance record(s) for {students} selected student(s) on {formatUsDate(date)} will be
              permanently deleted. Those students will show as not recorded for that day. This can't be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={busy} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy && <Loader2 aria-hidden="true" size={15} className="animate-spin" />}
            {busy ? "Deleting..." : "Delete records"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
