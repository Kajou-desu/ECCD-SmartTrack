import { WEATHER_CODES } from "@constants/weather";
import useWeather from "@hooks/useWeather";
import { Cloud, CloudLightning, CloudRain, CloudSun, Sun } from "lucide-react";

const iconMap = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  "cloud-lightning": CloudLightning,
};

export function WeatherCard({ latitude, longitude }) {
  const { data, loading, error, refetch } = useWeather(latitude, longitude);

  const weatherInfo = data
    ? WEATHER_CODES[data.weathercode] || { text: "Unknown", icon: "cloud" }
    : { text: loading ? "Loading..." : "Unavailable", icon: "cloud" };

  const IconComponent = iconMap[weatherInfo.icon] || Cloud;

  return (
    <div className="flex items-center gap-3 ">
      <IconComponent className="h-8 w-8 text-[#C2570C]" />
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-800">
          {loading ? "--" : `${data?.temperature ?? "--"}°C`}
        </span>
        <span className="text-xs text-gray-500">
          {error ? "Unable to load weather" : weatherInfo.text}
        </span>
        {error ? (
          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading}
            className="mt-1 text-left text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-60"
          >
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}
