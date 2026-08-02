import { useState, useEffect, useContext, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { LanguageContext } from "../../context/LanguageContext"
import { ThemeContext } from "../../context/ThemeContext"
import api from "../../api/axios"
import {
  FiHeart, FiTrash2, FiShare2
} from "react-icons/fi"
import ProductCard from "../../components/products/ProductCard"   // ✅ نفس الكارت المستخدم في باقي الصفحات
/* ────────────────────────────────────────────
   Helpers
──────────────────────────────────────────── */
const getPrice = (product) =>
  product?.current_price ?? product?.price ?? product?.selling_price ?? product?.base_price ?? 0

/* ────────────────────────────────────────────
   Empty State
──────────────────────────────────────────── */
const EmptyState = ({ isAr, t, textMain, textSub }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-24 text-center"
  >
    <div className="w-24 h-24 rounded-full bg-[#D9A066]/10 border border-[#D9A066]/20 flex items-center justify-center mb-6">
      <FiHeart className="text-[#D9A066] text-4xl" />
    </div>
    <h2 style={{ color: textMain }} className="text-xl font-bold mb-2">{t.emptyTitle}</h2>
    <p style={{ color: textSub }} className="text-sm mb-8 max-w-xs">{t.emptyDesc}</p>
    {/* ✅ اتشال السهم جنب "تصفح المنتجات" */}
    <Link to="/glasses/sunglasses"
      className="flex items-center gap-2 bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] shadow-[0_6px_20px_rgba(217,160,102,0.3)]">
      {t.browse}
    </Link>
  </motion.div>
)

/* ────────────────────────────────────────────
   Main Wishlist Page
──────────────────────────────────────────── */
export default function Wishlist() {
  const { language } = useContext(LanguageContext)
  const { darkMode }  = useContext(ThemeContext)
  const navigate     = useNavigate()
  const isAr         = language === "ar"

  const bg       = darkMode ? "#000000" : "#F7F2EE"
  const cardBg   = darkMode ? "rgba(255,255,255,0.05)" : "#FFFFFF"
  const border   = darkMode ? "rgba(255,255,255,0.1)"  : "rgba(0,0,0,0.08)"
  const textMain = darkMode ? "#FFFFFF" : "#0D0D0D"
  const textSub  = darkMode ? "rgba(255,255,255,0.4)"  : "rgba(0,0,0,0.45)"

  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")
  const [sort,    setSort]    = useState("newest")

  const t = {
    ar: {
      title: "قائمة المفضلة",
      share: "مشاركة القائمة",
      removeAll: "إزالة الكل",
      emptyTitle: "قائمة المفضلة فارغة",
      emptyDesc: "لم تضف أي منتجات بعد. تصفح المنتجات وأضف ما يعجبك!",
      browse: "تصفح المنتجات",
      error: "حدث خطأ أثناء تحميل القائمة",
      retry: "إعادة المحاولة",
    },
    en: {
      title: "Wishlist",
      share: "Share List",
      removeAll: "Remove All",
      emptyTitle: "Your Wishlist is Empty",
      emptyDesc: "You haven't saved any products yet. Browse and add your favorites!",
      browse: "Browse Products",
      error: "Error loading wishlist",
      retry: "Retry",
    },
  }[language]

  /* ── Fetch ── */
  const fetchWishlist = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const res = await api.get("/wishlist/")
      setItems(res.data)
    } catch (err) {
      if (err.response?.status === 401) navigate("/login")
      else setError(t.error)
    } finally {
      setLoading(false)
    }
  }, [navigate, t.error])

  useEffect(() => { fetchWishlist() }, [fetchWishlist])

  /* ── Remove all (فوري، من غير تأكيد) ── */
  const handleClearAll = async () => {
    const previousItems = items
    setItems([]) // تفريغ فوري في الواجهة
    try {
      await Promise.all(previousItems.map(i => api.delete(`/wishlist/remove/${i.product_detail?.id || i.product}/`)))
    } catch {
      // لو فشل الحذف من السيرفر نرجّع القائمة زي ما كانت
      setItems(previousItems)
    }
  }

  /* ── Sort ── */
  const sortedItems = [...items].sort((a, b) => {
    const pa = getPrice(a.product_detail), pb = getPrice(b.product_detail)
    if (sort === "price_asc")  return pa - pb
    if (sort === "price_desc") return pb - pa
    if (sort === "oldest")     return new Date(a.added_at) - new Date(b.added_at)
    return new Date(b.added_at) - new Date(a.added_at)
  })

  /* ── Render ── */
  // ✅ محاذاة الصفحة (max-width / padding) بقت زي صفحة تأكيد الطلب بالظبط:
  // max-w-[1400px] mx-auto px-10 pt-8 pb-12 — بدل الحاوية الأضيق اللي كانت
  // شايلة بريدكرمب فوق بـ padding منفصل
  return (
    <div style={{ backgroundColor: bg, color: textMain }} className="min-h-screen transition-colors duration-500" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-[1400px] mx-auto px-2 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-12">

        {/* ── Page Title ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            {/* العنوان الأول وبعده القلب */}
            <div className="flex items-center gap-3 mb-1">
              <h1 style={{ color: textMain }} className="text-3xl font-bold">{t.title}</h1>
              <FiHeart className="text-[#D9A066] text-2xl" />
            </div>
            {/* ✅ اتشال نص "X منتجات محفوظة" */}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ backgroundColor: cardBg }} className="rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="flex flex-col items-center py-20 gap-4">
            <p className="text-red-400">{error}</p>
            <button onClick={fetchWishlist}
              className="bg-[#D9A066] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#c98d54] transition-all">
              {t.retry}
            </button>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && items.length === 0 && (
          <EmptyState isAr={isAr} t={t} textMain={textMain} textSub={textSub} />
        )}

        {/* ── Content ── */}
        {!loading && !error && items.length > 0 && (
          <>
            {/* Controls */}
            <div className={`flex items-center justify-between mb-6 ${isAr ? "flex-row-reverse" : ""}`}>

              {/* زرار مشاركة القائمة */}
              <button style={{ borderColor: border, color: textSub }}
                className="flex items-center gap-2 border hover:border-[#D9A066]/40 hover:text-[#D9A066] text-sm px-4 py-2 rounded-xl transition-all">
                <FiShare2 size={14} /> {t.share}
              </button>

              {/* ✅ إزالة الكل: حذف فوري من غير رسالة تأكيد */}
              <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
                <button onClick={handleClearAll}
                  className="flex items-center gap-2 text-sm text-red-400/70 hover:text-red-400 border border-red-400/20 hover:border-red-400/50 px-3 py-2.5 rounded-xl transition-all">
                  <FiTrash2 size={14} /> {t.removeAll}
                </button>
              </div>
            </div>

            {/* Cards — بقت دايمًا شبكة (grid) بما إن زرار التبديل اتشال */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {sortedItems.map(item => (
                <ProductCard
                  key={item.id}
                  product={item.product_detail || { id: item.product }}
                  isAr={isAr}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}