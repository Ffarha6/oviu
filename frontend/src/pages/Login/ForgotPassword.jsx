import { useState, useContext } from "react"
import { Link } from "react-router-dom"
import { LanguageContext } from "../../context/LanguageContext"
import { motion } from "framer-motion"
import api from "../../api/axios"
import logo from "../../assets/images/logo.png"
import banner from "../../assets/images/banner.jpg"

import {
  FiMail,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowLeft,
  FiArrowRight,
  FiLock,
  FiKey,
  FiEye,
  FiEyeOff,
} from "react-icons/fi"

/* ─────────────────────────────────────────────
   Autofill Fix
───────────────────────────────────────────── */
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

  /*
    step 1 = إدخال الإيميل
    step 2 = إدخال الكود
    step 3 = إنشاء باسورد جديد
    step 4 = تم بنجاح
  */
  const [step, setStep] = useState(1)

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const t = {
    ar: {
      step1Title: "نسيت كلمة المرور؟",
      step1Desc: "ولا يهمك، هنبعتلك كود تحقق على إيميلك",

      email: "البريد الإلكتروني",
      emailPh: "أدخل بريدك الإلكتروني",
      sendCode: "إرسال كود التحقق",
      sending: "جارٍ إرسال الكود...",

      step2Title: "أدخل كود التحقق",
      step2Desc: "أدخل الكود المكوّن من 6 أرقام اللي اتبعت على إيميلك",
      code: "كود التحقق",
      codePh: "أدخل الكود",
      verifyCode: "تأكيد الكود",
      verifying: "جارٍ التحقق...",

      resendCode: "إعادة إرسال الكود",
      changeEmail: "تغيير البريد الإلكتروني",

      step3Title: "إنشاء كلمة مرور جديدة",
      step3Desc: "اكتب كلمة المرور الجديدة لحسابك",

      password: "كلمة المرور الجديدة",
      passwordPh: "أدخل كلمة المرور الجديدة",

      confirmPassword: "تأكيد كلمة المرور",
      confirmPasswordPh: "أعد إدخال كلمة المرور",

      changePassword: "تغيير كلمة المرور",
      changing: "جارٍ تغيير كلمة المرور...",

      successTitle: "تم تغيير كلمة المرور!",
      successDesc:
        "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.",

      login: "تسجيل الدخول",

      required: "من فضلك أدخل البيانات المطلوبة",
      passwordMismatch: "كلمتا المرور غير متطابقتين",
      genericError: "حصل خطأ، حاولي تاني",
    },

    en: {
      step1Title: "Forgot Password?",
      step1Desc: "No worries, we'll send a verification code to your email",

      email: "Email Address",
      emailPh: "Enter your email",
      sendCode: "Send Verification Code",
      sending: "Sending code...",

      step2Title: "Enter Verification Code",
      step2Desc: "Enter the 6-digit code sent to your email",
      code: "Verification Code",
      codePh: "Enter the code",
      verifyCode: "Verify Code",
      verifying: "Verifying...",

      resendCode: "Resend Code",
      changeEmail: "Change Email",

      step3Title: "Create New Password",
      step3Desc: "Enter a new password for your account",

      password: "New Password",
      passwordPh: "Enter your new password",

      confirmPassword: "Confirm Password",
      confirmPasswordPh: "Re-enter your password",

      changePassword: "Change Password",
      changing: "Changing password...",

      successTitle: "Password Changed!",
      successDesc:
        "Your password has been changed successfully. You can now sign in with your new password.",

      login: "Sign In",

      required: "Please enter all required information",
      passwordMismatch: "Passwords do not match",
      genericError: "Something went wrong, please try again",
    },
  }[language] || {}

  /* ─────────────────────────────────────────────
     STEP 1
     إرسال الكود للإيميل
  ───────────────────────────────────────────── */
  const handleSendCode = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      setError(t.required)
      return
    }

    setLoading(true)
    setError("")

    try {
      await api.post("/auth/forgot-password/", {
        email: email.trim(),
      })

      setStep(2)
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

  /* ─────────────────────────────────────────────
     STEP 2
     التحقق من الكود
  ───────────────────────────────────────────── */
  const handleVerifyCode = async (e) => {
    e.preventDefault()

    if (!code.trim()) {
      setError(t.required)
      return
    }

    setLoading(true)
    setError("")

    try {
      await api.post("/auth/verify-reset-code/", {
        email: email.trim(),
        code: code.trim(),
      })

      setStep(3)
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          t.genericError
      )
    } finally {
      setLoading(false)
    }
  }

  /* ─────────────────────────────────────────────
     STEP 3
     تغيير الباسورد
  ───────────────────────────────────────────── */
  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      setError(t.required)
      return
    }

    if (password !== confirmPassword) {
      setError(t.passwordMismatch)
      return
    }

    setLoading(true)
    setError("")

    try {
      await api.post("/auth/reset-password/", {
        email: email.trim(),
        code: code.trim(),
        password,
      })

      setStep(4)
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          t.genericError
      )
    } finally {
      setLoading(false)
    }
  }

  /* ─────────────────────────────────────────────
     إعادة إرسال الكود
  ───────────────────────────────────────────── */
  const handleResendCode = async () => {
    setLoading(true)
    setError("")

    try {
      await api.post("/auth/forgot-password/", {
        email: email.trim(),
      })

      setCode("")
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          t.genericError
      )
    } finally {
      setLoading(false)
    }
  }

  /* ─────────────────────────────────────────────
     شكل الـ Input
  ───────────────────────────────────────────── */
  const inputWrapper = `
    flex items-center gap-3
    bg-white/10
    border border-white/20
    rounded-xl
    px-4 py-3
    focus-within:border-[#D9A066]
    transition-all
  `

  return (
    <>
      {autofillFix}

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 overflow-hidden bg-[#0f0f0f]">

        {/* BACKGROUND */}
        <img
          src={banner}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50" />

        {/* CARD */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`
            relative z-10
            w-full max-w-[460px]
            bg-white/10
            backdrop-blur-md
            border border-white/20
            rounded-2xl
            shadow-2xl
            px-5 sm:px-8
            py-7 sm:py-10
            ${isAr ? "text-right" : "text-left"}
          `}
        >

          {/* LOGO */}
          <div
            className={`
              flex mb-5 sm:mb-7
              ${isAr ? "justify-end" : "justify-start"}
            `}
          >
            <img
              src={logo}
              alt="OVIU"
              className="h-10 sm:h-14 brightness-0 invert"
            />
          </div>


          {/* ═══════════════════════════════════════
              STEP 1 - EMAIL
          ═══════════════════════════════════════ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {t.step1Title}
              </h1>

              <p className="text-white/70 text-xs sm:text-sm mb-6">
                {t.step1Desc}
              </p>

              {error && (
                <ErrorMessage
                  error={error}
                  isAr={isAr}
                />
              )}

              <form
                onSubmit={handleSendCode}
                className="flex flex-col gap-4"
              >

                <div>
                  <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">
                    {t.email}
                  </label>

                  <div
                    className={`
                      ${inputWrapper}
                      ${isAr ? "flex-row-reverse" : ""}
                    `}
                  >
                    <FiMail className="text-white/60 shrink-0" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError("")
                      }}
                      placeholder={t.emailPh}
                      required
                      autoComplete="email"
                      className={`
                        flex-1
                        bg-transparent
                        outline-none
                        text-white
                        text-sm
                        placeholder:text-white/40
                        ${isAr ? "text-right" : ""}
                      `}
                    />
                  </div>
                </div>


                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    bg-[#D9A066]
                    hover:bg-[#c98d54]
                    text-white
                    font-bold
                    py-3 sm:py-3.5
                    rounded-xl
                    transition-all
                    hover:scale-[1.02]
                    shadow-[0_6px_20px_rgba(217,160,102,0.4)]
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    disabled:hover:scale-100
                    flex items-center justify-center gap-2
                    text-sm sm:text-base
                  "
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}

                  {loading ? t.sending : t.sendCode}
                </button>

              </form>
            </motion.div>
          )}


          {/* ═══════════════════════════════════════
              STEP 2 - CODE
          ═══════════════════════════════════════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >

              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-[#D9A066]/20 border border-[#D9A066]/40 flex items-center justify-center">
                  <FiKey className="text-[#D9A066] text-2xl" />
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
                {t.step2Title}
              </h1>

              <p className="text-white/70 text-xs sm:text-sm text-center mb-6 leading-relaxed">
                {t.step2Desc}
              </p>

              <p className="text-[#D9A066] text-sm text-center mb-5 break-all">
                {email}
              </p>

              {error && (
                <ErrorMessage
                  error={error}
                  isAr={isAr}
                />
              )}

              <form
                onSubmit={handleVerifyCode}
                className="flex flex-col gap-4"
              >

                <div>
                  <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">
                    {t.code}
                  </label>

                  <div
                    className={`
                      ${inputWrapper}
                      ${isAr ? "flex-row-reverse" : ""}
                    `}
                  >
                    <FiKey className="text-white/60 shrink-0" />

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={code}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)

                        setCode(value)
                        setError("")
                      }}
                      placeholder={t.codePh}
                      required
                      autoComplete="one-time-code"
                      className="
                        flex-1
                        bg-transparent
                        outline-none
                        text-white
                        text-lg
                        tracking-[0.5em]
                        text-center
                        placeholder:text-white/40
                        placeholder:tracking-normal
                      "
                    />
                  </div>
                </div>


                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="
                    w-full
                    bg-[#D9A066]
                    hover:bg-[#c98d54]
                    text-white
                    font-bold
                    py-3 sm:py-3.5
                    rounded-xl
                    transition-all
                    hover:scale-[1.02]
                    shadow-[0_6px_20px_rgba(217,160,102,0.4)]
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    disabled:hover:scale-100
                    flex items-center justify-center gap-2
                    text-sm sm:text-base
                  "
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}

                  {loading ? t.verifying : t.verifyCode}
                </button>

              </form>


              {/* RESEND / CHANGE EMAIL */}
              <div className="flex flex-col items-center gap-3 mt-5">

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-[#D9A066] text-sm hover:underline disabled:opacity-50"
                >
                  {t.resendCode}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1)
                    setCode("")
                    setError("")
                  }}
                  className="text-white/60 text-xs hover:text-white transition"
                >
                  {t.changeEmail}
                </button>

              </div>

            </motion.div>
          )}


          {/* ═══════════════════════════════════════
              STEP 3 - NEW PASSWORD
          ═══════════════════════════════════════ */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >

              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-[#D9A066]/20 border border-[#D9A066]/40 flex items-center justify-center">
                  <FiLock className="text-[#D9A066] text-2xl" />
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
                {t.step3Title}
              </h1>

              <p className="text-white/70 text-xs sm:text-sm text-center mb-6">
                {t.step3Desc}
              </p>

              {error && (
                <ErrorMessage
                  error={error}
                  isAr={isAr}
                />
              )}

              <form
                onSubmit={handleResetPassword}
                className="flex flex-col gap-4"
              >

                {/* PASSWORD */}
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">
                    {t.password}
                  </label>

                  <div
                    className={`
                      ${inputWrapper}
                      ${isAr ? "flex-row-reverse" : ""}
                    `}
                  >
                    <FiLock className="text-white/60 shrink-0" />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError("")
                      }}
                      placeholder={t.passwordPh}
                      required
                      autoComplete="new-password"
                      className={`
                        flex-1
                        bg-transparent
                        outline-none
                        text-white
                        text-sm
                        placeholder:text-white/40
                        ${isAr ? "text-right" : ""}
                      `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      className="text-white/50 hover:text-white"
                    >
                      {showPassword ? (
                        <FiEyeOff />
                      ) : (
                        <FiEye />
                      )}
                    </button>

                  </div>
                </div>


                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-white mb-1.5 block">
                    {t.confirmPassword}
                  </label>

                  <div
                    className={`
                      ${inputWrapper}
                      ${isAr ? "flex-row-reverse" : ""}
                    `}
                  >
                    <FiLock className="text-white/60 shrink-0" />

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        setError("")
                      }}
                      placeholder={t.confirmPasswordPh}
                      required
                      autoComplete="new-password"
                      className={`
                        flex-1
                        bg-transparent
                        outline-none
                        text-white
                        text-sm
                        placeholder:text-white/40
                        ${isAr ? "text-right" : ""}
                      `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      className="text-white/50 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff />
                      ) : (
                        <FiEye />
                      )}
                    </button>

                  </div>
                </div>


                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    bg-[#D9A066]
                    hover:bg-[#c98d54]
                    text-white
                    font-bold
                    py-3 sm:py-3.5
                    rounded-xl
                    transition-all
                    hover:scale-[1.02]
                    shadow-[0_6px_20px_rgba(217,160,102,0.4)]
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    disabled:hover:scale-100
                    flex items-center justify-center gap-2
                    text-sm sm:text-base
                  "
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}

                  {loading
                    ? t.changing
                    : t.changePassword}
                </button>

              </form>

            </motion.div>
          )}


          {/* ═══════════════════════════════════════
              STEP 4 - SUCCESS
          ═══════════════════════════════════════ */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center gap-4 py-3"
            >

              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center">
                <FiCheckCircle className="text-green-300 text-3xl" />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {t.successTitle}
              </h1>

              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                {t.successDesc}
              </p>

              <Link
                to="/login"
                className="
                  w-full
                  bg-[#D9A066]
                  hover:bg-[#c98d54]
                  text-white
                  font-bold
                  py-3
                  rounded-xl
                  transition-all
                  hover:scale-[1.02]
                  shadow-[0_6px_20px_rgba(217,160,102,0.4)]
                  text-sm
                  mt-2
                "
              >
                {t.login}
              </Link>

            </motion.div>
          )}


          {/* BACK TO LOGIN */}
          {step !== 4 && (
            <Link
              to="/login"
              className={`
                flex items-center justify-center gap-2
                text-xs sm:text-sm
                text-[#D9A066]
                hover:underline
                mt-6
                ${isAr ? "flex-row-reverse" : ""}
              `}
            >
              <BackArrow size={14} />
              {t.login}
            </Link>
          )}

        </motion.div>
      </div>
    </>
  )
}


/* ─────────────────────────────────────────────
   Error Message
───────────────────────────────────────────── */
function ErrorMessage({ error, isAr }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex items-center gap-2
        bg-red-500/20
        border border-red-400/40
        text-red-300
        px-3.5 sm:px-4
        py-2.5 sm:py-3
        rounded-xl
        text-xs sm:text-sm
        mb-4
        ${isAr ? "flex-row-reverse" : ""}
      `}
    >
      <FiAlertCircle className="shrink-0" />
      <span>{error}</span>
    </motion.div>
  )
}

export default ForgotPassword