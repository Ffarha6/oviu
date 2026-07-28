import { useState, useContext } from "react"
import { Link } from "react-router-dom"
import { LanguageContext } from "../../context/LanguageContext"
import { motion } from "framer-motion"
import api from "../../api/axios"
import logo from "../../assets/images/logo.png"
import banner from "../../assets/images/banner.jpg"

import { FiMail, FiAlertCircle, FiCheckCircle, FiArrowLeft, FiArrowRight } from "react-icons/fi"

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

function ForgotPassword() {
  const { language } = useContext(LanguageContext)
  const isAr = language === "ar"
  const BackArrow = isAr ? FiArrowRight : FiArrowLeft

  const [email, setEmail]     = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [sent, setSent]       = useState(false)

  const t = {
    ar: {
      title: "نسيت كلمة المرور؟",
      desc: "محدش هيلاحظ، هنبعتلك رابط لإعادة التعيين على إيميلك",
      email: "البريد الإلكتروني", emailPh: "أدخل بريدك الإلكتروني",
      submit: "إرسال رابط إعادة التعيين", submitting: "جارٍ الإرسال...",
      backToLogin: "الرجوع لتسجيل الدخول",
      sentTitle: "اتبعت الإيميل!",
      sentDesc: "لو الإيميل ده مسجل عندنا، هتلاقي رابط لإعادة تعيين كلمة المرور في بريدك خلال دقايق. متنسيش تتأكدي من الـ Spam.",
      genericError: "حصل خطأ، حاولي تاني",
    },
    en: {
      title: "Forgot Password?",
      desc: "No worries, we'll send a reset link to your email",
      email: "Email Address", emailPh: "Enter your email",
      submit: "Send Reset Link", submitting: "Sending...",
      backToLogin: "Back to Sign In",
      sentTitle: "Email Sent!",
      sentDesc: "If that email is registered with us, you'll receive a password reset link in a few minutes. Don't forget to check Spam.",
      genericError: "Something went wrong, please try again",
    },
  }[language]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.post("/auth/forgot-password/", { email })
      setSent(true)
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
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

          {!sent ? (
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

                {/* EMAIL */}
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">{t.email}</label>
                  <div className={`flex items-center gap-2.5 sm:gap-3 bg-white/10 border border-white/20 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus-within:border-[#D9A066] transition-all ${isAr ? "flex-row-reverse" : ""}`}>
                    <FiMail className="text-white/60 shrink-0" />
                    <input
                      type="email" value={email}
                      onChange={(e) => { setEmail(e.target.value); setError("") }}
                      placeholder={t.emailPh} required
                      autoComplete="email"
                      className={`flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/40 ${isAr ? "text-right" : ""}`}
                    />
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
          ) : (
            /* ── SUCCESS STATE ── */
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center gap-3 sm:gap-4 py-3 sm:py-4"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center">
                <FiCheckCircle className="text-green-300 text-2xl sm:text-3xl" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white">{t.sentTitle}</h1>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{t.sentDesc}</p>
            </motion.div>
          )}

          {/* BACK TO LOGIN */}
          <Link
            to="/login"
            className={`flex items-center justify-center gap-2 text-xs sm:text-sm text-[#D9A066] hover:underline mt-5 sm:mt-6 ${isAr ? "flex-row-reverse" : ""}`}
          >
            <BackArrow size={14} />
            {t.backToLogin}
          </Link>
        </motion.div>
      </div>
    </>
  )
}

export default ForgotPassword