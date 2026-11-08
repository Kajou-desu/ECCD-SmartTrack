import { CircleCheck, DoorOpen, EyeOff } from "lucide-react";
import formatStudentName from "@utils/formatStudentName.js";
import MarkPickedUpButton from "@features/attendance/components/MarkPickedUpButton";
import { formatArrivalTime } from "../utils/attendanceMonitor.js";
import { PRESENCE_LABELS, presenceCounts } from "../utils/presentStudents.js";

const CHIP = {
  inside: { style: "bg-green-100 text-green-700", Icon: CircleCheck },
  not_detected: { style: "bg-amber-100 text-amber-800", Icon: EyeOff },
  picked_up: { style: "bg-slate-100 text-slate-700", Icon: DoorOpen },
};

// Everyone marked present today and where they are now, refreshed with the live
// monitor. "Mark Picked Up" is offered only for Not Detected rows: a student the
// cameras and tags still see is inside, and one already picked up is done.
// `detectionActive` false means the camera or tag reader is down, so nobody can
// be called Not Detected right now.
export default function PresentStudentsTable({ students = [], detectionActive = true, busyIds, onMarkPickedUp }) {
  const counts = presenceCounts(students);

  return (
    <section aria-label="Present students" className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-semibold text-gray-800">Present students</h2>
      <p className="mt-1 text-sm text-gray-600">
        {counts.inside} inside, {counts.not_detected} not detected, {counts.picked_up} picked up
      </p>

      {!detectionActive && (
        <p role="status" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          The camera or the tag reader is offline, so students can't be checked right now. Nobody is shown as Not Detected until both are back.
        </p>
      )}

      {students.length === 0 ? (
        <p className="mt-6 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-gray-500">
          Nobody is marked present yet today.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <caption className="sr-only">Students marked present today and whether they are still inside</caption>
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <th scope="col" className="py-2 pr-3 font-semibold">Student</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Arrived</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Status</th>
                <th scope="col" className="py-2 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => {
                const { style, Icon } = CHIP[student.status] ?? CHIP.inside;
                const name = formatStudentName(student);
                return (
                  <tr key={student.studentId}>
                    <th scope="row" className="py-3 pr-3 font-medium text-gray-800">{name}</th>
                    <td className="py-3 pr-3 text-gray-600">{student.arrivedAt ? formatArrivalTime(student.arrivedAt) : "—"}</td>
                    <td className="py-3 pr-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
                        <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                        {PRESENCE_LABELS[student.status] ?? PRESENCE_LABELS.inside}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {student.status === "not_detected" && (
                        <MarkPickedUpButton
                          studentName={name}
                          onPickUp={() => onMarkPickedUp(student)}
                          disabled={busyIds?.has(student.studentId)}
                          className="rounded-lg px-3 py-1.5 text-xs"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
