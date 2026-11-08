import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";

async function fetchMaterials(session) {
    const data = await apiClient.getMaterials({ session });
    if (Array.isArray(data)) return { materials: data };
    if (Array.isArray(data?.materials)) return { materials: data.materials };
    return { materials: [] };
}

// Shared by the teacher Materials page (full CRUD) and the parent Materials
// page (read-only + per-child submissions), since both list the same
// classroom materials. `session` ("morning" | "afternoon") is only for the
// teacher page's filter; the key stays under ["materials"] so every existing
// invalidation refreshes it too.
export function useMaterialsQuery({ session, enabled = true } = {}) {
    return useQuery({
        queryKey: session ? ["materials", { session }] : ["materials"],
        queryFn: () => fetchMaterials(session),
        enabled,
    });
}

export default useMaterialsQuery;
