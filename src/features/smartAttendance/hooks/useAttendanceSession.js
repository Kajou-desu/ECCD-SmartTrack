import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { normalizeSessionResponse, sessionPollInterval } from "../utils/attendanceSession.js";

export const ATTENDANCE_SESSION_KEY = ["attendanceSession"];

// The server is the source of truth for whether attendance is running, so the
// Start/Stop button survives a refresh and stays in sync across devices.
export function useAttendanceSession() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ATTENDANCE_SESSION_KEY,
    queryFn: async () => normalizeSessionResponse(await apiClient.getAttendanceSession()),
    refetchInterval: (q) => sessionPollInterval(q.state.data),
    refetchIntervalInBackground: false,
  });

  const startMutation = useMutation({
    mutationFn: () => apiClient.startAttendanceSession(),
    onSuccess: (data) => {
      queryClient.setQueryData(ATTENDANCE_SESSION_KEY, normalizeSessionResponse(data));
    },
  });

  const stopMutation = useMutation({
    mutationFn: () => apiClient.stopAttendanceSession(),
    onSuccess: () => {
      queryClient.setQueryData(ATTENDANCE_SESSION_KEY, null);
      // Same caches useAttendance.js invalidates after a manual status change:
      // the roster and the dashboard's stat cards must reflect the closed run.
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });

  const { mutateAsync: startAsync } = startMutation;
  const { mutateAsync: stopAsync } = stopMutation;
  const start = useCallback(() => startAsync(), [startAsync]);
  const stop = useCallback(() => stopAsync(), [stopAsync]);

  return {
    session: query.data ?? null,
    isActive: Boolean(query.data),
    isLoading: query.isLoading,
    isToggling: startMutation.isPending || stopMutation.isPending,
    start,
    stop,
  };
}

export default useAttendanceSession;
