import { Suspense, useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@components/shared/ErrorBoundary.jsx";
import RouteSpinner from "@components/shared/RouteSpinner.jsx";
import { AuthProvider } from "@context/AuthContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // avoid refetching the same data across components for 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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

          <AuthProvider>
            <Suspense fallback={<RouteSpinner />}>
              <AppRoutes />
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
