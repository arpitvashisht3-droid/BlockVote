import { Navigate, Outlet } from 'react-router-dom'
import { useDemoAuth, DemoUserRole } from '../context/DemoAuthContext'

interface ProtectedRouteProps {
  requiredRole?: DemoUserRole
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useDemoAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-sm font-medium text-navy-muted">Restoring authenticated session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    } else {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <Outlet />
}
