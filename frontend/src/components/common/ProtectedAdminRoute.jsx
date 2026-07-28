import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

// ✅ نفس فكرة ProtectedRoute بالظبط، بس بيتأكد كمان إن اليوزر أدمن
// (is_staff أو is_superuser) قبل ما يسمحله يدخل أي صفحة تحت /admin
function ProtectedAdminRoute({ children }) {
  const { isLoggedIn, isAdmin, authLoading } = useAuth()
  const location = useLocation()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#D9A066] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdmin) {
    // ✅ يوزر عادي حاول يدخل /admin مباشرة عن طريق اللينك -> يترد للهوم
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedAdminRoute