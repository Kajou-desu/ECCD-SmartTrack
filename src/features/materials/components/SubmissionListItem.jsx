import { FileSearch } from "lucide-react";
import { formatSubmittedAt, getFileBadge } from "@features/materials/utils/submissions";
import formatStudentName from "@utils/formatStudentName.js";

export default function SubmissionListItem({ submission, isActive, onSelect }) {
  const displayName = formatStudentName(submission.studentName);
  const { label, isPdf } = getFileBadge(submission.fileName);
  const badgeColor = isPdf
    ? "border-rose-500 text-rose-500"
    : "border-sky-500 text-sky-600";

  return (
    <button
      type="button"
      onClick={() => onSelect(submission.id)}
      aria-current={isActive ? "true" : undefined}
      aria-label={`Preview ${displayName}'s work`}
      className={`flex w-full cursor-pointer items-center gap-4 rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-orange-400 ${
        isActive
          ? "border-orange-200 bg-[#fef2e6] shadow-sm"
          : "border-slate-100 bg-white hover:bg-slate-50"
      }`}
    >
      <span
        className={`flex h-11 w-9 shrink-0 flex-col items-center justify-center rounded border-2 bg-white ${badgeColor}`}
        aria-hidden="true"
      >
        <span className="text-[9px] font-black tracking-wider">{label}</span>
        <span className="mt-1 h-0.5 w-4 bg-current" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-slate-900">
          {displayName}
        </span>
        <span className="mt-0.5 block text-xs text-slate-500">
          Submitted: {formatSubmittedAt(submission.submittedAt)}
        </span>
        <span className="block truncate text-xs text-slate-500">
          {submission.fileName}
        </span>
      </span>

      <FileSearch size={24} className="shrink-0 text-slate-700" aria-hidden="true" />
    </button>
  );
}
