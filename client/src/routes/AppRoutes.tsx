import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "../pages/HomePage";
import ScoresPage from "../pages/ScoresPage";
import SchedulePage from "../pages/SchedulePage";
import GalleryPage from "../pages/GalleryPage";
import AboutPage from "../pages/AboutPage";
import ResultsPage from "../pages/ResultsPage";
import AdminPage from "../pages/AdminPage";
import AdminLoginPage from "../pages/AdminLoginPage";
// import CaptainRegisterPage from "../pages/CaptainRegisterPage"; // Registration temporarily disabled
import CaptainLoginPage from "../pages/CaptainLoginPage";
import CaptainDashboardPage from "../pages/CaptainDashboardPage";
import RulesPage from "../pages/RulesPage";
import ProtectedRoute from "./ProtectedRoute";
import CaptainProtectedRoute from "./CaptainProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/scores" element={<ScoresPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/rules" element={<RulesPage />} />

      {/* Captain Routes */}
      {/* <Route path="/captain-register" element={<CaptainRegisterPage />} /> */} {/* Registration temporarily disabled */}
      <Route path="/captain-login" element={<CaptainLoginPage />} />
      <Route
        path="/captain-dashboard"
        element={
          <CaptainProtectedRoute>
            <CaptainDashboardPage />
          </CaptainProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
