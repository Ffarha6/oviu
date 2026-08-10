import { ThemeContext } from "../../context/ThemeContext"
import { useContext, useEffect, useState } from "react"
import { LanguageContext } from "../../context/LanguageContext"
import { useNavigate } from "react-router-dom"
import heroBannerLight from "../../assets/images/hero-banner-light.png"
import heroBannerDark from "../../assets/images/hero-banner-dark.png"
import heroShippingBanner from "../../assets/images/hero-shipping-banner.png"
// ✅ صورة جديدة مخصوصة للديسكتوب بس لسلايد "التوصيل المجاني". حطي صورتك
// الجديدة في نفس فولدر src/assets/images بنفس الاسم ده، أو غيّري اسم
// الملف هنا لو سميتيها اسم مختلف
import heroShippingBannerDesktop from "../../assets/images/hero-shipping-banner-desktop.png"
import { motion } from "framer-motion"

function HeroSection() {
  const navigate = useNavigate()
  const { language } = useContext(LanguageContext)
  const { darkMode } = useContext(ThemeContext)
  const [activeSlide, setActiveSlide] = useState(0)

  const isAr = language === "ar"
  const bannerImg = darkMode ? heroBannerDark : heroBannerLight

  // ✅ الموبايل بيفضل شغال بنفس الصور القديمة زي ما هي بالظبط
  const heroSlidesMobile = [
    bannerImg,
    heroShippingBanner,
  ]

  // ✅ الديسكتوب بس بيستخدم الصورة الجديدة في سلايد التوصيل المجاني،
  // وصورة الشخص فضلت زي ما هي (نفس بانرImg بتاع الموبايل)
  const heroSlidesDesktop = [
    bannerImg,
    heroShippingBannerDesktop,
  ]

  // عدد السلايدز واحد في الاتنين، فبنستخدمه للـ interval والنقاط سوا
  const slideCount = heroSlidesMobile.length

useEffect(() => {
  const interval = setInterval(() => {
    setActiveSlide((prev) => (prev + 1) % slideCount)
  }, 3000)

  return () => clearInterval(interval)
}, [slideCount])

  const heroMobileImageStyle = darkMode
    ? { objectPosition: "88% top" }
    : { objectPosition: "88% 10%" }

  const heroDesktopImageStyle = {
    objectPosition: "50% 5%",
    transform: "scale(1)",
  }

  // ✅ بانر التوصيل المجاني بقى object-cover زي صورة الشخص بالظبط، عشان
  // يملى المساحة بالكامل من غير فراغات حواليه. لو حبيتي تتحكمي في أنهي جزء
  // من الصورة يفضل ظاهر (لو حصل قص بسيط)، عدّلي objectPosition هنا
  const heroDesktopBannerStyle = {
    objectPosition: "50% 50%",
  }

  const content = {
    ar: {
  subtitle: "OVIU COLLECTION",
  title: "أسلوبك يبدأ من نظارتك",
  description:
    "اكتشف تشكيلة مختارة من النظارات الشمسية والطبية بأفضل الأسعار.",
  shop: "تسوق الآن",
},
    en: {
      subtitle: "Your Style . Your Vision",
      title: "It All Reflects You",
      description:
        "Discover a curated collection of eyewear that blends luxury, quality, and modern elegance.",
      shop: "Shop Now",
    },
  }
  const c = content[language]

  const scrollToProducts = () => {
    document.getElementById("best-sellers")?.scrollIntoView({ behavior: "smooth" })
  }

 return (
  <section>

    {/* =========================================================
        MOBILE
    ========================================================= */}
    <div className="sm:hidden px-0 pt-0 pb-6">

      <div className="relative overflow-hidden w-full aspect-[16/9] bg-[#F8F4F1]">

        <motion.img
          key={activeSlide}
          src={heroSlidesMobile[activeSlide]}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full object-contain"
        />

        {activeSlide === 0 && (
          <>
            <div
              className={`absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t ${
                darkMode
                  ? "from-black/85 via-black/40 to-transparent"
                  : "from-black/70 via-black/25 to-transparent"
              }`}
            />

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

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-2">

          {heroSlidesMobile.map((_, index) => (
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
          h-[75vh]
          bg-[#F8F4F1]
          flex items-center
        "
      >

        {/* =====================================================
            صورة السلايدر — السلايدين الاتنين بقوا object-cover عشان
            يملوا المساحة بالكامل من غير فراغات، زي بعض بالظبط
        ===================================================== */}
        <motion.img
          key={activeSlide}
          src={heroSlidesDesktop[activeSlide]}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full object-cover"
          style={activeSlide === 0 ? heroDesktopImageStyle : heroDesktopBannerStyle}
        />


        {/* =====================================================
            محتوى الهيرو الأصلي فقط
        ===================================================== */}
        {activeSlide === 0 && (
          <>
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

              <button
                onClick={scrollToProducts}
                className="
                  bg-[#C89072] hover:bg-[#b87f61]
                  text-white font-semibold
                  px-8 py-3.5 lg:px-10 lg:py-4
                  rounded-full
                  text-base lg:text-lg
                  transition
                  shadow-md hover:shadow-lg
                "
              >
                {c.shop}
              </button>

            </motion.div>
          </>
        )}


        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">

          {heroSlidesDesktop.map((_, index) => (
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