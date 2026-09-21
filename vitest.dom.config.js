// Component/behaviour tests that need a DOM (jsdom). The fast unit tests in
// tests/ run with `npm test` (node --test) and need none of this.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const aliasNames = [
  "api", "assets", "auth", "components", "config", "constants", "context", "data",
  "features", "hooks", "layouts", "pages", "routes", "utils", "validation",
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: Object.fromEntries(aliasNames.map((n) => [`@${n}`, path.resolve(root, `./src/${n}`)])),
  },
  test: { environment: "jsdom", include: ["tests-dom/**/*.test.jsx"] },
});
