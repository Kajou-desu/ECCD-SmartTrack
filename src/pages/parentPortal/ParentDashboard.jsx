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
        subtitle={`Here's ${selectedChild.name}'s progress at ${LOCATION_CONFIG.name}`}
      />

      <ChildOverviewCard child={selectedChild} />

      {status === "loading" && <ProgressLoadingState />}
      {status === "error" && <ProgressErrorState onRetry={retry} />}
      {status === "empty" && (
        <ProgressEmptyState childName={selectedChild.name} />
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
            <EventCard />
          </div>

          {/* Tips & Resources — derived from this week's top goal so it never
              goes stale or references the wrong child. */}
          <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-3xl border border-blue-200 p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">
              💡 Tips for Supporting Learning at Home
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm font-medium text-gray-800">
                  This Week's Focus
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {progress.weeklyGoals?.[0]
                    ? `Help ${selectedChild.name.split(" ")[0]} with "${
                        progress.weeklyGoals[0].title
                      }" through everyday activities at home.`
                    : `Check in with ${selectedChild.name.split(" ")[0]}'s teacher for this week's learning focus.`}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm font-medium text-gray-800">
                  Recommended Activity
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Try the "Color Hunt" game at home. Look for objects of
                  different colors and practice naming them.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
