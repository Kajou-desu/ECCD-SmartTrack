import { ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_LABEL = {
  present: "Present",
  absent: "Absent",
  excused: "Excused",
};

function getDayColor(daily, day) {
  const status = daily[day];
  if (!status) return "bg-gray-50 text-gray-500";
  if (status === "present") return "bg-emerald-100 text-emerald-700";
  if (status === "absent") return "bg-rose-100 text-rose-700";
  if (status === "excused") return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-600";
}

// A distinct shape per status (not just color) so the status is still
// distinguishable for colorblind users — green/red is a classic pairing
// that's hard to tell apart with red-green color blindness.
function StatusMarker({ status }) {
  if (status === "present") {
    return (
      <span
        aria-hidden="true"
        className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-600"
      />
    );
  }
  if (status === "absent") {
    return (
      <span
        aria-hidden="true"
        className="absolute bottom-1 right-1 h-1.5 w-1.5 bg-rose-600"
      />
    );
  }
  if (status === "excused") {
    return (
      <span
        aria-hidden="true"
        className="absolute bottom-1 right-1 h-0 w-0 border-x-4 border-x-transparent border-b-[6px] border-b-amber-600"
      />
    );
  }
  return null;
}

export default function ParentAttendanceCalendar({
  monthDate,
  monthName,
  daily,
  onPrevMonth,
  onNextMonth,
}) {
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDay = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    1,
  ).getDay();

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === monthDate.getFullYear() &&
    today.getMonth() === monthDate.getMonth();

  const days = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{monthName}</h2>
        <div className="flex gap-2">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-gray-500 uppercase py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const status = day ? daily[day] : null;
          return (
            <div
              key={idx}
              role={day ? "img" : undefined}
              aria-label={
                day
                  ? `${monthName} ${day}, ${status ? STATUS_LABEL[status] ?? status : "no record"}`
                  : undefined
              }
              className={`relative aspect-square flex items-center justify-center rounded-lg font-semibold text-sm transition ${
                day
                  ? `${getDayColor(daily, day)} ${
                      isCurrentMonth && day === today.getDate()
                        ? "ring-2 ring-orange-500"
                        : ""
                    } hover:shadow-md`
                  : "bg-transparent"
              }`}
            >
              {day || ""}
              {day && <StatusMarker status={status} />}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
          Legend
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-4 h-4 bg-emerald-100 rounded border border-emerald-300">
              <StatusMarker status="present" />
            </div>
            <span className="text-xs text-gray-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-4 h-4 bg-rose-100 rounded border border-rose-300">
              <StatusMarker status="absent" />
            </div>
            <span className="text-xs text-gray-600">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-4 h-4 bg-amber-100 rounded border border-amber-300">
              <StatusMarker status="excused" />
            </div>
            <span className="text-xs text-gray-600">Excused</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-orange-500 rounded" />
            <span className="text-xs text-gray-600">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
