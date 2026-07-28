/**
 * OAuthCallback.jsx
 *
 * صفحة مؤقتة بتستقبل redirect من django-allauth بعد تسجيل الدخول
 * بجوجل أو فيسبوك.
 *
 * الباك بيعمل redirect لـ: /oauth/callback?token=XXX&user_id=YYY&username=ZZZ&email=AAA
 * (شيل الـ OAuthRedirectView في views.py دي)
 */

import { useEffect, useContext } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { LanguageContext } from "../../context/LanguageContext"

function OAuthCallback() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { language } = useContext(LanguageContext)
  const isAr = language === "ar"

  useEffect(() => {
    const token    = searchParams.get("token")
    const user_id  = searchParams.get("user_id")
    const username = searchParams.get("username")
    const email    = searchParams.get("email")
    const error    = searchParams.get("error")

    if (error) {
      navigate("/login", { state: { oauthError: error }, replace: true })
      return
    }

    if (token && user_id) {
      login(
        { id: Number(user_id), username, email },
        token
      )
      navigate("/", { replace: true })
    } else {
      // مفيش بيانات — روح login
      navigate("/login", { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F2EE] dark:bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#D9A066] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-base">
          {isAr ? "جارٍ تسجيل الدخول..." : "Signing you in..."}
        </p>
      </div>
    </div>
  )
}

export default OAuthCallback