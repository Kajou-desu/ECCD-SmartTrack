import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";

async function fetchWeeklyGoals(weekKey, session) {
  const data = await apiClient.getWeeklyGoals(weekKey, session);
  return Array.isArray(data?.goals) ? data.goals : [];
}

export function useWeeklyGoalsQuery(weekKey, session) {
  return useQuery({
    queryKey: ["weeklyGoals", weekKey, session],
    queryFn: () => fetchWeeklyGoals(weekKey, session),
  });
}

export default useWeeklyGoalsQuery;
