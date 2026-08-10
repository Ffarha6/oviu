import { useCart } from "../../context/CartContext"
import { useWishlist } from "../../context/WishlistContext"
import { useContext, useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { LanguageContext } from "../../context/LanguageContext"
import { ThemeContext } from "../../context/ThemeContext"
import { motion, AnimatePresence } from "framer-motion"
import api from "../../api/axios"
import {
  FiHeart, FiShoppingBag, FiTruck, FiShield,
  FiRotateCcw, FiChevronLeft, FiChevronRight,
  FiHome
} from "react-icons/fi"
import { FaHeart, FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"

// ✅ محتوى تحذير المخزون بيظهر بس لما يبقى قطعة واحدة أخيرة، مش أي عدد قليل

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { language } = useContext(LanguageContext)
  const { darkMode } = useContext(ThemeContext)
  const isAr = language === "ar"

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const [related, setRelated] = useState([])
  const [addedToCart, setAddedToCart] = useState(false)
  // ✅ رسالة خطأ لو حاول حد يضيف منتج نفذ من المخزون (سباق بين تابين مفتوحين مثلاً)
  const [cartError, setCartError] = useState("")

  useEffect(() => {
    setLoading(true)
    setActiveImage(0)
    api.get(`/products/by-id/${id}/`)
      .then(r => {
        setProduct(r.data)
        setLoading(false)
      })
      .catch(e => { console.error("ERROR:", e); setLoading(false) })
  }, [id])

  // ✅ الحالة والتوجل بقوا جايين من الـ context الموحد (WishlistContext)
  // بدل ما كل صفحة تعمل الطلبات دي لوحدها - ده اللي بيخلي أي إضافة
  // من أي مكان (كارت أو صفحة تفاصيل) تظهر في صفحة المفضلة على طول
  const inWishlist = product ? isWishlisted(product.id) : false
  const handleToggleWishlist = () => {
    if (!product) return
    toggleWishlist(product.id)
  }

  // ✅ المخزون جاي من الباك إند مباشرة (حقل stock في Product model)
  const stock = product?.stock ?? 0
  const outOfStock = stock <= 0
  const isLowStock = !outOfStock && stock === 1

  const t = {
    ar: {
      new: "جديد", addCart: "إضافة إلى السلة", buyNow: "الشراء الآن",
      color: "اللون", freeShip: "شحن مجاني", freeShipSub: "للطلبات فوق 499 ج.م",
      warranty: "ضمان سنتين", warrantySub: "على جميع المنتجات",
      returns: "إرجاع مجاني", returnsSub: "خلال 14 يوم",
      tryOn: "جربها افتراضياً", tryOnSub: "استخدم الكاميرا لرؤية النظارة على وجهك",
      tryBtn: "جرب الآن", related: "قد يعجبك أيضاً",
      specs: "مواصفات المنتج", desc: "الوصف", shipping: "الشحن والتوصيل",
      warranty2: "الضمان والاسترجاع", sizeGuide: "دليل المقاسات",
      currency: "ج.م", reviews: "تقييم", added: "✓ تمت الإضافة",
      noReviews: "لسه مفيش تقييمات، قيّم النظارة إنت الأول",
      home: "الرئيسية", glasses: "النظارات", sunglasses: "نظارات شمسية",
      frameType: "نوع الإطار", frameShape: "شكل الإطار", frameColor: "لون الإطار",
      material: "مادة الإطار", lensColor: "لون العدسة", lensWidth: "عرض العدسة", bridgeWidth: "عرض الجسر",
      armLength: "طول الذراع", uvProtection: "نوع العدسة",
      outOfStock: "نفذ من المخزون",
      lowStock: (n) => `متبقى ${n} فقط`,
      addError: "عذرًا، الكمية المتاحة لم تعد كافية",
    },
    en: {
      new: "New", addCart: "Add to Cart", buyNow: "Buy Now",
      color: "Color", freeShip: "Free Shipping", freeShipSub: "Orders above 499 EGP",
      warranty: "2-Year Warranty", warrantySub: "On all products",
      returns: "Free Returns", returnsSub: "Within 14 days",
      tryOn: "Virtual Try-On", tryOnSub: "Use camera to see the glasses on your face",
      tryBtn: "Try Now", related: "You May Also Like",
      specs: "Specifications", desc: "Description", shipping: "Shipping & Delivery",
      warranty2: "Warranty & Returns", sizeGuide: "Size Guide",
      currency: "EGP", reviews: "reviews", added: "✓ Added",
      noReviews: "No ratings yet, be the first to rate it",
      home: "Home", glasses: "Glasses", sunglasses: "Sunglasses",
      frameType: "Frame Type", frameShape: "Frame Shape", frameColor: "Frame Color",
      material: "Frame Material", lensColor: "Lens Color", lensWidth: "Lens Width", bridgeWidth: "Bridge Width",
      armLength: "Arm Length", uvProtection: "Lens Type",
      outOfStock: "Out of Stock",
      lowStock: (n) => `Only ${n} left`,
      addError: "Sorry, there isn't enough stock available anymore",
    }
  }[language]

  const [hoverStar, setHoverStar] = useState(0)
  const [submittingRating, setSubmittingRating] = useState(false)

  // ملحوظة: عدّلي المسار /products/${id}/rate/ لو الـ endpoint الحقيقي عندك
  // في الباك اسمه مختلف. الفكرة: نبعت رقم النجوم، وبعدين نجيب المنتج تاني
  // عشان نعرض المتوسط والعدد الحقيقيين الراجعين من الباك.
  const handleRate = async (value) => {
    if (submittingRating) return
    setSubmittingRating(true)
    try {
      await api.post(`/products/${id}/rate/`, { rating: value })
      const updated = await api.get(`/products/by-id/${id}/`)
      setProduct(updated.data)
    } catch (error) {
      console.error("Rating error:", error)
    } finally {
      setSubmittingRating(false)
    }
  }

  const renderStars = (rating = 0, interactive = false) =>
    Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      const activeValue = interactive ? (hoverStar || rating) : rating
      const filled = starValue <= Math.floor(activeValue)
      const half = !filled && starValue - 0.5 <= activeValue
      const StarIcon = filled ? FaStar : half ? FaStarHalfAlt : FaRegStar

      return (
        <StarIcon
          key={i}
          className={`text-[#D9A066] text-sm ${interactive ? "cursor-pointer transition-transform hover:scale-125" : ""}`}
          onMouseEnter={interactive ? () => setHoverStar(starValue) : undefined}
          onMouseLeave={interactive ? () => setHoverStar(0) : undefined}
          onClick={interactive ? () => handleRate(starValue) : undefined}
        />
      )
    })

  const handleAddCart = async () => {
    // ✅ حماية إضافية في الفرونت: مينفعش نبعت طلب أصلاً لو ظاهر قدامنا إن المخزون خلص.
    // التحقق الحقيقي والملزم برضه لازم يكون في الباك إند (add-to-cart endpoint)
    // عشان محدش يقدر يتحايل عليه من الفرونت.
    if (outOfStock) return

    setCartError("")
    try {
      await addToCart(product.id)
      setAddedToCart(true)
      setTimeout(() => {
        setAddedToCart(false)
      }, 2000)
    } catch (error) {
      // ✅ لو الباك إند رفض الإضافة (مثلاً المخزون خلص لحظة إرسال الطلب)
      // بيرجع رسالة واضحة بدل ما الزرار يفضل شغال من غير أي تفسير
      // (CartContext.jsx بيرمي Error عادي فيه .message، مش رد axios)
      setCartError(error?.message || t.addError)
      // نجيب بيانات المنتج تاني عشان نحدّث رقم المخزون المعروض فورًا
      api.get(`/products/by-id/${id}/`).then(r => setProduct(r.data)).catch(() => {})
    }
  }

  const imgUrl = (path) => {
    if (!path) return ""
    if (path.startsWith("http")) return path
    return `https://oviu-production.up.railway.app${path}`
  }

  const images = (() => {
    if (!product) return []
    if (selectedColor && Array.isArray(selectedColor.images) && selectedColor.images.length) {
      return selectedColor.images.map(img => img.url).filter(Boolean)
    }
    const firstColorWithImages = (product.colors || []).find(c => Array.isArray(c.images) && c.images.length)
    if (firstColorWithImages) {
      return firstColorWithImages.images.map(img => img.url).filter(Boolean)
    }
    if (product.primary_image) return [product.primary_image]
    return []
  })()

  const prevImg = () => setActiveImage(i => (images.length ? (i - 1 + images.length) % images.length : 0))
  const nextImg = () => setActiveImage(i => (images.length ? (i + 1) % images.length : 0))
  const colors = product?.colors || product?.variants || []

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    setActiveImage(0)
  }

  // ✅ الباك بيبعت شكل الإطار بالإنجليزي (rectangle, round, ...) عشان ده
  // القيمة المخزنة في الداتابيز، فبنترجمها هنا لعرضها بالعربي في الواجهة.
  // لو جالنا شكل جديد مش موجود في القاموس، بنعرضه زي ما هو بدل ما نكسر الصفحة.
  const frameShapeLabels = {
    ar: {
      rectangle: "مستطيل",
      round: "دائري",
      square: "مربع",
      oval: "بيضاوي",
      cat_eye: "عين القطة",
      aviator: "أفياتور",
      hexagonal: "سداسي",
      wayfarer: "ويفير",
      butterfly: "فراشة",
      geometric: "هندسي",
    },
    en: {
      rectangle: "Rectangle",
      round: "Round",
      square: "Square",
      oval: "Oval",
      cat_eye: "Cat Eye",
      aviator: "Aviator",
      hexagonal: "Hexagonal",
      wayfarer: "Wayfarer",
      butterfly: "Butterfly",
      geometric: "Geometric",
    },
  }

  const getFrameShapeLabel = (shape) => {
    if (!shape) return "--"
    const key = String(shape).trim().toLowerCase().replace(/\s+/g, "_")
    const dict = frameShapeLabels[isAr ? "ar" : "en"]
    return dict[key] || shape
  }

  const specs = product ? [
    { label: t.frameType, value: product.frame_type || product.type || "--" },
    { label: t.frameShape, value: getFrameShapeLabel(product.frame_shape) },
    { label: t.frameColor, value: product.color || "--" },
    { label: t.uvProtection, value: product.uv_protection || "--" },
    { label: t.lensColor, value: product.lens_color || "--" },
    { label: t.lensWidth, value: product.lens_width ? `${product.lens_width} مم` : "--" },
    { label: t.bridgeWidth, value: product.bridge_width ? `${product.bridge_width} مم` : "--" },
    { label: t.armLength, value: product.arm_length ? `${product.arm_length} مم` : "--" },
  ] : []

  const bg       = darkMode ? "#0a0a0a"  : "#FAFAF8"
  const cardBg   = darkMode ? "#111111"  : "#FFFFFF"
  const cardBg2  = darkMode ? "#161616"  : "#F5F0EB"
  const border   = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"
  const textMain = darkMode ? "#FFFFFF"  : "#0D0D0D"
  const textSub  = darkMode ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)"
  const gold     = "#D9A066"
  const photoBg  = "#FFFFFF" // خلفية ثابتة بيضا لصناديق الصور، عشان تندمج مع خلفية صور المنتج البيضا سواء في اللايت أو الدارك مود

  if (loading) return (
    <div style={{ backgroundColor: bg }} className="min-h-screen px-6 py-10">
      <div className="max-w-[1300px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
          <div style={{ backgroundColor: cardBg }} className="rounded-[24px] h-[480px]" />
          <div className="space-y-5 pt-6">
            {[60, 40, 30, 80, 50, 100].map((w, i) => (
              <div key={i} style={{ backgroundColor: `${gold}22`, width: `${w}%` }} className="h-4 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (!product) return null

  return (
    <div style={{ backgroundColor: bg, color: textMain }} className="min-h-screen transition-colors duration-500 overflow-x-hidden"
      dir={isAr ? "rtl" : "ltr"}>
      {/* ✅ FIX: py-8 اتحولت لـ pt-8 عشان منسيبش مسافة زيادة تحت آخر عنصر في
          الصفحة لما قسم "قد يعجبك أيضاً" مش بيظهر (related فاضية) */}
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 pt-8">

        {/* ✅ FIX: تمت إزالة flex-row-reverse لأنها كانت تعمل عكس مزدوج مع dir="rtl"
            وهو اللي كان بيخلي الـ breadcrumb يظهر في اتجاه LTR (على الشمال) بدل اليمين.
            دلوقتي الـ dir="rtl" الموروثة من الأب هي اللي بتظبط الترتيب لوحدها. */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-6 flex-wrap justify-start"
          style={{ color: textSub, fontSize: "14px" }}>
          {[
            { label: t.home, action: () => navigate("/") },
            { label: t.glasses, action: () => navigate("/glasses") },
            { label: t.sunglasses, action: null },
          ].map((crumb, i, arr) => (
            <span key={i} className="flex items-center gap-2">
              <span
                onClick={crumb.action}
                style={{ color: i === arr.length - 1 ? textMain : textSub }}
                className={crumb.action ? "hover:text-[#D9A066] cursor-pointer transition-colors" : "font-medium"}>
                {crumb.label}
              </span>
              {i < arr.length - 1 && <span style={{ color: textSub }}>/</span>}
            </span>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[520px_minmax(0,1fr)] gap-8 mb-12 overflow-hidden">

          <motion.div
            initial={{ opacity: 0, x: isAr ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col-reverse lg:flex-row gap-3"
          >
            {/* Thumbnails - عمودي على الجنب، وكبّرناها شوية */}
            <div className="
    flex
    flex-row
    lg:flex-col
    gap-2.5
    w-full
    lg:w-[104px]
    overflow-x-auto
    shrink-0
">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  style={{
                    borderColor: activeImage === i ? gold : border,
                    backgroundColor: photoBg,
                    boxShadow: activeImage === i ? `0 0 0 2px ${gold}33` : "none"
                  }}
                  className="rounded-[14px] overflow-hidden border-2 transition-all duration-200 hover:opacity-90 shrink-0">
                  <img src={imgUrl(img)} alt=""
                    className="
w-[80px]
h-[80px]
lg:w-full
lg:h-[96px]
object-contain
mx-auto
" />
                </button>
              ))}
            </div>

            {/* الصورة الرئيسية */}
            <div style={{ backgroundColor: photoBg, border: `1px solid ${border}` }}
              className="
relative
flex-1
rounded-[24px]
overflow-hidden
aspect-square
">
              {/* ✅ شارة "نفذ من المخزون" فوق الصورة عشان تبان بوضوح من أول وهلة */}
              {outOfStock && (
                <div className={`absolute top-4 ${isAr ? "right-4" : "left-4"} z-10 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full`}>
                  {t.outOfStock}
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage + "-" + (selectedColor?.id ?? "none")}
                  src={imgUrl(images[activeImage])}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: outOfStock ? 0.5 : 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  drag="x"
dragConstraints={{ left: 0, right: 0 }}
dragElastic={0.2}

onDragEnd={(e, info) => {
  if (info.offset.x < -80) {
    nextImg()
  } else if (info.offset.x > 80) {
    prevImg()
  }
}}
                  className="
    w-full
    h-full
    object-contain
    p-4
    touch-pan-y
    select-none
  "
/>
              </AnimatePresence>

              <button onClick={handleToggleWishlist}
                style={{ backgroundColor: darkMode ? "#222" : "#fff", border: `1px solid ${border}` }}
                className={`absolute top-4 ${isAr ? "left-4" : "right-4"} w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110`}>
                {inWishlist
                  ? <FaHeart className="text-[#D9A066]" />
                  : <FiHeart style={{ color: textSub }} />}
              </button>

              {images.length > 1 && (
                <>
                  <button onClick={prevImg}
                    style={{ backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)", color: textMain }}
                    className={`absolute bottom-4 ${isAr ? "right-4" : "left-4"} w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-all`}>
                    <FiChevronLeft />
                  </button>
                  <button onClick={nextImg}
                    style={{ backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)", color: textMain }}
                    className={`absolute bottom-4 ${isAr ? "left-4" : "right-4"} w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-all`}>
                    <FiChevronRight />
                  </button>
                  <div style={{ backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: textSub }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full">
                    {activeImage + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isAr ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`flex flex-col gap-4 min-w-0 ${isAr ? "text-right" : "text-left"}`}
          >
            {product.is_new && (
              <span style={{ backgroundColor: gold }} className="inline-block self-start text-white text-xs font-bold px-3 py-1 rounded-md">
                {t.new}
              </span>
            )}

            <h1 style={{ color: textMain, textAlign: isAr ? "right" : "left" }} className="text-4xl font-bold leading-tight">
              {product.name}
            </h1>

            {product.sku && (
              <p style={{ color: textSub }} className="text-sm">
                {product.sku} | {product.category || "مجموعة كلاسيك"}
              </p>
            )}

            {/* ✅ التقييم + السعر + اللون كلهم دلوقتي جوه نفس البلوك، مباشرة تحت
                اسم المنتج وفوق أزرار الشراء، بمسافات ضيقة عشان الشكل يبقى نضيف
                ومتجمع في مكان واحد */}
            <div className="flex flex-col gap-3 mt-0.5">

  <div className="flex items-center gap-2">
    <div className="flex gap-0.5">
      {renderStars(product.rating || 0, true)}
    </div>
    <span style={{ color: textSub }} className="text-sm">
      ({product.reviews_count || 0} {t.reviews})
    </span>
    {submittingRating && (
      <span style={{ color: textSub }} className="text-xs">…</span>
    )}
  </div>

  {colors.length > 0 && (
    <div className="flex gap-3">
      {colors.map((c, i) => (
        <button
          key={i}
          onClick={() => handleColorSelect(c)}
          className="flex flex-col items-center gap-1"
        >
          <span
            style={{
              backgroundColor: c.hex_code || c.hex || c.color_code || "#333",
              borderColor: (selectedColor?.id === c.id || (!selectedColor && i === 0)) ? gold : "transparent",
              boxShadow: (selectedColor?.id === c.id || (!selectedColor && i === 0)) ? `0 0 0 3px ${gold}44` : "none"
            }}
            className="w-6 h-6 rounded-full border-2 transition-all hover:scale-110 block"
          />
          <span style={{ color: textSub }} className="text-[11px]">
            {c.name}
          </span>
        </button>
      ))}
    </div>
  )}

  <div>
  

              
                <div className="flex items-baseline gap-1">
                  <span style={{ color: textMain }} className="text-5xl font-bold">
                    {product.current_price || product.price}
                  </span>
                  <span style={{ color: textSub }} className="text-xl">{t.currency}</span>
                  {product.has_discount && product.discount_price && (
                    <span style={{ color: textSub }} className="text-lg line-through">{product.price}</span>
                  )}
                </div>

                {/* ✅ حالة المخزون: نفذ من المخزون (أحمر) أو متبقى X فقط (تحذيري) */}
                {outOfStock ? (
                  <p className="text-red-500 font-semibold text-sm mt-2">{t.outOfStock}</p>
                ) : isLowStock ? (
                  <p className="text-red-500 font-semibold text-sm mt-2">{t.lowStock(stock)}</p>
                ) : null}
              </div>
            </div>

            {cartError && (
              <p className="text-red-500 text-sm -mt-2">{cartError}</p>
            )}

            <div className="flex gap-3">
              <motion.button
                whileHover={outOfStock ? {} : { scale: 1.03 }}
                whileTap={outOfStock ? {} : { scale: 0.97 }}
                onClick={handleAddCart}
                disabled={outOfStock}
                style={{
                  backgroundColor: outOfStock ? (darkMode ? "#2a2a2a" : "#e5e5e5") : (addedToCart ? "#22c55e" : gold),
                  boxShadow: outOfStock ? "none" : `0 4px 20px ${gold}44`,
                  cursor: outOfStock ? "not-allowed" : "pointer",
                }}
                className={`group relative overflow-hidden flex-1 flex items-center justify-center gap-2 py-4 rounded-[14px] font-bold text-sm transition-all duration-300 ${outOfStock ? "text-gray-400" : "text-white"}`}>
                {!outOfStock && (
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                )}
                <FiShoppingBag className="relative z-10" />
                <span className="relative z-10">
                  {outOfStock ? t.outOfStock : (addedToCart ? t.added : t.addCart)}
                </span>
              </motion.button>

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/virtual-tryon?glass=${product.id}`)}
                style={{ border: `1.5px solid ${gold}`, color: gold, backgroundColor: "transparent" }}
                className="group relative overflow-hidden flex-1 flex items-center justify-center gap-2 py-4 rounded-[14px] font-bold text-sm transition-all duration-300 hover:bg-[#D9A066] hover:text-white">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <span className="relative z-10">{t.tryBtn}</span>
              </motion.button>
            </div>

          </motion.div>
        </div>

        {/* ✅ FIX: mb-10 بقت شرطية - بتظهر بس لو فيه منتجات related فعلاً.
            كده لما related تبقى فاضية، مفيش مسافة زيادة (بيج) بتفضل معلقة
            قبل الفوتر مباشرة */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${related.length > 0 ? "mb-10" : ""}`}>

          {/* ✅ جدول المواصفات: خط أكبر + تلوين صفوف متبادل (Zebra) زي الجداول
              الاحترافية، بدل الخط الصغير والسطر الفاصل الباهت اللي كان موجود */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4 }}
            style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
            className="rounded-[20px] p-6 overflow-hidden">
            <h3 style={{ color: gold }} className="font-bold text-lg mb-4 text-right">
              {t.specs}
            </h3>
            <div className="rounded-[12px] overflow-hidden">
              {specs.map((s, i) => (
                <div key={i}
                  style={{ backgroundColor: i % 2 === 0 ? (darkMode ? "rgba(255,255,255,0.03)" : "#F7F2EE") : "transparent" }}
                  className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span style={{ color: gold }} className="text-base w-5">{s.icon}</span>
                    <span style={{ color: textSub }} className="text-base">{s.label}</span>
                  </div>
                  <span style={{ color: textMain }} className="text-base font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex flex-col gap-4">

            
            {/* ✅ بدل الأكورديون (اللي كان محتاج دوسة على السهم عشان تظهر)،
                دلوقتي كل قسم ظاهر بالكامل من أول ما الصفحة تفتح، بتصميم
                كارت واضح مع أيقونة وعنوان ومحتوى مباشر */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.15 }}
              className="flex flex-col gap-3">
              {[
  { id: "desc", label: t.desc, icon: null, content: product.description || "تصميم كلاسيكي يجمع بين الأناقة والعملية. إطار أسيتات عالي الجودة يوفر الراحة والمتانة." },
].map((sec) => (
                <div key={sec.id}
                  style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
                  className="rounded-[14px] px-5 py-4">
                  <div className="flex items-center gap-2 font-bold text-base mb-1.5"
                    style={{ color: gold }}>
                    {sec.icon && <span>{sec.icon}</span>}
                    {sec.label}
                  </div>
                  <p style={{ color: textSub }} className="text-[15px] leading-relaxed text-right">
                    {sec.content}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {related.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-4 mb-6">
              <div style={{ background: `linear-gradient(to right, transparent, ${gold}44)` }} className="flex-1 h-px" />
              <h3 style={{ color: textMain }} className="font-bold text-lg whitespace-nowrap">{t.related}</h3>
              <span style={{ color: gold }}>✦</span>
              <div style={{ background: `linear-gradient(to left, transparent, ${gold}44)` }} className="flex-1 h-px" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {related.map((p, i) => (
                <motion.div key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
                  className="rounded-[18px] overflow-hidden cursor-pointer group transition-all hover:shadow-[0_8px_30px_rgba(217,160,102,0.12)]">
                  <div style={{ backgroundColor: photoBg }} className="relative overflow-hidden">
                    <img src={imgUrl(p.primary_image)} alt={p.name}
                      className="w-full h-[150px] object-cover transition duration-500 group-hover:scale-105" />
                    <button
                      onClick={e => e.stopPropagation()}
                      style={{ backgroundColor: darkMode ? "#222" : "#fff" }}
                      className={`absolute top-2 ${isAr ? "left-2" : "right-2"} w-7 h-7 rounded-full flex items-center justify-center shadow-sm`}>
                      <FiHeart style={{ color: textSub }} className="text-xs" />
                    </button>
                  </div>
                  <div className={`p-3 ${isAr ? "text-right" : "text-left"}`}>
                    <p style={{ color: textMain }} className="text-xs font-semibold mb-1 leading-tight">{p.name}</p>
                    <p style={{ color: gold }} className="font-bold text-sm mb-2">{p.current_price || p.price} {t.currency}</p>
                    <button
                      onClick={e => e.stopPropagation()}
                      style={{ backgroundColor: `${gold}18`, color: gold }}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#D9A066] hover:text-white transition-colors">
                      <FiShoppingBag className="text-xs" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}

export default ProductDetail