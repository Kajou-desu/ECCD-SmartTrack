import formatStudentName from "@utils/formatStudentName.js";

import { CircleCheck, Clock } from "lucide-react";
import { formatArrivalTime, statusLabel } from "../utils/attendanceMonitor.js";

const CHIP = {
  verified: { style: "bg-green-100 text-green-700", Icon: CircleCheck },
  face_only: { style: "bg-amber-100 text-amber-700", Icon: Clock },
  ble_only: { style: "bg-amber-100 text-amber-700", Icon: Clock },
};

export default function AttendanceStudentList({ students = [], counts }) {
  const waiting = (counts?.faceOnly ?? 0) + (counts?.bleOnly ?? 0);

  return (
    <section aria-label="Arrivals" className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-semibold text-gray-800">Arrivals</h2>
      <p className="mt-1 text-sm text-gray-600">
        {counts?.verified ?? 0} marked present, {waiting} waiting for a second check
      </p>

      {students.length === 0 ? (
        <p className="mt-6 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-gray-500">
          Nobody yet. Students appear here as the camera and the door tag reader pick them up.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100">
          {students.map((student) => {
            const { style, Icon } = CHIP[student.status] ?? CHIP.ble_only;
            return (
              <li key={student.studentId} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-800">{formatStudentName(student)}</p>
                  {student.verifiedAt && (
                    <p className="text-xs text-gray-500">Arrived at {formatArrivalTime(student.verifiedAt)}</p>
                  )}
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {statusLabel(student.status)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
