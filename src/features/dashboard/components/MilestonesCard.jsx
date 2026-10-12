import { Award } from "lucide-react";
import { isNewMilestone } from "../utils/milestones.js";

// A milestone is a weekly goal the child completed (100%). Its date is the
// Monday of the goal's week ("YYYY-MM-DD"), shown as "Week of Oct 5".
function weekLabel(weekStart) {
  const date = new Date(`${weekStart}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return "";
  return `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`;
}

export default function MilestonesCard({ milestones = [], total = milestones.length, childName }) {
  const hiddenCount = Math.max(0, total - milestones.length);

  return (
    <section
      aria-labelledby="milestones-heading"
      className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600" aria-hidden="true">
          <Award className="h-5 w-5" />
        </span>
        <div>
          <h3 id="milestones-heading" className="text-lg font-bold text-gray-800">
            Milestones Reached
          </h3>
          <p className="text-xs text-gray-500">
            Goals {childName ? `${childName} has` : "completed"} reached 100% on
          </p>
        </div>
      </div>

      {milestones.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-300 p-5 text-center text-sm text-gray-600">
          No milestones yet. A goal appears here once it is completed.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {milestones.map((milestone) => (
            <li
              key={milestone.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-gray-200 p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-800">{milestone.title}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {[milestone.category, weekLabel(milestone.weekStart)].filter(Boolean).join(" · ")}
                </p>
              </div>
              {isNewMilestone(milestone.weekStart) && (
                <span className="shrink-0 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                  New
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {hiddenCount > 0 && (
        <p className="mt-3 text-xs text-gray-500">
          Showing the {milestones.length} most recent of {total} milestones.
        </p>
      )}
    </section>
  );
}
