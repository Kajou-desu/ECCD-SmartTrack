// Runs before first paint so a saved dark theme / text size doesn't flash the
// default look while the app loads. It is an external file (not inline) because
// the production Content-Security-Policy only allows script-src 'self'.
// Mirrors src/utils/appearance.js (plus the login-is-always-light rule, which
// the app applies through useForcedLightTheme) — keep the two in sync.
(function () {
  var theme = "system";
  var textSize = "medium";
  try {
    var saved = JSON.parse(localStorage.getItem("eccd.appearance") || "null");
    if (saved && ["system", "light", "dark"].indexOf(saved.theme) !== -1) theme = saved.theme;
    if (saved && ["small", "medium", "large"].indexOf(saved.textSize) !== -1) textSize = saved.textSize;
  } catch {
    // Blocked storage or corrupt JSON: fall back to the defaults.
  }
  var systemDark = !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  // The sign-in screen is always light, so don't flash dark on a reload there.
  var onLogin = /^\/login\/?$/.test((window.location && window.location.pathname) || "");
  var isDark = !onLogin && (theme === "dark" || (theme === "system" && systemDark));
  var root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
  root.dataset.textSize = textSize;
})();
