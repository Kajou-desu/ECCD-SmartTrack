import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toDayKey } from "@utils/dateKeys.js";
import { useAttendanceQuery } from "@features/attendance/hooks/useAttendanceQuery.js";
import { Check, ArrowRight } from "lucide-react";

function getArrivalPeriod(arrivedAt) {
  if (!arrivedAt) return null;
  return new Date(arrivedAt).getHours() < 12 ? "am" : "pm";
}

export function AttendanceList() {
  const navigate = useNavigate();

  const today = useMemo(() => toDayKey(), []);
  const { data } = useAttendanceQuery(today);
  const records = useMemo(() => data?.records ?? [], [data]);

  // Filter attendance morning to afternoon
  const [selectedPeriod, setSelectedPeriod] = useState("am");
  const filteredData = useMemo(() => {
    return records
      .filter((attendance) => {
        if (attendance.status !== "present") {
          return false;
        }
        return getArrivalPeriod(attendance.arrivedAt) === selectedPeriod;
      })
      .sort((a, b) => new Date(b.arrivedAt || 0) - new Date(a.arrivedAt || 0));
  }, [records, selectedPeriod]);

  return (
    <div className="flex min-h-0 h-full overflow-hidden flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
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
            <p className="text-sm italic text-gray-500">
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
      aria-label={`Present: ${attendance.name}, ${
        attendance.arrivedAt
          ? new Date(attendance.arrivedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
          : "time not recorded"
      }`}
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
        {attendance.arrivedAt
          ? new Date(attendance.arrivedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
          : "Not recorded"}
      </p>
    </div>
  );
}
