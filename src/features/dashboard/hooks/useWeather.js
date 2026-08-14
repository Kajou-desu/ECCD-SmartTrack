import { useCallback, useEffect, useRef, useState } from "react";

export default function useWeather(latitude, longitude, options = {}) {
  const { refreshInterval = 15 * 60 * 1000, timeout = 5000 } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const controllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);

  const fetchWeather = useCallback(async () => {
    if (latitude == null || longitude == null) return;

    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(false);

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const timeoutId = window.setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`,
        { signal: controller.signal },
      );

      if (!response.ok) throw new Error("Failed to fetch weather");

      const json = await response.json();
      const current = json.current_weather;
      if (!controller.signal.aborted && isMountedRef.current) {
        setData({
          temperature: Math.round(current.temperature),
          weathercode: current.weathercode,
        });
      }
    } catch (err) {
      console.error("useWeather fetch failed:", err);
      // If aborted, do not mark as error or clear data — this avoids cascading updates
      if (controller.signal.aborted) return;

      if (isMountedRef.current) {
        setError(true);
        // keep previous data instead of clearing it to avoid empty flicker
      }
    } finally {
      clearTimeout(timeoutId);
      loadingRef.current = false;
      if (isMountedRef.current) setLoading(false);
    }
  }, [latitude, longitude, timeout]);

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    // mark mounted
    isMountedRef.current = true;

    // Defer the first fetch to a microtask to avoid synchronous setState inside the effect
    Promise.resolve().then(fetchWeather);
    const id = window.setInterval(fetchWeather, refreshInterval);
    return () => {
      window.clearInterval(id);
      controllerRef.current?.abort();
      isMountedRef.current = false;
    };
  }, [fetchWeather, refreshInterval, latitude, longitude]);

  return { data, loading, error, refetch: fetchWeather };
}
