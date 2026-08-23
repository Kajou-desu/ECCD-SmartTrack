export default function WeeklyGoalsCard({ goals }) {
  return (
    <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        This Week's Goals
      </h3>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800">{goal.title}</p>
              <span className="text-xs font-semibold text-gray-500">
                {goal.progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  goal.progress === 100
                    ? "bg-green-500"
                    : goal.progress > 50
                      ? "bg-orange-500"
                      : "bg-blue-500"
                }`}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{goal.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
