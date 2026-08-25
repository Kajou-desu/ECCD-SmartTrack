import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";

export default function AttendanceSummaryCard({ stats, monthName }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Attendance Summary</h2>
        <Link
          to="/parent/attendance"
          className="text-sm font-semibold text-[#C2570C] hover:text-orange-700"
        >
          View Full Attendance →
        </Link>
      </div>

      {stats ? (
        <>
          <p className="text-xs text-gray-500 mb-4">{monthName}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat
              label="Rate"
              value={`${stats.attendanceRate}%`}
              color="text-emerald-600"
            />
            <Stat
              label="Present"
              value={stats.presentDays}
              color="text-blue-600"
            />
            <Stat
              label="Absent"
              value={stats.absentDays}
              color="text-rose-600"
            />
            <Stat
              label="Late"
              value={stats.lateArrivals}
              color="text-amber-600"
            />
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
          <CalendarCheck size={28} className="text-gray-400 shrink-0" />
          <p className="text-sm text-gray-500">
            No attendance recorded for {monthName} yet.
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
