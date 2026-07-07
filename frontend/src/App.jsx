import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import AdminLogin from './pages/auth/AdminLogin'
import AdminRegister from './pages/auth/AdminRegister'

// Dashboards
import StudentDashboard from './pages/student/Dashboard'
import StaffDashboard from './pages/staff/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'

// Admin pages
import UserManagement from './pages/admin/UserManagement'
import AdminDocuments from './pages/admin/Documents'
import AdminCompliance from './pages/admin/Compliance'
import AdminLogs from './pages/admin/Logs'
import Settings from './pages/Settings'
import DashboardLayout from './layouts/DashboardLayout'

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Role-based redirect after login
const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (user?.role === 'staff') return <Navigate to="/staff/dashboard" replace />
  return <Navigate to="/student/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-register" element={<AdminRegister />} />

      {/* Role redirect */}
      <Route path="/" element={<RoleRedirect />} />

      {/* Student routes — accessible by all roles */}
      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={['student', 'admin', 'staff']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />

      {/* Staff routes — accessible by staff and admin */}
      <Route path="/staff/*" element={
        <ProtectedRoute allowedRoles={['staff', 'admin']}>
          <StaffDashboard />
        </ProtectedRoute>
      } />

      {/* Admin routes — admin only */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout searchPlaceholder="Search users, documents..." />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="documents" element={<AdminDocuments />} />
        <Route path="compliance" element={<AdminCompliance />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="*" element={<AdminDashboard />} />
      </Route>

      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
          <Settings />
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}