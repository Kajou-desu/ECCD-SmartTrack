// Appearance preferences (colour theme + text size). They are per device, kept
// in localStorage, and apply to every role (admin, teacher, parent).
//
// public/appearance-init.js repeats the load + apply steps so the right theme is
// set before first paint. Keep the two in sync (tests/appearance.test.js checks it).

export const APPEARANCE_STORAGE_KEY = "eccd.appearance";

export const THEMES = ["system", "light", "dark"];
export const TEXT_SIZES = ["small", "medium", "large"];

export const DEFAULT_APPEARANCE = Object.freeze({
  theme: "system",
  textSize: "medium",
});

// Anything read back from storage is untrusted (it can be edited by hand or by
// another script), and these values end up in DOM attributes, so only known
// values are ever accepted.
export function sanitizeAppearance(value) {
  const theme = THEMES.includes(value?.theme)
    ? value.theme
    : DEFAULT_APPEARANCE.theme;
  const textSize = TEXT_SIZES.includes(value?.textSize)
    ? value.textSize
    : DEFAULT_APPEARANCE.textSize;
  return { theme, textSize };
}

export function loadAppearance(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(APPEARANCE_STORAGE_KEY);
    return sanitizeAppearance(raw ? JSON.parse(raw) : null);
  } catch {
    // Storage blocked (private mode) or the stored JSON is corrupt.
    return { ...DEFAULT_APPEARANCE };
  }
}

export function saveAppearance(appearance, storage = globalThis.localStorage) {
  try {
    storage?.setItem(
      APPEARANCE_STORAGE_KEY,
      JSON.stringify(sanitizeAppearance(appearance)),
    );
  } catch {
    // The preference still applies for this session; it just won't persist.
  }
}

export function resolveTheme(theme, systemPrefersDark) {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  return systemPrefersDark ? "dark" : "light";
}

export function applyAppearance(root, appearance, systemPrefersDark) {
  const { theme, textSize } = sanitizeAppearance(appearance);
  const isDark = resolveTheme(theme, systemPrefersDark) === "dark";
  root.classList.toggle("dark", isDark);
  // Tells the browser to draw native controls and scrollbars to match.
  root.style.colorScheme = isDark ? "dark" : "light";
  root.dataset.textSize = textSize;
}
