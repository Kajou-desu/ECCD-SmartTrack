export default function RecentActivitiesCard({ activities }) {
  return (
    <div className=" bg-white rounded-3xl border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        Recent Activities
      </h3>
      <div className="space-y-4 overflow-y-auto">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-4 border border-gray-200 rounded-2xl hover:border-orange-200 hover:bg-orange-50 transition"
          >
            <div className="flex flex-col items-start justify-between mb-2">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800">
                    {activity.activity}
                  </h4>
                  <span className="text-center text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                    {activity.category}
                  </span>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  {activity.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
            </div>
            <p className="text-sm text-gray-600 italic">"{activity.notes}"</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled
        title="Full activity history is coming soon"
        aria-disabled="true"
        className="mt-4 w-full py-2 text-center text-sm font-medium text-gray-400 cursor-not-allowed"
      >
        View All Activities (coming soon)
      </button>
    </div>
  );
}
