import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client.js";
import { initialRecords } from "../data/mockData.js";
import StatCard from "../components/StatCard";
import { UsersRound, UserCheck, UserX, CalendarCheck } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" },
];

const getTodayDate = () => {
  const today = new Date();

  return today.toISOString().split("T")[0];
};

const formatDate = (date) => {
  const dateObject = new Date(`${date}T00:00:00`);

  return dateObject.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const formattedDate = formatDate(selectedDate);

  const filteredRecords = useMemo(() => {
    if (filterStatus === "all") {
      return attendanceRecords;
    }

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

  useEffect(() => {
    let isMounted = true;

    const fetchAttendance = async () => {
      setError("");

      try {
        const data = await apiClient.getAttendance(selectedDate);

        if (!isMounted) {
          return;
        }

        setAttendanceRecords(data);
      } catch (error) {
        console.error(error);

        if (!isMounted) {
          return;
        }

        setAttendanceRecords(initialRecords);
        setError(
          "Unable to load attendance from the server. Showing mock data.",
        );
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

  const handleDateChange = (event) => {
    const nextDate = event.target.value;

    setSelectedDate(nextDate);
    setAttendanceRecords([]);
    setLoading(true);
    setError("");
    setFilterStatus("all");
  };

  const handleStatusChange = async (id, nextStatus) => {
    const previousRecords = attendanceRecords;

    setSavingId(id);
    setError("");

    setAttendanceRecords((current) =>
      current.map((record) =>
        record.id === id ? { ...record, status: nextStatus } : record,
      ),
    );

    try {
      await apiClient.updateAttendance(id, {
        status: nextStatus,
        date: selectedDate,
      });
    } catch (error) {
      console.error(error);

      setAttendanceRecords(previousRecords);
      setError("Unable to update attendance. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden bg-[#f8f9ff] p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Attendance
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Loading attendance records...
          </p>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!attendanceRecords.length) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden bg-[#f8f9ff] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Attendance
            </h1>

            <p className="mt-2 text-sm text-gray-600">{formattedDate}</p>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="attendance-date"
              className="text-sm font-medium text-gray-700"
            >
              Date
            </label>

            <input
              id="attendance-date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-[#C2570C] focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
            {error}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <div className="text-center">
            <p className="font-medium text-gray-700">
              No attendance records found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              There are no attendance records for {formattedDate}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden bg-[#f8f9ff] p-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Attendance
          </h1>

          <p className="mt-2 text-sm text-gray-600">{formattedDate}</p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="attendance-date"
            className="text-sm font-medium text-gray-700"
          >
            Date
          </label>

          <input
            id="attendance-date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-[#C2570C] focus:ring-2 focus:ring-orange-100"
          />
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {error}
        </div>
      ) : null}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={attendanceRecords.length}
          Icon={UsersRound}
          color="bg-blue-100 text-blue-600"
        />

        <StatCard
          label="Present"
          value={presentCount}
          Icon={UserCheck}
          color="bg-green-100 text-green-600"
        />

        <StatCard
          label="Absent"
          value={absentCount}
          Icon={UserX}
          color="bg-red-100 text-red-600"
        />

        <StatCard
          label="Excused"
          value={excusedCount}
          Icon={CalendarCheck}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Attendance records */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Filter */}
        <div className="flex shrink-0 flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">Attendance Records</h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredRecords.length}{" "}
              {filteredRecords.length === 1 ? "record" : "records"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterStatus === "all"
                  ? "bg-[#C2570C] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>

            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilterStatus(option.value)}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filterStatus === option.value
                    ? "bg-[#C2570C] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Records */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {filteredRecords.length ? (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <AttendanceCard
                  key={record.id}
                  record={record}
                  onMarkStatus={handleStatusChange}
                  isSaving={savingId === record.id}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-32 items-center justify-center">
              <p className="text-sm italic text-gray-400">
                No {filterStatus} attendance records found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AttendanceCard({ record, onMarkStatus, isSaving }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={record.photo || "https://placehold.co/48x48"}
          alt={record.name}
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-800">
            {record.name}
          </p>

          {record.studentId ? (
            <p className="mt-1 text-xs text-gray-500">
              Student ID: {record.studentId}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => {
          const isSelected = record.status === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={isSaving}
              onClick={() => onMarkStatus(record.id, option.value)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? "bg-[#C2570C] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isSaving && isSelected ? "Saving..." : option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
