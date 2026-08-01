import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LanguageContext } from "../../context/LanguageContext"
import { useAuth } from "../../context/AuthContext"
import { motion } from "framer-motion"
import api from "../../api/axios"
import banner from "../../assets/images/banner.jpg"


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
import logo from "../../assets/images/logo.png"
import sunglassesImg from "../../assets/images/sunglasses.jpg"
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from "react-icons/fi"

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



/* ── مشترك: خلفية الصورة ── */
const PageWrapper = ({ children }) => (
  <div className="relative min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 overflow-hidden bg-[#0f0f0f]">
    <style>{autofillFix}</style>
    <img src={banner} alt="background" className="absolute inset-0 w-full h-full object-contain lg:object-cover" />
    <div className="absolute inset-0 bg-black/55" />
    <div className="relative z-10 w-full flex items-center justify-center">
      {children}
    </div>
  </div>
)

function Register() {
  const { language } = useContext(LanguageContext)
  const { login } = useAuth()
  const navigate = useNavigate()
  const isAr = language === "ar"

  const [step, setStep]             = useState("form")
  const [registrationId, setRegistrationId] = useState(null)
  const [verifyCode, setVerifyCode] = useState("")
  const [verifyError, setVerifyError]   = useState("")
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifySuccess, setVerifySuccess] = useState(false)

  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed]           = useState(true)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState("")
  const [countryCode, setCountryCode] = useState("+20")
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreed) { setError(isAr ? "يجب الموافقة على الشروط" : "You must agree to the terms"); return }
    if (form.password !== form.confirm) { setError(isAr ? "كلمتا المرور غير متطابقتين" : "Passwords do not match"); return }

    setLoading(true); setError("")
    try {
      const res = await api.post("/auth/register/", {
        username: `${form.firstName}${form.lastName}`.replace(/\s/g, "_") || form.email.split("@")[0],
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone ? `${countryCode}${form.phone}` : "",
        password: form.password,
        password_confirm: form.confirm,
      })
      setRegistrationId(res.data.registration_id)
      setStep("verify")
    } catch (err) {
      const data = err.response?.data
      setError(data?.error || data?.detail || data?.email?.[0] || data?.password?.[0] || (isAr ? "حدث خطأ، يرجى المحاولة مجدداً" : "An error occurred"))
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!verifyCode.trim()) { setVerifyError(isAr ? "أدخل الكود" : "Enter the code"); return }
    setVerifyLoading(true); setVerifyError("")
    try {
      const res = await api.post("/auth/verify-email/", {
        registration_id: registrationId,
        code: verifyCode.toUpperCase()
      })

      if (!res.data?.token) {
        throw new Error("Verification succeeded but no authentication token was returned")
      }

      await login(
        {
          id: res.data.user_id,
          username: res.data.username,
          email: res.data.email,
          phone: res.data.phone,
          is_staff: res.data.is_staff,
          is_superuser: res.data.is_superuser,
        },
        res.data.token
      )

      setVerifySuccess(true)
      setTimeout(() => navigate("/", { replace: true }), 800)
    } catch (err) {
      setVerifyError(err.response?.data?.error || (isAr ? "الكود غير صحيح أو منتهي الصلاحية" : "Invalid or expired code"))
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleGoogleLogin   = () => { window.location.href = `${BACKEND_URL}/accounts/google/login/?process=login` }

  const t = {
    ar: {
      title: "إنشاء حساب جديد", desc: "أنشئ حسابك الآن واستمتع بتجربة تسوق فريدة",
      firstName: "الاسم الأول", firstPh: "أدخل اسمك الأول",
      lastName: "اسم العائلة", lastPh: "أدخل اسم العائلة",
      email: "البريد الإلكتروني", emailPh: "أدخل بريدك الإلكتروني",
      phone: "رقم الجوال", phonePh: "1xxxxxxxx",
      password: "كلمة المرور", passwordPh: "أدخل كلمة المرور",
      confirm: "تأكيد كلمة المرور", confirmPh: "أعد إدخال كلمة المرور",
      terms: "أوافق على", termsLink: "الشروط والأحكام",
      submit: "إنشاء حساب", submitting: "جارٍ الإنشاء...",
      or: "أو سجل باستخدام",
      hasAccount: "لديك حساب؟", login: "تسجيل الدخول",
      verifyTitle: "تأكيد البريد الإلكتروني",
      verifyDesc: "أرسلنا كود التفعيل إلى",
      verifyPh: "أدخل الكود المكون من 6 أحرف",
      verifyBtn: "تأكيد الحساب", verifying: "جارٍ التحقق...",
      verifySuccess: "تم تفعيل حسابك وتسجيل دخولك بنجاح! جارٍ فتح الموقع...",
      back: "تعديل البيانات",
    },
    en: {
      title: "Create New Account", desc: "Create your account and enjoy a unique shopping experience",
      firstName: "First Name", firstPh: "Enter your first name",
      lastName: "Last Name", lastPh: "Enter your last name",
      email: "Email Address", emailPh: "Enter your email",
      phone: "Phone Number", phonePh: "1xxxxxxxx",
      password: "Password", passwordPh: "Enter your password",
      confirm: "Confirm Password", confirmPh: "Re-enter your password",
      terms: "I agree to the", termsLink: "Terms & Conditions",
      submit: "Create Account", submitting: "Creating...",
      or: "Or sign up with",
      hasAccount: "Already have an account?", login: "Sign In",
      verifyTitle: "Verify Your Email",
      verifyDesc: "We sent a verification code to",
      verifyPh: "Enter the 6-character code",
      verifyBtn: "Verify Account", verifying: "Verifying...",
      verifySuccess: "Account verified and signed in! Opening the store...",
      back: "Edit details",
    },
  }[language]

  /* ── STEP: Verify ── */
  if (step === "verify") {
    return (
      <PageWrapper>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className={`w-full max-w-[440px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl px-5 sm:px-8 py-7 sm:py-10 ${isAr ? "text-right" : "text-left"}`}
        >
          <div className={`flex mb-4 sm:mb-6 ${isAr ? "justify-end" : "justify-start"}`}>
            <img src={logo} alt="Viona" className="h-10 sm:h-14 brightness-0 invert" />
          </div>

          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#D9A066]/20 border border-[#D9A066]/40 flex items-center justify-center mb-4 sm:mb-5">
            <FiMail className="text-[#D9A066] text-xl sm:text-2xl" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{t.verifyTitle}</h1>
          <p className="text-white/60 text-xs sm:text-sm mb-1">{t.verifyDesc}</p>
          <p className="text-[#D9A066] font-semibold text-xs sm:text-sm mb-5 sm:mb-7 break-all">{form.email}</p>

          {verifySuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 bg-green-500/20 border border-green-400/40 text-green-300 px-3.5 sm:px-4 py-3.5 sm:py-4 rounded-xl"
            >
              <FiCheckCircle className="text-lg sm:text-xl shrink-0" />
              <span className="font-medium text-xs sm:text-sm">{t.verifySuccess}</span>
            </motion.div>
          ) : (
            <form onSubmit={handleVerify} className="flex flex-col gap-3.5 sm:gap-4">
              {verifyError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 bg-red-500/20 border border-red-400/40 text-red-300 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm ${isAr ? "flex-row-reverse" : ""}`}
                >
                  <FiAlertCircle className="shrink-0" /><span>{verifyError}</span>
                </motion.div>
              )}

              <input
                type="text" value={verifyCode}
                onChange={(e) => { setVerifyCode(e.target.value); setVerifyError("") }}
                placeholder={t.verifyPh} maxLength={6} autoFocus
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 sm:px-5 py-3.5 sm:py-4 text-center text-xl sm:text-2xl font-bold tracking-[0.35em] sm:tracking-[0.5em] text-white outline-none focus:border-[#D9A066] transition-all placeholder:tracking-normal placeholder:text-sm sm:placeholder:text-base placeholder:font-normal placeholder:text-white/30"
              />

              <button
                type="submit" disabled={verifyLoading || verifyCode.length < 6}
                className="w-full bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-[0_6px_20px_rgba(217,160,102,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {verifyLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {verifyLoading ? t.verifying : t.verifyBtn}
              </button>

              <button type="button" onClick={() => setStep("form")} className="text-center text-xs sm:text-sm text-white/50 hover:text-[#D9A066] transition-colors">
                ← {t.back}
              </button>
            </form>
          )}
        </motion.div>
      </PageWrapper>
    )
  }

  /* ── STEP: Form ── */
  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className={`w-full max-w-[520px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl px-5 sm:px-8 py-7 sm:py-10 ${isAr ? "text-right" : "text-left"}`}
      >
        {/* LOGO */}
        <div className={`flex mb-4 sm:mb-6 ${isAr ? "justify-end" : "justify-start"}`}>
          <img src={logo} alt="Viona" className="h-10 sm:h-14 brightness-0 invert" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">{t.title}</h1>
        <p className="text-white/60 text-xs sm:text-sm mb-5 sm:mb-7">{t.desc}</p>

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

          {/* NAME ROW */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">{t.firstName}</label>
              <div className={`flex items-center gap-1.5 sm:gap-2 bg-white/10 border border-white/20 rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 focus-within:border-[#D9A066] transition-all ${isAr ? "flex-row-reverse" : ""}`}>
                <FiUser className="text-white/50 shrink-0 text-xs sm:text-sm" />
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder={t.firstPh} required
                  className={`flex-1 min-w-0 bg-transparent outline-none text-white text-xs sm:text-sm placeholder:text-white/30 ${isAr ? "text-right" : ""}`} />
              </div>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">{t.lastName}</label>
              <div className={`flex items-center gap-1.5 sm:gap-2 bg-white/10 border border-white/20 rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 focus-within:border-[#D9A066] transition-all ${isAr ? "flex-row-reverse" : ""}`}>
                <FiUser className="text-white/50 shrink-0 text-xs sm:text-sm" />
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder={t.lastPh}
                  className={`flex-1 min-w-0 bg-transparent outline-none text-white text-xs sm:text-sm placeholder:text-white/30 ${isAr ? "text-right" : ""}`} />
              </div>
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">{t.email}</label>
            <div className={`flex items-center gap-2.5 sm:gap-3 bg-white/10 border border-white/20 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus-within:border-[#D9A066] transition-all ${isAr ? "flex-row-reverse" : ""}`}>
              <FiMail className="text-white/50 shrink-0" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder={t.emailPh} required
                className={`flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30 ${isAr ? "text-right" : ""}`} />
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">{t.phone}</label>
            <div className={`flex items-center gap-2 sm:gap-3 bg-white/10 border border-white/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:border-[#D9A066] transition-all ${isAr ? "flex-row-reverse" : ""}`}>
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                onKeyDown={(e) => e.key === "Backspace" && e.preventDefault()}
                className="bg-transparent outline-none text-white text-xs sm:text-sm border-r border-white/20 pr-2 sm:pr-3 cursor-pointer shrink-0">
                <option value="+20" className="text-black">🇪🇬 +20</option>
                <option value="+966" className="text-black">🇸🇦 +966</option>
                <option value="+971" className="text-black">🇦🇪 +971</option>
                <option value="+1"  className="text-black">🇺🇸 +1</option>
                <option value="+44" className="text-black">🇬🇧 +44</option>
              </select>
              <FiPhone className="text-white/50 shrink-0" />
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder={t.phonePh}
                className={`flex-1 min-w-0 bg-transparent outline-none text-white text-sm placeholder:text-white/30 ${isAr ? "text-right" : ""}`} />
            </div>
          </div>

          {/* PASSWORD ROW */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">{t.password}</label>
              <div className={`flex items-center gap-1.5 sm:gap-2 bg-white/10 border border-white/20 rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 focus-within:border-[#D9A066] transition-all ${isAr ? "flex-row-reverse" : ""}`}>
                <FiLock className="text-white/50 shrink-0 text-xs sm:text-sm" />
                <input name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handleChange} placeholder={t.passwordPh} required
                  className={`flex-1 bg-transparent outline-none text-white text-xs sm:text-sm placeholder:text-white/30 min-w-0 ${isAr ? "text-right" : ""}`} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-white/50 hover:text-[#D9A066] transition shrink-0">
                  {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">{t.confirm}</label>
              <div className={`flex items-center gap-1.5 sm:gap-2 bg-white/10 border border-white/20 rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 focus-within:border-[#D9A066] transition-all ${isAr ? "flex-row-reverse" : ""}`}>
                <FiLock className="text-white/50 shrink-0 text-xs sm:text-sm" />
                <input name="confirm" type={showConfirm ? "text" : "password"} value={form.confirm} onChange={handleChange} placeholder={t.confirmPh} required
                  className={`flex-1 bg-transparent outline-none text-white text-xs sm:text-sm placeholder:text-white/30 min-w-0 ${isAr ? "text-right" : ""}`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-white/50 hover:text-[#D9A066] transition shrink-0">
                  {showConfirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* TERMS */}
          <label className={`flex items-start gap-2.5 sm:gap-3 cursor-pointer ${isAr ? "flex-row-reverse" : ""}`}>
            <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="accent-[#D9A066] mt-0.5 shrink-0" />
            <span className="text-xs sm:text-sm text-white/60">
              {t.terms}{" "}
              <a href="#" className="text-[#D9A066] hover:underline font-medium">{t.termsLink}</a>
            </span>
          </label>

          {/* SUBMIT */}
          <button
            type="submit" disabled={loading || !agreed}
            className="w-full bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-[0_6px_20px_rgba(217,160,102,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? t.submitting : t.submit}
          </button>

          {/* DIVIDER */}
          <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-white/40 text-[11px] sm:text-xs">{t.or}</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* SOCIAL */}
          <div className="flex gap-2.5 sm:gap-3">
            <button type="button" onClick={handleGoogleLogin}
              className="flex-1 flex items-center justify-center gap-2 sm:gap-2.5 bg-white/10 border border-white/20 text-white font-medium py-3 sm:py-3.5 rounded-xl hover:border-[#D9A066] hover:bg-white/20 transition-all text-xs sm:text-sm">
              <GoogleIcon className="w-5 h-5 sm:w-6 sm:h-6" /> Google
            </button>

          </div>

          {/* LOGIN LINK */}
          <p className="text-center text-xs sm:text-sm text-white/50 mt-1">
            {t.hasAccount}{" "}
            <Link to="/login" className="text-[#D9A066] font-semibold hover:underline">{t.login}</Link>
          </p>

        </form>
      </motion.div>
    </PageWrapper>
  )
}

export default Register
