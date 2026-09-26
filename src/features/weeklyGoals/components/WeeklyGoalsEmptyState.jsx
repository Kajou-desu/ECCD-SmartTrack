import { PrimaryButton } from "@components/ui/Button";
import { Plus, Target } from "lucide-react";

export default function WeeklyGoalsEmptyState({ onAddGoal }) {
  return (
    <section className="flex min-h-96 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-lg bg-orange-50"
        aria-hidden="true"
      >
        <Target size={32} className="text-orange-600" />
      </div>

      <h2 className="mt-4 text-lg font-bold text-slate-900">No goals set for this week</h2>

      <p className="my-4 max-w-sm text-sm text-slate-600">
        Add a goal to start tracking this class's progress for the week.
      </p>

      <PrimaryButton icon={<Plus size={18} aria-hidden="true" />} label="Add Goal" onClick={onAddGoal} />
    </section>
  );
}
