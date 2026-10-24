import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";

async function fetchWeeklyGoals(weekKey) {
  const data = await apiClient.getWeeklyGoals(weekKey);
  return Array.isArray(data?.goals) ? data.goals : [];
}

export function useWeeklyGoalsQuery(weekKey) {
  return useQuery({
    queryKey: ["weeklyGoals", weekKey],
    queryFn: () => fetchWeeklyGoals(weekKey),
  });
}

export default useWeeklyGoalsQuery;
