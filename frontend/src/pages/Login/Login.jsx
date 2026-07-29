import { useState, useContext } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { LanguageContext } from "../../context/LanguageContext"
import { useAuth } from "../../context/AuthContext"
import { motion } from "framer-motion"
import api from "../../api/axios"
import logo from "../../assets/images/logo.png"
import banner from "../../assets/images/banner.jpg"


import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from "react-icons/fi"

const BACKEND_URL = "https://oviu-production.up.railway.app"

/* ── أيقونة جوجل الرسمية (الألوان الأربعة) ── */
const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
)

/* ── أيقونة فيسبوك الرسمية (الدائرة الزرقاء) ── */
const FacebookIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path fill="#1877F2" d="M24,4C12.954,4,4,12.954,4,24c0,10.019,7.393,18.302,17.031,19.734V29.531h-4.797v-5.484h4.797v-3.836c0-5.484,3.023-8.531,7.914-8.531c2.297,0,4.617,0.219,4.617,0.219v5.109h-2.594c-2.555,0-3.352,1.586-3.352,3.211v3.828h5.703l-0.914,5.484h-4.789v14.203C36.607,42.302,44,34.019,44,24C44,12.954,35.046,4,24,4z"/>
    <path fill="#FFFFFF" d="M31.31,29.531l0.914-5.484h-5.703v-3.828c0-1.625,0.797-3.211,3.352-3.211h2.594v-5.109c0,0-2.32-0.219-4.617-0.219c-4.891,0-7.914,3.047-7.914,8.531v3.836h-4.797v5.484h4.797v14.203c0.961,0.151,1.947,0.231,2.953,0.231s1.992-0.08,2.953-0.231V29.531H31.31z"/>
  </svg>
)

/* ── تعديل الـ autofill اللي بيحط خلفية بيضاء ── */
const autofillFix = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
    box-shadow: 0 0 0px 1000px transparent inset !important;
    -webkit-text-fill-color: white !important;
    transition: background-color 9999s ease-in-out 0s;
    caret-color: white;
  }
`

function Login() {
  const { language } = useContext(LanguageContext)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAr = language === "ar"

  const from = location.state?.from || "/"
  const justVerified = location.state?.verified === true
  // ✅ جاية من صفحة ResetPassword بعد نجاح تحديث كلمة المرور
  const justResetPassword = location.state?.passwordReset === true

  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [form, setForm]         = useState({ email: "", password: "" })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/auth/login/", {
        email: form.email,
        password: form.password,
      })
      const data = res.data
      login({ id: data.user_id, username: data.username, email: data.email }, data.token)
      navigate(from, { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        (isAr ? "بيانات غير صحيحة، تحقق من الإيميل وكلمة المرور" : "Invalid credentials")
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin   = () => { window.location.href = `${BACKEND_URL}/accounts/google/login/?process=login` }
  const handleFacebookLogin = () => { window.location.href = `${BACKEND_URL}/accounts/facebook/login/?process=login` }

  const t = {
    ar: {
      title: "تسجيل الدخول", desc: "مرحباً بك مجدداً!",
      email: "البريد الإلكتروني", emailPh: "أدخل بريدك الإلكتروني",
      password: "كلمة المرور", passwordPh: "أدخل كلمة المرور",
      remember: "تذكرني", forgot: "نسيت كلمة المرور؟",
      submit: "تسجيل الدخول", submitting: "جارٍ تسجيل الدخول...",
      or: "أو سجل الدخول باستخدام",
      noAccount: "ليس لديك حساب؟", register: "إنشاء حساب جديد",
      verifiedMsg: "تم تفعيل حسابك بنجاح! يمكنك تسجيل الدخول الآن.",
      passwordResetMsg: "تم تحديث كلمة المرور بنجاح! سجّلي الدخول بكلمة المرور الجديدة.",
    },
    en: {
      title: "Sign In", desc: "Welcome back!",
      email: "Email Address", emailPh: "Enter your email",
      password: "Password", passwordPh: "Enter your password",
      remember: "Remember me", forgot: "Forgot password?",
      submit: "Sign In", submitting: "Signing in...",
      or: "Or sign in with",
      noAccount: "Don't have an account?", register: "Create New Account",
      verifiedMsg: "Account verified! You can sign in now.",
      passwordResetMsg: "Password updated successfully! Sign in with your new password.",
    },
  }[language]

  return (
    <>
      {/* ── Fix autofill white background ── */}
      <style>{autofillFix}</style>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 overflow-hidden bg-[#0f0f0f]">

        {/* خلفية الصورة — كاملة بدون قص على الموبايل/التابلت، وcover زي ما كانت على اللابتوب (lg فأكبر) */}
        <img src={banner} alt="background" className="absolute inset-0 w-full h-full object-contain lg:object-cover" />
        <div className="absolute inset-0 bg-black/50" />

        {/* الكارد */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`
            relative z-10 w-full max-w-[460px]
            bg-white/10 backdrop-blur-md
            border border-white/20
            rounded-2xl shadow-2xl
            px-5 sm:px-8 py-7 sm:py-10
            ${isAr ? "text-right" : "text-left"}
          `}
        >
          {/* LOGO */}
          <div className={`flex mb-4 sm:mb-6 ${isAr ? "justify-end" : "justify-start"}`}>
            <img src={logo} alt="Viona" className="h-10 sm:h-14 brightness-0 invert" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">{t.title}</h1>
          <p className="text-white/70 text-xs sm:text-sm mb-5 sm:mb-7">{t.desc}</p>

          {/* VERIFIED SUCCESS */}
          {justVerified && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 bg-green-500/20 border border-green-400/40 text-green-300 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm mb-4 ${isAr ? "flex-row-reverse" : ""}`}
            >
              <FiCheckCircle className="shrink-0" />
              <span>{t.verifiedMsg}</span>
            </motion.div>
          )}

          {/* PASSWORD RESET SUCCESS */}
          {justResetPassword && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 bg-green-500/20 border border-green-400/40 text-green-300 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm mb-4 ${isAr ? "flex-row-reverse" : ""}`}
            >
              <FiCheckCircle className="shrink-0" />
              <span>{t.passwordResetMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4">

            {/* ERROR */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 bg-red-500/20 border border-red-400/40 text-red-300 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm ${isAr ? "flex-row-reverse" : ""}`}
              >
                <FiAlertCircle className="shrink-0" /><span>{error}</span>
              </motion.div>
            )}

            {/* EMAIL */}
            <div>
              <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">{t.email}</label>
              <div className={`flex items-center gap-2.5 sm:gap-3 bg-white/10 border border-white/20 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus-within:border-[#D9A066] transition-all ${isAr ? "flex-row-reverse" : ""}`}>
                <FiMail className="text-white/60 shrink-0" />
                <input
                  name="email" type="email" value={form.email}
                  onChange={handleChange} placeholder={t.emailPh} required
                  autoComplete="email"
                  className={`flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/40 ${isAr ? "text-right" : ""}`}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">{t.password}</label>
              <div className={`flex items-center gap-2.5 sm:gap-3 bg-white/10 border border-white/20 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus-within:border-[#D9A066] transition-all ${isAr ? "flex-row-reverse" : ""}`}>
                <FiLock className="text-white/60 shrink-0" />
                <input
                  name="password" type={showPass ? "text" : "password"}
                  value={form.password} onChange={handleChange}
                  placeholder={t.passwordPh} required
                  autoComplete="current-password"
                  className={`flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/40 ${isAr ? "text-right" : ""}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-white/60 hover:text-[#D9A066] transition shrink-0">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* REMEMBER + FORGOT */}
            <div className={`flex items-center justify-between flex-wrap gap-y-2 ${isAr ? "flex-row-reverse" : ""}`}>
              <label className={`flex items-center gap-2 cursor-pointer ${isAr ? "flex-row-reverse" : ""}`}>
                <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} className="accent-[#D9A066]" />
                <span className="text-xs sm:text-sm text-white/70">{t.remember}</span>
              </label>
              {/* ✅ FIX: كان href="#" ومش بيوديك أي حتة، بقى Link حقيقي لصفحة نسيت كلمة المرور */}
              <Link to="/forgot-password" className="text-xs sm:text-sm text-[#D9A066] hover:underline">{t.forgot}</Link>
            </div>

            {/* SUBMIT */}
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-[0_6px_20px_rgba(217,160,102,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-1 text-sm sm:text-base"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? t.submitting : t.submit}
            </button>

            {/* DIVIDER */}
            <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/50 text-[11px] sm:text-xs">{t.or}</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* SOCIAL */}
            <div className="flex gap-2.5 sm:gap-3">
              <button type="button" onClick={handleGoogleLogin}
                className="flex-1 flex items-center justify-center gap-2 sm:gap-2.5 bg-white/10 border border-white/20 text-white font-medium py-3 sm:py-3.5 rounded-xl hover:border-[#D9A066] hover:bg-white/20 transition-all text-xs sm:text-sm">
                <GoogleIcon className="w-5 h-5 sm:w-6 sm:h-6" /> Google
              </button>
              <button type="button" onClick={handleFacebookLogin}
                className="flex-1 flex items-center justify-center gap-2 sm:gap-2.5 bg-white/10 border border-white/20 text-white font-medium py-3 sm:py-3.5 rounded-xl hover:border-[#D9A066] hover:bg-white/20 transition-all text-xs sm:text-sm">
                <FacebookIcon className="w-5 h-5 sm:w-6 sm:h-6" /> Facebook
              </button>
            </div>

            {/* REGISTER LINK */}
            <p className="text-center text-xs sm:text-sm text-white/60 mt-1">
              {t.noAccount}{" "}
              <Link to="/register" className="text-[#D9A066] font-semibold hover:underline">{t.register}</Link>
            </p>

          </form>
        </motion.div>
      </div>
    </>
  )
}

export default Login