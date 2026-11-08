import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";

// The teachers a student can be moved to. Only fetched while the dialog is open.
export function useTransferTeachers(enabled) {
  return useQuery({
    queryKey: ["transferTeachers"],
    queryFn: async () => {
      const list = await apiClient.getTransferTeachers();
      return Array.isArray(list) ? list.filter((t) => t && Number.isInteger(t.id) && typeof t.name === "string") : [];
    },
    enabled,
    staleTime: 60_000,
  });
}
