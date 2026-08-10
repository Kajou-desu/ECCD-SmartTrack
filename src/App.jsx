import { Suspense, lazy, useEffect, useAuth } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/Authcontext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import ParentLayout from "./components/parentLayout";

// Lazy loaded pages
const Login = lazy(() => import("./pages/Loginpage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Attendance = lazy(() => import("./pages/Attendance"));
const StudentInfo = lazy(() => import("./pages/StudentInfo"));
const StudentForm = lazy(() => import("./pages/StudentForm"));
const StudentDetail = lazy(() => import("./pages/StudentDetail"));
const LearningMaterials = lazy(() => import("./pages/Materials"));
const EventPhotos = lazy(() => import("./pages/EventPhotos"));
const PhotoGallery = lazy(() => import("./pages/PhotoGallery"));
const AccountsManagement = lazy(() => import("./pages/AccountManagement"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/ErrorPage"));
// For Parent Portal
const ParentDashboard = lazy(
  () => import("./pages/parentPortal/parentDashboard"),
);
const ParentStudentProfile = lazy(
  () => import("./pages/parentPortal/parentStudentProfile"),
);
const ParentAttendance = lazy(
  () => import("./pages/parentPortal/parentAttendance"),
);
const ParentMaterials = lazy(
  () => import("./pages/parentPortal/parentMaterials"),
);
const ParentPhotoGallery = lazy(
  () => import("./pages/parentPortal/parentPhotoGallery"),
);
const ParentSettings = lazy(
  () => import("./pages/parentPortal/parentSettings"),
);

function RouteSpinner() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// API Configuration Warning
function ApiConfigWarning() {
  if (!import.meta.env.VITE_API_URL && import.meta.env.MODE === "production") {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-3 text-center text-sm font-semibold">
        ⚠️ API Configuration Error - Contact Support
      </div>
    );
  }
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ApiConfigWarning />
        <ScrollToTop />
        <AuthProvider>
          <Suspense fallback={<RouteSpinner />}>
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public Routes */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
              </Route>

              {/* Protected Routes */}
              {/* Staff routes */}
              <Route
                element={<ProtectedRoute allowedRoles={["Developer", "Admin", "Teacher"]} />}
              >
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/student-info" element={<StudentInfo />} />
                  <Route path="/student-add" element={<StudentForm />} />
                  <Route
                    path="/student/:studentId/edit"
                    element={<StudentForm />}
                  />
                  <Route
                    path="/student/:studentId"
                    element={<StudentDetail />}
                  />
                  <Route
                    path="/learning-materials"
                    element={<LearningMaterials />}
                  />
                  <Route path="/event-photos" element={<EventPhotos />} />
                  <Route
                    path="/event-photos/:albumId"
                    element={<PhotoGallery />}
                  />
                  <Route path="/settings" element={<Settings />} />

                  {/* Admin only */}
                  <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
                    <Route
                      path="/accounts-management"
                      element={<AccountsManagement />}
                    />
                  </Route>
                </Route>
              </Route>

              {/* Parent routes */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={["Parent", "Guardian"]} />
                }
              >
                <Route element={<ParentLayout />}>
                  <Route
                    path="/parent/dashboard"
                    element={<ParentDashboard />}
                  />
                  <Route
                    path="/parent/studentprofile"
                    element={<ParentStudentProfile />}
                  />
                  <Route
                    path="/parent/attendance"
                    element={<ParentAttendance />}
                  />
                  <Route
                    path="/parent/materials"
                    element={<ParentMaterials />}
                  />
                  <Route
                    path="/parent/photo-gallery"
                    element={<ParentPhotoGallery />}
                  />
                  <Route path="/parent/settings" element={<ParentSettings />} />
                </Route>
              </Route>

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <RouteSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "Parent" || user?.role === "Guardian") {
    return <Navigate to="/parent/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
