import { useNavigate } from "react-router-dom"
import { useContext, useState, useEffect } from "react"
import { LanguageContext } from "../../context/LanguageContext"
import { ThemeContext } from "../../context/ThemeContext"
import { motion, AnimatePresence } from "framer-motion"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"
import ProductCard from "../../components/products/ProductCard"

function BestSellers() {
  const { language } = useContext(LanguageContext)
  const { darkMode } = useContext(ThemeContext)
  const isAr = language === "ar"
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  // ✅ فلتر "الكل / شمسية / طبية / قراءة" فوق شبكة المنتجات
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    fetch("https://oviu-production.up.railway.app/api/products/best-sellers/")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.results ?? [])
        setProducts(list)
        setLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setProducts([])
        setLoading(false)
      })
  }, [])

  const content = {
    ar: { heading: "الأكثر مبيعاً", currency: "جنيه", addToCart: "أضف للسلة", viewAll: "عرض كل المنتجات" },
    en: { heading: "Best Sellers", currency: "EGP", addToCart: "Add to Cart", viewAll: "View All Products" },
  }

  const filters = {
    ar: [
      { key: "all",        label: "الكل" },
      { key: "sunglasses", label: "شمسية" },
      { key: "medical",    label: "طبية" },
      { key: "reading",    label: "قراءة" },
    ],
    en: [
      { key: "all",        label: "All" },
      { key: "sunglasses", label: "Sunglasses" },
      { key: "medical",    label: "Optical" },
      { key: "reading",    label: "Reading" },
    ],
  }

  // ✅ FIX: بيفلتر على حقل category/type لو موجود في بيانات المنتج القادمة
  // من الـ API. لو الحقل غير موجود أو مختلف عن ده، الفلتر "الكل" هو اللي
  // هيفضل شغال بس — لو اسم الحقل عندك مختلف (مثلاً product.type) قولّي
  // عشان أظبطه بالظبط على شكل الداتا الحقيقية.
  const filteredProducts =
    activeFilter === "all"
      ? products
      : products.filter((p) => (p.category ?? p.type ?? "").toLowerCase() === activeFilter)

  const ArrowIcon = isAr ? FaArrowLeft : FaArrowRight

  if (loading) {
    return (
      <section className="px-2 sm:px-6 xl:px-24 py-12 sm:py-16 bg-[#F7F2EE] dark:bg-[#050505] transition-all duration-500">
        <div className="max-w-[1750px] mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black dark:text-white text-center mb-10">
            {content[language].heading}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`rounded-[20px] overflow-hidden animate-pulse ${darkMode ? "bg-[#111]" : "bg-white"}`}>
                <div className="h-[160px] bg-[#D9A066]/10" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[#D9A066]/20 rounded-full w-3/4" />
                  <div className="h-3 bg-[#D9A066]/20 rounded-full w-1/2" />
                  <div className="h-8 bg-[#D9A066]/20 rounded-full mt-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!loading && products.length === 0) {
    return (
      <section className="px-6 xl:px-24 py-16 bg-[#F7F2EE] dark:bg-[#050505]">
        <div className="max-w-[1750px] mx-auto text-center text-gray-400">
          {language === "ar" ? "لا توجد منتجات متاحة حالياً" : "No products available"}
        </div>
      </section>
    )
  }

  return (
    <section className="px-2 sm:px-6 xl:px-24 py-12 sm:py-16 bg-[#F7F2EE] dark:bg-[#050505] transition-all duration-500">
      <div className="max-w-[1750px] mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-black dark:text-white text-center mb-6"
        >
          {content[language].heading}
        </motion.h2>

        {/* Filter tabs */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {filters[language].map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`
                px-4 md:px-6 py-2 rounded-full text-sm md:text-base font-semibold transition-all duration-300
                ${activeFilter === f.key
                  ? "bg-[#D9A066] text-white shadow-md shadow-[#D9A066]/30"
                  : "bg-white dark:bg-neutral-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-[#D9A066] hover:text-[#D9A066]"
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAr={isAr}
                t={content[language]}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-400 mt-8">
            {language === "ar" ? "لا توجد منتجات في هذا التصنيف حالياً" : "No products in this category yet"}
          </p>
        )}

        {/* View all button */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate("/glasses/all")}
            className="
              flex items-center gap-2
              border-2 border-[#D9A066] text-[#D9A066]
              hover:bg-[#D9A066] hover:text-white transition-all duration-300
              font-semibold text-sm md:text-base
              px-6 md:px-8 py-2.5 md:py-3 rounded-full
            "
          >
            <span>{content[language].viewAll}</span>
            <ArrowIcon className="text-xs" />
          </button>
        </div>

      </div>
    </section>
  )
}

export default BestSellers