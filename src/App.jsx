import { Suspense, useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@components/shared/ErrorBoundary.jsx";
import RouteSpinner from "@components/shared/RouteSpinner.jsx";
import { AuthProvider } from "@context/AuthContext.jsx";
import { NotificationProvider } from "@context/NotificationContext.jsx";
import { ToastProvider } from "@context/ToastContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { FILE_URL_FAILED_EVENT } from "@components/shared/SafeImage.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // avoid refetching the same data across components for 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Signed file URLs expire after an hour, but a page that stays open keeps
// showing the URLs from its last fetch. When an image fails, refetch what is on
// screen to get fresh URLs. At most once per interval so a genuinely missing
// file can't cause a refetch storm.
const FILE_URL_REFRESH_INTERVAL_MS = 30_000;

function FileUrlRefresher() {
  useEffect(() => {
    let lastRefresh = 0;
    const refresh = () => {
      const now = Date.now();
      if (now - lastRefresh < FILE_URL_REFRESH_INTERVAL_MS) return;
      lastRefresh = now;
      queryClient.invalidateQueries({ refetchType: "active" });
    };
    window.addEventListener(FILE_URL_FAILED_EVENT, refresh);
    return () => window.removeEventListener(FILE_URL_FAILED_EVENT, refresh);
  }, []);

  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />
          <FileUrlRefresher />

          <AuthProvider>
            <ToastProvider>
              <NotificationProvider>
                <Suspense fallback={<RouteSpinner />}>
                  <AppRoutes />
                </Suspense>
              </NotificationProvider>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
