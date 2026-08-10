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
} from "lucide-react";

export default function Attendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        setLoading(true);
        setError("");
      }
    });

    const fetchAttendance = async () => {
      try {
        const data = await apiClient.getAttendance(selectedDate);
        if (!isMounted) return;

        if (Array.isArray(data)) {
          setAttendanceRecords(data);
        } else if (data?.records) {
          setAttendanceRecords(data.records);
        } else {
          setAttendanceRecords(initialRecords);
        }
      } catch (err) {
        console.error("Failed to fetch attendance:", err);
        if (!isMounted) return;

        // Use fallback data and show a warning instead of error screen
        setAttendanceRecords(initialRecords);
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
    if (filterStatus === "all") return attendanceRecords;
    return attendanceRecords.filter((record) => record.status === filterStatus);
  }, [attendanceRecords, filterStatus]);

  const presentCount = attendanceRecords.filter(
    (record) => record.status === "present",
  ).length;
  const absentCount = attendanceRecords.filter(
    (record) => record.status === "absent",
  ).length;
  const excusedCount = attendanceRecords.filter(
    (record) => record.status === "excused",
  ).length;

  const handleStatusChange = async (id, nextStatus) => {
    setSaving(id);

    const previousRecords = attendanceRecords;

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
      setSaving(null);
    }
  };

  const handleExport = () => {
    const rows = filteredRecords.map(
      (record) => `${record.name},${record.status},${record.time}`,
    );
    const csv = ["name,status,time", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-[#f8f9ff] p-6">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[#C2570C] border-t-transparent mb-4" />
          <p className="text-gray-600">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  // If no records at all (no data and no error fallback)
  if (attendanceRecords.length === 0) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Attendance Record
            </h1>
            <p className="mt-1 text-sm text-gray-600">{formattedDate}</p>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2 shadow-sm">
            <Calendar className="h-5 w-5 text-[#C2570C]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm font-medium text-gray-800 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white p-12">
          <div className="text-center max-w-sm">
            <UsersRound className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Attendance Records
            </h3>
            <p className="text-gray-500 text-sm">
              No students are enrolled yet or data is not available for this
              date.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const formattedDate = selectedDateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Attendance Record
          </h1>
          <p className="mt-1 text-sm text-gray-600">{formattedDate}</p>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2 shadow-sm">
          <Calendar className="h-5 w-5 text-[#C2570C]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm font-medium text-gray-800 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-amber-600 hover:text-amber-800 transition font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            Icon={UsersRound}
            label="Total Students"
            value={String(attendanceRecords.length)}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            Icon={UserCheck}
            label="Present Today"
            value={String(presentCount)}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            Icon={UserX}
            label="Absent Today"
            value={String(absentCount)}
            color="bg-red-100 text-red-600"
          />
          <StatCard
            Icon={Clock}
            label="Excused"
            value={String(excusedCount)}
            color="bg-orange-100 text-orange-600"
          />
        </div>
      </div>

      <div className="flex flex-col bg-white rounded-3xl p-6 gap-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-bold">Today's Attendance</h3>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
              {[
                { key: "all", label: "All" },
                { key: "present", label: "Present" },
                { key: "absent", label: "Absent" },
                { key: "excused", label: "Excused" },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setFilterStatus(option.key)}
                  aria-label={`Filter ${option.label}`}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                    filterStatus === option.key
                      ? "bg-[#C2570C] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={loading}
              className="flex shrink-0 items-center gap-2 rounded-lg p-2.5 font-semibold text-white bg-[#C2570C] transition sm:px-3 sm:gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SquareArrowRightExit className="h-5 w-5" />
              <span className="hidden sm:inline text-sm">Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <AttendanceCard
                key={record.id}
                record={record}
                onMarkStatus={handleStatusChange}
                isSaving={saving === record.id}
              />
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-gray-200 p-8 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No records match the selected filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AttendanceCard({ record, onMarkStatus, isSaving }) {
  const isPresent = record.status === "present";
  const statusLabel =
    record.status.charAt(0).toUpperCase() + record.status.slice(1);

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isSaving ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-200">
          <span className="text-xl font-bold text-gray-500">
            {record.name.charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="truncate text-lg font-semibold text-gray-800">
            {record.name}
          </h4>
          <p className="text-sm text-gray-500">Arrived at {record.time}</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isPresent
              ? "bg-green-100 text-green-700"
              : record.status === "excused"
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="my-5 h-px bg-gray-200"></div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          aria-label={`Mark ${record.name} present`}
          onClick={() => onMarkStatus(record.id, "present")}
          disabled={isSaving}
          className={`rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition ${
            isPresent
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 hover:bg-gray-500"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSaving ? "..." : "Present"}
        </button>

        <button
          type="button"
          aria-label={`Mark ${record.name} absent`}
          onClick={() => onMarkStatus(record.id, "absent")}
          disabled={isSaving}
          className={`rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition ${
            record.status === "absent"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-400 hover:bg-gray-500"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSaving ? "..." : "Absent"}
        </button>

        <button
          type="button"
          aria-label={`Mark ${record.name} excused`}
          onClick={() => onMarkStatus(record.id, "excused")}
          disabled={isSaving}
          className={`rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition ${
            record.status === "excused"
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-gray-400 hover:bg-gray-500"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSaving ? "..." : "Excused"}
        </button>
      </div>
    </div>
  );
}
