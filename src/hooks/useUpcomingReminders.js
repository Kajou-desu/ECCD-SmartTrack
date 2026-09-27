import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { apiClient } from "@api/client.js";
import { toMonthKey } from "@utils/dateKeys.js";
import {
  REMINDER_WINDOW_DAYS,
  getBirthdayReminders,
  getHolidayReminders,
  getEventReminders,
  formatReminders,
} from "@utils/reminders.js";

// Every distinct "YYYY-MM" the reminder window touches, so a window that
// crosses a month boundary (e.g. 3 days left in September) still picks up
// events saved under October.
function monthKeysForWindow(today, windowDays) {
  const keys = [];
  for (let offset = 0; offset <= windowDays; offset += 1) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const key = toMonthKey(day);
    if (!keys.includes(key)) keys.push(key);
  }
  return keys;
}

// Builds the "upcoming birthdays/events/holidays" text for the Reminder
// Banner, starting 7 days before each date.
//
// `students` supplies the birthdays to check — pass the full roster for
// Teacher/Admin, or just a parent's own children.
// `includeEvents` additionally pulls in teacher-created calendar events
// (GET /api/events). Leave this off for parents: that endpoint is
// Teacher/Admin only server-side, so a parent's request would just 403.
export function useUpcomingReminders({ students = [], includeEvents = false } = {}) {
  const today = useMemo(() => new Date(), []);
  const monthKeys = useMemo(
    () => monthKeysForWindow(today, REMINDER_WINDOW_DAYS),
    [today],
  );

  // Reuses the same ["events", monthKey] query key as CalendarEvents.jsx,
  // so if that page already loaded this month it's served from cache.
  const eventQueries = useQueries({
    queries: monthKeys.map((monthKey) => ({
      queryKey: ["events", monthKey],
      queryFn: () => apiClient.getEvents(monthKey),
      enabled: includeEvents,
    })),
  });

  const eventLogs = includeEvents
    ? eventQueries.flatMap((query) => query.data?.logs ?? [])
    : [];
  // eventLogs is a fresh array every render (built above from eventQueries),
  // so memoizing on it directly would never hit the cache; comparing its
  // actual contents is what we want instead.
  const eventLogsKey = JSON.stringify(eventLogs);

  return useMemo(() => {
    const items = [
      ...getBirthdayReminders(students, today, REMINDER_WINDOW_DAYS),
      ...getHolidayReminders(today, REMINDER_WINDOW_DAYS),
      ...getEventReminders(eventLogs, today, REMINDER_WINDOW_DAYS),
    ];
    return formatReminders(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on eventLogsKey (contents), not eventLogs (a new array reference every render)
  }, [students, today, eventLogsKey]);
}

export default useUpcomingReminders;
