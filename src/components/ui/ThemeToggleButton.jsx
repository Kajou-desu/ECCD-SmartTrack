import { Moon, Sun } from "lucide-react";
import { useAppearance } from "@hooks/useAppearance.js";

// Header shortcut: flips between light and dark. It always sets an explicit
// choice (based on what is showing right now), so it also works when the
// preference is "System". The three-way choice lives in Settings.
export default function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useAppearance();
  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2570C] focus-visible:ring-offset-2"
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}
