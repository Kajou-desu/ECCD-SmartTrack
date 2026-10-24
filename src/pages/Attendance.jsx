import { useMemo, useState } from "react";
import useAttendance from "@features/attendance/hooks/useAttendance";
import AttendanceControls from "@features/attendance/components/AttendanceControls";
import AttendanceStats from "@features/attendance/components/AttendanceStats";
import AttendanceList from "@features/attendance/components/AttendanceList";
import AttendancePeriodTable from "@features/attendance/components/AttendancePeriodTable";
import AttendanceLoadingState from "@features/attendance/components/AttendanceLoadingState";
import AttendanceEmptyState from "@features/attendance/components/AttendanceEmptyState";
import ErrorMsg from "@components/ui/ErrorMsg";
import { PrimaryButton } from "@components/ui/Button";
import ImportAttendanceModal from "@features/attendance/components/ImportAttendanceModal";
import { Calendar, Download, Upload } from "lucide-react";

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
    handlePickUp,
    todayKey,
    handleExport,
    exportingRange,
    handleExportRange,
    refreshAttendance,
    period,
    setPeriod,
    periodTable,
    rangeLoading,
    rangeError,
  } = useAttendance();
  const [importOpen, setImportOpen] = useState(false);

  const formattedDate = useMemo(() => {
    if (!selectedDate) return "Select a date";

    const date = new Date(`${selectedDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    if (period === "month") {
      return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long" }).format(date);
    }

    if (period === "week" && periodTable) {
      const format = (dateKey) =>
        new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return `Week of ${format(periodTable.range.from)} – ${format(periodTable.range.to)}`;
    }

    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }, [selectedDate, period, periodTable]);

  const pageHeader = (
    <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Attendance Record
        </h1>

        <p className="mt-1 text-sm text-gray-600">{formattedDate}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm sm:w-auto">
          <Calendar className="h-5 w-5 shrink-0 text-[#C2570C]" />

          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-gray-800 outline-none sm:flex-none"
            aria-label="Select attendance date"
          />
        </div>

        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          aria-label="Attendance period"
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-800 shadow-sm"
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>

        <PrimaryButton
          icon={<Download className="h-5 w-5" />}
          label={exportingRange ? "Exporting..." : "Export"}
          onClick={period === "day" ? handleExport : handleExportRange}
          disabled={period === "day" ? filteredRecords.length === 0 : exportingRange}
          ariaLabel="Export Attendance Data"
        />

        <PrimaryButton
          icon={<Upload className="h-5 w-5" />}
          label="Import CSV"
          onClick={() => setImportOpen(true)}
          ariaLabel="Import Attendance from CSV"
        />
      </div>

      {importOpen && (
        <ImportAttendanceModal
          onCancel={() => setImportOpen(false)}
          onImported={() => refreshAttendance()}
        />
      )}
    </header>
  );

  if (loading) {
    return <AttendanceLoadingState />;
  }

  if (attendanceRecords.length === 0) {
    return (
      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto bg-[#f8f9ff] p-4 sm:p-6">
        {pageHeader}

        {error && <ErrorMsg message={error} onClose={() => setError("")} />}

        <section className="flex flex-1 items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white p-6 sm:p-12">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100" />

            <h2 className="mb-2 text-base font-semibold text-gray-700">
              No Attendance Records
            </h2>

            <p className="text-sm leading-6 text-gray-500">
              No students are enrolled yet or attendance data is not available
              for this date.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto bg-[#f8f9ff] p-4 sm:p-6">
      {pageHeader}

      {error && <ErrorMsg message={error} onClose={() => setError("")} />}

      {period === "day" && <AttendanceStats attendanceStats={attendanceStats} />}

      <section className="flex min-w-0 flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h2 className="text-base font-bold text-gray-800">
            {period === "week" ? "Weekly Attendance" : period === "month" ? "Monthly Attendance" : "Attendance Records"}
          </h2>

          <div className="min-w-0 w-full xl:w-auto">
            <AttendanceControls
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterTime={filterTime}
              setFilterTime={setFilterTime}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showStatusFilter={period === "day"}
            />
          </div>
        </div>

        {period === "day" ? (
          <AttendanceList
            filteredRecords={filteredRecords}
            handleStatusChange={handleStatusChange}
            handlePickUp={handlePickUp}
            selectedDate={selectedDate}
            todayKey={todayKey}
            savingIds={savingIds}
            searchQuery={searchQuery}
          />
        ) : rangeLoading ? (
          <p className="py-10 text-center text-sm text-gray-500" role="status">
            Loading attendance...
          </p>
        ) : rangeError ? (
          <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {rangeError}
          </p>
        ) : periodTable.rows.length === 0 ? (
          <AttendanceEmptyState searchQuery={searchQuery} />
        ) : (
          <AttendancePeriodTable table={periodTable} period={period} caption={formattedDate} />
        )}
      </section>
    </main>
  );
}
