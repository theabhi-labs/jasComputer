// src/routes/PublicRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/common/Loader'

const PublicRoute = () => {
  const { user, isAuthenticated, loading } = useAuth()

  // Loading state
  if (loading) {
    return <Loader />
  }

  // If authenticated, redirect to dashboard (single dashboard for all roles)
  if (isAuthenticated) {
    // ✅ All roles go to /dashboard
    return <Navigate to="/dashboard" replace />
  }

  // If not authenticated, show public content (login/register)
  return <Outlet />
}

export default PublicRoute