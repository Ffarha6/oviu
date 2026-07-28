import { useContext } from "react"
import { LanguageContext } from "../../context/LanguageContext"
import logo from "../../assets/images/logo.png"
import { FaInstagram, FaTiktok, FaFacebookF } from "react-icons/fa"

function Footer() {
  const { language } = useContext(LanguageContext)
  const isAr = language === "ar"

  const content = {
    ar: {
      shop: "تسوق",
      shopLinks: [ "نظارات شمسية", "نظارات طبية", "نظارات قراءة","العروض","العدسات"],
      support: "خدمة العملاء",
      supportLinks: ["تتبع الطلب", "الاستبدال والاسترجاع", "طرق الدفع", "ضمان المنتجات", "تواصل معنا"],
      team: "فريق العمل",
      teamDesc1: "تم تصميم وتطوير الموقع بواسطة ",
      teamDesc2: "VAIA Team",
      rights: "جميع الحقوق محفوظة © 2024 Oviu",
      backToTop: "الرجوع للأعلى ",
      privacy: "سياسة الخصوصية",
      terms: "الشروط والأحكام",
    },
    en: {
      shop: "Shop",
      shopLinks: ["Store", "Sunglasses", "Medical Glasses", "Reading Glasses"],
      support: "Customer Service",
      supportLinks: ["Track Order", "Returns & Exchanges", "Payment Methods", "Product Warranty", "Contact Us"],
      team: "Our Team",
      teamDesc1: "Designed and developed by the VIAI Girls team",
      teamDesc2: "with care and attention to detail.",
      rights: "© 2024 Oviu. All rights reserved",
      backToTop: "Back to Top ↑",
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",
    },
  }

  const t = content[language]

  const socialLinks = [
    { icon: <FaInstagram />, href: "https://www.instagram.com/oviu13?igsh=MmNwMHQwOXFpbXpi" },
    { icon: <FaTiktok />, href: "#" },
    { icon: <FaFacebookF />, href: "https://www.facebook.com/share/1G1EUPp1m7/" },
  ]

  const members = ["Eng.Naglaa Saaed ", "Lamiaa Mohamed", "Marwa Yosry", "Fatma Hossam", "Farha Yasser"]

  return (
    <footer className="bg-[#0f0f0f] transition-all duration-500">

      {/* BACK TO TOP */}
      <div
        className="w-full text-center py-3 sm:py-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <span className="text-gray-400 text-xs sm:text-sm">{t.backToTop}</span>
      </div>

      {/* MAIN GRID — تسوق وخدمة العملاء جنب بعض حتى على الموبايل، بدون أي كروت أو بوردرات */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-9 sm:pt-14 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-12">

          {/* COL 1 — تسوق */}
          <div className="flex flex-col items-center text-center">
            <h4 className="font-bold text-white text-sm sm:text-base mb-4 sm:mb-6 tracking-wide">{t.shop}</h4>
            <ul className="flex flex-col gap-2.5 sm:gap-3 items-center">
              {t.shopLinks.map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-[#D9A066] transition text-xs sm:text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 2 — خدمة العملاء */}
          <div className="flex flex-col items-center text-center">
            <h4 className="font-bold text-white text-sm sm:text-base mb-4 sm:mb-6 tracking-wide">{t.support}</h4>
            <ul className="flex flex-col gap-2.5 sm:gap-3 items-center">
              {t.supportLinks.map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-[#D9A066] transition text-xs sm:text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 3 — فريق العمل: بعرض كامل تحت العمودين على الموبايل، عمود عادي على الديسكتوب */}
          <div className="col-span-2 sm:col-span-1 mt-6 sm:mt-0 pt-6 sm:pt-0 border-t border-white/10 sm:border-0 flex flex-col items-center text-center">
            <h4 className="font-bold text-white text-sm sm:text-base mb-4 sm:mb-6 tracking-wide">{t.team}</h4>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-1 max-w-[280px] sm:max-w-none">{t.teamDesc1}</p>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 max-w-[280px] sm:max-w-none">{t.teamDesc2}</p>
            <div className="flex flex-col gap-2 items-center">
              {members.map((member, i) => (
                <span key={i} className="text-[#D9A066] text-xs sm:text-sm font-medium">
                  {member}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* BOTTOM BAR — سوشيال فوق، وحقوق + سياسة تحته على الموبايل */}
        <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-white/10 flex flex-col sm:grid sm:grid-cols-3 gap-5 sm:gap-4 items-center text-center">

          {/* Social Icons */}
          <div className="flex items-center gap-3 order-1">
            {socialLinks.map((s, i) => (
              <a
                key={i}
                href={s.href}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#D9A066] hover:text-white hover:scale-110 transition-all duration-300 text-sm sm:text-base"
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Privacy + Terms */}
          <div className="flex items-center gap-5 sm:gap-6 order-2 sm:order-none">
            <a href="#" className="text-gray-500 hover:text-[#D9A066] text-[11px] sm:text-xs transition">{t.privacy}</a>
            <a href="#" className="text-gray-500 hover:text-[#D9A066] text-[11px] sm:text-xs transition">{t.terms}</a>
          </div>

          {/* Rights */}
          <p className="text-gray-500 text-[11px] sm:text-xs order-3 sm:order-none">{t.rights}</p>

        </div>
      </div>

      {/* لوجو فقط في الأسفل */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-8 sm:pb-10 flex justify-center">
        <img
          src={logo}
          alt="oviu"
          className="w-[80px] sm:w-[100px] drop-shadow-[0_0_20px_rgba(217,160,102,0.25)]"
        />
      </div>

    </footer>
  )
}

export default Footer