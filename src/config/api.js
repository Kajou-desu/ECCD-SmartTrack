// config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

if (!API_BASE_URL) {
    console.error(
        "❌ API_BASE_URL is not configured. Set VITE_API_URL in your .env file."
    );
}

export { API_BASE_URL };