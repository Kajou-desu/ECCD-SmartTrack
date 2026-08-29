import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ConfigError from "@components/shared/ConfigError.jsx";
import { IS_API_CONFIGURED } from "./config/api.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>{IS_API_CONFIGURED ? <App /> : <ConfigError />}</StrictMode>,
);
