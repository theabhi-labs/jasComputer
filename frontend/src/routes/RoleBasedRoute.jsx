import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/common/Loader'

const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth()

  console.log('🔐 RoleBasedRoute:')
  console.log('   loading:', loading)
  console.log('   isAuthenticated:', isAuthenticated)
  console.log('   user:', user)
  console.log('   user?.role:', user?.role)
  console.log('   allowedRoles:', allowedRoles)

  if (loading) {
    return <Loader />
  }

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirect to login')
    return <Navigate to="/login" replace />
  }

  // ✅ If role not allowed, redirect to /dashboard
  if (!allowedRoles.includes(user?.role)) {
    console.log('❌ Role not allowed, redirect to /dashboard')
    return <Navigate to="/dashboard" replace />
  }

  console.log('✅ Role allowed, rendering outlet')
  return <Outlet />
}

export default RoleBasedRoute