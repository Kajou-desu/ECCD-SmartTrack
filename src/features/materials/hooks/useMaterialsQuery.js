import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { withMockFallback } from "@api/mockFallback.js"; // MOCK_FALLBACK
import { MATERIALS_DATA } from "@data/mockData";

async function fetchMaterials() {
    const { data, usedMock } = await withMockFallback(
        () => apiClient.getMaterials(),
        MATERIALS_DATA,
        { label: "materials" },
    );

    if (usedMock) return { materials: data, usedMock: true };
    if (Array.isArray(data)) return { materials: data, usedMock: false };
    if (Array.isArray(data?.materials)) return { materials: data.materials, usedMock: false };
    return { materials: MATERIALS_DATA, usedMock: false };
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