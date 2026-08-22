import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import PublicRoute from "@components/shared/PublicRoute.jsx";
import ParentRoutes from "./ParentRoutes.jsx";
import RootRedirect from "./RootRedirect.jsx";
import TeacherRoutes from "./TeacherRoutes.jsx";

const Login = lazy(() => import("@pages/Loginpage.jsx"));
const NotFound = lazy(() => import("@pages/ErrorPage.jsx"));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <TeacherRoutes />

      <ParentRoutes />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
