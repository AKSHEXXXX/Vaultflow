import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import AppLayout           from '../layouts/AppLayout'
import LandingPage         from '../pages/LandingPage'
import LoginPage           from '../pages/LoginPage'
import RegisterPage        from '../pages/RegisterPage'
import OAuthCallbackPage   from '../pages/OAuthCallbackPage'
import DashboardPage       from '../pages/DashboardPage'
import DocumentsPage       from '../pages/DocumentsPage'
import DocumentDetailPage  from '../pages/DocumentDetailPage'
import UploadPage          from '../pages/UploadPage'
import UsersPage           from '../pages/UsersPage'
import SettingsPage        from '../pages/SettingsPage'
import NotFoundPage        from '../pages/NotFoundPage'

// ─── Guards ───────────────────────────────────────────────────────────────────
function AdminOnly() {
  const { user } = useAuth()
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/dashboard" replace />
}

// ─── Routes ───────────────────────────────────────────────────────────────────
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"               element={<LandingPage />} />
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/register"       element={<RegisterPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      {/* Authenticated — AppLayout owns the auth guard */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard"         element={<DashboardPage />} />
        <Route path="/documents"         element={<DocumentsPage />} />
        <Route path="/documents/:id"     element={<DocumentDetailPage />} />
        <Route path="/upload"            element={<UploadPage />} />
        <Route path="/settings"          element={<SettingsPage />} />
        <Route element={<AdminOnly />}>
          <Route path="/users"           element={<UsersPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
