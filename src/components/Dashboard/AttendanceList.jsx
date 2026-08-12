import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { initialRecords } from "../../data/mockData.js";

// Helpers
function timeToMinutes(time) {
  if (!time) return 0;

  const [value, period] = time.trim().split(/\s+/);
  let [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }
  if (period?.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }
  if (period?.toUpperCase() === "PM" && hours !== 12) {
    hours += 12;
  }
  return hours * 60 + minutes;
}

export function AttendanceList() {
  const navigate = useNavigate();

  // Filter attendance morning to afternoon
  const [selectedPeriod, setSelectedPeriod] = useState("am");
  const filteredData = useMemo(() => {
    return initialRecords
      .filter((attendance) => {
        // Only show present records
        if (attendance.status !== "present") {
          return false;
        }
        if (selectedPeriod === "am") {
          return attendance.time?.toUpperCase().includes("AM");
        }

        if (selectedPeriod === "pm") {
          return attendance.time?.toUpperCase().includes("PM");
        }
        return true;
      })
      .sort((a, b) => timeToMinutes(b.time) - timeToMinutes(a.time));
  }, [selectedPeriod]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-gray-800 sm:text-xl">
            Today's Attendance
          </h4>

          <button
            type="button"
            onClick={() => navigate("/attendance")}
            className="flex shrink-0 items-center text-sm sm:text-xs text-[#C2570C] transition-colors hover:text-orange-800 cursor-pointer"
          >
            <span>See Attendance</span>
            <ArrowRight aria-hidden="true" className="ml-1 h-4 w-4" />
          </button>
        </div>

        {/* Filter buttons */}
        <div
          className="flex justify-center gap-2"
          role="group"
          aria-label="Attendance period"
        >
          {/* Morning */}
          <button
            type="button"
            aria-pressed={selectedPeriod === "am"}
            onClick={() => setSelectedPeriod("am")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors w-full cursor-pointer ${
              selectedPeriod === "am"
                ? "bg-[#C2570C] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            AM
          </button>
          {/* Afternoon */}
          <button
            type="button"
            aria-pressed={selectedPeriod === "pm"}
            onClick={() => setSelectedPeriod("pm")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors w-full cursor-pointer ${
              selectedPeriod === "pm"
                ? "bg-[#C2570C] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            PM
          </button>
        </div>
      </div>

      {/* Attendance item list */}
      <div
        className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-2 max-h-75 md:max-h-none
          [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
        role="list"
        aria-label="Today's present attendance records"
      >
        {filteredData.length > 0 ? (
          filteredData.map((attendance) => (
            <AttendanceListItem key={attendance.id} attendance={attendance} />
          ))
        ) : (
          <div className="flex h-24 items-center justify-center">
            <p className="text-sm italic text-gray-400">
              No present attendance records
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AttendanceListItem({ attendance }) {
  return (
    <div
      role="listitem"
      aria-label={`Present: ${attendance.name}, ${attendance.time}`}
      className="group flex items-center justify-between rounded-lg border p-3 transition-colors duration-200 bg-green-50 hover:bg-green-100 border-green-200"
    >
      {/* Student Information */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className="shrink-0 rounded-full p-2 bg-green-200"
          aria-hidden="true"
        >
          <Check className="h-4 w-4 text-green-700" />
        </div>

        <p className="min-w-0 truncate text-sm font-medium text-gray-800 transition-colors group-hover:text-green-700">
          {attendance.name}
        </p>

        <span className="sr-only">Present</span>
      </div>

      {/* Attendance Time */}
      <p className="ml-2 shrink-0 whitespace-nowrap text-xs text-gray-500">
        {attendance.time}
      </p>
    </div>
  );
}
