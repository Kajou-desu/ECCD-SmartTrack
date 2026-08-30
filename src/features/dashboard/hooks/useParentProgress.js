import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { withMockFallback } from "@api/mockFallback.js"; // MOCK_FALLBACK
import { PROGRESS_DATA_BY_CHILD } from "@data/mockParentData";

async function fetchProgressData(childId) {
    const { data } = await withMockFallback(
        () => apiClient.getChildProgress(childId),
        PROGRESS_DATA_BY_CHILD[childId] ?? null,
        { label: "useParentProgress" },
    );
    return data;
}

// Returns { status: "loading" | "empty" | "error" | "success", data, retry }
export default function useParentProgress(childId) {
    const query = useQuery({
        queryKey: ["parentProgress", childId],
        queryFn: () => fetchProgressData(childId),
        enabled: Boolean(childId),
    });

    let status;
    if (!childId) status = "error";
    else if (query.isPending) status = "loading";
    else if (query.isError) status = "error";
    else status = query.data ? "success" : "empty";

    return { status, data: query.data ?? null, retry: query.refetch };
}