import { LOCATION_CONFIG } from "@constants/location";
import { WeatherCard } from "./WeatherCard";

export default function DashboardHeader({
  greeting,
  firstName,
  currentDateTime,
}) {
  return (
    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          {greeting}, {firstName}!
        </h1>

        <p className="text-sm leading-6 text-gray-600">
          Here's what's happening at {LOCATION_CONFIG.name} today.
        </p>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm sm:gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
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
  );
}
