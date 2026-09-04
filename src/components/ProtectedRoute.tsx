import { Navigate, Outlet } from 'react-router-dom'
import { useDemoAuth, DemoUserRole } from '../context/DemoAuthContext'

/**
 * FRONTEND DEMO PROTECTED ROUTE COMPONENT
 * Ensures unauthenticated demo users are directed to /signin,
 * and handles role redirection between demo Admin and Demo Voter dashboards.
 */

interface ProtectedRouteProps {
  requiredRole?: DemoUserRole
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useDemoAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on actual demo role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    } else {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <Outlet />
}
