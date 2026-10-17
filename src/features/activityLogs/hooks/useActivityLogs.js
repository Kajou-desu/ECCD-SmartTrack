import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { buildLogQuery } from "../utils/activityLogs.js";

// One page of the activity log. The previous page stays on screen while the
// next one loads, so paging and filtering don't flash an empty table.
export function useActivityLogs(filters, page) {
  return useQuery({
    queryKey: ["activity-logs", filters, page],
    queryFn: () => apiClient.getActivityLogs(buildLogQuery(filters, page)),
    placeholderData: (previous) => previous,
  });
}

export default useActivityLogs;
