import formatStudentName from "@utils/formatStudentName.js";
import Avatar from "@components/shared/Avatar.jsx";
import MarkDepartedButton from "./MarkDepartedButton";
import { formatTime } from "../utils/attendanceDeparture.js";

export default function AttendanceCard({ record, onMarkStatus, onDepart, canDepart = false, isSaving }) {
  const studentName = formatStudentName(record) || "Unknown Student";
  const status = record.status || "absent";

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
        <Avatar
          src={record.photo}
          name={formatStudentName(record)}
          className="h-16 w-16 rounded-full text-xl"
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-gray-800">{studentName}</h3>
          <p className="text-sm text-gray-500">
            {record.status === "present" && record.arrivedAt
              ? `Arrived at ${new Date(record.arrivedAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}`
              : "Not arrived"}
          </p>
          {record.status === "present" && record.departedAt && (
            <p className="text-sm text-gray-500">Departed at {formatTime(record.departedAt)}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.absent}`}>{statusLabel}</span>
          {record.verified && record.status === "present" && (
            <span className="text-xs text-gray-500" title="Recorded automatically from the camera and the door tag reader">
              Verified automatically
            </span>
          )}
        </div>
      </div>

      <div className="my-5 h-px bg-gray-200" />

      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => (
          <button key={action.status} type="button" aria-label={`Mark ${studentName} ${action.status}`} onClick={() => onMarkStatus(record.id, action.status)} disabled={isSaving} className={`cursor-pointer rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${status === action.status ? actionStyles[action.status].active : actionStyles[action.status].inactive}`}>
            {isSaving ? "..." : action.label}
          </button>
        ))}
      </div>

      {canDepart && (
        <MarkDepartedButton
          studentName={studentName}
          onDepart={() => onDepart(record.id)}
          disabled={isSaving}
          className="mt-2 w-full rounded-xl px-3 py-2.5 text-xs"
        />
      )}
    </article>
  );
}
