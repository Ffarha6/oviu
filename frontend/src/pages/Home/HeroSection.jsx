import { ThemeContext } from "../../context/ThemeContext"
import { useContext, useEffect, useState } from "react"
import { LanguageContext } from "../../context/LanguageContext"
import { useNavigate } from "react-router-dom"
import heroBannerLight from "../../assets/images/hero-banner-light.png"
import heroBannerDark from "../../assets/images/hero-banner-dark.png"
import heroShippingBanner from "../../assets/images/hero-shipping-banner.png"
import { motion } from "framer-motion"

function HeroSection() {
  const navigate = useNavigate()
  const { language } = useContext(LanguageContext)
  const { darkMode } = useContext(ThemeContext)
  const [activeSlide, setActiveSlide] = useState(0)

  const isAr = language === "ar"
  const bannerImg = darkMode ? heroBannerDark : heroBannerLight
  const heroSlides = [
  bannerImg,
  heroShippingBanner,
]

useEffect(() => {
  const interval = setInterval(() => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length)
  }, 3000)

  return () => clearInterval(interval)
}, [heroSlides.length])

  // ✅ الصورتين (الفاتحة والغامقة) مصورتين بزاوية وبعد مختلفين عن بعض، فنفس
  // الـ object-position بيدّي كروب مختلف بصريًا في كل واحدة. القيم دي بتحكم في
  // موضع الصورة على الموبايل لكل ثيم لوحده — عدّلي الأرقام دي لحد ما الشخص
  // يبان بنفس الحجم وفي نفس المكان تقريبًا في الصورتين.
  const heroMobileImageStyle = darkMode
    ? { objectPosition: "88% top" }      // الصورة الغامقة
    : { objectPosition: "88% 10%" }      // الصورة الفاتحة — زوّدي/قلّلي النسبة دي لو لسه مش متطابقة

  const content = {
    ar: {
  subtitle: "OVIU COLLECTION",
  title: "أسلوبك يبدأ من نظارتك",
  description:
    "اكتشف تشكيلة مختارة من النظارات الشمسية والطبية بأفضل الأسعار.",
},
    en: {
      subtitle: "Your Style . Your Vision",
      title: "It All Reflects You",
      description:
        "Discover a curated collection of eyewear that blends luxury, quality, and modern elegance.",
      shop: "Shop Now",
      tryon: "Virtual Try-On",
    },
  }
  const c = content[language]

 return (
  <section>

    {/* =========================================================
        MOBILE
    ========================================================= */}
    <div className="sm:hidden px-0 pt-0 pb-6">

      <div className="relative overflow-hidden w-full aspect-[16/9] bg-[#F8F4F1]">

        {/* صورة السلايدر */}
        <motion.img
          key={activeSlide}
          src={heroSlides[activeSlide]}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* =====================================================
            محتوى الهيرو الأصلي فقط
        ===================================================== */}
        {activeSlide === 0 && (
          <>
            {/* التعتيم */}
            <div
              className={`absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t ${
                darkMode
                  ? "from-black/85 via-black/40 to-transparent"
                  : "from-black/70 via-black/25 to-transparent"
              }`}
            />

            {/* النص */}
            <div
              className={`absolute inset-x-0 bottom-0 px-5 pb-8 ${
                isAr ? "text-right" : "text-left"
              }`}
            >
              <p className="text-[#E8B074] text-[13px] font-semibold mb-1">
                {c.subtitle}
              </p>

              <h1 className="text-white text-[32px] font-extrabold mb-2 leading-tight">
                {c.title}
              </h1>

              <p className="text-white/90 text-[15px] leading-7 max-w-[300px]">
                {c.description}
              </p>
            </div>
          </>
        )}

        {/* =====================================================
            نقاط السلايدر
        ===================================================== */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-2">

          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activeSlide === index
                  ? "w-8 bg-[#D9A066]"
                  : "w-2.5 bg-black/20"
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}

        </div>

      </div>
    </div>


    {/* =========================================================
        DESKTOP / TABLET
    ========================================================= */}
    <div
      className="
        hidden sm:flex
        md:px-0
        pb-0
        md:pb-2
        overflow-hidden
        items-center
        bg-transparent
      "
    >

      <div
        className="
          w-full
          relative
          overflow-hidden
          aspect-[16/9]
          max-h-[calc(100vh-var(--navbar-height,132px))]
          bg-[#F8F4F1]
        "
      >

        {/* =====================================================
            صورة السلايدر
        ===================================================== */}
        <motion.img
          key={activeSlide}
          src={heroSlides[activeSlide]}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full object-contain"
        />


        {/* =====================================================
            محتوى الهيرو الأصلي فقط
        ===================================================== */}
        {activeSlide === 0 && (
          <>
            {/* Overlay */}
            <div
              className={`
                absolute inset-0
                ${
                  darkMode
                    ? "bg-gradient-to-r from-black/70 via-black/30 to-transparent"
                    : "bg-gradient-to-r from-[#F8F4F1]/55 via-[#F8F4F1]/20 to-transparent"
                }
              `}
            />

            {/* النص */}
            <motion.div
              key={language}
              initial={{
                opacity: 0,
                x: isAr ? 80 : -80,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{ duration: 0.7 }}
              className={`
                relative z-20
                w-full
                max-w-[580px]
                px-10
                lg:px-14
                py-8
                lg:py-16
                ${isAr ? "text-right mr-auto" : "text-left ml-0"}
              `}
            >

              <p className="text-[#D9A066] text-xl lg:text-3xl font-semibold mb-3">
                {c.subtitle}
              </p>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-5 text-black dark:text-white leading-[1.1] drop-shadow-[0_0_20px_rgba(217,160,102,0.15)]">
                {c.title}
              </h1>

              <p className="text-gray-700 dark:text-gray-300 text-lg lg:text-xl leading-relaxed mb-8 max-w-[460px]">
                {c.description}
              </p>

            </motion.div>
          </>
        )}


        {/* =====================================================
            نقاط السلايدر - DESKTOP
        ===================================================== */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">

          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activeSlide === index
                  ? "w-8 bg-[#D9A066]"
                  : "w-2.5 bg-black/25"
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}

        </div>

      </div>
    </div>

  </section>
)
}

export default HeroSection