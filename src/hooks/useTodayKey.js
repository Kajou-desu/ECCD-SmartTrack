import { useEffect, useState } from "react";
import { toDayKey } from "@utils/dateKeys.js";

// Current local day as "YYYY-MM-DD", updated when the day changes. A screen
// left open overnight (or a tablet waking from sleep, where timers are
// throttled) would otherwise keep showing yesterday's data.
export default function useTodayKey() {
  const [todayKey, setTodayKey] = useState(() => toDayKey());

  useEffect(() => {
    const sync = () => setTodayKey(toDayKey());
    const timer = setInterval(sync, 30_000);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return todayKey;
}
