import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";

async function fetchAttendanceRange(from, to) {
  const data = await apiClient.getAttendanceRange(from, to);
  return Array.isArray(data?.records) ? data.records : [];
}

// Recorded attendance for the week/month tables. `enabled` is false in the day
// view, so nothing is requested until a week or month is chosen.
export function useAttendanceRangeQuery(range, enabled) {
  return useQuery({
    queryKey: ["attendanceRange", range.from, range.to],
    queryFn: () => fetchAttendanceRange(range.from, range.to),
    enabled,
  });
}

export default useAttendanceRangeQuery;
