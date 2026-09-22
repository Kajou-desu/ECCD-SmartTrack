import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { MONITOR_POLL_MS } from "../utils/attendanceMonitor.js";

// Polls the live monitor while a session is running. `enabled` should be true
// only then, so nothing is fetched (or rate-limited) when attendance is idle.
export function useAttendanceMonitor(enabled) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["attendanceMonitor"],
    queryFn: () => apiClient.getAttendanceMonitor(),
    enabled,
    refetchInterval: enabled ? MONITOR_POLL_MS : false,
    refetchIntervalInBackground: false,
  });

  // When someone new is verified, the roster and dashboard counts are stale.
  const verified = query.data?.counts?.verified ?? 0;
  const previousVerified = useRef(verified);
  useEffect(() => {
    if (verified > previousVerified.current) {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    }
    previousVerified.current = verified;
  }, [verified, queryClient]);

  return {
    monitor: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export default useAttendanceMonitor;
