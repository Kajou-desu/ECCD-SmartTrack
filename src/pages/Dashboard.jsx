import { useEffect, useState } from "react";
import { useAuth } from "@hooks/useAuth";
import { apiClient } from "@api/client.js";
import { withMockFallback } from "@api/mockFallback.js"; // MOCK_FALLBACK
import { DASHBOARD_STATS } from "@data/mockData";
import DashboardHeader from "@features/dashboard/components/DashboardHeader";
import useDashboardGreeting from "@features/dashboard/hooks/useDashboardGreeting";
import {
  STAT_CARDS,
  MAIN_CARDS,
} from "@features/dashboard/components/DashboardStats";
import DashboardContentGrid from "@features/dashboard/components/DashboardContentGrid";
import StatCard from "@components/shared/StatCard";

export default function Dashboard() {
  const { user } = useAuth();
  const { greeting, firstName, currentDateTime } = useDashboardGreeting(
    user?.name,
  );

  const [stats, setStats] = useState(DASHBOARD_STATS);

  useEffect(() => {
    let isMounted = true;

    withMockFallback(() => apiClient.getDashboardStats(), DASHBOARD_STATS, {
      label: "Dashboard",
    }).then(({ data }) => {
      if (!isMounted) return;
      setStats(data ?? DASHBOARD_STATS);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-0 flex flex-col gap-6 bg-[#f8f9ff] p-4 sm:p-6">
      <DashboardHeader
        greeting={greeting}
        firstName={firstName}
        currentDateTime={currentDateTime}
      />

      <DashboardContentGrid
        stats={
          <>
            {STAT_CARDS.map((c) => (
              <StatCard
                key={c.key}
                Icon={c.Icon}
                label={c.label}
                value={c.value ?? stats[c.valueKey] ?? "--"}
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
