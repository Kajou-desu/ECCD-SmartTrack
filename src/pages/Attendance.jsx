import { useMemo } from "react";
import useAttendance from "../features/attendance/hooks/useAttendance";
import AttendanceControls from "../features/attendance/components/AttendanceControls";
import AttendanceStats from "../features/attendance/components/AttendanceStats";
import AttendanceList from "../features/attendance/components/AttendanceList";
import AttendanceLoadingState from "../features/attendance/components/AttendanceLoadingState";
import { AlertCircle, X, Calendar, SquareArrowRightExit } from "lucide-react";

export default function Attendance() {
  const {
    attendanceRecords,
    filteredRecords,
    attendanceStats,
    filterStatus,
    setFilterStatus,
    filterTime,
    setFilterTime,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    setError,
    selectedDate,
    setSelectedDate,
    savingIds,
    handleStatusChange,
    handleExport,
  } = useAttendance();

  const formattedDate = useMemo(() => {
    const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
    return selectedDateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [selectedDate]);

  // Header (title + date + actions)
  const pageHeader = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Attendance Record
        </h1>
        <p className="mt-1 text-sm text-gray-600">{formattedDate}</p>
      </div>

      <div className="flex flex-wrap items-center justify-start gap-3 sm:justify-center">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
          <Calendar className="h-5 w-5 shrink-0 text-[#C2570C]" />

          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="bg-transparent text-sm font-medium text-gray-800 outline-none"
            aria-label="Select attendance date"
          />
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={filteredRecords.length === 0}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-[#C2570C] p-2.5 font-semibold text-white transition hover:bg-[#a94709] disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
        >
          <SquareArrowRightExit className="h-5 w-5" />
          <span className="text-sm">Export</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <AttendanceLoadingState />;
  }

  if (attendanceRecords.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-6">
        {pageHeader}

        {error && <ErrorAlert message={error} onClose={() => setError("")} />}

        <div className="flex flex-1 items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white p-12">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100" />

            <h3 className="mb-2 text-lg font-semibold text-gray-600">
              No Attendance Records
            </h3>

            <p className="text-sm text-gray-500">
              No students are enrolled yet or attendance data is not available
              for this date.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-6">
      {pageHeader}

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}

      <AttendanceStats attendanceStats={attendanceStats} />

      {/* Main Section for records */}
      <section className="flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            Attendance Records
          </h2>

          <div className="w-full xl:w-auto">
            <AttendanceControls
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterTime={filterTime}
              setFilterTime={setFilterTime}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </div>

        <AttendanceList
          filteredRecords={filteredRecords}
          handleStatusChange={handleStatusChange}
          savingIds={savingIds}
          searchQuery={searchQuery}
        />
      </section>
    </div>
  );
}

// Error Message
function ErrorAlert({ message, onClose }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{message}</span>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss alert"
        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-amber-600 transition hover:bg-amber-100 hover:text-amber-800"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
