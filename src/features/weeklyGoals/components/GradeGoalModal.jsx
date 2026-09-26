import { useMemo, useState } from "react";
import Modal from "@components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@components/ui/Button";
import SearchInput from "@components/ui/SearchInput";
import { X } from "lucide-react";

const STATUS_PRESETS = ["Not started", "In progress", "Almost there", "Mastered"];

export default function GradeGoalModal({ goal, onCancel, onConfirm }) {
  const [rows, setRows] = useState(() =>
    goal.students.map((s) => ({ studentId: s.studentId, name: s.name, progress: s.progress, status: s.status })),
  );
  const [search, setSearch] = useState("");

  const updateRow = (studentId, patch) => {
    setRows((prev) => prev.map((row) => (row.studentId === studentId ? { ...row, ...patch } : row)));
  };

  const handleProgressChange = (studentId, value) => {
    const progress = Math.min(100, Math.max(0, Number(value) || 0));
    updateRow(studentId, { progress });
  };

  const filteredRows = useMemo(
    () => rows.filter((row) => row.name.toLowerCase().includes(search.trim().toLowerCase())),
    [rows, search],
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm(rows.map(({ studentId, progress, status }) => ({ studentId, progress, status })));
  };

  return (
    <Modal
      onClose={onCancel}
      labelledBy="grade-goal-title"
      className="w-full max-w-2xl max-h-[90vh] rounded-xl bg-white shadow-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 id="grade-goal-title" className="text-lg font-bold text-slate-900">
              Grade Class — {goal.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">Set each student's progress toward this goal.</p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close modal"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="shrink-0 border-b border-slate-200 p-4">
          <SearchInput
            id="grade-goal-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student..."
            ariaLabel="Search student by name"
          />
        </div>

        <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
          {filteredRows.length === 0 && (
            <p className="p-5 text-center text-sm text-slate-500">No students match "{search}".</p>
          )}

          {filteredRows.map((row) => (
            <div key={row.studentId} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
              <p className="min-w-0 shrink-0 text-sm font-semibold text-slate-800 sm:w-40">{row.name}</p>

              <div className="flex flex-1 items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={row.progress}
                  onChange={(event) => handleProgressChange(row.studentId, event.target.value)}
                  aria-label={`${row.name} progress`}
                  className="h-2 flex-1 cursor-pointer accent-[#C2570C]"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={row.progress}
                  onChange={(event) => handleProgressChange(row.studentId, event.target.value)}
                  aria-label={`${row.name} progress percent`}
                  className="w-16 shrink-0 rounded-lg border border-slate-300 px-2 py-1.5 text-right text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                <span className="shrink-0 text-sm text-slate-500">%</span>
              </div>

              <select
                value={row.status}
                onChange={(event) => updateRow(row.studentId, { status: event.target.value })}
                aria-label={`${row.name} status`}
                className="shrink-0 rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                {STATUS_PRESETS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 p-4">
          <SecondaryButton label="Cancel" type="button" onClick={onCancel} />
          <PrimaryButton label="Save Progress" type="submit" />
        </div>
      </form>
    </Modal>
  );
}
