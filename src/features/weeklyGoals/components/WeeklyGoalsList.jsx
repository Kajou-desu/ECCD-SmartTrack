import GoalCard from "./GoalCard";
import WeeklyGoalsEmptyState from "./WeeklyGoalsEmptyState";

export default function WeeklyGoalsList({ goals, onGrade, onEdit, onDelete, onAddGoal }) {
  if (goals.length === 0) {
    return <WeeklyGoalsEmptyState onAddGoal={onAddGoal} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} onGrade={onGrade} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
