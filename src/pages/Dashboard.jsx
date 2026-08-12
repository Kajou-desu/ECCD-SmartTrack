import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import { useAuth } from "../hooks/useAuth";
import { DASHBOARD_STATS } from "../data/mockData";
import { LOCATION_CONFIG } from "../constants/location";
import { WeatherCard } from "../components/Dashboard/WeatherCard";
import { DailyThemeCard } from "../components/Dashboard/DailyThemeCard";
import { AttendanceList } from "../components/Dashboard/AttendanceList";
import { EventCard } from "../components/Dashboard/EventCard";
import { UsersRound, UserCheck, UserX, CalendarDays } from "lucide-react";

const fetchDashboardTheme = async () => {
  await new Promise((resolve) => window.setTimeout(resolve, 200));

  return {
    letter: "Aa",
    label: "Letter A",
    subtitle: "Today's featured letter",
    title: "Alphabet Learning: Module 1",
    description:
      "Focusing on phonetic sounds of vowels and identifying everyday objects that begin with the letter A.",
    objectives: [
      "Identify the letter 'A' in five different words.",
      "Trace uppercase and lowercase 'A' correctly.",
      "Recognize objects beginning with the letter 'A'.",
    ],
  };
};

export default function Dashboard() {
  const { user } = useAuth();

  const firstName = user?.name?.split(" ")[0] ?? "Educator";

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [dailyTheme, setDailyTheme] = useState(null);
  const [dashboardError, setDashboardError] = useState("");

  const currentHour = currentDateTime.getHours();

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let ignore = false;

    const fetchDashboardData = async () => {
      try {
        const [theme] = await ([fetchDashboardTheme()]);

        if (!ignore) {
          setDailyTheme(theme);
          setDashboardError("");
        }
      } catch (error) {
        if (!ignore) {
          console.error(error);
          setDashboardError("Unable to load today's highlights.");
        }
      }
    };

    fetchDashboardData();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden bg-[#f8f9ff] p-6">
      {/* Page heading */}
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            {greeting}, {firstName}!
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Here's what's happening at {LOCATION_CONFIG.name} today.
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm sm:gap-4">
          <div className="flex flex-col">
            <p className="text-xs font-bold uppercase text-orange-900/75">
              {currentDateTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                timeZone: LOCATION_CONFIG.timezone,
              })}
            </p>

            <p className="text-end text-lg font-bold text-[#C2570C]">
              {currentDateTime.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
                timeZone: LOCATION_CONFIG.timezone,
              })}
            </p>
          </div>

          <div className="mx-1 h-6 w-px bg-slate-200" />

          <WeatherCard
            latitude={LOCATION_CONFIG.latitude}
            longitude={LOCATION_CONFIG.longitude}
          />
        </div>
      </div>

      {/* Error message */}
      {dashboardError ? (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {dashboardError}
        </div>
      ) : null}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        <StatCard
          Icon={UsersRound}
          label="Total Students"
          value={DASHBOARD_STATS.totalStudents}
          color="bg-blue-100 text-blue-600"
        />

        <StatCard
          Icon={UserCheck}
          label="Present Today"
          value={DASHBOARD_STATS.presentToday}
          color="bg-green-100 text-green-600"
        />

        <StatCard
          Icon={UserX}
          label="Absent Today"
          value={DASHBOARD_STATS.absentToday}
          color="bg-red-100 text-red-600"
        />

        <StatCard
          Icon={CalendarDays}
          label="School Days"
          value="60"
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Dashboard cards */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-4 lg:overflow-hidden">
        <div className="min-h-0 lg:col-span-2">
          {dailyTheme ? <DailyThemeCard theme={dailyTheme} /> : null}
        </div>

        <div className="min-h-0 lg:col-span-1">
          <AttendanceList />
        </div>

        <div className="min-h-0 lg:col-span-1">
          <EventCard />
        </div>
      </div>
    </div>
  );
}
