import { useContext } from "react"
import { LanguageContext } from "../../context/LanguageContext"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

import tryonBanner from "../../assets/images/banner-tryon.jpg"

function PromoBanners() {
  const { language } = useContext(LanguageContext)
  const navigate = useNavigate()
  const isAr = language === "ar"

  const content = {
    ar: {
      tag: "تقنية الذكاء الاصطناعي",
      title: "جرب النظارات\nافتراضياً",
      desc: "استخدم تقنية الذكاء الاصطناعي لتجربة النظارات على وجهك في ثوانٍ",
      btn: "جرب الآن",
    },
    en: {
      tag: "AI Technology",
      title: "Try Glasses\nVirtually",
      desc: "Use AI technology to try glasses on your face in seconds",
      btn: "Try Now",
    },
  }

  const t = content[language]

  return (
    // ✅ FIX: وحّدنا الـ padding الأفقي (px-6 بدل ما كانت px-4 md:px-6) عشان
    // تتماشى بالظبط مع باقي الأقسام، وضفنا xl:px-24 (مسافة متساوية يمين وشمال)
    <section className="px-6 xl:px-24 py-6 md:py-8 bg-[#F7F2EE] dark:bg-[#050505] transition-all duration-500">
      <div className="max-w-[1750px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[24px] md:rounded-[35px] overflow-hidden w-full min-h-[260px] md:min-h-[380px] lg:min-h-[460px] group"
        >
          <img
            src={tryonBanner}
            alt="Virtual try-on banner"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700"
          />

          <div className={`relative z-10 h-full flex flex-col justify-center p-8 md:p-16 lg:p-20 ${isAr ? "items-end text-right" : "items-start text-left"}`}>
            <span className="inline-block bg-white/80 text-[#5a3a2a] text-xs md:text-sm font-semibold px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
              {t.tag}
            </span>

            <h2 className="text-[#2c1810] font-bold leading-tight whitespace-pre-line text-3xl md:text-5xl lg:text-6xl xl:text-7xl mb-4 md:mb-6">
              {t.title}
            </h2>

            <p className="text-[#4a3020] max-w-[480px] text-sm md:text-lg lg:text-xl mb-6 md:mb-8 font-medium">
              {t.desc}
            </p>

            <button
              onClick={() => navigate("/virtual-tryon")}
              className="bg-[#D9A066] hover:bg-[#c98d54] text-white px-7 md:px-10 py-3 md:py-4 rounded-full text-sm md:text-base lg:text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {t.btn}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PromoBanners