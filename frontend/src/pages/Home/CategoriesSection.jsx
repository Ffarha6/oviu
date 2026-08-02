import { useContext } from "react"
import { ThemeContext } from "../../context/ThemeContext"
import { LanguageContext } from "../../context/LanguageContext"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import menImg from "../../assets/images/men.png"
import womenImg from "../../assets/images/women.png"
import kidsImg from "../../assets/images/kids.png"
import unisexImg from "../../assets/images/bannerUnisex.jpg"

function CategoriesSection() {
  const { darkMode } = useContext(ThemeContext)
  const { language } = useContext(LanguageContext)
  const navigate = useNavigate()

  const isAr = language === "ar"

  const content = {
    ar: { heading: "تسوق حسب النوع", shop: "تسوق الآن" },
    en: { heading: "Shop by Type", shop: "Shop Now" },
  }

  // ✅ بقت مقسّمة حسب الفئة (رجالي/نسائي/أطفال/للجنسين) بدل النوع، وبصور
  // حقيقية بدل الأيقونات
  const types = {
    ar: [
      { title: "رجالي",   image: menImg,    slug: "men"    },
      { title: "نسائي",   image: womenImg,  slug: "women"  },
      { title: "أطفال",   image: kidsImg,   slug: "kids"   },
      { title: "للجنسين", image: unisexImg, slug: "unisex" },
    ],
    en: [
      { title: "Men",    image: menImg,    slug: "men"    },
      { title: "Women",  image: womenImg,  slug: "women"  },
      { title: "Kids",   image: kidsImg,   slug: "kids"   },
      { title: "Unisex", image: unisexImg, slug: "unisex" },
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
          {types[language].map((item, index) => (
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
                flex flex-col items-center text-center
              `}
            >
              {/* ✅ الصورة بقت مربعة وبتاخد عرض الكارت كامل بدل الدايرة الصغيرة */}
              <div className="w-full aspect-square overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="px-4 py-5 md:py-6 flex flex-col items-center">
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
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default CategoriesSection