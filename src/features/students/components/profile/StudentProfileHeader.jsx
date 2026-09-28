import { useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  GraduationCap,
  MapPin,
  UserRound,
  UsersRound,
} from "lucide-react";
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
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md">
      <div className="h-2 bg-[#C2570C]" aria-hidden="true" />
      <div className="p-5 sm:p-7 lg:p-8">
        <div className="flex flex-col items-start gap-6 md:flex-row md:gap-7">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-[1.25rem] bg-orange-100" aria-hidden="true" />
            <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-orange-50 text-orange-700 shadow-sm sm:h-32 sm:w-32">
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#C2570C]">
                Student profile
              </p>
              <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {student.name}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <GraduationCap size={16} className="shrink-0 text-slate-400" />
                <span className="truncate">{student.school || "School not assigned"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:pt-1">
              <span
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold capitalize shadow-sm ${getStatusBadgeClass(
                    student.status,
                )}`}
              >
                {student.status || "N/A"}
              </span>
              {headerAction}
            </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <InfoItem icon={ClipboardList} label="Student ID" value={formatStudentCode(student)} />
            <InfoItem icon={UsersRound} label="Session" value={student.session || "N/A"} />
            <InfoItem icon={GraduationCap} label="Teacher" value={student.teacher || "N/A"} />
            <InfoItem icon={MapPin} label="Teacher Center" value={student.teacherCenterLocation || "N/A"} />
            <InfoItem icon={UserRound} label="Gender" value={student.gender || "N/A"} />
            <InfoItem
              icon={CalendarDays}
              label="Birthday"
              value={student.birthday ? formatDate(student.birthday) : "N/A"}
            />
            <InfoItem icon={MapPin} label="Address" value={student.address || "N/A"} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  const displayValue = value ?? "N/A";
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#C2570C] shadow-sm">
        <Icon size={16} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {label}
        </p>
        <p
          className="mt-1 truncate text-sm font-semibold text-slate-800 hover:text-clip"
          title={String(displayValue)}
        >
          {displayValue}
        </p>
      </div>
    </div>
  );
}
