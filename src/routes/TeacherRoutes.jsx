import { lazy } from "react";
import { Route } from "react-router-dom";
import { ROLES } from "@auth/roles.js";
import ProtectedRoute from "@components/shared/ProtectedRoute.jsx";
import Layout from "@layouts/Layout.jsx";

const Dashboard = lazy(() => import("@pages/Dashboard.jsx"));
const Attendance = lazy(() => import("@pages/Attendance.jsx"));
const StudentInfo = lazy(() => import("@pages/StudentInfo.jsx"));
const StudentForm = lazy(() => import("@pages/StudentForm.jsx"));
const StudentDetail = lazy(() => import("@pages/StudentDetail.jsx"));
const LearningMaterials = lazy(() => import("@pages/Materials.jsx"));
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
          <Route path="/student-info" element={<StudentInfo />} />
          <Route path="/student-add" element={<StudentForm />} />
          <Route path="/student/:studentId/edit" element={<StudentForm />} />
          <Route path="/student/:studentId" element={<StudentDetail />} />
          <Route path="/learning-materials" element={<LearningMaterials />} />
          <Route path="/event-photos" element={<EventPhotos />} />
          <Route path="/event-photos/:albumId" element={<PhotoGallery />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/accounts-management" element={<AccountsManagement />} />
        </Route>
      </Route>
    </>
  );
}
