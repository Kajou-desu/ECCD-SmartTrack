import { useState } from "react";
import { UserRound } from "lucide-react";
import formatDate from "@utils/formatDate";
import { formatStudentCode } from "@features/students/utils/studentCode.js";

function getStatusBadgeClass(status) {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized === "active") return "bg-green-100 text-green-700";
  if (normalized === "inactive") return "bg-gray-100 text-gray-600";
  return "bg-teal-100 text-teal-700";
}

export default function StudentProfileHeader({ student, headerAction }) {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:gap-8">
        <div className="shrink-0">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-gray-100 bg-orange-50 text-orange-700 shadow-md sm:h-32 sm:w-32">
            {student.photo && !photoFailed ? (
              <img
                src={student.photo}
                alt={`${student.name}'s profile`}
                onError={() => setPhotoFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound size={42} aria-label="No student photo" />
            )}
          </div>
        </div>

        <div className="w-full min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold text-gray-800 sm:text-3xl">
                {student.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {student.school || "N/A"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${getStatusBadgeClass(
                  student.status,
                )}`}
              >
                {student.status || "N/A"}
              </span>
              {headerAction}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Student ID" value={formatStudentCode(student)} />
            <InfoItem label="Session" value={student.session || "N/A"} />
            <InfoItem label="Teacher" value={student.teacher || "N/A"} />
            <InfoItem label="Gender" value={student.gender || "N/A"} />
            <InfoItem
              label="Birthday"
              value={student.birthday ? formatDate(student.birthday) : "N/A"}
            />
            <InfoItem label="Address" value={student.address || "N/A"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  const displayValue = value ?? "N/A";
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p
        className="mt-2 truncate font-medium text-gray-800 hover:text-clip"
        title={String(displayValue)}
      >
        {displayValue}
      </p>
    </div>
  );
}
