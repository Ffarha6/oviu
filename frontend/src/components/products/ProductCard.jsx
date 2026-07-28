import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FiHeart, FiShoppingBag, FiEye } from "react-icons/fi"
import { FaHeart, FaStar, FaStarHalfAlt, FaRegStar, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { useCart } from "../../context/CartContext"
import { useWishlist } from "../../context/WishlistContext"
// ─────────────────────────────────────────────
// FIX: بعض روابط الصور بترجع من الـ API ناقصة الدومين
// (زي "/media/products/xxx.jpg" بدل "http://127.0.0.1:8000/media/products/xxx.jpg")
// الدالة دي بتكمل الدومين الناقص عشان المتصفح يقدر يجيب الصورة صح
// ─────────────────────────────────────────────
const API_BASE = "http://127.0.0.1:8000"

function resolveImageUrl(url) {
  if (!url) return null
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`
}

// ===== STAR RATING =====
function StarRating({ rating = 0, count = 0 }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-[2px]">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className="text-[#D9A066] text-[13px]">
            {rating >= s ? <FaStar /> : rating >= s - 0.5 ? <FaStarHalfAlt /> : <FaRegStar />}
          </span>
        ))}
      </div>
      {count > 0 && (
        <span className="text-gray-400 text-[12px]">({count})</span>
      )}
    </div>
  )
}

// ===== COLOR SWATCH =====
function ColorSwatches({ colors = [], selectedColor, onSelect }) {
  if (!colors.length) return null
  return (
    <div className="flex items-center gap-[7px] flex-wrap">
      {colors.map((color) => (
        <button
          key={color.id || color.name}
          title={color.name}
          onClick={(e) => {
            e.stopPropagation() // يمنع الكليك من الوصول لصفحة المنتج
            onSelect?.(color)
          }}
          className={`
            w-[18px] h-[18px] rounded-full transition-all duration-200
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
function ProductCard({ product, isAr = false, t = {} }) {
  const navigate = useNavigate()
  const { addToCart, loading: cartLoading } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [addedFeedback, setAddedFeedback] = useState(false)
  // ✅ رسالة خطأ لو الباك إند رفض الإضافة (مثلاً المخزون خلص لحظة الضغط)
  const [cartError, setCartError] = useState("")

  const colors = product.colors || []
  const [selectedColor, setSelectedColor] = useState(colors[0] || null)

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
  // ✅ جديد: بتتبع لو الماوس واقف فوق صورة المنتج دلوقتي، عشان نلف تلقائي بين الصور
  const [isHovering, setIsHovering] = useState(false)
  const dragStart = useRef(null)

  // كل ما نغير الصورة المعروضة (نطلع فوق نتحت في نفس النظارة)، نصفّر حالة "الصورة مكسورة"
  // عشان نديها فرصة تحمّل تاني بدل ما تفضل واقفة على شكل الخطأ القديم
  useEffect(() => {
    setBrokenImage(false)
  }, [imgIndex, selectedColor])

  // ✅ جديد: لما الماوس يفضل واقف فوق الكارت وفيه أكتر من صورة، نلف تلقائيًا
  // للصورة اللي بعدها كل شوية، ونوقف اللف لو الماوس طلع برا
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
  // زي ما هو ظاهر في ProductListSerializer - ده كان سبب إن المنطق مكنش بيشتغل خالص
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

  // ✅ جديد: بداية ونهاية الـ hover على منطقة الصورة
  const handleMouseEnter = () => setIsHovering(true)
  const handleMouseLeave = (e) => {
    onMouseUp(e) // نسيب سلوك إنهاء السحب زي ما هو لو المستخدم كان بيسحب
    setIsHovering(false)
    setImgIndex(0) // نرجع لأول صورة تاني لما الماوس يطلع، عشان كل هوفر يبدأ من الأول
  }

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    // ✅ حماية إضافية في الفرونت: منمنعش الطلب أصلاً لو ظاهر قدامنا إن المخزون خلص
    // (الحماية الملزمة برضه في الباك إند add_to_cart، ده بس تجربة استخدام أنضف)
    if (outOfStock) return

    setCartError("")
    try {
      await addToCart(product.id, selectedColor?.id ?? null, 1)
      setAddedFeedback(true)
      setTimeout(() => setAddedFeedback(false), 2000)
    } catch (err) {
      // ✅ CartContext.jsx بيرمي Error عادي فيه .message (مش رد axios)
      setCartError(err?.message || (isAr ? "تعذر إضافة المنتج للسلة" : "Couldn't add product to cart"))
      setTimeout(() => setCartError(""), 3000)
    }
  }

  const handleTryNow = (e) => {
    e.stopPropagation()
    navigate(`/virtual-tryon?glass=${product.id}`)
  }

  // ✅ FIX: بيستدعي toggleWishlist من الـ context المركزي - ده اللي بيعمل
  // فعليًا الطلب للباك (add/remove) ويظهر الرسالة المنبثقة
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
        group relative flex flex-col cursor-pointer
        bg-white dark:bg-[#141414]
        rounded-2xl overflow-hidden
        border border-black/[0.07] dark:border-white/[0.06]
        hover:border-[#D9A066]/50 dark:hover:border-[#D9A066]/40
        hover:shadow-[0_10px_35px_rgba(217,160,102,0.14)]
        transition-all duration-300
      "
      onClick={goToProduct}
    >

      {/* ══════════ صورة المنتج ══════════
          - مساحة مربعة ثابتة (aspect-square) بدل ارتفاع بالبكسل، عشان تتناسق مهما كان مقاس الصورة الأصلي
          - خلفية بيضاء/فاتحة ثابتة حتى في الدارك مود، عشان تفرق بصريًا عن خلفية الكارت الغامقة
          - padding داخلي عشان الصورة متلزقش في الحواف
      */}
      <div
        className="
          relative
          aspect-[5/4]
          w-full
          overflow-hidden
          bg-white
          select-none
          shrink-0
          rounded-t-2xl
          p-4
        "
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
            alt={product.name}
            draggable={false}
            className={`
              w-full
              h-full
              object-contain
              transition-transform
              duration-500
              group-hover:scale-105
              pointer-events-none
              ${outOfStock ? "opacity-50 grayscale-[30%]" : ""}
            `}
            onError={() => setBrokenImage(true)}
          />
        ) : (
          // بدل خدمة خارجية بتكسر مع النص العربي، نعرض أيقونة نظارة بسيطة وواضحة
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
            <span className="text-5xl">👓</span>
            <span className="text-[11px] text-gray-400">
              {isAr ? "الصورة غير متاحة" : "Image unavailable"}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {hasDiscount && discountPct > 0 && !outOfStock && (
            <span className="bg-[#D9A066] text-white text-[11px] font-bold px-2.5 py-[3px] rounded-full shadow-sm">
              -{discountPct}%
            </span>
          )}
          {outOfStock ? (
            <span className="bg-black/80 text-white text-[11px] font-bold px-2.5 py-[3px] rounded-full shadow-sm">
              {outOfStockLabel}
            </span>
          ) : isLowStock ? (
            <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-[3px] rounded-full shadow-sm">
              {lowStockLabel}
            </span>
          ) : null}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          className="
            absolute top-2.5 right-2.5 z-10
            w-[30px] h-[30px] rounded-full
            bg-white/90 backdrop-blur-sm
            flex items-center justify-center shadow
            hover:scale-110 transition-all duration-200
          "
        >
          {isInWishlist
            ? <FaHeart className="text-[#D9A066] text-[12px]" />
            : <FiHeart className="text-gray-400 text-[12px]" />}
        </button>

        {/* Carousel Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[26px] h-[26px] rounded-full bg-white/85 flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow backdrop-blur-sm text-[10px]"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-[26px] h-[26px] rounded-full bg-white/85 flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow backdrop-blur-sm text-[10px]"
            >
              <FaChevronRight />
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-[4px]">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setImgIndex(i) }}
                  className={`rounded-full transition-all duration-200 ${
                    i === imgIndex
                      ? "w-[14px] h-[4px] bg-[#D9A066]"
                      : "w-[4px] h-[4px] bg-black/20 hover:bg-black/40"
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
          flex flex-col gap-2 flex-1
          px-3.5 pt-2.5 pb-3
          ${isAr ? "text-right" : "text-left"}
        `}
      >

        {/* التقييم */}
        {(rating > 0 || reviewCount > 0) && (
          <div className={`flex ${isAr ? "justify-end" : "justify-start"}`}>
            <StarRating rating={rating} count={reviewCount} />
          </div>
        )}

        {/* اسم المنتج */}
        <h3
          onClick={goToProduct}
          className="text-[13.5px] font-semibold text-black dark:text-white leading-snug hover:text-[#D9A066] transition-colors duration-200 cursor-pointer line-clamp-2"
        >
          {product.name}
        </h3>

        {/* الألوان */}
        {colors.length > 0 && (
          <div className={`flex ${isAr ? "justify-end" : "justify-start"}`}>
            <ColorSwatches colors={colors} selectedColor={selectedColor} onSelect={handleColorSelect} />
          </div>
        )}

        {/* السعر - أكبر وأوضح عنصر في الكارت */}
        <div className={`flex items-baseline gap-2 ${isAr ? "flex-row-reverse justify-end" : ""}`}>
          <span className="text-[#D9A066] font-extrabold text-[20px] md:text-[22px]">
            {currentPrice.toLocaleString()} {currency}
          </span>
          {hasDiscount && originalPrice > currentPrice && (
            <span className="text-gray-400 text-[13px] line-through">
              {originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* ✅ رسالة خطأ لو الإضافة اترفضت من الباك إند */}
        {cartError && (
          <p className="text-red-500 text-[11px] leading-snug -mt-1">{cartError}</p>
        )}

        {/* الأزرار */}
        <div
          className={`flex items-center gap-1.5 mt-auto ${isAr ? "flex-row-reverse" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleAddToCart}
            disabled={cartLoading || addedFeedback || outOfStock}
            className={`
              flex-1 flex items-center justify-center gap-1
              text-[11.5px] font-semibold
              py-2 rounded-xl
              transition-all duration-200 active:scale-95
              disabled:active:scale-100
              ${outOfStock
                ? "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none"
                : addedFeedback
                  ? "bg-green-500 hover:bg-green-500 text-white shadow-[0_3px_12px_rgba(217,160,102,0.3)]"
                  : "bg-[#D9A066] hover:bg-[#c98d54] text-white shadow-[0_3px_12px_rgba(217,160,102,0.3)] disabled:opacity-80"}
            `}
          >
            <FiShoppingBag className="text-[12px] shrink-0" />
            <span className="truncate">
              {addedFeedback
                ? (isAr ? "تمت الإضافة ✓" : "Added ✓")
                : addCartLabel}
            </span>
          </button>

          <button
            onClick={handleTryNow}
            className="
              flex-1 flex items-center justify-center gap-1
              border border-[#D9A066]/50 text-[#D9A066]
              hover:bg-[#D9A066]/10 active:scale-95
              text-[11.5px] font-semibold
              py-2 rounded-xl
              transition-all duration-200
            "
          >
            <FiEye className="text-[12px] shrink-0" />
            <span className="truncate">{tryNowLabel}</span>
          </button>
        </div>

      </div>
    </div>
  )
}

export default ProductCard