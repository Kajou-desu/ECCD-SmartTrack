import { lazy } from "react";
import { Route } from "react-router-dom";
import { ROLES } from "@auth/roles.js";
import ProtectedRoute from "@components/shared/ProtectedRoute.jsx";
import ParentLayout from "@layouts/ParentLayout.jsx";

const ParentDashboard = lazy(
  () => import("@pages/parentPortal/parentDashboard.jsx"),
);

const ParentStudentProfile = lazy(
  () => import("@pages/parentPortal/parentStudentProfile.jsx"),
);

const ParentAttendance = lazy(
  () => import("@pages/parentPortal/parentAttendance.jsx"),
);

const ParentMaterials = lazy(
  () => import("@pages/parentPortal/parentMaterials.jsx"),
);

const ParentPhotoGallery = lazy(
  () => import("@pages/parentPortal/parentPhotoGallery.jsx"),
);

const ParentSettings = lazy(
  () => import("@pages/parentPortal/parentSettings.jsx"),
);

export default function ParentRoutes() {
  return (
    <Route
      element={<ProtectedRoute allowedRoles={[ROLES.PARENT, ROLES.GUARDIAN]} />}
    >
      <Route element={<ParentLayout />}>
        <Route path="/parent/dashboard" element={<ParentDashboard />} />

        <Route
          path="/parent/studentprofile"
          element={<ParentStudentProfile />}
        />

        <Route path="/parent/attendance" element={<ParentAttendance />} />

        <Route path="/parent/materials" element={<ParentMaterials />} />

        <Route path="/parent/photo-gallery" element={<ParentPhotoGallery />} />

        <Route path="/parent/settings" element={<ParentSettings />} />
      </Route>
    </Route>
  );
}
