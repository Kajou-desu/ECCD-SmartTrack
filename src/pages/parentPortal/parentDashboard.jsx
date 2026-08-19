import { useState, useEffect, useCallback } from "react";
import { CHILD_DATA, PROGRESS_DATA } from "@data/mockParentData";
import { useAuth } from "@hooks/useAuth";
import { WeatherCard } from "@features/dashboard/components/WeatherCard";
import StatCard from "@components/shared/StatCard";
import { TrendingUp, BookUser, CalendarDays, Award } from "lucide-react";

// For weather widget
const LOCATION_CONFIG = {
  name: "Poblacion II ECCD Center",
  latitude: 14.9749,
  longitude: 120.4957,
  timezone: "Asia/Manila",
};

export default function ParentDashboard() {
  const { user } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Greeting based on time of day
  const greeting = useCallback(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // For timer in widget
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[calc(100vh-75px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between items-start sm:flex-row sm:items-center gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {greeting()}, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Here's {CHILD_DATA.name}'s progress at {LOCATION_CONFIG.name}
          </p>
        </div>

        {/* Date/Time & Weather Widget */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 gap-2 sm:gap-4 shadow-sm shrink-0">
          <div className="flex flex-col">
            <p className="text-xs font-bold text-orange-900/75 uppercase">
              {currentDateTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                timeZone: LOCATION_CONFIG.timezone,
              })}
            </p>
            <p className="text-lg font-bold text-end text-[#C2570C]">
              {currentDateTime.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
                timeZone: LOCATION_CONFIG.timezone,
              })}
            </p>
          </div>

          <div className="mx-1 h-6 w-px bg-slate-200"></div>

          <WeatherCard
            latitude={LOCATION_CONFIG.latitude}
            longitude={LOCATION_CONFIG.longitude}
          />
        </div>
      </div>

      {/* Child Profile Card */}
      <div className="bg-linear-to-r from-orange-50 to-orange-100 rounded-3xl border border-orange-200 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <img
            src={CHILD_DATA.photo}
            alt={CHILD_DATA.name}
            className="w-24 h-24 rounded-2xl object-cover shrink-0"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">
              {CHILD_DATA.name}
            </h2>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase font-semibold text-gray-600">
                  Student ID
                </p>
                <p className="font-medium text-orange-700">{CHILD_DATA.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-gray-600">
                  Session
                </p>
                <p className="font-medium text-orange-700">
                  {CHILD_DATA.session}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-gray-600">
                  Teacher
                </p>
                <p className="font-medium text-orange-700">
                  {CHILD_DATA.teacher}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-gray-600">
                  Enrolled Since
                </p>
                <p className="font-medium text-orange-700">
                  {CHILD_DATA.enrollmentDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          Icon={Award}
          label="Milestones Achieved"
          value={String(PROGRESS_DATA.milestones)}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          Icon={TrendingUp}
          label="Attendance Rate"
          value={PROGRESS_DATA.attendance}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          Icon={BookUser}
          label="Activities Completed"
          value={String(PROGRESS_DATA.activityCount)}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          Icon={CalendarDays}
          label="School Days"
          value={String(PROGRESS_DATA.schoolDays)}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Weekly Goals & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Goals */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            This Week's Goals
          </h3>
          <div className="space-y-4">
            {PROGRESS_DATA.weeklyGoals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    {goal.title}
                  </p>
                  <span className="text-xs font-semibold text-gray-500">
                    {goal.progress}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      goal.progress === 100
                        ? "bg-green-500"
                        : goal.progress > 50
                          ? "bg-orange-500"
                          : "bg-blue-500"
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{goal.status}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Recent Activities
          </h3>
          <div className="space-y-4">
            {PROGRESS_DATA.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 border border-gray-200 rounded-2xl hover:border-orange-200 hover:bg-orange-50 transition"
              >
                <div className="flex flex-col items-start justify-between mb-2">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800">
                        {activity.activity}
                      </h4>
                      <span className="text-center text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                        {activity.category}
                      </span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                </div>
                <p className="text-sm text-gray-600 italic">
                  "{activity.notes}"
                </p>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 text-center text-sm font-medium text-[#C2570C] hover:text-orange-800 transition">
            View All Activities →
          </button>
        </div>
      </div>

      {/* Tips & Resources Section */}
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
              Help Leo practice counting to 10 through everyday activities like
              setting the table or counting toys.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm font-medium text-gray-800">
              Recommended Activity
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Try the "Color Hunt" game at home. Look for objects of different
              colors and practice naming them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
