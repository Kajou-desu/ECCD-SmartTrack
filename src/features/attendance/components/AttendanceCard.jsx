export default function AttendanceCard({ record, onMarkStatus, isSaving }) {
  const studentName = record.name || "Unknown Student";
  const status = record.status || "absent";
  const initial = studentName.charAt(0).toUpperCase();

  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  const statusStyles = {
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    excused: "bg-amber-100 text-amber-700",
  };

  const actionStyles = {
    present: { active: "bg-green-600 hover:bg-green-700", inactive: "bg-gray-400 hover:bg-gray-500" },
    absent: { active: "bg-red-600 hover:bg-red-700", inactive: "bg-gray-400 hover:bg-gray-500" },
    excused: { active: "bg-amber-600 hover:bg-amber-700", inactive: "bg-gray-400 hover:bg-gray-500" },
  };

  const actions = [
    { status: "present", label: "Present" },
    { status: "absent", label: "Absent" },
    { status: "excused", label: "Excused" },
  ];

  return (
    <article className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isSaving ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-200">
          <span className="text-xl font-bold text-gray-500">{initial}</span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-gray-800">{studentName}</h3>
          <p className="text-sm text-gray-500">Arrived at {record.time || "Not recorded"}</p>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.absent}`}>{statusLabel}</span>
      </div>

      <div className="my-5 h-px bg-gray-200" />

      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => (
          <button key={action.status} type="button" aria-label={`Mark ${studentName} ${action.status}`} onClick={() => onMarkStatus(record.id, action.status)} disabled={isSaving} className={`cursor-pointer rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${status === action.status ? actionStyles[action.status].active : actionStyles[action.status].inactive}`}>
            {isSaving ? "..." : action.label}
          </button>
        ))}
      </div>
    </article>
  );
}
