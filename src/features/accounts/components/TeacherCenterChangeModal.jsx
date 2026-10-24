import { useState } from "react";
import { Loader2, X } from "lucide-react";

import { useEscapeKey } from "@hooks/useEscapeKey.js";

import { getAccountId, getAccountName } from "../utils/accountUtils.js";

// Shown when an Admin moves a Teacher to another center while students are
// enrolled with them. The students either stay with the Teacher (and, with
// their families, follow to the new center) or are handed to another teacher
// at the current center. Nothing is preselected: the Admin must choose.
export default function TeacherCenterChangeModal({
  teacherName,
  enrolled,
  oldCenterName,
  newCenterName,
  candidates = [],
  loading = false,
  onConfirm,
  onClose,
}) {
  const [action, setAction] = useState("");
  const [newTeacherId, setNewTeacherId] = useState("");

  useEscapeKey(() => {
    if (!loading) onClose();
  });

  const canTransfer = candidates.length > 0;
  const ready = action === "move" || (action === "transfer" && newTeacherId !== "");
  const studentsLabel = `${enrolled} enrolled student${enrolled === 1 ? "" : "s"}`;

  const submit = (event) => {
    event.preventDefault();
    if (!ready || loading) return;
    onConfirm({ studentAction: action, newTeacherId: action === "transfer" ? newTeacherId : "" });
  };

  const optionClass = (active, disabled) =>
    `flex items-start gap-3 rounded-xl border p-3 text-left transition ${
      disabled
        ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
        : active
          ? "cursor-pointer border-amber-400 bg-amber-50"
          : "cursor-pointer border-slate-200 hover:bg-slate-50"
    }`;

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="teacher-center-change-title"
        onSubmit={submit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 id="teacher-center-change-title" className="text-sm font-black text-slate-800">
            Change Teacher&apos;s Center
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

        <p className="text-xs font-medium leading-relaxed text-slate-600">
          <span className="font-bold text-slate-800">{teacherName}</span> is moving from{" "}
          <span className="font-bold text-slate-800">{oldCenterName}</span> to{" "}
          <span className="font-bold text-slate-800">{newCenterName}</span> and has {studentsLabel}. What should happen
          to them?
        </p>

        <fieldset className="mt-4 space-y-2" disabled={loading}>
          <legend className="sr-only">What happens to the enrolled students</legend>

          <label className={optionClass(action === "move", false)}>
            <input
              type="radio"
              name="studentAction"
              value="move"
              checked={action === "move"}
              onChange={() => setAction("move")}
              className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
            />
            <span className="min-w-0">
              <span className="block text-xs font-bold text-slate-800">Stay with this teacher</span>
              <span className="block text-xs text-slate-500">
                The students and their parent/guardian accounts move to {newCenterName} too.
              </span>
            </span>
          </label>

          <label className={optionClass(action === "transfer", !canTransfer)}>
            <input
              type="radio"
              name="studentAction"
              value="transfer"
              checked={action === "transfer"}
              onChange={() => setAction("transfer")}
              disabled={!canTransfer}
              className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-slate-800">Transfer to another teacher</span>
              <span className="block text-xs text-slate-500">
                {canTransfer
                  ? `All ${studentsLabel} go to one teacher who stays at ${oldCenterName}.`
                  : `There is no other active teacher at ${oldCenterName} to take them over.`}
              </span>

              {canTransfer && action === "transfer" && (
                <select
                  value={newTeacherId}
                  onChange={(event) => setNewTeacherId(event.target.value)}
                  aria-label="New teacher"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                >
                  <option value="">Select a teacher</option>
                  {candidates.map((teacher) => (
                    <option key={getAccountId(teacher)} value={String(getAccountId(teacher))}>
                      {getAccountName(teacher)}
                    </option>
                  ))}
                </select>
              )}
            </span>
          </label>
        </fieldset>

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
            type="submit"
            disabled={!ready || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}

            {loading ? "Updating..." : "Confirm Update"}
          </button>
        </div>
      </form>
    </div>
  );
}
