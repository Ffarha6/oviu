import { createContext, useContext, useState, useEffect } from "react"

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      fetchProfile(token)
    } else {
      setAuthLoading(false)
    }
  }, [])

  const fetchProfile = async (token) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/user/", {
        headers: { Authorization: `Token ${token}` }, // ✅ Token مش Bearer
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        return data
      } else {
        localStorage.removeItem("access_token")
        setUser(null)
      }
    } catch {
      localStorage.removeItem("access_token")
      setUser(null)
    } finally {
      setAuthLoading(false)
    }
  }

  // ✅ FIX: بدل ما نثق في الـ userData الناقصة الجاية من صفحة اللوجين
  // (اللي مبتحتويش first_name/last_name)، دايماً نجيب البروفايل الكامل
  // من الباك اند فور تسجيل الدخول، عشان الاسم يظهر صح من أول لحظة
  // سواء تسجيل عادي أو عن طريق جوجل/فيسبوك.
  const login = async (userData, token) => {
    localStorage.setItem("access_token", token)
    return await fetchProfile(token) // ✅ رجّعي البيانات الكاملة عشان Login.jsx يقرر يودّي اليوزر فين (أدمن ولا لأ)
  }

  // ✅ إضافة جديدة: تستخدم بعد أي تعديل في الملف الشخصي (تغيير الاسم مثلاً)
  // عشان الـ Navbar وباقي الصفحة تتحدث فورًا من غير ما نحتاج نعمل ريفريش.
  const refreshUser = () => {
    const token = localStorage.getItem("access_token")
    if (token) return fetchProfile(token)
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      authLoading,
      login,
      logout,
      refreshUser,
      isLoggedIn: !!user,
      isAdmin: !!(user?.is_staff || user?.is_superuser), // ✅ جديد: تستخدم في ProtectedAdminRoute
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)