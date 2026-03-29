import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/common/Loader'

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth()

  // 🔥 sabse important fix
  if (loading) {
    return <Loader />   // ❌ null नहीं
  }

  return isAuthenticated 
    ? <Outlet /> 
    : <Navigate to="/login" replace />
}

export default PrivateRoute