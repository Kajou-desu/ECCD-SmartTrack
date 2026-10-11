import { useContext } from "react";
import { AppearanceContext } from "@context/appearanceContextObject.js";

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return ctx;
}
