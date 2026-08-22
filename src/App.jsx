import { Suspense, useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import ErrorBoundary from "@components/shared/ErrorBoundary.jsx";
import RouteSpinner from "@components/shared/RouteSpinner.jsx";
import { AuthProvider } from "@context/Authcontext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

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
      <BrowserRouter>
        <ScrollToTop />

        <AuthProvider>
          <Suspense fallback={<RouteSpinner />}>
            <AppRoutes />
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
