import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    (!user || !allowedRoles.includes(user.role))
  ) {
    // User is authenticated but not authorized for this route.
    return <Navigate to="/" replace />
  }

  return children
}

