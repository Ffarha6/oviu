import { useState, useContext } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { LanguageContext } from "../../context/LanguageContext"
import { motion } from "framer-motion"
import api from "../../api/axios"
import logo from "../../assets/images/logo.png"
import banner from "../../assets/images/banner.jpg"

import { FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi"

/* ── تعديل الـ autofill اللي بيحط خلفية بيضاء (نفس صفحة اللوجين بالظبط) ── */
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

function ResetPassword() {
  const { language } = useContext(LanguageContext)
  const navigate = useNavigate()
  const { token } = useParams()
  const isAr = language === "ar"

  // ✅ الرابط اللي بيوصل فعليًا من الباك إند شكله: /reset-password/TOKEN
  // (الـ token جزء من الـ path مش query string، اتأكدنا من ده من نص الإيميل الفعلي)

  const [showPass, setShowPass]           = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState("")
  const [form, setForm] = useState({ new_password: "", confirm_password: "" })

  const t = {
    ar: {
      title: "إعادة تعيين كلمة المرور",
      desc: "اختاري كلمة مرور جديدة وقوية لحسابك",
      newPass: "كلمة المرور الجديدة", newPassPh: "أدخلي كلمة المرور الجديدة",
      confirmPass: "تأكيد كلمة المرور", confirmPassPh: "أعيدي كتابة كلمة المرور",
      submit: "تحديث كلمة المرور", submitting: "جارٍ التحديث...",
      backToLogin: "الرجوع لتسجيل الدخول",
      mismatchError: "كلمتا المرور غير متطابقتين",
      genericError: "حصل خطأ، حاولي تاني",
      invalidLinkTitle: "الرابط غير صالح",
      invalidLinkDesc: "الرابط ده مش سليم أو منتهي الصلاحية. اطلبي رابط جديد من صفحة نسيت كلمة المرور.",
      requestNewLink: "طلب رابط جديد",
    },
    en: {
      title: "Reset Password",
      desc: "Choose a new, strong password for your account",
      newPass: "New Password", newPassPh: "Enter new password",
      confirmPass: "Confirm Password", confirmPassPh: "Re-enter password",
      submit: "Update Password", submitting: "Updating...",
      backToLogin: "Back to Sign In",
      mismatchError: "Passwords don't match",
      genericError: "Something went wrong, please try again",
      invalidLinkTitle: "Invalid Link",
      invalidLinkDesc: "This link is invalid or expired. Please request a new one from the forgot password page.",
      requestNewLink: "Request New Link",
    },
  }[language]

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (form.new_password !== form.confirm_password) {
      setError(t.mismatchError)
      return
    }

    setLoading(true)
    try {
      // ✅ FIX: الـ view في الباك إند بيقرا request.data.get('password')
      // مش 'new_password' (رغم إن السيريالايزر فيه new_password) — ده اللي كان
      // بيخلي العملية ترفض دايمًا حتى لو التوكن صح
      await api.post("/auth/reset-password/", {
        token,
        password: form.new_password,
      })
      // بعد نجاح التعيين نودّيها لصفحة اللوجين مع رسالة نجاح (نفس فكرة justVerified الموجودة هناك)
      navigate("/login", { state: { passwordReset: true }, replace: true })
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        t.genericError
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{autofillFix}</style>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 overflow-hidden bg-[#0f0f0f]">

        {/* خلفية الصورة — نفس صفحة اللوجين */}
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

          {!token ? (
            /* ── مفيش token في الرابط خالص، يبقى الرابط ملموم أو مش جاي من إيميلنا ── */
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center gap-3 sm:gap-4 py-3 sm:py-4"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500/20 border border-red-400/40 flex items-center justify-center">
                <FiAlertCircle className="text-red-300 text-2xl sm:text-3xl" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white">{t.invalidLinkTitle}</h1>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{t.invalidLinkDesc}</p>
              <Link
                to="/forgot-password"
                className="w-full text-center bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-[0_6px_20px_rgba(217,160,102,0.4)] mt-2 text-sm sm:text-base"
              >
                {t.requestNewLink}
              </Link>
            </motion.div>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">{t.title}</h1>
              <p className="text-white/70 text-xs sm:text-sm mb-5 sm:mb-7">{t.desc}</p>

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

                {/* NEW PASSWORD */}
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">{t.newPass}</label>
                  <div className={`flex items-center gap-2.5 sm:gap-3 bg-white/10 border border-white/20 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus-within:border-[#D9A066] transition-all ${isAr ? "flex-row-reverse" : ""}`}>
                    <FiLock className="text-white/60 shrink-0" />
                    <input
                      name="new_password" type={showPass ? "text" : "password"}
                      value={form.new_password} onChange={handleChange}
                      placeholder={t.newPassPh} required minLength={6}
                      autoComplete="new-password"
                      className={`flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/40 ${isAr ? "text-right" : ""}`}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="text-white/60 hover:text-[#D9A066] transition shrink-0">
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">{t.confirmPass}</label>
                  <div className={`flex items-center gap-2.5 sm:gap-3 bg-white/10 border border-white/20 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus-within:border-[#D9A066] transition-all ${isAr ? "flex-row-reverse" : ""}`}>
                    <FiLock className="text-white/60 shrink-0" />
                    <input
                      name="confirm_password" type={showConfirm ? "text" : "password"}
                      value={form.confirm_password} onChange={handleChange}
                      placeholder={t.confirmPassPh} required minLength={6}
                      autoComplete="new-password"
                      className={`flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/40 ${isAr ? "text-right" : ""}`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-white/60 hover:text-[#D9A066] transition shrink-0">
                      {showConfirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-[0_6px_20px_rgba(217,160,102,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-1 text-sm sm:text-base"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? t.submitting : t.submit}
                </button>
              </form>
            </>
          )}

          {/* BACK TO LOGIN */}
          <Link
            to="/login"
            className="flex items-center justify-center text-xs sm:text-sm text-[#D9A066] hover:underline mt-5 sm:mt-6"
          >
            {t.backToLogin}
          </Link>
        </motion.div>
      </div>
    </>
  )
}

export default ResetPassword