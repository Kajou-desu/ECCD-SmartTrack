import { Pencil, Trash2, Users } from "lucide-react";

function classAverage(students) {
  if (!students?.length) return 0;
  const total = students.reduce((sum, s) => sum + s.progress, 0);
  return Math.round(total / students.length);
}

export default function GoalCard({ goal, onGrade, onEdit, onDelete }) {
  const average = classAverage(goal.students);
  const gradedCount = goal.students?.filter((s) => s.progress > 0).length ?? 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {goal.category && (
            <span className="inline-block rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#C2570C]">
              {goal.category}
            </span>
          )}
          <h3 className="mt-2 text-lg font-bold text-gray-800">{goal.title}</h3>
          {goal.description && (
            <p className="mt-1 text-sm text-gray-600">{goal.description}</p>
          )}
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            aria-label="Edit goal"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal)}
            aria-label="Delete goal"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Class average</span>
          <span className="font-semibold text-gray-500">{average}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all duration-300 ${
              average === 100 ? "bg-green-500" : average > 50 ? "bg-orange-500" : "bg-blue-500"
            }`}
            style={{ width: `${average}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users size={14} />
          {gradedCount} of {goal.students?.length ?? 0} graded
        </span>

        <button
          type="button"
          onClick={() => onGrade(goal)}
          className="cursor-pointer rounded-lg bg-[#C2570C]/10 px-3 py-1.5 text-sm font-semibold text-[#C2570C] transition hover:bg-[#C2570C]/20"
        >
          Grade Class
        </button>
      </div>
    </div>
  );
}
