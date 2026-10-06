import { downloadCsv } from "@utils/exportCsv";

function getLogStyles(status) {
  if (status === "present" || status === "completed") {
    return {
      row: "bg-emerald-50 border-emerald-200",
      badge: "bg-emerald-200 text-emerald-700",
    };
  }
  if (status === "sick") {
    return {
      row: "bg-rose-50 border-rose-200",
      badge: "bg-rose-200 text-rose-700",
    };
  }
  if (status === "excused") {
    return {
      row: "bg-amber-50 border-amber-200",
      badge: "bg-amber-200 text-amber-700",
    };
  }
  if (status === "Late") {
    return {
      row: "bg-orange-50 border-orange-200",
      badge: "bg-orange-200 text-orange-700",
    };
  }
  return {
    row: "bg-gray-50 border-gray-200",
    badge: "bg-gray-200 text-gray-700",
  };
}

// The backend sends arrivedAt/departedAt (ISO timestamps), never a ready-made
// `time`; `log.time` is kept only as an override for any caller that has one.
function formatLogTime(isoValue) {
  return isoValue
    ? new Date(isoValue).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "";
}

const toFilenamePart = (value, fallback) =>
  String(value ?? "").trim().replace(/\s+/g, "_") || fallback;

export default function ParentRecentLogs({ logs, childName, monthName }) {
  const handleExport = () => {
    downloadCsv(
      // childName / monthName can be undefined while the page is still loading.
      `attendance_${toFilenamePart(childName, "child")}_${toFilenamePart(monthName, "month")}.csv`,
      ["Date", "Status", "Check-in", "Check-out"],
      logs.map((log) => [
        log.date,
        log.status ? log.status.charAt(0).toUpperCase() + log.status.slice(1) : "",
        log.time ?? formatLogTime(log.arrivedAt),
        formatLogTime(log.departedAt),
      ]),
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Recent Logs</h3>
        <button
          type="button"
          onClick={handleExport}
          className="text-sm font-semibold text-[#C2570C] hover:text-orange-800 cursor-pointer"
        >
          Export
        </button>
      </div>

      <div className="space-y-3">
        {logs.map((log, idx) => {
          const { row, badge } = getLogStyles(log.status);
          const time = log.time ?? (formatLogTime(log.arrivedAt) || "---");
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border transition ${row}`}
            >
              <div className="flex items-start justify-between">
                <p className="font-semibold text-gray-800 text-sm">
                  {log.date}
                </p>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${badge}`}
                >
                  {log.status === "completed" ? "✓ Completed" : log.status}
                </span>
              </div>
              {time !== "---" && (
                <p className="text-xs text-gray-600 mt-2">
                  <span className="font-medium">Check-in:</span> {time}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
