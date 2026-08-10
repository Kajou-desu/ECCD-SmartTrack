import { Suspense, lazy, useEffect } from "react";
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
const Login = lazy(() => import("./Pages/Loginpage"));
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const Attendance = lazy(() => import("./Pages/Attendance"));
const StudentInfo = lazy(() => import("./Pages/StudentInfo"));
const StudentForm = lazy(() => import("./Pages/StudentForm"));
const StudentDetail = lazy(() => import("./Pages/StudentDetail"));
const LearningMaterials = lazy(() => import("./Pages/Materials"));
const EventPhotos = lazy(() => import("./Pages/EventPhotos"));
const PhotoGallery = lazy(() => import("./Pages/PhotoGallery"));
const AccountsManagement = lazy(() => import("./Pages/AccountManagement"));
const Settings = lazy(() => import("./Pages/Settings"));
const NotFound = lazy(() => import("./Pages/ErrorPage"));

const ParentDashboard = lazy(() => import("./Pages/parentPortal/parentDashboard"));
const ParentStudentProfile = lazy(() => import("./Pages/parentPortal/parentStudentProfile"));
const ParentAttendance = lazy(() => import("./Pages/parentPortal/parentAttendance"));
const ParentMaterials = lazy(() => import("./Pages/parentPortal/ParentMaterials"));
const ParentPhotoGallery = lazy(() => import("./Pages/parentPortal/ParentPhotoGallery"));
const ParentSettings = lazy(() => import("./Pages/parentPortal/ParentSettings"));

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
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Public Routes */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
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
                  />{" "}
                  <Route path="/settings" element={<Settings />} />
                  {/* Admin only pages */}
                  <Route
                    element={
                      <ProtectedRoute
                        allowedRoles={["Admin", "Lead Educator"]}
                      />
                    }
                  >
                    <Route
                      path="/accounts-management"
                      element={<AccountsManagement />}
                    />
                  </Route>
                </Route>
              </Route>

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
