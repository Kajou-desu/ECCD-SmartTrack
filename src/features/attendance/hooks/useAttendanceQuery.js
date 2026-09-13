import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";

async function fetchAttendanceForDate(dateKey) {
    const data = await apiClient.getAttendance(dateKey);
    if (Array.isArray(data)) return { records: data };
    if (Array.isArray(data?.records)) return { records: data.records };
    return { records: [] };
}

// Shared by the teacher Attendance page and the dashboard's "present today"
// widget — both fetch the same date's records, so caching by date means the
// dashboard and the full attendance page don't each make their own request.
export function useAttendanceQuery(dateKey) {
    return useQuery({
        queryKey: ["attendance", dateKey],
        queryFn: () => fetchAttendanceForDate(dateKey),
        enabled: Boolean(dateKey),
    });
}

export default useAttendanceQuery;