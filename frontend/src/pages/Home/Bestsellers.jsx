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

  const ArrowIcon = isAr ? FaArrowLeft : FaArrowRight

  if (loading) {
    return (
      <section className="px-2 sm:px-6 xl:px-24 py-12 bg-[#F7F2EE] dark:bg-[#050505] transition-all duration-500">
        <div className="max-w-[1750px] mx-auto">
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

        <AnimatePresence mode="wait">
          <motion.div
            key="all-products"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6"
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAr={isAr}
                t={content[language]}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        

      </div>
    </section>
  )
}

export default BestSellers