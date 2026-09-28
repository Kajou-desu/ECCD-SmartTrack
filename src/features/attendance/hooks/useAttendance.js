import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { toDayKey } from "@utils/dateKeys.js";
import { useAttendanceQuery } from "./useAttendanceQuery.js";
import { normalizeAttendanceTime } from "../utils/attendanceFilters.js";
import { useToast } from "@hooks/useToast.js";

export function useAttendance(initialDate) {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(initialDate || toDayKey());

  const { data: queryData, isLoading, isError } = useAttendanceQuery(selectedDate);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadedDate, setLoadedDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTime, setFilterTime] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [savingIds, setSavingIds] = useState(() => new Set());

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (queryData && loadedDate !== selectedDate) {
    setLoadedDate(selectedDate);
    setAttendanceRecords(queryData.records);
    setError("");
  }

  if (isError && loadedDate !== selectedDate && !error) {
    setError("Unable to load attendance for this date. Please try again.");
  }

  const loading = isLoading || (loadedDate !== selectedDate && !isError);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return attendanceRecords.filter((record) => {
      const statusMatch = filterStatus === "all" || record.status === filterStatus;
      const timeMatch = filterTime === "all" || normalizeAttendanceTime(record.session) === filterTime;
      const searchMatch = normalizedSearch === "" || String(record.name ?? "").toLowerCase().includes(normalizedSearch);
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
      { total: 0, present: 0, absent: 0, excused: 0 },
    );
  }, [attendanceRecords]);

  const handleStatusChange = useCallback(
    async (id, nextStatus) => {
      if (savingIds.has(id)) return;

      const previousRecords = attendanceRecords;
      const studentName = previousRecords.find((record) => record.id === id)?.name;

      setSavingIds((current) => {
        const next = new Set(current);
        next.add(id);
        return next;
      });

      setAttendanceRecords((current) => current.map((record) => (record.id === id ? { ...record, status: nextStatus, verified: false, departedAt: null } : record)));

      try {
        await apiClient.updateAttendance(id, selectedDate, nextStatus);
        // The Dashboard's "Today's Attendance" widget reads ["attendance", date]
        // from the same cache, and the stat cards read ["dashboardStats"] — both
        // need to be invalidated or a manual status change here won't show up
        // there until the cache's staleTime naturally expires.
        queryClient.invalidateQueries({ queryKey: ["attendance", selectedDate] });
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
        showToast("success", `${studentName || "Attendance"} status was updated.`);
      } catch (err) {
        console.error("Failed to update attendance:", err);
        if (!mountedRef.current) return;
        setAttendanceRecords(previousRecords);
        setError("Failed to save attendance. Your changes were not saved.");
        showToast("error", "Failed to save attendance. Your changes were not saved.");
      } finally {
        setSavingIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
    },
    [savingIds, attendanceRecords, selectedDate, queryClient, showToast],
  );

  // Marks a present student departed (today only — the server rejects other
  // days, and the button isn't offered for them). Same optimistic-update /
  // rollback shape as handleStatusChange; the server also notifies the parents.
  const handleDepart = useCallback(
    async (id) => {
      if (savingIds.has(id)) return;

      const previousRecords = attendanceRecords;
      const studentName = previousRecords.find((record) => record.id === id)?.name;

      setSavingIds((current) => new Set(current).add(id));
      setAttendanceRecords((current) => current.map((record) => (record.id === id ? { ...record, departedAt: new Date().toISOString() } : record)));

      try {
        await apiClient.markDeparted(id);
        queryClient.invalidateQueries({ queryKey: ["attendance", selectedDate] });
        showToast("success", `${studentName || "Student"} was marked departed.`);
      } catch (err) {
        console.error("Failed to mark departed:", err);
        if (!mountedRef.current) return;
        setAttendanceRecords(previousRecords);
        setError("Failed to mark departure. The student was not marked departed.");
        showToast("error", "Failed to mark departure. The student was not marked departed.");
      } finally {
        setSavingIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
    },
    [savingIds, attendanceRecords, selectedDate, queryClient, showToast],
  );

  const handleExport = useCallback(() => {
    try {
      const escapeCsvValue = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const rows = filteredRecords.map((record) => [record.name, record.status, record.arrivedAt].map(escapeCsvValue).join(","));
      const csv = ["name,status,arrivedAt", ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_${selectedDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("success", "Attendance data was exported.");
    } catch (err) {
      console.error("Failed to export attendance:", err);
      setError("Failed to export attendance data.");
      showToast("error", "Failed to export attendance data.");
    }
  }, [filteredRecords, selectedDate, showToast]);

  return {
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
    handleDepart,
    todayKey: toDayKey(),
    handleExport,
  };
}

export default useAttendance;