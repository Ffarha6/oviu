import { useState, useContext, useEffect } from "react"
import { LanguageContext } from "../../context/LanguageContext"
import { FiSearch, FiX, FiHeart } from "react-icons/fi"
import { FaHeart, FaStar, FaStarHalfAlt } from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"

// ===== STATIC DATA =====
const mockProducts = [
  { id: 1, name_ar: "أوفيو لوكس بلاك",    name_en: "OVIU Luxe Black",    price: 599, rating: 4.8, reviews: 128, image: "https://placehold.co/80x60/1a1a1a/D9A066?text=OVIU" },
  { id: 2, name_ar: "أوفيو أفياتور جرين",  name_en: "OVIU Aviator Green",  price: 699, rating: 4.7, reviews: 96,  image: "https://placehold.co/80x60/1a1a1a/D9A066?text=OVIU" },
  { id: 3, name_ar: "أوفيو راند جولد",     name_en: "OVIU Round Gold",     price: 499, rating: 4.6, reviews: 74,  image: "https://placehold.co/80x60/1a1a1a/D9A066?text=OVIU" },
  { id: 4, name_ar: "أوفيو كلاسيك براون",  name_en: "OVIU Classic Brown",  price: 549, rating: 4.5, reviews: 63,  image: "https://placehold.co/80x60/1a1a1a/D9A066?text=OVIU" },
]

const mockBrands   = ["Ray-Ban", "Gucci", "Prada", "Tom Ford"]
const mockLenses   = {
  ar: ["عدسات سوداء", "عدسات مستقطبة", "عدسات مستوفنة", "عدسات فوتوكرومية", "عدسات زرقاء"],
  en: ["Black Lenses", "Polarized", "Mirrored", "Photochromic", "Blue Light"],
}
const mockArticles = {
  ar: [
    { title: "كيف تختار النظارة الشمسية المناسبة لوجهك", date: "20 مايو 2024", image: "https://placehold.co/60x60/1a1a1a/D9A066?text=Blog" },
    { title: "أفضل 10 نظارات شمسية لصيف 2024",           date: "15 مايو 2024", image: "https://placehold.co/60x60/1a1a1a/D9A066?text=Blog" },
    { title: "الفرق بين العدسات المستقطبة والعادية",      date: "10 مايو 2024", image: "https://placehold.co/60x60/1a1a1a/D9A066?text=Blog" },
  ],
  en: [
    { title: "How to Choose the Right Sunglasses for Your Face", date: "May 20, 2024", image: "https://placehold.co/60x60/1a1a1a/D9A066?text=Blog" },
    { title: "Top 10 Sunglasses for Summer 2024",               date: "May 15, 2024", image: "https://placehold.co/60x60/1a1a1a/D9A066?text=Blog" },
    { title: "Polarized vs Regular Lenses: The Difference",     date: "May 10, 2024", image: "https://placehold.co/60x60/1a1a1a/D9A066?text=Blog" },
  ],
}

const tabs = {
  ar: ["الكل", "المنتجات", "العدسات", "الماركات", "المدونة"],
  en: ["All", "Products", "Lenses", "Brands", "Blog"],
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[1,2,3,4,5].map(s => (
        <span key={s} className="text-[#D9A066] text-xs">
          {rating >= s ? <FaStar /> : rating >= s - 0.5 ? <FaStarHalfAlt /> : "☆"}
        </span>
      ))}
    </div>
  )
}

function SearchModal({ open, onClose }) {
  const { language } = useContext(LanguageContext)
  const isAr = language === "ar"

  const [query, setQuery]       = useState("")
  const [activeTab, setActiveTab] = useState(0)
  const [wishlist, setWishlist] = useState([])

  const toggleWishlist = (id) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  // إغلاق بـ Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  // منع scroll لما المودال مفتوح
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const filtered = query.length > 0
    ? mockProducts.filter(p =>
        (isAr ? p.name_ar : p.name_en).toLowerCase().includes(query.toLowerCase())
      )
    : mockProducts

  const content = {
    ar: {
      placeholder: "ابحث عن نظارات، ماركات، عدسات...",
      close: "للإغلاق",
      bestResults: "أفضل النتائج",
      brands: "الماركات",
      showAll: "عرض الكل",
      lenses: "العدسات",
      articles: "مقالات مقترحة",
      showAllProducts: "عرض جميع المنتجات",
      currency: "جنيه",
    },
    en: {
      placeholder: "Search for glasses, brands, lenses...",
      close: "to close",
      bestResults: "Best Results",
      brands: "Brands",
      showAll: "Show All",
      lenses: "Lenses",
      articles: "Suggested Articles",
      showAllProducts: "Show All Products",
      currency: "EGP",
    },
  }

  const t = content[language]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />

          {/* MODAL */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className={`
              fixed top-[100px] left-1/2 -translate-x-1/2
              w-[95vw] max-w-[900px]
              bg-white dark:bg-[#111]
              rounded-[24px]
              shadow-[0_20px_60px_rgba(0,0,0,0.3)]
              z-[100]
              overflow-hidden
              ${isAr ? "text-right" : "text-left"}
            `}
          >

            {/* SEARCH INPUT */}
            <div className={`flex items-center gap-4 px-6 py-4 border-b border-black/5 dark:border-white/5 ${isAr ? "flex-row-reverse" : ""}`}>
              <FiSearch className="text-[#D9A066] text-xl shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.placeholder}
                className={`flex-1 bg-transparent outline-none text-black dark:text-white text-lg placeholder:text-gray-400 ${isAr ? "text-right" : "text-left"}`}
              />
              <button onClick={() => setQuery("")} className="text-gray-400 hover:text-[#D9A066] transition shrink-0">
                <FiX className="text-xl" />
              </button>
            </div>

            {/* TABS */}
            <div className={`flex items-center gap-1 px-6 py-3 border-b border-black/5 dark:border-white/5 overflow-x-auto ${isAr ? "flex-row-reverse" : ""}`}>
              {tabs[language].map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`
                    px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${activeTab === i
                      ? "bg-[#D9A066] text-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-[#D9A066]"
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* CONTENT */}
            <div className={`flex gap-0 max-h-[480px] overflow-hidden ${isAr ? "flex-row-reverse" : ""}`}>

              {/* LEFT — Products */}
              <div className="flex-1 overflow-y-auto p-6 border-r dark:border-white/5 border-black/5">
                <div className={`flex items-center justify-between mb-4 ${isAr ? "flex-row-reverse" : ""}`}>
                  <h3 className="font-bold text-black dark:text-white text-sm">{t.bestResults}</h3>
                  <button className="text-[#D9A066] text-sm hover:underline">{t.showAll}</button>
                </div>

                <div className="flex flex-col gap-3">
                  {filtered.map((p) => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-4 p-3 rounded-[14px] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition group ${isAr ? "flex-row-reverse" : ""}`}
                    >
                      <img src={p.image} alt="" className="w-[70px] h-[50px] object-cover rounded-[10px] shrink-0" />
                      <div className={`flex-1 ${isAr ? "text-right" : "text-left"}`}>
                        <p className="text-black dark:text-white text-sm font-semibold mb-1">
                          {isAr ? p.name_ar : p.name_en}
                        </p>
                        <StarRating rating={p.rating} />
                        <p className="text-[#D9A066] font-bold text-sm mt-1">{p.price} {t.currency}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id) }}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition"
                      >
                        {wishlist.includes(p.id)
                          ? <FaHeart className="text-[#D9A066]" />
                          : <FiHeart className="text-gray-400" />
                        }
                      </button>
                    </div>
                  ))}
                </div>

                {/* SHOW ALL */}
                <button className={`
                  mt-4 w-full flex items-center justify-center gap-2
                  border border-[#D9A066]/40 text-[#D9A066]
                  hover:bg-[#D9A066] hover:text-white
                  py-2.5 rounded-full text-sm font-semibold
                  transition-all duration-300
                  ${isAr ? "flex-row-reverse" : ""}
                `}>
                  {t.showAllProducts}
                </button>
              </div>

              {/* RIGHT — Brands + Lenses + Articles */}
              <div className="w-[320px] shrink-0 overflow-y-auto p-6">

                {/* BRANDS */}
                <div className="mb-6">
                  <div className={`flex items-center justify-between mb-3 ${isAr ? "flex-row-reverse" : ""}`}>
                    <h3 className="font-bold text-black dark:text-white text-sm">{t.brands}</h3>
                    <button className="text-[#D9A066] text-sm hover:underline">{t.showAll}</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {mockBrands.map((brand, i) => (
                      <button key={i} className="
                        border border-black/10 dark:border-white/10
                        rounded-[10px] py-2 px-3
                        text-sm text-gray-600 dark:text-gray-300
                        hover:border-[#D9A066] hover:text-[#D9A066]
                        transition font-medium
                      ">
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LENSES */}
                <div className="mb-6">
                  <div className={`flex items-center justify-between mb-3 ${isAr ? "flex-row-reverse" : ""}`}>
                    <h3 className="font-bold text-black dark:text-white text-sm">{t.lenses}</h3>
                    <button className="text-[#D9A066] text-sm hover:underline">{t.showAll}</button>
                  </div>
                  <div className={`flex flex-wrap gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                    {mockLenses[language].map((lens, i) => (
                      <span key={i} className="
                        bg-black/5 dark:bg-white/5
                        text-gray-600 dark:text-gray-300
                        text-xs px-3 py-1.5 rounded-full
                        hover:bg-[#D9A066]/10 hover:text-[#D9A066]
                        cursor-pointer transition
                      ">
                        {lens}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ARTICLES */}
                <div>
                  <div className={`flex items-center justify-between mb-3 ${isAr ? "flex-row-reverse" : ""}`}>
                    <h3 className="font-bold text-black dark:text-white text-sm">{t.articles}</h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    {mockArticles[language].map((article, i) => (
                      <div key={i} className={`flex items-center gap-3 cursor-pointer group ${isAr ? "flex-row-reverse" : ""}`}>
                        <img src={article.image} alt="" className="w-[55px] h-[55px] object-cover rounded-[10px] shrink-0" />
                        <div className={isAr ? "text-right" : "text-left"}>
                          <p className="text-black dark:text-white text-xs font-semibold leading-tight mb-1 group-hover:text-[#D9A066] transition">
                            {article.title}
                          </p>
                          <p className="text-gray-400 text-xs">{article.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* BOTTOM BAR */}
            <div className={`flex items-center justify-center gap-2 px-6 py-3 border-t border-black/5 dark:border-white/5 ${isAr ? "flex-row-reverse" : ""}`}>
              <kbd className="bg-black/10 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded">Esc</kbd>
              <span className="text-gray-400 text-xs">{t.close}</span>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
export default SearchModal