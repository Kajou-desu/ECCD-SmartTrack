import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import { apiClient } from "../api/client.js";
import { initialRecords } from "../data/mockData.js";
import {
  UsersRound,
  UserCheck,
  UserX,
  Clock,
  SquareArrowRightExit,
  Calendar,
  AlertCircle,
  X,
  Search,
} from "lucide-react";

const STATUS_OPTIONS = [
  { key: "all", label: "All" },
  { key: "present", label: "Present" },
  { key: "absent", label: "Absent" },
  { key: "excused", label: "Excused" },
];

const TIME_OPTIONS = [
  { key: "all", label: "All" },
  { key: "am", label: "AM" },
  { key: "pm", label: "PM" },
];

function getLocalDateString() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().split("T")[0];
}

function escapeCsvValue(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export default function Attendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTime, setFilterTime] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(getLocalDateString);
  const [savingIds, setSavingIds] = useState(() => new Set());

  const formattedDate = useMemo(() => {
    const selectedDateObj = new Date(`${selectedDate}T00:00:00`);

    return selectedDateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [selectedDate]);

  useEffect(() => {
    let isMounted = true;

    const fetchAttendance = async () => {
      setLoading(true);
      setError("");

      const mockRecords = initialRecords.filter(
        (record) => record.date === selectedDate,
      );

      try {
        const data = await apiClient.getAttendance(selectedDate);

        if (!isMounted) return;

        if (Array.isArray(data)) {
          setAttendanceRecords(data);
        } else if (Array.isArray(data?.records)) {
          setAttendanceRecords(data.records);
        } else {
          setAttendanceRecords(mockRecords);
        }
      } catch (err) {
        console.error("Failed to fetch attendance:", err);

        if (!isMounted) return;

        setAttendanceRecords(mockRecords);
        setError("Unable to sync with server. Showing cached data.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAttendance();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return attendanceRecords.filter((record) => {
      const statusMatch =
        filterStatus === "all" || record.status === filterStatus;

      const timeMatch =
        filterTime === "all" ||
        String(record.shift ?? "").toLowerCase() === filterTime;

      const searchMatch =
        normalizedSearch === "" ||
        String(record.name ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      return statusMatch && timeMatch && searchMatch;
    });
  }, [attendanceRecords, filterStatus, filterTime, searchQuery]);

  const attendanceStats = useMemo(() => {
    return attendanceRecords.reduce(
      (stats, record) => {
        stats.total += 1;

        switch (record.status) {
          case "present":
            stats.present += 1;
            break;
          case "absent":
            stats.absent += 1;
            break;
          case "excused":
            stats.excused += 1;
            break;
          default:
            break;
        }

        return stats;
      },
      {
        total: 0,
        present: 0,
        absent: 0,
        excused: 0,
      },
    );
  }, [attendanceRecords]);

  const handleStatusChange = async (id, nextStatus) => {
    if (savingIds.has(id)) return;

    const previousRecords = attendanceRecords;

    setSavingIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });

    setAttendanceRecords((current) =>
      current.map((record) =>
        record.id === id ? { ...record, status: nextStatus } : record,
      ),
    );

    try {
      await apiClient.updateAttendance(id, selectedDate, nextStatus);
    } catch (err) {
      console.error("Failed to update attendance:", err);

      setAttendanceRecords(previousRecords);
      setError("Failed to save attendance. Your changes were not saved.");
    } finally {
      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  const handleExport = () => {
    try {
      const rows = filteredRecords.map((record) =>
        [record.name, record.status, record.time].map(escapeCsvValue).join(","),
      );

      const csv = ["name,status,time", ...rows].join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `attendance_${selectedDate}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export attendance:", err);
      setError("Failed to export attendance data.");
    }
  };

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
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-[#f8f9ff] p-6">
        <div className="text-center">
          <div className="mb-4 inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[#C2570C] border-t-transparent" />
          <p className="text-gray-600">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  if (attendanceRecords.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-6">
        {pageHeader}

        {error && <ErrorAlert message={error} onClose={() => setError("")} />}

        <div className="flex flex-1 items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white p-12">
          <div className="max-w-sm text-center">
            <UsersRound className="mx-auto mb-4 h-16 w-16 text-gray-300" />

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

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        <StatCard
          Icon={UsersRound}
          label="Total Students"
          value={String(attendanceStats.total)}
          color="bg-blue-100 text-blue-600"
        />

        <StatCard
          Icon={UserCheck}
          label="Present Today"
          value={String(attendanceStats.present)}
          color="bg-green-100 text-green-600"
        />

        <StatCard
          Icon={UserX}
          label="Absent Today"
          value={String(attendanceStats.absent)}
          color="bg-red-100 text-red-600"
        />

        <StatCard
          Icon={Clock}
          label="Excused"
          value={String(attendanceStats.excused)}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      <section className="flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            Attendance Records
          </h2>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <FilterGroup
              options={STATUS_OPTIONS}
              selectedValue={filterStatus}
              onChange={setFilterStatus}
              ariaLabel="Filter attendance by status"
            />

            <FilterGroup
              options={TIME_OPTIONS}
              selectedValue={filterTime}
              onChange={setFilterTime}
              ariaLabel="Filter attendance by time"
            />

            <div className="relative min-w-0 flex-1 sm:min-w-55 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search student..."
                aria-label="Search student by name"
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#C2570C] focus:ring-2 focus:ring-[#C2570C]/20 sm:w-55"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <AttendanceCard
                key={record.id}
                record={record}
                onMarkStatus={handleStatusChange}
                isSaving={savingIds.has(record.id)}
              />
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-gray-200 p-8 text-center">
              <Clock className="mx-auto mb-3 h-12 w-12 text-gray-300" />

              <p className="text-sm text-gray-500">
                {searchQuery
                  ? `No students found matching "${searchQuery}".`
                  : "No records match the selected filters."}
              </p>

              {(searchQuery ||
                filterStatus !== "all" ||
                filterTime !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                    setFilterTime("all");
                  }}
                  className="mt-4 cursor-pointer text-sm font-semibold text-[#C2570C] transition hover:text-[#a94709]"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

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

function FilterGroup({ options, selectedValue, onChange, ariaLabel }) {
  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold transition ${
            selectedValue === option.key
              ? "bg-[#C2570C] text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function AttendanceCard({ record, onMarkStatus, isSaving }) {
  const studentName = record.name || "Unknown Student";
  const status = record.status || "absent";
  const initial = studentName.charAt(0).toUpperCase();

  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  const statusStyles = {
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    excused: "bg-amber-100 text-amber-700",
  };

  const actionStyles = {
    present: {
      active: "bg-green-600 hover:bg-green-700",
      inactive: "bg-gray-400 hover:bg-gray-500",
    },
    absent: {
      active: "bg-red-600 hover:bg-red-700",
      inactive: "bg-gray-400 hover:bg-gray-500",
    },
    excused: {
      active: "bg-amber-600 hover:bg-amber-700",
      inactive: "bg-gray-400 hover:bg-gray-500",
    },
  };

  const actions = [
    { status: "present", label: "Present" },
    { status: "absent", label: "Absent" },
    { status: "excused", label: "Excused" },
  ];

  return (
    <article
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        isSaving ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-200">
          <span className="text-xl font-bold text-gray-500">{initial}</span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-gray-800">
            {studentName}
          </h3>

          <p className="text-sm text-gray-500">
            Arrived at {record.time || "Not recorded"}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            statusStyles[status] || statusStyles.absent
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="my-5 h-px bg-gray-200" />

      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            aria-label={`Mark ${studentName} ${action.status}`}
            onClick={() => onMarkStatus(record.id, action.status)}
            disabled={isSaving}
            className={`cursor-pointer rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              status === action.status
                ? actionStyles[action.status].active
                : actionStyles[action.status].inactive
            }`}
          >
            {isSaving ? "..." : action.label}
          </button>
        ))}
      </div>
    </article>
  );
}
