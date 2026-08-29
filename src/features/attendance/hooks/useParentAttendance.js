import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { withMockFallback } from "@api/mockFallback.js"; // MOCK_FALLBACK
import { ATTENDANCE_DATA_BY_CHILD } from "@data/mockParentData";

async function fetchAttendance(childId, monthKey) {
    const { data } = await withMockFallback(
        () => apiClient.getChildAttendance(childId, monthKey),
        ATTENDANCE_DATA_BY_CHILD[childId]?.[monthKey] ?? null,
        { label: "useParentAttendance" },
    );
    return data;
}

// Returns { status: "loading" | "empty" | "error" | "success", data, retry }
// Re-fetches whenever childId or monthKey changes (e.g. child switch, month nav).
export default function useParentAttendance(childId, monthKey) {
    const query = useQuery({
        queryKey: ["parentAttendance", childId, monthKey],
        queryFn: () => fetchAttendance(childId, monthKey),
        enabled: Boolean(childId),
    });

    let status;
    if (!childId) status = "error";
    else if (query.isPending) status = "loading";
    else if (query.isError) status = "error";
    else status = query.data ? "success" : "empty";

    return { status, data: query.data ?? null, retry: query.refetch };
}