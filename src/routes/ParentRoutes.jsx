import { lazy } from "react";
import { Route } from "react-router-dom";
import { ROLES } from "@auth/roles.js";
import ProtectedRoute from "@components/shared/ProtectedRoute.jsx";
import ParentLayout from "@layouts/ParentLayout.jsx";

const ParentDashboard = lazy(
  () => import("@pages/parentPortal/ParentDashboard.jsx"),
);
const ParentStudentProfile = lazy(
  () => import("@pages/parentPortal/ParentStudentProfile.jsx"),
);
const ParentAttendance = lazy(
  () => import("@pages/parentPortal/ParentAttendance.jsx"),
);
const ParentMaterials = lazy(
  () => import("@pages/parentPortal/ParentMaterials.jsx"),
);
const ParentPhotoGallery = lazy(
  () => import("@pages/parentPortal/ParentPhotoGallery.jsx"),
);
const ParentSettings = lazy(
  () => import("@pages/parentPortal/ParentSettings.jsx"),
);

export function ParentRoutes() {
  return (
    <>
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.PARENT, ROLES.GUARDIAN]} />
        }
      >
        <Route element={<ParentLayout />}>
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route
            path="/parent/studentprofile"
            element={<ParentStudentProfile />}
          />
          <Route path="/parent/attendance" element={<ParentAttendance />} />
          <Route path="/parent/materials" element={<ParentMaterials />} />
          <Route
            path="/parent/photo-gallery"
            element={<ParentPhotoGallery />}
          />
          <Route path="/parent/settings" element={<ParentSettings />} />
        </Route>
      </Route>
    </>
  );
}
