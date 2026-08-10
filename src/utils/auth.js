export function readStoredAuth() {
    try {
        if (!window.localStorage) {
            return { token: null, user: null };
        }

        const token = localStorage.getItem("token");
        const rawUser = localStorage.getItem("user");
        if (!token || !rawUser) return { token: null, user: null };
        return { token, user: JSON.parse(rawUser) };
    } catch (error) {
        console.error("Failed to read auth from storage:", error);
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        } catch (cleanupError) {
            console.error("Failed to clear auth from storage during cleanup:", cleanupError);
        }
        return { token: null, user: null };
    }
}

export function isTokenExpired(token) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return true;

        const payload = JSON.parse(atob(parts[1]));
        if (!payload.exp) return false;

        return Date.now() >= payload.exp * 1000;
    } catch (error) {
        console.error("Failed to parse token:", error);
        return true;
    }
}