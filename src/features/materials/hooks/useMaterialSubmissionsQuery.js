import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";

// File URLs in this response are signed and expire after an hour, so the data
// is never served from cache (staleTime/gcTime 0: every visit fetches fresh
// links) and is renewed before a long-open page can outlive them.
const REFRESH_BEFORE_URLS_EXPIRE_MS = 45 * 60_000;

export function useMaterialSubmissionsQuery(materialId) {
  return useQuery({
    queryKey: ["material-submissions", materialId],
    queryFn: ({ signal }) => apiClient.getMaterialSubmissions(materialId, { signal }),
    staleTime: 0,
    gcTime: 0,
    refetchInterval: REFRESH_BEFORE_URLS_EXPIRE_MS,
  });
}

export default useMaterialSubmissionsQuery;
