import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import { useAuth } from "../hooks/useAuth";
import { WeatherCard } from "../components/Dashboard/WeatherCard";
import { DailyThemeCard } from "../components/Dashboard/DailyThemeCard";
import { AttendanceList } from "../components/Dashboard/AttendanceList";
import { EventCard } from "../components/Dashboard/EventCard";
import { UsersRound, UserCheck, UserX, CalendarDays } from "lucide-react";

const LOCATION_CONFIG = {
  name: "Poblacion II ECCD Center",
  latitude: 14.9749,
  longitude: 120.4957,
  timezone: "Asia/Manila",
};

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

const fetchDashboardEvents = async () => {
  await new Promise((resolve) => window.setTimeout(resolve, 200));

  return {
    birthdays: [{ id: 1, name: "Emma Johnson", date: "Dec 15" }],
    holidays: [
      { id: 1, month: "JAN", day: "01", name: "New Year's Day" },
      { id: 2, month: "APR", day: "09", name: "Araw ng Kagitingan" },
      { id: 3, month: "MAY", day: "01", name: "Labor Day" },
      { id: 4, month: "JUN", day: "12", name: "Independence Day" },
      { id: 5, month: "AUG", day: "21", name: "Ninoy Aquino Day" },
      { id: 6, month: "AUG", day: "31", name: "National Heroes Day" },
      { id: 7, month: "NOV", day: "01", name: "All Saints' Day" },
      { id: 8, month: "NOV", day: "30", name: "Bonifacio Day" },
      { id: 9, month: "DEC", day: "08", name: "Feast of the Immaculate Conception" },
      { id: 10, month: "DEC", day: "24", name: "Christmas Eve" },
      { id: 11, month: "DEC", day: "25", name: "Christmas Day" },
      { id: 12, month: "DEC", day: "30", name: "Rizal Day" },
      { id: 13, month: "DEC", day: "31", name: "New Year's Eve" },
    ],
  };
};

export default function Dashboard() {
  const { user } = useAuth();

  const firstName = user?.name?.split(" ")[0] ?? "Educator";

  const greeting = () => {
    const currentHour = currentDateTime.getHours();
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
  };

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [dailyTheme, setDailyTheme] = useState(null);
  const [events, setEvents] = useState({ birthdays: [], holidays: [] });
  const [dashboardError, setDashboardError] = useState("");

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
        const [theme, eventData] = await Promise.all([
          fetchDashboardTheme(),
          fetchDashboardEvents(),
        ]);

        if (!ignore) {
          setDailyTheme(theme);
          setEvents(eventData);
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
    <div className="h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      <div className="flex flex-col justify-between items-center sm:flex-row gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {greeting()}, {firstName}!
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Here's what's happening at {LOCATION_CONFIG.name} today.
          </p>
        </div>

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

      {dashboardError ? (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {dashboardError}
        </div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          Icon={UsersRound}
          label="Total Students"
          value="10"
          color="bg-blue-100 text-blue-600"
        />

        <StatCard
          Icon={UserCheck}
          label="Present Today"
          value="8"
          color="bg-green-100 text-green-600"
        />

        <StatCard
          Icon={UserX}
          label="Absent Today"
          value="2"
          color="bg-red-100 text-red-600"
        />

        <StatCard
          Icon={CalendarDays}
          label="School Days"
          value="60"
          color="bg-orange-100 text-orange-600"
        />
      </div>

      <div className="grid lg:flex-1 lg:min-h-0 grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:overflow-hidden">
        <div className="lg:col-span-2 min-h-0">
          {dailyTheme ? <DailyThemeCard theme={dailyTheme} /> : null}
        </div>

        <div className="lg:col-span-1 min-h-0">
          <AttendanceList />
        </div>

        <div className="lg:col-span-1 min-h-0">
          <EventCard events={events} />
        </div>
      </div>
    </div>
  );
}
