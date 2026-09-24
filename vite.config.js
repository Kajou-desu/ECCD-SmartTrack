import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The frontend keeps its session token in localStorage, so any script that
// manages to run on the page could read it. A Content-Security-Policy is the
// control that stops injected script from running or phoning home. It's built
// here, at build time, because its allow-list depends on VITE_API_URL (the
// backend the app talks to), which a static vercel.json header can't know.
//
// Delivered as a <meta> tag, which browsers honor for everything below except
// frame-ancestors — that one lives in vercel.json's headers. Production builds
// only: the dev server needs inline scripts for hot reload.
function contentSecurityPolicy(apiUrl) {
  let apiOrigin;
  try {
    apiOrigin = new URL(apiUrl).origin;
  } catch {
    throw new Error(`VITE_API_URL is not a valid URL: "${apiUrl}"`);
  }

  return [
    "default-src 'self'",
    "script-src 'self'", // no inline script, no eval, no third-party script
    "style-src 'self' 'unsafe-inline'", // React inline style={} attributes need this
    `img-src 'self' data: blob: ${apiOrigin}`, // blob: = upload previews; API = photos/documents
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin} https://api.open-meteo.com`, // API + the weather widget
    `frame-src blob: ${apiOrigin}`, // PDF previews (local blob and API-hosted)
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

function cspPlugin(apiUrl) {
  return {
    name: "inject-content-security-policy",
    apply: "build",
    transformIndexHtml() {
      return [
        {
          tag: "meta",
          attrs: {
            "http-equiv": "Content-Security-Policy",
            content: contentSecurityPolicy(apiUrl),
          },
          injectTo: "head-prepend", // must precede every script/style it governs
        },
      ];
    },
  };
}

export default defineConfig(({ mode }) => {
  // Same fallback as src/config/api.js.
  const apiUrl =
    loadEnv(mode, __dirname, "VITE_").VITE_API_URL ||
    (mode === "production"
      ? "https://eccd-backend-production.up.railway.app"
      : "http://localhost:4000");

  return {
  plugins: [react(), tailwindcss(), cspPlugin(apiUrl)],
  resolve: {
    alias: {
      "@api": path.resolve(__dirname, "./src/api"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@auth": path.resolve(__dirname, "./src/auth"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@config": path.resolve(__dirname, "./src/config"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@data": path.resolve(__dirname, "./src/data"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@routes": path.resolve(__dirname, "./src/routes"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@validation": path.resolve(__dirname, "./src/validation"),
    },
  },
};
});
