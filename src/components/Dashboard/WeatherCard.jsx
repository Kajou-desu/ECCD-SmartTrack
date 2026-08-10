import { useCallback, useEffect, useState } from "react";
import { Cloud, CloudLightning, CloudRain, CloudSun, Sun } from "lucide-react";
import { WEATHER_CODES } from "../../constants/weather";

const iconMap = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  "cloud-lightning": CloudLightning,
};

export function WeatherCard({ latitude, longitude }) {
  const [weather, setWeather] = useState({
    temperature: "--",
    description: "Loading...",
    icon: CloudSun,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(false);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }

      const data = await response.json();
      const current = data.current_weather;
      const weatherInfo = WEATHER_CODES[current.weathercode] || {
        text: "Unknown",
        icon: "cloud",
      };
      const IconComponent = iconMap[weatherInfo.icon] || Cloud;

      setWeather({
        temperature: Math.round(current.temperature),
        description: weatherInfo.text,
        icon: IconComponent,
      });
    } catch (err) {
      console.error("Weather fetch failed:", err);
      setError(true);
      setWeather({
        temperature: "--",
        description: "Unavailable",
        icon: Cloud,
      });
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setRetrying(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    const run = () => Promise.resolve().then(fetchWeather);

    run();
    const intervalId = window.setInterval(run, 15 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [fetchWeather]);

  const Icon = weather.icon;

  return (
    <div className="flex items-center gap-3">
      <Icon className="h-8 w-8 text-[#C2570C]" />
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-800">
          {loading ? "--" : `${weather.temperature}°C`}
        </span>
        <span className="text-xs text-gray-500">
          {error ? "Unable to load weather" : weather.description}
        </span>
        {error ? (
          <button
            type="button"
            onClick={() => {
              setRetrying(true);
              fetchWeather();
            }}
            disabled={retrying}
            className="mt-1 text-left text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-60"
          >
            {retrying ? "Retrying..." : "Retry"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
