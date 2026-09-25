import { useAuth } from "@hooks/useAuth";
import { useParentChild } from "@hooks/useParentChild";
import useDashboardGreeting from "@features/dashboard/hooks/useDashboardGreeting";
import useParentProgress from "@features/dashboard/hooks/useParentProgress";
import DashboardHeader from "@features/dashboard/components/DashboardHeader";
import ChildOverviewCard from "@features/dashboard/components/ChildOverviewCard";
import WeeklyGoalsCard from "@features/dashboard/components/WeeklyGoalsCard";
import RecentActivitiesCard from "@features/dashboard/components/RecentActivitiesCard";
import { EventCard } from "@features/dashboard/components/EventCard";
import {
  ProgressLoadingState,
  ProgressEmptyState,
  ProgressErrorState,
} from "@features/dashboard/components/ParentProgressStates";
import StatCard from "@components/shared/StatCard";
import { LOCATION_CONFIG } from "@constants/location";
import { TrendingUp, BookUser, CalendarDays, Award, Users } from "lucide-react";
import formatStudentName from "@utils/formatStudentName.js";

export default function ParentDashboard() {
  const { user } = useAuth();
  const { selectedChild } = useParentChild();
  const { greeting, firstName, currentDateTime } = useDashboardGreeting(
    user?.name,
  );
  const {
    status,
    data: progress,
    retry,
  } = useParentProgress(selectedChild?.id);

  // No child linked to this account — clear empty state per instructions §1.2.
  if (!selectedChild) {
    return (
      <div className="min-h-[calc(100vh-75px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
        <DashboardHeader
          greeting={greeting}
          firstName={firstName}
          currentDateTime={currentDateTime}
        />
        <div className="flex min-h-96 w-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-lg bg-orange-50"
            aria-hidden="true"
          >
            <Users size={32} className="text-orange-600" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No child linked to your account
          </h2>
          <p className="mt-2 max-w-sm text-sm text-slate-600">
            Contact your child's school to link their enrollment to this parent
            account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-75px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      <DashboardHeader
        greeting={greeting}
        firstName={firstName}
        currentDateTime={currentDateTime}
        subtitle={`Here's ${formatStudentName(selectedChild)}'s progress at ${LOCATION_CONFIG.name}`}
      />

      <ChildOverviewCard child={selectedChild} />

      {status === "loading" && <ProgressLoadingState />}
      {status === "error" && <ProgressErrorState onRetry={retry} />}
      {status === "empty" && (
        <ProgressEmptyState childName={formatStudentName(selectedChild)} />
      )}

      {status === "success" && progress && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              Icon={Award}
              label="Milestones Achieved"
              value={String(progress.milestones)}
              color="bg-purple-100 text-purple-600"
            />
            <StatCard
              Icon={TrendingUp}
              label="Attendance Rate"
              value={progress.attendance}
              color="bg-green-100 text-green-600"
            />
            <StatCard
              Icon={BookUser}
              label="Activities Completed"
              value={String(progress.activityCount)}
              color="bg-blue-100 text-blue-600"
            />
            <StatCard
              Icon={CalendarDays}
              label="School Days"
              value={String(progress.schoolDays)}
              color="bg-orange-100 text-orange-600"
            />
          </div>

          <div className="lg:h-125 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <WeeklyGoalsCard goals={progress.weeklyGoals} />
            <RecentActivitiesCard activities={progress.recentActivities} />
            <EventCard showBirthdays={false} />
          </div>
        </>
      )}
    </div>
  );
}
