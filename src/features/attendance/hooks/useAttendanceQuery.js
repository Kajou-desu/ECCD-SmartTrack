import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { withMockFallback } from "@api/mockFallback.js"; // MOCK_FALLBACK
import { initialRecords } from "@data/mockData.js";

async function fetchAttendanceForDate(dateKey) {
    const mockValue = initialRecords.filter((record) => record.date === dateKey);

    const { data, usedMock } = await withMockFallback(
        () => apiClient.getAttendance(dateKey),
        mockValue,
        { label: "attendance" },
    );

    if (usedMock) return { records: data, usedMock: true };
    if (Array.isArray(data)) return { records: data, usedMock: false };
    if (Array.isArray(data?.records)) return { records: data.records, usedMock: false };
    return { records: mockValue, usedMock: false };
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