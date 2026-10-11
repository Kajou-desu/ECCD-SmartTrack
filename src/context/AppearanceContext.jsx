import { useCallback, useEffect, useMemo, useState } from "react";
import { AppearanceContext } from "./appearanceContextObject.js";
import {
  applyAppearance,
  loadAppearance,
  resolveTheme,
  saveAppearance,
} from "@utils/appearance.js";

const DARK_QUERY = "(prefers-color-scheme: dark)";

const readSystemDark = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(DARK_QUERY).matches;

export function AppearanceProvider({ children }) {
  const [appearance, setAppearance] = useState(loadAppearance);
  const [systemDark, setSystemDark] = useState(readSystemDark);

  // Follow the OS setting live, so "System" tracks it without a reload.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(DARK_QUERY);
    const onChange = (event) => setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    applyAppearance(document.documentElement, appearance, systemDark);
  }, [appearance, systemDark]);

  const update = useCallback((change) => {
    setAppearance((current) => {
      const next = { ...current, ...change };
      saveAppearance(next);
      return next;
    });
  }, []);

  const setTheme = useCallback((theme) => update({ theme }), [update]);
  const setTextSize = useCallback((textSize) => update({ textSize }), [update]);

  const resolvedTheme = resolveTheme(appearance.theme, systemDark);

  const value = useMemo(
    () => ({
      theme: appearance.theme,
      textSize: appearance.textSize,
      resolvedTheme,
      setTheme,
      setTextSize,
    }),
    [appearance, resolvedTheme, setTheme, setTextSize],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}
