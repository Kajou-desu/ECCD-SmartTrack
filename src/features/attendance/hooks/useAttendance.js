import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@api/client.js";
import { withMockFallback } from "@api/mockFallback.js"; // MOCK_FALLBACK
import { initialRecords } from "@data/mockData.js";
import { toDayKey } from "@utils/dateKeys.js";

export function useAttendance(initialDate) {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTime, setFilterTime] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(initialDate || toDayKey());
  const [savingIds, setSavingIds] = useState(() => new Set());

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchAttendance = async () => {
      setLoading(true);
      setError("");

      const mockRecords = initialRecords.filter((record) => record.date === selectedDate);

      const { data, usedMock } = await withMockFallback(
        () => apiClient.getAttendance(selectedDate, { signal: controller.signal }),
        mockRecords,
        { label: "useAttendance" },
      );

      if (!isMounted) return;

      if (usedMock) {
        setAttendanceRecords(data);
        setError("Unable to sync with server. Showing cached data.");
      } else if (Array.isArray(data)) {
        setAttendanceRecords(data);
      } else if (Array.isArray(data?.records)) {
        setAttendanceRecords(data.records);
      } else {
        setAttendanceRecords(mockRecords);
      }

      if (isMounted) setLoading(false);
    };

    fetchAttendance();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedDate]);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return attendanceRecords.filter((record) => {
      const statusMatch = filterStatus === "all" || record.status === filterStatus;
      const timeMatch = filterTime === "all" || String(record.session ?? "").toLowerCase() === filterTime;
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

      setSavingIds((current) => {
        const next = new Set(current);
        next.add(id);
        return next;
      });

      setAttendanceRecords((current) => current.map((record) => (record.id === id ? { ...record, status: nextStatus } : record)));

      try {
        await apiClient.updateAttendance(id, selectedDate, nextStatus);
      } catch (err) {
        console.error("Failed to update attendance:", err);
        if (!mountedRef.current) return;
        setAttendanceRecords(previousRecords);
        setError("Failed to save attendance. Your changes were not saved.");
      } finally {
        setSavingIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
    },
    [savingIds, attendanceRecords, selectedDate],
  );

  const handleExport = useCallback(() => {
    try {
      const escapeCsvValue = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const rows = filteredRecords.map((record) => [record.name, record.status, record.time].map(escapeCsvValue).join(","));
      const csv = ["name,status,time", ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
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
  }, [filteredRecords, selectedDate]);

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
    handleExport,
  };
}

export default useAttendance;