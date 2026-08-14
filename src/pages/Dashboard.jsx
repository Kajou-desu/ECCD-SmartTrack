import useDashboardGreeting from "../features/dashboard/hooks/useDashboardGreeting";
import StatCard from "../components/shared/StatCard";
import { useAuth } from "../hooks/useAuth";
import { DASHBOARD_STATS } from "../data/mockData";
import {
  STAT_CARDS,
  MAIN_CARDS,
} from "../features/dashboard/components/DashboardStats";
import DashboardHeader from "../features/dashboard/components/DashboardHeader";
import DashboardContentGrid from "../features/dashboard/components/DashboardContentGrid";

export default function Dashboard() {
  const { user } = useAuth();
  const { greeting, firstName, currentDateTime } = useDashboardGreeting(
    user?.name,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 bg-[#f8f9ff] p-4 sm:p-6">
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
                value={c.value ?? DASHBOARD_STATS[c.valueKey] ?? "--"}
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
