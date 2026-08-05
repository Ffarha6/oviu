import { useState, useContext } from "react"
import { LanguageContext } from "../../context/LanguageContext"
import { useSettings } from "../../context/SettingsContext"
import { FaChevronLeft, FaGlobe, FaBell, FaLock, FaSlidersH, FaEnvelope, FaCommentDots, FaWhatsapp } from "react-icons/fa"

// صف إعداد عام (أيقونة + تسمية + قيمة اختيارية + سهم) — مستخدم هنا بس
function SettingsRow({ icon, label, value, onClick, last }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 ${last ? "" : "border-b border-[#f5f5f5] dark:border-gray-700"}`}
      style={{ fontFamily: "'Cairo',sans-serif" }}
    >
      <span className="flex items-center gap-3 text-[15px] sm:text-base text-[#333] dark:text-gray-200">
        <span className="text-[#E8821A] shrink-0">{icon}</span>
        {label}
      </span>
      <span className="flex items-center gap-2 text-[#999] dark:text-gray-500 text-sm shrink-0">
        {value}
        <FaChevronLeft className="text-xs" style={{ transform: "rotate(180deg)" }} />
      </span>
    </button>
  )
}

// مفتاح تبديل بسيط (Toggle) — مستخدم هنا بس
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0 ${checked ? "bg-[#E8821A]" : "bg-[#e0e0e0] dark:bg-gray-600"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${checked ? "left-0.5" : "left-[22px]"}`}
      />
    </button>
  )
}

// ── شاشة الإشعارات الفرعية ─────────────────────────────────────────
function NotificationsView({ onBack }) {
  // ⚠️ دي حالة محلية بس لحد ما نضيف حقول فعلية للتفضيلات دي في User model
  // بالباك إند وendpoint يحفظها - دلوقتي بترجع للوضع الافتراضي بعد أي refresh
  const [email, setEmail] = useState(true)
  const [sms, setSms] = useState(true)
  const [whatsapp, setWhatsapp] = useState(true)

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#666] dark:text-gray-400 text-sm font-semibold self-start"
        style={{ fontFamily: "'Cairo',sans-serif" }}
      >
        <FaChevronLeft style={{ transform: "rotate(180deg)" }} />
        رجوع للإعدادات
      </button>

      <div className="bg-white dark:bg-black rounded-2xl p-4 sm:p-6 border border-[#f0f0f0] dark:border-gray-700">
        <h3 className="m-0 mb-2 text-base sm:text-lg font-bold text-[#222] dark:text-gray-100">إشعارات التطبيق</h3>
        <p className="m-0 text-[13px] sm:text-sm text-[#888] dark:text-gray-400 leading-relaxed">
          فعّلي إشعارات المتصفح أو التطبيق عشان متفوتيش تحديثات طلباتك والعروض الجديدة.
        </p>
      </div>

      <div className="bg-white dark:bg-black rounded-2xl p-4 sm:p-6 border border-[#f0f0f0] dark:border-gray-700">
        <h3 className="m-0 mb-4 text-base sm:text-lg font-bold text-[#222] dark:text-gray-100">تفضيلات التسويق</h3>

        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2.5 text-[15px] text-[#333] dark:text-gray-200">
              <FaEnvelope className="text-[#999] dark:text-gray-500" /> البريد الإلكتروني
            </span>
            <Toggle checked={email} onChange={setEmail} />
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2.5 text-[15px] text-[#333] dark:text-gray-200">
              <FaCommentDots className="text-[#999] dark:text-gray-500" /> رسائل SMS
            </span>
            <Toggle checked={sms} onChange={setSms} />
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2.5 text-[15px] text-[#333] dark:text-gray-200">
              <FaWhatsapp className="text-[#999] dark:text-gray-500" /> واتساب
            </span>
            <Toggle checked={whatsapp} onChange={setWhatsapp} />
          </div>
        </div>

        <p className="mt-4 mb-0 text-xs text-[#aaa] dark:text-gray-500 leading-relaxed border-t border-[#f5f5f5] dark:border-gray-700 pt-3.5">
          إيقاف هذه الخيارات يوقف الرسائل الترويجية بس، وهتفضلي تستلمي تحديثات مهمة عن حسابك وطلباتك.
        </p>
      </div>
    </div>
  )
}

// ── القايمة الرئيسية للإعدادات ────────────────────────────────────
export default function SettingsTab() {
  const { language, setLanguage } = useContext(LanguageContext)
  const { settings } = useSettings()

  const [view, setView] = useState("list")
  const isAr = language === "ar"

  
  if (view === "notifications") {
    return <NotificationsView onBack={() => setView("list")} />
  }

  return (
    <div className="bg-white dark:bg-black rounded-2xl border border-[#f0f0f0] dark:border-gray-700 overflow-hidden">
      <h2 className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 m-0 text-xl sm:text-[22px] font-bold text-[#222] dark:text-gray-100">إعدادات الحساب ⚙️</h2>

      <SettingsRow
        icon={<FaLock />}
        label="تغيير كلمة المرور"
      />
      {/* ✅ جديد: اللغة متربطة مباشرة بنفس LanguageContext المستخدم في باقي
          الموقع (نفس اللي في الـ Navbar) - الضغطة بتبدّل اللغة على طول */}
      {settings?.enable_multilanguage && (
  <SettingsRow
    icon={<FaGlobe />}
    label="اللغة"
    value={isAr ? "العربية" : "English"}
    onClick={() => setLanguage(isAr ? "en" : "ar")}
  />
)}
      {/* ✅ جديد: بتفتح صفحة فرعية فيها تفضيلات الإشعارات */}
      <SettingsRow
        icon={<FaBell />}
        label="الإشعارات"
        onClick={() => setView("notifications")}
      />
      <SettingsRow
        icon={<FaSlidersH />}
        label="إعدادات الخصوصية"
        last
      />
    </div>
  )
}