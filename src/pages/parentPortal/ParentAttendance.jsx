import { useState } from "react";
import StatCard from "@components/shared/StatCard";
import PageHeader from "@components/shared/PageHeader";
import { useParentChild } from "@hooks/useParentChild";
import useParentAttendance from "@features/attendance/hooks/useParentAttendance";
import ParentAttendanceCalendar from "@features/attendance/components/ParentAttendanceCalendar";
import ParentRecentLogs from "@features/attendance/components/ParentRecentLogs";
import {
  AttendanceLoadingState,
  AttendanceEmptyState,
  AttendanceErrorState,
} from "@features/attendance/components/ParentAttendanceStates";
import { toMonthKey } from "@utils/dateKeys";
import { Calendar, TrendingUp, AlertCircle, Users } from "lucide-react";

export default function ParentAttendance() {
  const { selectedChild } = useParentChild();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 7));
  const monthKey = toMonthKey(currentDate);
  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const {
    status,
    data: attendance,
    retry,
  } = useParentAttendance(selectedChild?.id, monthKey);

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

  if (!selectedChild) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
        <PageHeader
          title="Attendance Record"
          subtitle="Monitor your child's attendance throughout the month"
        />
        <div className="flex min-h-96 w-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-lg bg-orange-50"
            aria-hidden="true"
          >
            <Users size={32} className="text-orange-600" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No child linked to your account
          </h2>
          <p className="mt-2 max-w-sm text-sm text-slate-600">
            Contact your child's school to link their enrollment to this parent
            account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      <PageHeader
        title="Attendance Record"
        subtitle={`Monitor ${selectedChild.name}'s attendance throughout the month`}
      />

      {status === "loading" && <AttendanceLoadingState />}
      {status === "error" && <AttendanceErrorState onRetry={retry} />}
      {status === "empty" && (
        <AttendanceEmptyState
          childName={selectedChild.name}
          monthName={monthName}
        />
      )}

      {status === "success" && attendance && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              Icon={Calendar}
              label="Attendance Rate"
              value={`${attendance.stats.attendanceRate}%`}
              color="bg-emerald-100 text-emerald-600"
            />
            <StatCard
              Icon={TrendingUp}
              label="Present Days"
              value={String(attendance.stats.presentDays)}
              color="bg-blue-100 text-blue-600"
            />
            <StatCard
              Icon={AlertCircle}
              label="Absent Days"
              value={String(attendance.stats.absentDays)}
              color="bg-rose-100 text-rose-600"
            />
            <StatCard
              Icon={Calendar}
              label="Late Arrivals"
              value={String(attendance.stats.lateArrivals)}
              color="bg-amber-100 text-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ParentAttendanceCalendar
              monthDate={currentDate}
              monthName={monthName}
              daily={attendance.daily}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
            />
            <ParentRecentLogs
              logs={attendance.logs}
              childName={selectedChild.name}
              monthName={monthName}
            />
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Monthly Breakdown
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-emerald-600">
                  {attendance.stats.presentDays}
                </p>
                <p className="text-sm text-gray-600 mt-2">Days Present</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-rose-600">
                  {attendance.stats.absentDays}
                </p>
                <p className="text-sm text-gray-600 mt-2">Days Absent</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-amber-600">
                  {attendance.stats.excusedDays}
                </p>
                <p className="text-sm text-gray-600 mt-2">Excused Absences</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">
                  {attendance.stats.attendanceRate}%
                </p>
                <p className="text-sm text-gray-600 mt-2">Attendance Rate</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
