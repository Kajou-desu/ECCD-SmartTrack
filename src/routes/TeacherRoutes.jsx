import { lazy } from "react";
import { Route } from "react-router-dom";
import { ROLES } from "@auth/roles.js";
import ProtectedRoute from "@components/shared/ProtectedRoute.jsx";
import Layout from "@layouts/Layout.jsx";
import { EventPhotosProvider } from "@features/eventPhotos/context/EventPhotosProvider";

const Dashboard = lazy(() => import("@pages/Dashboard.jsx"));
const Attendance = lazy(() => import("@pages/Attendance.jsx"));
const AttendanceLive = lazy(() => import("@pages/AttendanceLive.jsx"));
const StudentInfo = lazy(() => import("@pages/StudentInfo.jsx"));
const StudentForm = lazy(() => import("@pages/StudentForm.jsx"));
const StudentDetail = lazy(() => import("@pages/StudentDetail.jsx"));
const LearningMaterials = lazy(() => import("@pages/Materials.jsx"));
const WeeklyGoals = lazy(() => import("@pages/WeeklyGoals.jsx"));
const MaterialSubmissions = lazy(() => import("@pages/MaterialSubmissions.jsx"));
const CalendarEvents = lazy(() => import("@pages/CalendarEvents.jsx"));
const EventPhotos = lazy(() => import("@pages/EventPhotos.jsx"));
const PhotoGallery = lazy(() => import("@pages/PhotoGallery.jsx"));
const AccountsManagement = lazy(() => import("@pages/AccountManagement.jsx"));
const Settings = lazy(() => import("@pages/Settings.jsx"));

export function TeacherRoutes() {
  return (
    <>
      <Route
        element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]} />}
      >
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance/live" element={<AttendanceLive />} />
          <Route path="/student-info" element={<StudentInfo />} />
          <Route path="/student-add" element={<StudentForm />} />
          <Route path="/student/:studentId/edit" element={<StudentForm />} />
          <Route path="/student/:studentId" element={<StudentDetail />} />
          <Route path="/learning-materials" element={<LearningMaterials />} />
          <Route path="/weekly-goals" element={<WeeklyGoals />} />
          <Route path="/learning-materials/:materialId/submissions" element={<MaterialSubmissions />} />
          <Route path="/calendar" element={<CalendarEvents />} />
          <Route element={<EventPhotosProvider />}>
            <Route path="/event-photos" element={<EventPhotos />} />
            <Route path="/event-photos/:albumId" element={<PhotoGallery />} />
          </Route>
          <Route path="/settings" element={<Settings />} />
          <Route path="/accounts-management" element={<AccountsManagement />} />
        </Route>
      </Route>
    </>
  );
}
