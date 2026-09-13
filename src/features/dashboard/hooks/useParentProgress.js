import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";

async function fetchProgressData(childId) {
    return apiClient.getChildProgress(childId);
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