import { useContext, useLayoutEffect } from "react";
import { AppearanceContext } from "@context/appearanceContextObject.js";

// Keeps the app in the light theme while the calling screen is mounted, for
// screens that must always be white (the login page). Unlike useAppearance it
// does nothing, rather than throwing, when there is no AppearanceProvider.
export function useForcedLightTheme() {
  const lockLight = useContext(AppearanceContext)?.lockLight;
  useLayoutEffect(() => (lockLight ? lockLight() : undefined), [lockLight]);
}
