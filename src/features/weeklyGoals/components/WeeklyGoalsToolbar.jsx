import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PrimaryButton } from "@components/ui/Button";
import { formatWeekRange } from "../utils/week.js";

export default function WeeklyGoalsToolbar({
  weekStart,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  onAddGoal,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPreviousWeek}
          aria-label="Previous week"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={onCurrentWeek}
          className="min-w-40 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
          title="Jump to current week"
        >
          {formatWeekRange(weekStart)}
        </button>

        <button
          type="button"
          onClick={onNextWeek}
          aria-label="Next week"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <PrimaryButton icon={<Plus size={18} />} label="Add Goal" onClick={onAddGoal} />
    </div>
  );
}
