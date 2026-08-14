import { useState, useEffect } from "react";

export default function useDashboardGreeting(userName) {
  const firstName = userName?.split(" ")[0] ?? "Educator";
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const currentHour = currentDateTime.getHours();

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";

  return { greeting, firstName, currentDateTime };
}
