import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { withMockFallback } from "@api/mockFallback.js"; // MOCK_FALLBACK
import { EVENTS_DATA } from "@data/mockData";
import ErrorMsg from "@components/ui/ErrorMsg";
import { ChevronLeft, ChevronRight } from "lucide-react";

async function fetchEvents(monthKey) {
  const mockValue = EVENTS_DATA[monthKey] || EVENTS_DATA["2026-08"];
  const { data, usedMock } = await withMockFallback(
    () => apiClient.getEvents(monthKey),
    mockValue,
    { label: "CalendarEvents" },
  );
  return { attendanceData: data ?? mockValue, usedMock };
}

export default function CalendarEvents() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 7));

  const monthKey = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, [currentDate]);

  const { data: queryData, isLoading } = useQuery({
    queryKey: ["events", monthKey],
    queryFn: () => fetchEvents(monthKey),
  });

  const loading = isLoading;
  const attendanceData = queryData?.attendanceData ?? null;
  const error = queryData?.usedMock
    ? "Unable to sync with server. Showing cached data."
    : "";
  const [dismissedMonth, setDismissedMonth] = useState(null);
  const showError = Boolean(error) && dismissedMonth !== monthKey;

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const normalizeEventLegend = (status) => {
    const value = String(status ?? "")
      .trim()
      .toLowerCase();

    if (["today", "present", "completed", "late"].includes(value)) {
      return "Today";
    }
    if (["holiday", "no classes", "holiday event", "day off"].includes(value)) {
      return "Holiday";
    }
    if (["birthday", "birthday event"].includes(value)) {
      return "Birthday";
    }
    return "Others";
  };

  const getDayColor = (day) => {
    const status = attendanceData?.daily?.[day];
    if (!status) return "bg-gray-50 text-gray-400";
    if (status === "Today")
      return "bg-orange-100 text-orange-700 border border-orange-300";
    if (status === "Holiday")
      return "bg-green-100 text-green-700 border border-green-300";
    if (status === "Birthday")
      return "bg-red-100 text-red-700 border border-red-300";
    if (status === "Others")
      return "bg-gray-100 text-gray-700 border border-gray-300";
    return "bg-gray-100 text-gray-600";
  };

  const getDayBorder = (day) => {
    const today = currentDate.getDate();
    if (day === today) return "ring-2 ring-orange-500";
    return "";
  };

  const getLegendBadgeClasses = (legend) => {
    switch (legend) {
      case "Today":
        return "bg-orange-200 text-orange-700";
      case "Holiday":
        return "bg-green-200 text-green-700";
      case "Birthday":
        return "bg-red-200 text-red-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const getLegendCardClasses = (legend) => {
    switch (legend) {
      case "Today":
        return "bg-orange-50 border-orange-200";
      case "Holiday":
        return "bg-green-50 border-green-200";
      case "Birthday":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const eventLogs = useMemo(() => {
    if (!attendanceData) return [];
    return attendanceData.logs.reduce((acc, log) => {
      const legend = normalizeEventLegend(log.status);
      if (!acc.some((item) => item.legend === legend)) {
        acc.push({
          date: log.date,
          time: log.time,
          legend,
        });
      }
      return acc;
    }, []);
  }, [attendanceData]);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col gap-6 bg-[#f8f9ff] p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Event Calendar</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track upcoming events, special days, and school celebrations
          throughout the month
        </p>
      </div>

      {showError && (
        <ErrorMsg message={error} onClose={() => setDismissedMonth(monthKey)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {monthName}
              {loading && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  Loading...
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-300 rounded-lg transition cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-300 rounded-lg transition cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-bold text-gray-500 uppercase py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square flex items-center justify-center rounded-lg font-semibold text-sm transition ${
                  day
                    ? `${getDayColor(day)} ${getDayBorder(day)} hover:shadow-md`
                    : "bg-transparent"
                }`}
              >
                {day || ""}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
              Legend
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 rounded border border-orange-300"></div>
                <span className="text-xs text-gray-600">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded border border-green-300"></div>
                <span className="text-xs text-gray-600">Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 rounded border border-red-300"></div>
                <span className="text-xs text-gray-600">Birthday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300"></div>
                <span className="text-xs text-gray-600">Others</span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Logs */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Event Logs</h3>
            <button className="text-sm font-semibold text-[#C2570C] hover:text-orange-800 cursor-pointer">
              Add Event
            </button>
          </div>

          <div className="space-y-3">
            {eventLogs.map((log, idx) => (
              <div
                key={`${log.legend}-${idx}`}
                className={`p-3 rounded-lg border transition ${getLegendCardClasses(
                  log.legend,
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {log.date}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${getLegendBadgeClasses(
                      log.legend,
                    )}`}
                  >
                    {log.legend}
                  </span>
                </div>
                {log.time !== "---" && (
                  <p className="text-xs text-gray-600 mt-2">
                    <span className="font-medium">Time:</span> {log.time}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
