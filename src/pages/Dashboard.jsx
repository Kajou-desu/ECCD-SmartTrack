import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@hooks/useAuth";
import { apiClient } from "@api/client.js";
import DashboardHeader from "@features/dashboard/components/DashboardHeader";
import useDashboardGreeting from "@features/dashboard/hooks/useDashboardGreeting";
import {
  STAT_CARDS,
  MAIN_CARDS,
} from "@features/dashboard/components/DashboardStats";
import { QuickActions } from "@features/dashboard/components/QuickActions";
import DashboardContentGrid from "@features/dashboard/components/DashboardContentGrid";
import StatCard from "@components/shared/StatCard";
import ErrorMsg from "@components/ui/ErrorMsg";

async function fetchDashboardStats() {
  return apiClient.getDashboardStats();
}

export default function Dashboard() {
  const { user } = useAuth();
  const { greeting, firstName, currentDateTime } = useDashboardGreeting(
    user?.name,
  );

  const { data: stats, isError, refetch } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  const showError = isError;

  return (
    <div className="min-h-0 flex flex-col gap-6 bg-[#f8f9ff] p-4 sm:p-6">
      <DashboardHeader
        greeting={greeting}
        firstName={firstName}
        currentDateTime={currentDateTime}
      />

      {showError && (
        <ErrorMsg
          message="Unable to load dashboard stats. Please try again."
          onClose={() => refetch()}
        />
      )}

      <QuickActions />

      <DashboardContentGrid
        stats={
          <>
            {STAT_CARDS.map((c) => (
              <StatCard
                key={c.key}
                Icon={c.Icon}
                label={c.label}
                value={c.value ?? stats?.[c.valueKey] ?? "--"}
                color={c.color}
              />
            ))}
          </>
        }
        cards={
          <>
            {MAIN_CARDS.map((card) => {
              const Comp = card.component;
              return (
                <div
                  key={card.key}
                  className={`lg:col-span-${card.colSpan} lg:min-h-0`}
                >
                  <Comp />
                </div>
              );
            })}
          </>
        }
      />
    </div>
  );
}
