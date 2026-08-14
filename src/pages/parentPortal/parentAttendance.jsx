import { useState, useMemo } from "react";
import StatCard from "../../components/shared/StatCard";
import { ATTENDANCE_DATA } from "../../data/mockParentData";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function ParentAttendance() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 7));
  const attendanceData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const monthKey = `${year}-${month}`;

    return ATTENDANCE_DATA[monthKey] || ATTENDANCE_DATA["2026-08"];
  }, [currentDate]);

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const getDayColor = (day) => {
    const status = attendanceData.daily[day];
    if (!status) return "bg-gray-50 text-gray-400";
    if (status === "present") return "bg-emerald-100 text-emerald-700";
    if (status === "absent") return "bg-rose-100 text-rose-700";
    if (status === "excused") return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-600";
  };

  const getDayBorder = (day) => {
    // Highlight today's date based on currentDate context
    const today = currentDate.getDate();
    if (day === today) return "ring-2 ring-orange-500";
    return "";
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Attendance Record</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor your child's attendance throughout the month
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          Icon={Calendar}
          label="Attendance Rate"
          value={`${attendanceData.stats.attendanceRate}%`}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          Icon={TrendingUp}
          label="Present Days"
          value={String(attendanceData.stats.presentDays)}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          Icon={AlertCircle}
          label="Absent Days"
          value={String(attendanceData.stats.absentDays)}
          color="bg-rose-100 text-rose-600"
        />
        <StatCard
          Icon={Calendar}
          label="Late Arrivals"
          value={String(attendanceData.stats.lateArrivals)}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{monthName}</h2>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-300 rounded-lg transition cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-300 rounded-lg transition cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
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

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square flex items-center justify-center rounded-lg font-semibold text-sm transition ${
                  day
                    ? `${getDayColor(day)} ${getDayBorder(day)} hover:shadow-md`
                    : "bg-transparent"
                }`}
              >
                {day || ""}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
              Legend
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-100 rounded border border-emerald-300"></div>
                <span className="text-xs text-gray-600">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-rose-100 rounded border border-rose-300"></div>
                <span className="text-xs text-gray-600">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-100 rounded border border-amber-300"></div>
                <span className="text-xs text-gray-600">Excused</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border-2 border-orange-500 rounded"></div>
                <span className="text-xs text-gray-600">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Recent Logs</h3>
            <button className="text-sm font-semibold text-[#C2570C] hover:text-orange-800 cursor-pointer">
              Export
            </button>
          </div>

          <div className="space-y-3">
            {attendanceData.logs.map((log, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border transition ${
                  log.status === "present" || log.status === "completed"
                    ? "bg-emerald-50 border-emerald-200"
                    : log.status === "sick"
                      ? "bg-rose-50 border-rose-200"
                      : log.status === "excused"
                        ? "bg-amber-50 border-amber-200"
                        : log.status === "Late"
                          ? "bg-orange-50 border-orange-200"
                          : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {log.date}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      log.status === "present" || log.status === "completed"
                        ? "bg-emerald-200 text-emerald-700"
                        : log.status === "sick"
                          ? "bg-rose-200 text-rose-700"
                          : log.status === "excused"
                            ? "bg-amber-200 text-amber-700"
                            : log.status === "Late"
                              ? "bg-orange-200 text-orange-700"
                              : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {log.status === "completed" ? "✓ Completed" : log.status}
                  </span>
                </div>
                {log.time !== "---" && (
                  <p className="text-xs text-gray-600 mt-2">
                    <span className="font-medium">Check-in:</span> {log.time}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Monthly Breakdown
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-emerald-600">
              {attendanceData.stats.presentDays}
            </p>
            <p className="text-sm text-gray-600 mt-2">Days Present</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-rose-600">
              {attendanceData.stats.absentDays}
            </p>
            <p className="text-sm text-gray-600 mt-2">Days Absent</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-600">
              {attendanceData.stats.excusedDays}
            </p>
            <p className="text-sm text-gray-600 mt-2">Excused Absences</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">
              {attendanceData.stats.attendanceRate}%
            </p>
            <p className="text-sm text-gray-600 mt-2">Attendance Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
