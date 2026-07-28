import { useContext } from "react"
import { ThemeContext } from "../../context/ThemeContext"
import { LanguageContext } from "../../context/LanguageContext"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FaSun, FaGlasses, FaBookOpen, FaEye } from "react-icons/fa"

// ✅ FIX: القسم ده كان "تسوق حسب الفئة" (رجالي/نسائي/أطفال) واتحول
// لـ "تسوق حسب النوع" (شمسية/طبية/قراءة/عدسات) زي التصميم الجديد.
// شلنا الصور (men/women/kids) لأنها مش مناسبة للمحتوى الجديد، وبنستخدم
// أيقونات بدلها لحد ما تبقى صور المنتجات الحقيقية جاهزة — لو عندك صور
// مناسبة (نظارة شمسية / طبية / قراءة / عدسة) ابعتهالي وهبدلها بالصور.
function CategoriesSection() {
  const { darkMode } = useContext(ThemeContext)
  const { language } = useContext(LanguageContext)
  const navigate = useNavigate()

  const isAr = language === "ar"

  const content = {
    ar: { heading: "تسوق حسب النوع", shop: "تسوق الآن" },
    en: { heading: "Shop by Type", shop: "Shop Now" },
  }

  const types = {
    ar: [
      { title: "نظارات شمسية", icon: FaSun,      slug: "sunglasses" },
      { title: "نظارات طبية",  icon: FaGlasses,  slug: "medical"    },
      { title: "نظارات قراءة", icon: FaBookOpen, slug: "reading"    },
      { title: "عدسات",        icon: FaEye,      slug: "lenses"     },
    ],
    en: [
      { title: "Sunglasses",     icon: FaSun,      slug: "sunglasses" },
      { title: "Optical",        icon: FaGlasses,  slug: "medical"    },
      { title: "Reading Glasses",icon: FaBookOpen, slug: "reading"    },
      { title: "Contact Lenses", icon: FaEye,      slug: "lenses"     },
    ],
  }

  return (
    <section className="px-6 xl:px-24 pt-4 pb-8 md:pt-5 md:pb-10 bg-[#F7F2EE] dark:bg-[#050505] transition-colors duration-500">
      <div className="max-w-[1750px] mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-black dark:text-white text-center mb-5 md:mb-7"
        >
          {content[language].heading}
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {types[language].map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`
                  rounded-[20px] overflow-hidden group
                  transition-all duration-300
                  hover:shadow-[0_10px_28px_rgba(217,160,102,0.2)]
                  ${darkMode ? "bg-[#141414]" : "bg-white"}
                  px-4 py-6 md:py-8
                  flex flex-col items-center text-center
                `}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#D9A066]/10 flex items-center justify-center text-[#D9A066] text-2xl md:text-3xl mb-4 transition-transform duration-300 group-hover:scale-105">
                  <Icon />
                </div>

                <h3 className="text-sm md:text-lg font-bold text-black dark:text-white mb-3">
                  {item.title}
                </h3>

                <button
                  onClick={() => navigate(`/glasses/${item.slug}`)}
                  className="
                    text-xs md:text-sm font-semibold text-[#D9A066]
                    border border-[#D9A066] rounded-full
                    px-4 md:px-5 py-1.5 md:py-2
                    hover:bg-[#D9A066] hover:text-white transition
                  "
                >
                  {content[language].shop}
                </button>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default CategoriesSection