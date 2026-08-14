import { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ROLES } from "./auth/roles";
import { isParent } from "./auth/permissions";
import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./context/Authcontext";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import PublicRoute from "./components/shared/PublicRoute";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import Layout from "./layouts/Layout";
import ParentLayout from "./layouts/ParentLayout";

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

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
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
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]} />
                }
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

                  <Route
                    path="/accounts-management"
                    element={<AccountsManagement />}
                  />
                </Route>
              </Route>

              {/* Parent routes */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.PARENT, ROLES.GUARDIAN]}
                  />
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
  const userIsParent = isParent(user?.role);

  if (isLoading) {
    return <RouteSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userIsParent) {
    return <Navigate to="/parent/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
