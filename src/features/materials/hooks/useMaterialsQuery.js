import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";

async function fetchMaterials() {
    const data = await apiClient.getMaterials();
    if (Array.isArray(data)) return { materials: data };
    if (Array.isArray(data?.materials)) return { materials: data.materials };
    return { materials: [] };
}

// Shared by the teacher Materials page (full CRUD) and the parent Materials
// page (read-only + per-child submissions), since both list the same
// classroom materials.
export function useMaterialsQuery() {
    return useQuery({
        queryKey: ["materials"],
        queryFn: fetchMaterials,
    });
}

export default useMaterialsQuery;