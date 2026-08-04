import { motion } from "framer-motion"
import tryonBanner from "../../assets/images/banner-tryon.jpg"

function PromoBanners() {
 

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
  className="
    rounded-2xl md:rounded-[32px]
    overflow-hidden
    w-full
  "
>
  <img
    src={tryonBanner}
    alt="Banner"
    className="w-full h-auto block object-cover"
  />
</motion.div>
      </div>
    </section>
  )
}

export default PromoBanners