import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Navigate } from "react-router-dom"
import { useSettings } from "../../context/SettingsContext"
import { LanguageContext } from "../../context/LanguageContext"
import { ThemeContext } from "../../context/ThemeContext"
import { motion } from "framer-motion"
import {
  FiCopy, FiCheck, FiChevronRight, FiMail,
  FiShield, FiStar, FiTruck, FiHeadphones,
  FiRefreshCw, FiLock
} from "react-icons/fi"
import { FaTag, FaTruck, FaBox, FaTicketAlt } from "react-icons/fa"

// ===== Static Offers Data =====
const offersData = {
  ar: {
    featured: {
      badge: "حصري",
      title: "عرض خاص لأول طلب",
      desc: "استمتع بخصم خاص على أول عملية شراء لك من OVIU",
      discount: "15% OFF",
      sub: "على أول طلب",
      code: "WELCOME15",
      cta: "تسوق الآن",
      note: "* صالح لأول طلب فقط",
      perks: [
        { icon: <FiShield />, title: "خصم حصري", desc: "لأول طلب فقط" },
        { icon: <FiStar />,   title: "جودة مضمونة", desc: "منتجات أصلية 100%" },
        { icon: <FiTruck />,  title: "توصيل سريع", desc: "شحن لجميع المدن" },
      ],
    },
    categories: [
      { key: "all",      label: "الكل",           icon: <FaTag />,      count: 6 },
      { key: "first",    label: "عرض أول طلب",    icon: <FaTag />,      count: 3 },
      { key: "shipping", label: "شحن وتوصيل",     icon: <FaTruck />,    count: 1 },
      { key: "bundle",   label: "باقات ومنتجات",  icon: <FaBox />,      count: 1 },
      { key: "coupon",   label: "كوبونات",         icon: <FaTicketAlt />,count: 1 },
    ],
    cards: [
      {
        id: 1, cat: "first", type: "عرض أول طلب", typeColor: "orange",
        discount: "15%", discountSub: "OFF",
        title: "خصم على أول طلب",
        desc: "احصل على خصم 15% على أول عملية شراء باستخدام الكود",
        code: "WELCOME15",
        expiry: "صالح حتى 31 ديسمبر 2024",
        ctaLink: "/glasses/sunglasses",
      },
      {
        id: 2, cat: "shipping", type: "شحن مجاني", typeColor: "green",
        icon: "truck",
        title: "شحن مجاني لأول طلب",
        desc: "استمتع بشحن مجاني على أول طلب بدون حد أدنى",
        code: "FREESHIP",
        expiry: "صالح حتى 31 ديسمبر 2024",
        ctaLink: "/glasses/sunglasses",
      },
      {
        id: 3, cat: "bundle", type: "باقات ومنتجات", typeColor: "amber",
        discount: "20%", discountSub: "OFF",
        title: "عند شراء إطار وعدستين",
        desc: "احصل على خصم 20% عند شراء إطار مع أي نوع من العدسات",
        cta: "تسوق الباقات",
        ctaLink: "/glasses/lenses",
        expiry: "صالح حتى 31 ديسمبر 2024",
      },
      {
        id: 4, cat: "coupon", type: "كوبون ترحيبي", typeColor: "purple",
        icon: "gift",
        title: "كوبون ترحيبيي",
        desc: "جديد في OVIU؟ استخدم الكوبون في أي وقت للحصول على خصم إضافي",
        code: "OVIU10",
        expiry: "صالح حتى 31 ديسمبر 2024",
        ctaLink: "/glasses/sunglasses",
      },
      {
        id: 5, cat: "first", type: "عرض أول طلب", typeColor: "orange",
        discount: "10%", discountSub: "OFF",
        title: "خصم العدسات الطبية",
        desc: "احصل على خصم 10% على أول طلب من العدسات الطبية",
        code: "LENS10",
        expiry: "صالح حتى 31 ديسمبر 2024",
        ctaLink: "/glasses/lenses",
      },
      {
        id: 6, cat: "first", type: "عرض أول طلب", typeColor: "orange",
        discount: "25%", discountSub: "OFF",
        title: "خصم نظارات الأطفال",
        desc: "خصم خاص على كل مجموعة نظارات الأطفال",
        code: "KIDS25",
        expiry: "صالح حتى 31 ديسمبر 2024",
        ctaLink: "/glasses/kids",
      },
    ],
    newsletter: {
      title: "اشترك في نشرتنا",
      desc: "كن أول من يعرف عن أحدث العروض والخصومات",
      placeholder: "أدخل بريدك الإلكتروني",
      cta: "اشترك",
    },
    help: {
      title: "تحتاج مساعدة؟",
      desc: "فريقنا هنا لمساعدتك",
      cta: "تواصل معنا",
    },
    footer: [
      { icon: <FiShield size={22} />,    title: "جودة أصلية 100%",  desc: "نظارات أصلية مع ضمان الجودة" },
      { icon: <FiRefreshCw size={22} />, title: "إرجاع سهل",        desc: "إرجاع واستبدال خلال 14 يوم" },
      { icon: <FiLock size={22} />,      title: "دفع آمن",           desc: "جميع طرق الدفع آمنة ومشفرة" },
      { icon: <FiHeadphones size={22} />,title: "دعم العملاء",       desc: "خدمة عملاء على مدار الساعة" },
    ],
    breadcrumb: { home: "الرئيسية", offers: "العروض" },
    heading: "العروض",
    subheading: "اكتشف أفضل العروض والخصومات الحصرية من OVIU",
    details: "التفاصيل",
    copied: "تم النسخ!",
    copyCode: "نسخ الكود",
    sections: "الأقسام",
    all: "الكل",
  },
  en: {
    featured: {
      badge: "Exclusive",
      title: "Special First Order Offer",
      desc: "Enjoy an exclusive discount on your first purchase from OVIU",
      discount: "15% OFF",
      sub: "on your first order",
      code: "WELCOME15",
      cta: "Shop Now",
      note: "* Valid for first order only",
      perks: [
        { icon: <FiShield />, title: "Exclusive Deal",    desc: "First order only" },
        { icon: <FiStar />,   title: "Quality Assured",  desc: "100% authentic products" },
        { icon: <FiTruck />,  title: "Fast Delivery",    desc: "Shipping to all cities" },
      ],
    },
    categories: [
      { key: "all",      label: "All",             icon: <FaTag />,      count: 6 },
      { key: "first",    label: "First Order",     icon: <FaTag />,      count: 3 },
      { key: "shipping", label: "Shipping",        icon: <FaTruck />,    count: 1 },
      { key: "bundle",   label: "Bundles",         icon: <FaBox />,      count: 1 },
      { key: "coupon",   label: "Coupons",         icon: <FaTicketAlt />,count: 1 },
    ],
    cards: [
      {
        id: 1, cat: "first", type: "First Order", typeColor: "orange",
        discount: "15%", discountSub: "OFF",
        title: "First Order Discount",
        desc: "Get 15% off your first purchase using the code",
        code: "WELCOME15",
        expiry: "Valid until Dec 31, 2024",
        ctaLink: "/glasses/sunglasses",
      },
      {
        id: 2, cat: "shipping", type: "Free Shipping", typeColor: "green",
        icon: "truck",
        title: "Free Shipping on First Order",
        desc: "Enjoy free shipping on your first order with no minimum",
        code: "FREESHIP",
        expiry: "Valid until Dec 31, 2024",
        ctaLink: "/glasses/sunglasses",
      },
      {
        id: 3, cat: "bundle", type: "Bundle Deal", typeColor: "amber",
        discount: "20%", discountSub: "OFF",
        title: "Frame + 2 Lenses Bundle",
        desc: "Get 20% off when you buy a frame with any type of lenses",
        cta: "Shop Bundles",
        ctaLink: "/glasses/lenses",
        expiry: "Valid until Dec 31, 2024",
      },
      {
        id: 4, cat: "coupon", type: "Welcome Coupon", typeColor: "purple",
        icon: "gift",
        title: "Welcome Coupon",
        desc: "New to OVIU? Use this coupon anytime for an extra discount",
        code: "OVIU10",
        expiry: "Valid until Dec 31, 2024",
        ctaLink: "/glasses/sunglasses",
      },
      {
        id: 5, cat: "first", type: "First Order", typeColor: "orange",
        discount: "10%", discountSub: "OFF",
        title: "Medical Lenses Discount",
        desc: "Get 10% off your first order of medical lenses",
        code: "LENS10",
        expiry: "Valid until Dec 31, 2024",
        ctaLink: "/glasses/lenses",
      },
      {
        id: 6, cat: "first", type: "First Order", typeColor: "orange",
        discount: "25%", discountSub: "OFF",
        title: "Kids Glasses Discount",
        desc: "Special discount on all kids glasses collection",
        code: "KIDS25",
        expiry: "Valid until Dec 31, 2024",
        ctaLink: "/glasses/kids",
      },
    ],
    newsletter: {
      title: "Subscribe to Our Newsletter",
      desc: "Be the first to know about the latest offers and discounts",
      placeholder: "Enter your email",
      cta: "Subscribe",
    },
    help: {
      title: "Need Help?",
      desc: "Our team is here for you",
      cta: "Contact Us",
    },
    footer: [
      { icon: <FiShield size={22} />,    title: "100% Authentic",   desc: "Original glasses with quality guarantee" },
      { icon: <FiRefreshCw size={22} />, title: "Easy Returns",     desc: "Return & exchange within 14 days" },
      { icon: <FiLock size={22} />,      title: "Secure Payment",   desc: "All payment methods are safe & encrypted" },
      { icon: <FiHeadphones size={22} />,title: "Customer Support", desc: "24/7 customer service" },
    ],
    breadcrumb: { home: "Home", offers: "Offers" },
    heading: "Offers",
    subheading: "Discover the best exclusive deals and discounts from OVIU",
    details: "Details",
    copied: "Copied!",
    copyCode: "Copy Code",
    sections: "Sections",
    all: "All",
  },
}

// ===== Color maps =====
const typeColorMap = {
  orange: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-500", border: "border-orange-200 dark:border-orange-800" },
  green:  { bg: "bg-green-50 dark:bg-green-900/20",   text: "text-green-500",  border: "border-green-200 dark:border-green-800" },
  amber:  { bg: "bg-amber-50 dark:bg-amber-900/20",   text: "text-amber-500",  border: "border-amber-200 dark:border-amber-800" },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-500", border: "border-purple-200 dark:border-purple-800" },
}

// ===== Copy Code Button =====
function CopyButton({ code, label, copiedLabel }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center justify-between border border-dashed border-[#D9A066]/60 rounded-xl px-3 py-2 bg-[#D9A066]/5">
        <span className="font-mono font-bold text-[#D9A066] tracking-widest text-sm">{code}</span>
        <button
          onClick={handleCopy}
          className="text-[#D9A066] hover:text-[#b8834a] transition ml-2"
          title={label}
        >
          {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
        </button>
      </div>
    </div>
  )
}

// ===== Offer Card =====
function OfferCard({ card, t, isAr, navigate }) {
  const colors = typeColorMap[card.typeColor] || typeColorMap.orange

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="bg-white dark:bg-[#111] rounded-2xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Type badge */}
      <div className={`px-4 pt-4 pb-2 flex items-center justify-between`}>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
          {card.type}
        </span>
      </div>

      <div className="px-4 pb-4 flex flex-col flex-1 gap-3">
        {/* Icon or discount */}
        {card.icon === "truck" ? (
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colors.bg}`}>
            <FaTruck className={`text-2xl ${colors.text}`} />
          </div>
        ) : card.icon === "gift" ? (
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colors.bg}`}>
            <span className="text-3xl">🎁</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-black ${colors.text}`}>{card.discount}</span>
            <span className={`text-lg font-bold ${colors.text}`}>{card.discountSub}</span>
          </div>
        )}

        {/* Title & desc */}
        <div>
          <h3 className="font-bold text-black dark:text-white text-base mb-1">{card.title}</h3>
          <p className="text-gray-400 text-xs leading-relaxed">{card.desc}</p>
        </div>

        {/* Code or CTA */}
        <div className="mt-auto">
          {card.code ? (
            <CopyButton code={card.code} label={t.copyCode} copiedLabel={t.copied} />
          ) : card.cta ? (
            <button
              onClick={() => navigate(card.ctaLink)}
              className={`w-full py-2 rounded-xl text-sm font-semibold border ${colors.border} ${colors.text} hover:bg-opacity-10 transition`}
            >
              {card.cta}
            </button>
          ) : null}
        </div>

        {/* Expiry + details */}
        <div className={`flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 ${isAr ? "flex-row-reverse" : ""}`}>
          <span className="text-gray-400 text-[11px]">{card.expiry}</span>
          <button
            onClick={() => navigate(card.ctaLink)}
            className={`flex items-center gap-1 text-[#D9A066] text-[11px] font-semibold hover:underline ${isAr ? "flex-row-reverse" : ""}`}
          >
            {t.details}
            <FiChevronRight size={12} className={isAr ? "rotate-180" : ""} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ===== MAIN PAGE =====
function OffersPage() {
  const { language } = useContext(LanguageContext)
  const { darkMode }  = useContext(ThemeContext)
  const navigate      = useNavigate()
  const { settings, loading } = useSettings()
  const isAr          = language === "ar"
  const t             = offersData[language]

  const [activeCategory, setActiveCategory] = useState("all")
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const filteredCards = activeCategory === "all"
    ? t.cards
    : t.cards.filter(c => c.cat === activeCategory)

    if (loading) {
  return null;
}

if (!settings?.enable_offers) {
  return <Navigate to="/" replace />;
}

  return (
    <div
      className={`min-h-screen bg-[#FAF8F5] dark:bg-black transition-all duration-500 ${isAr ? "font-[Cairo,sans-serif]" : ""}`}
      style={{ paddingTop: "20px" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 flex gap-6 lg:gap-8 ${isAr ? "flex-row-reverse" : "flex-row"}`}>

        {/* ===== SIDEBAR ===== */}
        <aside className={`hidden lg:flex flex-col gap-5 shrink-0 w-[220px] ${isAr ? "text-right" : "text-left"}`}>

          {/* Sections */}
          <div className="bg-white dark:bg-[#111] rounded-2xl border border-black/5 dark:border-white/5 p-4">
            <h3 className="font-bold text-black dark:text-white text-sm mb-3">{t.sections}</h3>
            <div className="flex flex-col gap-1">
              {t.categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm transition ${
                    activeCategory === cat.key
                      ? "bg-[#D9A066]/10 text-[#D9A066] font-semibold"
                      : "text-gray-500 dark:text-gray-400 hover:text-[#D9A066] hover:bg-[#D9A066]/5"
                  } ${isAr ? "flex-row-reverse" : ""}`}
                >
                  <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                    <span className={activeCategory === cat.key ? "text-[#D9A066]" : "text-gray-400"}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat.key
                      ? "bg-[#D9A066] text-white"
                      : "bg-gray-100 dark:bg-white/5 text-gray-400"
                  }`}>{cat.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-white dark:bg-[#111] rounded-2xl border border-black/5 dark:border-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiMail className="text-[#D9A066]" size={18} />
              <h3 className="font-bold text-black dark:text-white text-sm">{t.newsletter.title}</h3>
            </div>
            <p className="text-gray-400 text-xs mb-3 leading-relaxed">{t.newsletter.desc}</p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-green-500 text-sm font-semibold">
                <FiCheck /> <span>✓</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t.newsletter.placeholder}
                  className={`w-full border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs bg-gray-50 dark:bg-[#1a1a1a] text-black dark:text-white outline-none focus:border-[#D9A066] transition ${isAr ? "text-right" : "text-left"}`}
                />
                <button
                  onClick={() => email && setSubscribed(true)}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-xl text-xs font-bold hover:bg-[#D9A066] dark:hover:bg-[#D9A066] dark:hover:text-white transition"
                >
                  {t.newsletter.cta}
                </button>
              </div>
            )}
          </div>

          {/* Help */}
          <div className="bg-white dark:bg-[#111] rounded-2xl border border-black/5 dark:border-white/5 p-4 text-center">
            <FiHeadphones className="text-[#D9A066] mx-auto mb-2" size={28} />
            <h3 className="font-bold text-black dark:text-white text-sm mb-1">{t.help.title}</h3>
            <p className="text-gray-400 text-xs mb-3">{t.help.desc}</p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-xl text-xs font-bold hover:bg-[#D9A066] dark:hover:bg-[#D9A066] dark:hover:text-white transition"
            >
              {t.help.cta}
            </button>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 min-w-0">

          {/* Breadcrumb */}
          <div
            className={`flex items-center gap-2 text-gray-400 mb-5 ${isAr ? "flex-row-reverse" : "flex-row"}`}
            style={{ fontSize: "20px", fontWeight: "500" }}
          >
            <span onClick={() => navigate("/")} className="cursor-pointer hover:text-[#D9A066] transition">{t.breadcrumb.home}</span>
            <span>›</span>
            <span className="text-[#D9A066] font-semibold">{t.breadcrumb.offers}</span>
          </div>

          {/* Heading */}
          <div className={`mb-6 ${isAr ? "text-right" : "text-left"}`}>
            <h1 className="text-4xl font-black text-black dark:text-white mb-1">{t.heading}</h1>
            <p className="text-gray-400 text-sm">{t.subheading}</p>
          </div>

          {/* ===== FEATURED BANNER ===== */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl mb-8 bg-[#FDF6EE] dark:bg-[#1a1208] border border-[#D9A066]/20"
          >
            <div className={`grid lg:grid-cols-2 items-center min-h-[260px] gap-4 ${isAr ? "" : ""}`}>

              {/* Left: text */}
              <div className={`relative z-10 px-8 py-8 ${isAr ? "text-right order-2 lg:order-1" : "text-left order-1"}`}>
                <span className="inline-block bg-[#D9A066] text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                  {t.featured.badge}
                </span>
                <h2 className="text-3xl lg:text-4xl font-black text-black dark:text-white mb-3 leading-tight">
                  {t.featured.title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t.featured.desc}</p>
                <div className="mb-2">
                  <span className="text-4xl font-black text-[#D9A066]">{t.featured.discount}</span>
                  <p className="text-gray-500 text-sm mt-1">{t.featured.sub}</p>
                </div>
                <CopyButton code={t.featured.code} label={t.copyCode} copiedLabel={t.copied} />
                <button
                  onClick={() => navigate("/glasses/sunglasses")}
                  className="mt-4 bg-black dark:bg-white text-white dark:text-black font-bold px-8 py-3 rounded-2xl hover:bg-[#D9A066] dark:hover:bg-[#D9A066] dark:hover:text-white transition text-sm block"
                >
                  {t.featured.cta}
                </button>
                <p className="text-gray-400 text-xs mt-2">{t.featured.note}</p>
              </div>

              {/* Right: perks + image area */}
              <div className={`relative flex flex-col justify-center gap-3 px-6 py-8 ${isAr ? "order-1 lg:order-2" : "order-2"}`}>
                {/* Glasses illustration placeholder */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 dark:opacity-5 pointer-events-none select-none">
                  <span className="text-[160px]">🕶️</span>
                </div>
                {t.featured.perks.map((perk, i) => (
                  <div
                    key={i}
                    className={`relative z-10 flex items-center gap-3 bg-white/70 dark:bg-black/30 backdrop-blur-sm rounded-xl px-4 py-3 ${isAr ? "flex-row-reverse text-right" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#D9A066]/15 flex items-center justify-center text-[#D9A066] shrink-0">
                      {perk.icon}
                    </div>
                    <div>
                      <p className="text-black dark:text-white text-sm font-semibold leading-none mb-0.5">{perk.title}</p>
                      <p className="text-gray-400 text-xs">{perk.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ===== ALL OFFERS HEADING ===== */}
          <div className={`flex items-center justify-between mb-4 ${isAr ? "flex-row-reverse" : ""}`}>
            <h2 className="text-xl font-bold text-black dark:text-white">
              {isAr ? "كل العروض والخصومات" : "All Offers & Discounts"}
            </h2>
            {/* Mobile filter tabs */}
            <div className="flex items-center gap-1 lg:hidden overflow-x-auto">
              {t.categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    activeCategory === cat.key
                      ? "bg-[#D9A066] text-white"
                      : "bg-white dark:bg-[#111] text-gray-500 border border-black/10 dark:border-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* ===== OFFER CARDS GRID ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
            {filteredCards.map(card => (
              <OfferCard
                key={card.id}
                card={card}
                t={t}
                isAr={isAr}
                navigate={navigate}
              />
            ))}
          </div>

          {/* ===== FOOTER TRUST BAR ===== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {t.footer.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 bg-white dark:bg-[#111] rounded-2xl border border-black/5 dark:border-white/5 px-4 py-3 ${isAr ? "flex-row-reverse text-right" : ""}`}
              >
                <div className="text-[#D9A066] shrink-0">{item.icon}</div>
                <div>
                  <p className="text-black dark:text-white text-xs font-semibold leading-none mb-0.5">{item.title}</p>
                  <p className="text-gray-400 text-[11px]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

export default OffersPage