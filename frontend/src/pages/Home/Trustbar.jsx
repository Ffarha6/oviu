import { useContext } from "react"
import { LanguageContext } from "../../context/LanguageContext"
import { ThemeContext } from "../../context/ThemeContext"
import { FaTruck, FaLock, FaHeadset } from "react-icons/fa"

function TrustBar() {
  const { language } = useContext(LanguageContext)
  const { darkMode } = useContext(ThemeContext)
  const isAr = language === "ar"

  const items = {
    ar: [
      { icon: FaTruck,   title: "توصيل سريع",  desc: "خلال 1-3 أيام عمل" },
      { icon: FaLock,    title: "دفع آمن",      desc: "جميع وسائل الدفع متاحة" },
      { icon: FaHeadset, title: "دعم العملاء",  desc: "نحن هنا لمساعدتك" },
    ],
    en: [
      { icon: FaTruck,   title: "Fast Delivery",     desc: "Within 1-3 business days" },
      { icon: FaLock,    title: "Secure Payment",    desc: "All payment methods available" },
      { icon: FaHeadset, title: "Customer Support",  desc: "We're here to help" },
    ],
  }
  const list = items[language]

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="px-6 xl:px-24 pb-8 md:pb-10 bg-[#F7F2EE] dark:bg-[#050505]">
      <div
        className="
          max-w-[1750px] mx-auto
          border border-gray-200 dark:border-gray-800
          rounded-2xl md:rounded-3xl
          px-6 md:px-10 py-6 md:py-7
          grid grid-cols-1 sm:grid-cols-3
          gap-6 sm:gap-4
        "
      >
        {list.map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} className="flex items-center justify-center gap-3 text-center sm:text-right">
              <Icon className="text-[#D9A066] text-xl md:text-2xl shrink-0" />
              <div className={isAr ? "text-right" : "text-left"}>
                <p className="text-sm md:text-[15px] font-bold text-gray-800 dark:text-white">
                  {item.title}
                </p>
                <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TrustBar