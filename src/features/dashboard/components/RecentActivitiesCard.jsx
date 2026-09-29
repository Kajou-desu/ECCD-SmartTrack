import { Link } from "react-router-dom";
import { Calendar, ExternalLink } from "lucide-react";

function formatSubmittedDate(activity) {
  const parsed = activity.submittedAt ? new Date(activity.submittedAt) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return activity.date ?? null;
}

// Only ever open http(s) links returned by the API.
function isSafeUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

export default function RecentActivitiesCard({ activities }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white rounded-3xl border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        Recent Activities
      </h3>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        {activities.map((activity) => {
          const submitted = formatSubmittedDate(activity);

          return (
            <div
              key={activity.id}
              className="p-4 border border-gray-200 rounded-2xl hover:border-orange-200 hover:bg-orange-50 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-gray-800">
                    {activity.activity}
                  </h4>
                  <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                    {activity.category}
                  </span>
                </div>
                <span className="shrink-0 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full capitalize">
                  {activity.status}
                </span>
              </div>

              {submitted && (
                <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={12} aria-hidden="true" />
                  Submitted {submitted}
                </p>
              )}

              {isSafeUrl(activity.fileUrl) && (
                <a
                  href={activity.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`See completed work for ${activity.activity}`}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
                >
                  See Completed Work
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      <Link
        to="/parent/materials"
        className="mt-4 w-full shrink-0 border-t border-gray-100 pt-3 text-center text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
      >
        View All Activities
      </Link>
    </div>
  );
}
