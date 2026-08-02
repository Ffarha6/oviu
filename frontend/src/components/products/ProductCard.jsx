import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FiHeart, FiShoppingBag, FiEye } from "react-icons/fi"
import { FaHeart, FaStar, FaStarHalfAlt, FaRegStar, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { useCart } from "../../context/CartContext"
import { useWishlist } from "../../context/WishlistContext"
// ─────────────────────────────────────────────
// FIX: بعض روابط الصور بترجع من الـ API ناقصة الدومين
// (زي "/media/products/xxx.jpg" بدل "https://oviu-production.up.railway.app/media/products/xxx.jpg")
// الدالة دي بتكمل الدومين الناقص عشان المتصفح يقدر يجيب الصورة صح
// ─────────────────────────────────────────────
const API_BASE = "https://oviu-production.up.railway.app"

function resolveImageUrl(url) {
  if (!url) return null
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`
}

// ⚠️ حماية مؤقتة: بعض المنتجات راجعة من الباك إند وحقل الاسم بتاعها فيه
// كود اللغة نفسه ("ar" أو "en") بدل الاسم الحقيقي — على الأغلب مشكلة بيانات
// في قاعدة البيانات مش مشكلة فرونت إند. لحد ما يتصلح من هناك، منعرضش النص
// المكسور ده للزبون، ونستبدله ببديل نضيف بدل ما يبين اسم غريب على الموقع.
function safeProductName(rawName, isAr) {
  const isBroken = !rawName || /^(ar|en)$/i.test(String(rawName).trim())
  if (!isBroken) return rawName
  return isAr ? "منتج بدون اسم" : "Unnamed product"
}

// ===== STAR RATING =====
function StarRating({ rating = 0, count = 0 }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-[2px]">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className="text-[#D9A066] text-[12px]">
            {rating >= s ? <FaStar /> : rating >= s - 0.5 ? <FaStarHalfAlt /> : <FaRegStar />}
          </span>
        ))}
      </div>
      {count > 0 && (
        <span className="text-gray-400 text-[11px]">({count})</span>
      )}
    </div>
  )
}

// ===== COLOR SWATCH =====
function ColorSwatches({ colors = [], selectedColor, onSelect }) {
  if (!colors.length) return null
  return (
    <div className="flex items-center gap-[6px] flex-wrap">
      {colors.map((color) => (
        <button
          key={color.id || color.name}
          title={color.name}
          onClick={(e) => {
            e.stopPropagation() // يمنع الكليك من الوصول لصفحة المنتج
            onSelect?.(color)
          }}
          className={`
            w-4 h-4 rounded-full transition-all duration-200 shrink-0
            ${selectedColor?.id === color.id || selectedColor?.name === color.name
              ? "ring-2 ring-[#D9A066] ring-offset-2 ring-offset-white dark:ring-offset-[#141414] scale-110"
              : "ring-1 ring-black/10 dark:ring-white/10 hover:scale-110"}
          `}
          style={{ backgroundColor: color.hex_code || color.code || color.hex || "#ccc" }}
        />
      ))}
    </div>
  )
}

// ===== PRODUCT CARD =====
// ✅ FIX: شيلنا الـ props "wishlist" و"toggleWishlist" اللي كانت جاية من كل صفحة
// لوحدها (وكانت بتعمل toggle محلي وهمي بس، من غير أي اتصال بالباك).
// دلوقتي الكارت بيستخدم useWishlist() المركزي، فأي مكان يتحط فيه الكارت
// هيشتغل بنفس المنطق الحقيقي (حفظ في الباك + رسالة منبثقة) من غير ما
// الصفحة الأب تحتاج تعمل أي حاجة إضافية.
//
// ✅ إعادة تصميم (موبايل): بدل زرارين متساويين جنب بعض بيتزنقوا في مساحة
// ضيقة، بقى فيه زرار رئيسي واحد واضح "أضف للسلة"، وزرار "جرّب الآن" بقى
// أيقونة مربعة صغيرة جنبه — نفس فكرة مواقع كبيرة (Amazon/ASOS): فعل أساسي
// بارز + فعل ثانوي مضغوط، بدل ما الاتنين ياخدوا نفس الوزن البصري.
function ProductCard({ product, isAr = false, t = {} }) {
  const navigate = useNavigate()
  const { addToCart, loading: cartLoading } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [addedFeedback, setAddedFeedback] = useState(false)
  // ✅ رسالة خطأ لو الباك إند رفض الإضافة (مثلاً المخزون خلص لحظة الضغط)
  const [cartError, setCartError] = useState("")

  const colors = product.colors || []
  const [selectedColor, setSelectedColor] = useState(colors[0] || null)

  const displayName = safeProductName(product.name, isAr)

  // ─────────────────────────────────────────────
  // FIX: الصور المعروضة دلوقتي بتتبع اللون المختار فقط
  // مش كل صور كل الألوان مجمّعة في قايمة واحدة
  // ─────────────────────────────────────────────
  const images = (() => {
    const list = []

    if (selectedColor && Array.isArray(selectedColor.images) && selectedColor.images.length) {
      selectedColor.images.forEach((img) => {
        const url = resolveImageUrl(img?.url)
        if (url && !list.includes(url)) list.push(url)
      })
    }

    // fallback: لو اللون المختار مفهوش صور، نرجع لصورة المنتج الأساسية
    if (!list.length && product.primary_image) {
      list.push(resolveImageUrl(product.primary_image))
    }

    if (!list.length) list.push(null)
    return list
  })()

  const [imgIndex, setImgIndex]   = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [brokenImage, setBrokenImage] = useState(false)
  // ✅ بتتبع لو الماوس واقف فوق صورة المنتج دلوقتي، عشان نلف تلقائي بين الصور (ديسكتوب بس)
  const [isHovering, setIsHovering] = useState(false)
  const dragStart = useRef(null)

  useEffect(() => {
    setBrokenImage(false)
  }, [imgIndex, selectedColor])

  useEffect(() => {
    if (!isHovering || images.length <= 1) return
    const interval = setInterval(() => {
      setImgIndex((i) => (i + 1) % images.length)
    }, 1100)
    return () => clearInterval(interval)
  }, [isHovering, images.length])

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    setImgIndex(0) // نرجع لأول صورة بتاعة اللون الجديد
  }

  const originalPrice = parseFloat(product.price) || 0
  const currentPrice  = parseFloat(product.current_price || product.price) || 0
  const hasDiscount   = product.has_discount || (originalPrice > currentPrice && currentPrice > 0)
  const discountPct   = hasDiscount && originalPrice > 0
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0

  // ✅ FIX: الباك إند بيرجع الحقل باسم "stock" بس (مش stock_quantity ولا quantity)
  const stock      = product.stock ?? null
  const outOfStock  = stock !== null && stock <= 0
  const isLowStock  = stock !== null && stock === 1

  const rating      = parseFloat(product.average_rating || product.rating || 0)
  const reviewCount = parseInt(product.review_count || product.reviews_count || 0)
  const isInWishlist = isWishlisted(product.id)

  const goToProduct = () => {
    if (isDragging) return
    navigate(`/product/${product.id}`)
  }

  const prevImg = (e) => { e.stopPropagation(); setImgIndex(i => i === 0 ? images.length - 1 : i - 1) }
  const nextImg = (e) => { e.stopPropagation(); setImgIndex(i => i === images.length - 1 ? 0 : i + 1) }

  const onMouseDown = (e) => { dragStart.current = e.clientX; setIsDragging(false) }
  const onMouseMove = (e) => {
    if (dragStart.current !== null && Math.abs(e.clientX - dragStart.current) > 5) setIsDragging(true)
  }
  const onMouseUp = (e) => {
    if (dragStart.current !== null && isDragging) {
      const d = e.clientX - dragStart.current
      if (d < -30) nextImg(e)
      else if (d > 30) prevImg(e)
    }
    dragStart.current = null
  }
  const onTouchStart = (e) => { dragStart.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    const d = e.changedTouches[0].clientX - dragStart.current
    if (d < -30) nextImg(e)
    else if (d > 30) prevImg(e)
    dragStart.current = null
  }

  const handleMouseEnter = () => setIsHovering(true)
  const handleMouseLeave = (e) => {
    onMouseUp(e)
    setIsHovering(false)
    setImgIndex(0)
  }

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    if (outOfStock) return

    setCartError("")
    try {
      await addToCart(product.id, selectedColor?.id ?? null, 1)
      setAddedFeedback(true)
      setTimeout(() => setAddedFeedback(false), 2000)
    } catch (err) {
      setCartError(err?.message || (isAr ? "تعذر إضافة المنتج للسلة" : "Couldn't add product to cart"))
      setTimeout(() => setCartError(""), 3000)
    }
  }

  const handleTryNow = (e) => {
    e.stopPropagation()
    navigate(`/virtual-tryon?glass=${product.id}`)
  }

  const handleToggleWishlist = (e) => {
    e.stopPropagation()
    toggleWishlist(product.id)
  }

  const currency     = isAr ? "جنيه" : "EGP"
  const addCartLabel = t.addCart || (isAr ? "أضف للسلة" : "Add to Cart")
  const tryNowLabel  = t.tryNow  || (isAr ? "جرّب الآن" : "Try Now")
  const outOfStockLabel = isAr ? "نفذ من المخزون" : "Out of Stock"
  const lowStockLabel   = isAr ? "متبقي 1 فقط" : "Only 1 left"

  return (
    <div
      className="
        group relative flex flex-col min-w-0 h-full cursor-pointer
        bg-white dark:bg-[#141414]
        rounded-2xl overflow-hidden
        border border-black/[0.07] dark:border-white/[0.06]
        hover:border-[#D9A066]/50 dark:hover:border-[#D9A066]/40
        hover:shadow-[0_10px_35px_rgba(217,160,102,0.14)]
        transition-all duration-300
      "
      onClick={goToProduct}
    >

      {/* ══════════ صورة المنتج ══════════ */}
      <div
        className="relative aspect-square w-full overflow-hidden bg-white select-none shrink-0 rounded-t-2xl p-2.5 sm:p-3"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images[imgIndex] && !brokenImage ? (
          <img
            src={images[imgIndex]}
            alt={displayName}
            draggable={false}
            className={`
              w-full h-full object-contain transition-transform duration-500
              group-hover:scale-105 pointer-events-none
              ${outOfStock ? "opacity-50 grayscale-[30%]" : ""}
            `}
            onError={() => setBrokenImage(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
            <span className="text-5xl">👓</span>
            <span className="text-[11px] text-gray-400">
              {isAr ? "الصورة غير متاحة" : "Image unavailable"}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className={`absolute top-2 flex flex-col gap-1 z-10 pointer-events-none ${isAr ? "right-2" : "left-2"}`}>
          {hasDiscount && discountPct > 0 && !outOfStock && (
            <span className="bg-[#D9A066] text-white text-[10.5px] font-bold px-2 py-[3px] rounded-full shadow-sm w-fit">
              -{discountPct}%
            </span>
          )}
          {outOfStock ? (
            <span className="bg-black/80 text-white text-[10.5px] font-bold px-2 py-[3px] rounded-full shadow-sm w-fit whitespace-nowrap">
              {outOfStockLabel}
            </span>
          ) : isLowStock ? (
            <span className="bg-red-500 text-white text-[10.5px] font-bold px-2 py-[3px] rounded-full shadow-sm w-fit whitespace-nowrap">
              {lowStockLabel}
            </span>
          ) : null}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          className={`
            absolute top-2 z-10 ${isAr ? "left-2" : "right-2"}
            w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm
            flex items-center justify-center shadow
            hover:scale-110 transition-all duration-200
          `}
        >
          {isInWishlist
            ? <FaHeart className="text-[#D9A066] text-[11px]" />
            : <FiHeart className="text-gray-400 text-[11px]" />}
        </button>

        {/* Carousel Arrows — ديسكتوب بس (hover)، ومش بتظهر على الموبايل عشان متزنقش الشكل */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="hidden sm:flex absolute left-1.5 top-1/2 -translate-y-1/2 w-[26px] h-[26px] rounded-full bg-white/85 items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow backdrop-blur-sm text-[10px]"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextImg}
              className="hidden sm:flex absolute right-1.5 top-1/2 -translate-y-1/2 w-[26px] h-[26px] rounded-full bg-white/85 items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow backdrop-blur-sm text-[10px]"
            >
              <FaChevronRight />
            </button>

            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-[4px]">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setImgIndex(i) }}
                  className={`rounded-full transition-all duration-200 ${
                    i === imgIndex
                      ? "w-[12px] h-[3.5px] bg-[#D9A066]"
                      : "w-[3.5px] h-[3.5px] bg-black/20 hover:bg-black/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ══════════ محتوى الكارت ══════════ */}
      <div
        className={`
          flex flex-col gap-1.5 flex-1
          px-2.5 pt-2.5 pb-3 sm:px-3.5 sm:pt-3 sm:pb-3.5
          ${isAr ? "text-right" : "text-left"}
        `}
      >

        {/* التقييم */}
        {(rating > 0 || reviewCount > 0) && (
          <div className={`flex ${isAr ? "justify-end" : "justify-start"}`}>
            <StarRating rating={rating} count={reviewCount} />
          </div>
        )}

        {/* اسم المنتج — محمي من مشكلة البيانات المكسورة (راجع safeProductName فوق) */}
        <h3
          onClick={goToProduct}
          className="text-[13px] sm:text-[15px] md:text-[16px] font-semibold text-black dark:text-white leading-snug hover:text-[#D9A066] transition-colors duration-200 cursor-pointer line-clamp-2 min-h-[2.8em]"
        >
          {displayName}
        </h3>

        {/* الألوان */}
        {colors.length > 0 && (
          <div className={`flex ${isAr ? "justify-end" : "justify-start"}`}>
            <ColorSwatches colors={colors} selectedColor={selectedColor} onSelect={handleColorSelect} />
          </div>
        )}

        {/* السعر */}
        <div className={`flex flex-nowrap items-baseline gap-1.5 ${isAr ? "flex-row-reverse justify-end" : ""}`}>
          <span className="text-[#D9A066] font-extrabold text-[15px] sm:text-[18px] md:text-[22px] whitespace-nowrap flex items-center gap-1">
  <span>{currentPrice.toLocaleString()}</span>
  <span className="text-[13px] sm:text-[15px]">{currency}</span>
</span>
          {hasDiscount && originalPrice > currentPrice && (
            <span className="text-gray-400 text-[11px] sm:text-[13px] line-through whitespace-nowrap">
              {originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {cartError && (
          <p className="text-red-500 text-[11px] leading-snug -mt-1">{cartError}</p>
        )}

        {/* الأزرار
            ✅ زرار رئيسي واحد بارز "أضف للسلة" ياخد معظم المساحة، وزرار
            "جرّب الآن" بقى مربع أيقونة صغير بجانبه — بدل زرارين متساويين
            بيتزنقوا في مساحة ضيقة على الموبايل. */}
        <div
          className={`flex items-center gap-1.5 mt-auto pt-0.5 ${isAr ? "flex-row-reverse" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleAddToCart}
            disabled={cartLoading || addedFeedback || outOfStock}
            className={`
              flex-1 min-w-0 flex items-center justify-center gap-1.5
              text-[10px] sm:text-[12px] md:text-[13px] font-semibold
              py-2.5 rounded-xl
              transition-all duration-200 active:scale-95
              disabled:active:scale-100
              ${outOfStock
                ? "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none"
                : addedFeedback
                  ? "bg-green-500 hover:bg-green-500 text-white shadow-[0_3px_12px_rgba(217,160,102,0.3)]"
                  : "bg-[#D9A066] hover:bg-[#c98d54] text-white shadow-[0_3px_12px_rgba(217,160,102,0.3)] disabled:opacity-80"}
            `}
          >
            <FiShoppingBag className="text-[13px] shrink-0" />
            <span className="truncate">
              {addedFeedback
                ? (isAr ? "تمت الإضافة ✓" : "Added ✓")
                : addCartLabel}
            </span>
          </button>

          <button
            onClick={handleTryNow}
            title={tryNowLabel}
            aria-label={tryNowLabel}
            className="
              shrink-0 w-[36px] h-[36px] sm:w-[42px] sm:h-[38px] flex items-center justify-center
              border border-[#D9A066]/50 text-[#D9A066]
              hover:bg-[#D9A066]/10 active:scale-95
              rounded-xl transition-all duration-200
            "
          >
            <FiEye className="text-[16px]" />
          </button>
        </div>

      </div>
    </div>
  )
}

export default ProductCard