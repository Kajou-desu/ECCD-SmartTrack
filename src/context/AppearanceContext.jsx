import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
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
  // How many mounted screens currently demand the light theme (see lockLight).
  const [lightLocks, setLightLocks] = useState(0);

  // Follow the OS setting live, so "System" tracks it without a reload.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(DARK_QUERY);
    const onChange = (event) => setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // A layout effect, so the theme is on <html> before the browser paints:
  // leaving the login page must not flash light on a dark dashboard.
  useLayoutEffect(() => {
    applyAppearance(document.documentElement, appearance, systemDark, { forceLight: lightLocks > 0 });
  }, [appearance, systemDark, lightLocks]);

  // Forces the light theme until the returned function is called, whatever the
  // saved preference or the OS says. A count (not a flag) so overlapping
  // screens can't unlock each other.
  const lockLight = useCallback(() => {
    setLightLocks((n) => n + 1);
    return () => setLightLocks((n) => n - 1);
  }, []);

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
      lockLight,
    }),
    [appearance, resolvedTheme, setTheme, setTextSize, lockLight],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}
