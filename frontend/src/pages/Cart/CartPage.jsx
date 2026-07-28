import { useState, useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LanguageContext } from "../../context/LanguageContext"
import { ThemeContext } from "../../context/ThemeContext"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiShoppingBag, FiHeart, FiTrash2, FiRefreshCw,
  FiChevronRight, FiChevronLeft, FiTag, FiTruck, FiStar
} from "react-icons/fi"
import { MdOutlinePayment } from "react-icons/md"
import api from "../../api/axios"

// ─────────────────────────────────────────────
// FIX: Broader image resolution — covers all known API shapes
// ─────────────────────────────────────────────
function getItemImage(item) {
  const pd = item?.product_detail

  // 1. Direct top-level image fields on the item itself
  if (item?.image)           return item.image
  if (item?.thumbnail)       return item.thumbnail
  if (item?.primary_image)   return item.primary_image

  // 2. product_detail flat fields
  if (pd?.primary_image)     return pd.primary_image
  if (pd?.image)             return pd.image
  if (pd?.thumbnail)         return pd.thumbnail

  // 3. product_detail.colors array (various sub-shapes)
  if (Array.isArray(pd?.colors)) {
    for (const c of pd.colors) {
      if (c?.primary_image?.url)   return c.primary_image.url
      if (c?.primary_image)        return c.primary_image
      if (c?.images?.[0]?.url)     return c.images[0].url
      if (c?.images?.[0]?.image)   return c.images[0].image
      if (c?.image)                return c.image
    }
  }

  // 4. product_detail.images array
  if (Array.isArray(pd?.images)) {
    for (const img of pd.images) {
      if (img?.url)   return img.url
      if (img?.image) return img.image
      if (typeof img === "string") return img
    }
  }

  return ""
}

// Same helper reused for related products
function getProductImage(product) {
  if (!product) return ""
  if (product.primary_image) return product.primary_image
  if (product.image)         return product.image
  if (product.thumbnail)     return product.thumbnail
  if (Array.isArray(product.colors)) {
    for (const c of product.colors) {
      if (c?.primary_image?.url) return c.primary_image.url
      if (c?.primary_image)      return c.primary_image
      if (c?.images?.[0]?.url)   return c.images[0].url
    }
  }
  return ""
}

// ✅ خريطة بسيطة لتحويل اسم اللون (عربي أو إنجليزي) لكود لون فعلي، عشان نعرض
// دايرة اللون الحقيقي بدل ما نكتب اسمه كنص. أي اسم مش موجود في الخريطة بيرجع
// لون رمادي افتراضي بدل ما يكسر الشكل
const COLOR_NAME_MAP = {
  black: "#111111", "أسود": "#111111",
  white: "#ffffff", "أبيض": "#ffffff",
  red: "#e11d48", "أحمر": "#e11d48",
  green: "#16a34a", "أخضر": "#16a34a",
  blue: "#2563eb", "أزرق": "#2563eb",
  brown: "#7c4a26", "بني": "#7c4a26",
  gray: "#9ca3af", grey: "#9ca3af", "رمادي": "#9ca3af",
  gold: "#D9A066", "ذهبي": "#D9A066",
  silver: "#c0c0c0", "فضي": "#c0c0c0",
  orange: "#f97316", "برتقالي": "#f97316",
  pink: "#ec4899", "وردي": "#ec4899",
  purple: "#9333ea", "بنفسجي": "#9333ea",
  yellow: "#eab308", "أصفر": "#eab308",
  navy: "#1e293b", "كحلي": "#1e293b",
  tortoise: "#8b5e34", "سلحفاة": "#8b5e34",
}

function getColorSwatch(colorName) {
  if (!colorName) return "#d1d5db"
  const key = colorName.trim().toLowerCase()
  return COLOR_NAME_MAP[key] || COLOR_NAME_MAP[colorName.trim()] || "#d1d5db"
}

const FREE_SHIPPING_THRESHOLD = 500
const SHIPPING_COST = 75

function CartPage() {
  const { language } = useContext(LanguageContext)
  const { darkMode } = useContext(ThemeContext)
  const { cart, loading, updateItem, removeItem, clearCart, fetchCart } = useCart()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const isAr = language === "ar"
  const Chevron = isAr ? FiChevronLeft : FiChevronRight

  const [coupon, setCoupon]           = useState("")
  const [wishlist, setWishlist]       = useState([])
  const [related, setRelated]         = useState([])
  const [relatedLoading, setRelatedLoading] = useState(false)

  const toggleWishlist = (id) =>
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const items = cart?.items ?? []

  // ── Fetch related / recommended products based on cart items ──
  useEffect(() => {
    if (items.length === 0) return

    const fetchRelated = async () => {
      setRelatedLoading(true)
      try {
        // Collect unique category/product ids from cart
        const productIds = items.map(i =>
          i.product_detail?.id ?? i.product_id ?? i.id
        ).filter(Boolean)

        const categoryIds = items.map(i =>
          i.product_detail?.category?.id ?? i.product_detail?.category_id
        ).filter(Boolean)

        // Build query: prefer category-based similar products
        // Adjust the endpoint to match your actual API
        const params = new URLSearchParams()
        if (categoryIds.length > 0) {
          params.set("category", categoryIds[0])          // most relevant category
        }
        params.set("exclude_ids", productIds.join(","))   // hide items already in cart
        params.set("limit", "8")

        const res = await fetch(`/api/products/related/?${params.toString()}`)
        if (!res.ok) throw new Error("Failed")
        const data = await res.json()

        // Support both { results: [] } and plain array responses
        setRelated(Array.isArray(data) ? data : (data.results ?? []))
      } catch {
        // Silently fail — section just won't show
        setRelated([])
      } finally {
        setRelatedLoading(false)
      }
    }

    fetchRelated()
  }, [items.length]) // re-run when cart length changes

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal      = parseFloat(cart?.total_price ?? 0)
  const discount      = 0

  const qualifiesForFreeShipping  = subtotal >= FREE_SHIPPING_THRESHOLD
  const shippingCost              = qualifiesForFreeShipping ? 0 : SHIPPING_COST
  const remainingForFreeShipping  = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const total                     = subtotal - discount + shippingCost

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/cart" } })
      return
    }
    navigate("/checkout")
  }

  const content = {
    ar: {
      title: "سلة التسوق",
      continueShopping: "متابعة التسوق",
      product: "المنتج", price: "السعر", qty: "الكمية", total: "الإجمالي",
      save: "حفظ للمفضلة", delete: "حذف",
      updateCart: "تحديث السلة", clearCart: "إفراغ السلة",
      summary: "ملخص الطلب",
      subtotal: "المجموع الفرعي",
      items: "منتج",
      discountLabel: "خصم",
      shipping: "الشحن",
      shippingFree: "مجاناً",
      shippingPaid: `${SHIPPING_COST} ج.م`,
      totalLabel: "الإجمالي",
      couponPlaceholder: "أدخل كود الخصم",
      apply: "تطبيق",
      checkout: "إتمام الطلب",
      emptyCart: "سلتك فارغة",
      emptyCartSub: "أضف منتجات من متجرنا",
      shopNow: "تسوق الآن",
      freeShippingReached: "🎉 طلبك مؤهل للشحن المجاني!",
      freeShippingRemaining: (amount) => `أضف ${amount.toLocaleString()} ج.م أكثر للحصول على شحن مجاني`,
      currency: "ج.م",
      youMayLike: "قد يعجبك أيضاً",
      addToCart: "أضف للسلة",
    },
    en: {
      title: "Shopping Cart",
      continueShopping: "Continue Shopping",
      product: "Product", price: "Price", qty: "Quantity", total: "Total",
      save: "Save to Wishlist", delete: "Remove",
      updateCart: "Refresh Cart", clearCart: "Clear Cart",
      summary: "Order Summary",
      subtotal: "Subtotal",
      items: "items",
      discountLabel: "Discount",
      shipping: "Shipping",
      shippingFree: "Free",
      shippingPaid: `${SHIPPING_COST} EGP`,
      totalLabel: "Total",
      couponPlaceholder: "Enter coupon code",
      apply: "Apply",
      checkout: "Checkout",
      emptyCart: "Your cart is empty",
      emptyCartSub: "Add products from our store",
      shopNow: "Shop Now",
      freeShippingReached: "🎉 Your order qualifies for free shipping!",
      freeShippingRemaining: (amount) => `Add ${amount.toLocaleString()} EGP more for free shipping`,
      currency: "EGP",
      youMayLike: "You May Also Like",
      addToCart: "Add to Cart",
    },
  }

  const t = content[language]

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F2EE] dark:bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#D9A066] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F2EE] dark:bg-[#050505] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <FiShoppingBag className="text-[#D9A066] text-6xl" />
        <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">{t.emptyCart}</h2>
        <p className="text-gray-400 text-sm sm:text-base">{t.emptyCartSub}</p>
        <Link
          to="/glasses/sunglasses"
          className="bg-[#D9A066] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#c98d54] transition"
        >
          {t.shopNow}
        </Link>
      </div>
    )
  }

  const gridCols = "2fr 1fr 1.2fr 1fr"

  return (
    <div className="min-h-screen bg-[#F7F2EE] dark:bg-[#050505] transition-all duration-500">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-28 lg:pb-12">

        {/* TITLE ROW - على اليمين */}
        <div
          style={{ direction: "ltr" }}
          className={`flex items-center mb-4 ${isAr ? "justify-end" : "justify-start"}`}
        >
          <div className={`flex items-center gap-2.5 sm:gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
            <FiShoppingBag className="text-[#D9A066] text-xl sm:text-2xl" />
            <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
              {t.title} <span className="text-[#D9A066]">({totalQuantity} {t.items})</span>
            </h1>
          </div>
        </div>

        {/* ✅ بترص فوق بعض على الموبايل والتابلت (الملخص تحت المنتجات)، وجنب بعض من lg فأكبر */}
        <div className={`flex flex-col ${isAr ? "lg:flex-row-reverse" : "lg:flex-row"} gap-6 items-start mt-6 sm:mt-8`}>

          {/* CART ITEMS */}
          <div className="flex-1 min-w-0 w-full">

            {/* ── Table header (ديسكتوب/تابلت واسع بس) ── */}
            <div
              className="hidden md:grid gap-4 px-4 py-3 bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[16px] mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400"
              style={{ gridTemplateColumns: gridCols }}
              dir={isAr ? "rtl" : "ltr"}
            >
              {isAr ? (
                <>
                  <span className="text-right pr-4">المنتج</span>
                  <span className="text-center">السعر</span>
                  <span className="text-center">الكمية</span>
                  <span className="text-center">الإجمالي</span>
                </>
              ) : (
                <>
                  <span className="text-left pl-4">Product</span>
                  <span className="text-center">Price</span>
                  <span className="text-center">Quantity</span>
                  <span className="text-center">Total</span>
                </>
              )}
            </div>

            {/* ── Item rows ── */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <AnimatePresence>
                {items.map((item) => {
                  const name      = item.product_name ?? "—"
                  const image     = getItemImage(item)
                  const color     = item.color_name ?? ""
                  const unitPrice = parseFloat(item.product_price ?? 0)
                  const lineTotal = parseFloat(item.total_price ?? unitPrice * item.quantity)

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[20px] p-3"
                    >
                      {/* ── نسخة الديسكتوب/التابلت الواسع: صف grid زي ما كان ── */}
                      <div
                        className="hidden md:grid gap-4 items-center"
                        style={{ gridTemplateColumns: gridCols }}
                        dir={isAr ? "rtl" : "ltr"}
                      >
                        {/* ── Col 1: Product info ── */}
                        <div className={`flex items-center gap-4 ${isAr ? "flex-row" : ""}`}>
                          <div className="w-[100px] h-[88px] rounded-[14px] overflow-hidden shrink-0 bg-white flex items-center justify-center">
                            {image ? (
                              <img
                                src={image}
                                alt={name}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                  e.target.style.display = "none"
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = "flex"
                                  }
                                }}
                              />
                            ) : null}
                            <span
                              className="text-2xl font-bold text-[#D9A066]"
                              style={{ display: image ? "none" : "flex" }}
                            >
                              {name?.[0]?.toUpperCase() ?? "G"}
                            </span>
                          </div>
                          <div className={isAr ? "text-right" : "text-left"}>
                            <h3 className="font-bold text-black dark:text-white text-sm mb-1">{name}</h3>
                            {color && <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{color}</p>}
                            <div className={`flex items-center gap-4 mt-3 ${isAr ? "flex-row-reverse" : ""}`}>
                              <button
                                onClick={() => toggleWishlist(item.id)}
                                className={`flex items-center gap-1 text-xs text-gray-400 hover:text-[#D9A066] transition ${isAr ? "flex-row-reverse" : ""}`}
                              >
                                <FiHeart className={wishlist.includes(item.id) ? "text-[#D9A066] fill-[#D9A066]" : ""} />
                                {t.save}
                              </button>
                              <button
                                onClick={() => removeItem(item.id)}
                                className={`flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition ${isAr ? "flex-row-reverse" : ""}`}
                              >
                                <FiTrash2 />
                                {t.delete}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* ── Col 2: Unit price ── */}
                        <div className="flex justify-center">
                          <p className="font-bold text-black dark:text-white">
                            {unitPrice.toLocaleString()} {t.currency}
                          </p>
                        </div>

                        {/* ── Col 3: Quantity controls ── */}
                        <div className="flex justify-center">
                          <div className={`inline-flex items-center gap-3 bg-[#F7F2EE] dark:bg-[#1a1a1a] rounded-full px-3 py-2 ${isAr ? "flex-row-reverse" : ""}`}>
                            <button
                              onClick={() => updateItem(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || loading}
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#D9A066] transition font-bold disabled:opacity-40"
                            >−</button>
                            <span className="text-black dark:text-white font-semibold text-sm w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateItem(item.id, item.quantity + 1)}
                              disabled={loading}
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#D9A066] transition font-bold disabled:opacity-40"
                            >+</button>
                          </div>
                        </div>

                        {/* ── Col 4: Line total ── */}
                        <div className="flex justify-center">
                          <p className="font-bold text-[#D9A066] text-lg">
                            {lineTotal.toLocaleString()} {t.currency}
                          </p>
                        </div>
                      </div>

                      {/* ── نسخة الموبايل: صورة كبيرة وواضحة زي نون، وكنترول الكمية تحتها في نفس العمود، والاسم/السعر/القلب في عمود جنبها ── */}
                      <div className={`md:hidden flex gap-3 ${isAr ? "flex-row-reverse" : ""}`} dir={isAr ? "rtl" : "ltr"}>
                        {/* عمود الصورة + كنترول الكمية تحتها */}
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <div className="w-[130px] h-[130px] rounded-[14px] overflow-hidden bg-white border border-black/5 flex items-center justify-center">
                            {image ? (
                              <img
                                src={image}
                                alt={name}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                  e.target.style.display = "none"
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = "flex"
                                  }
                                }}
                              />
                            ) : null}
                            <span
                              className="text-3xl font-bold text-[#D9A066]"
                              style={{ display: image ? "none" : "flex" }}
                            >
                              {name?.[0]?.toUpperCase() ?? "G"}
                            </span>
                          </div>

                          {/* كنترول الكمية زي نون: سلة (لو الكمية 1، بتحذف المنتج) أو ناقص (لو أكتر من 1)، رقم، زائد */}
                          <div className={`inline-flex items-center gap-2.5 bg-[#F7F2EE] dark:bg-[#1a1a1a] rounded-full px-2.5 py-1.5 ${isAr ? "flex-row-reverse" : ""}`}>
                            {item.quantity <= 1 ? (
                              <button
                                onClick={() => removeItem(item.id)}
                                disabled={loading}
                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-400 transition disabled:opacity-40"
                              >
                                <FiTrash2 className="text-sm" />
                              </button>
                            ) : (
                              <button
                                onClick={() => updateItem(item.id, item.quantity - 1)}
                                disabled={loading}
                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#D9A066] transition font-bold disabled:opacity-40"
                              >−</button>
                            )}
                            <span className="text-black dark:text-white font-semibold text-sm w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateItem(item.id, item.quantity + 1)}
                              disabled={loading}
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#D9A066] transition font-bold disabled:opacity-40"
                            >+</button>
                          </div>
                        </div>

                        {/* عمود الاسم + اللون + السعر — القلب فوق لوحده بمحاذاة أقصى اليمين، والاسم تحته */}
                        <div className={`flex-1 min-w-0 flex flex-col ${isAr ? "items-end text-right" : "items-start text-left"}`}>
                          <button
                            onClick={() => toggleWishlist(item.id)}
                            className="shrink-0 w-7 h-7 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center mb-2"
                          >
                            <FiHeart className={`text-xs ${wishlist.includes(item.id) ? "text-[#D9A066] fill-[#D9A066]" : "text-gray-400"}`} />
                          </button>
                          <h3 className="font-bold text-black dark:text-white text-sm leading-snug line-clamp-2">{name}</h3>
                          {/* ✅ دايرة اللون الفعلي بدل ما يتكتب اسمه كنص */}
                          {color && (
                            <span
                              className="inline-block w-4 h-4 rounded-full border border-black/10 dark:border-white/20 mt-1.5"
                              style={{ backgroundColor: getColorSwatch(color) }}
                              title={color}
                            />
                          )}
                          <p className="font-bold text-[#D9A066] text-base mt-auto">
                            {unitPrice.toLocaleString()} {t.currency}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Cart action buttons */}
            <div className={`flex items-center gap-2.5 sm:gap-3 mt-4 flex-wrap ${isAr ? "flex-row-reverse" : ""}`}>
              <button
                onClick={fetchCart}
                disabled={loading}
                className={`flex items-center gap-2 border border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-[#D9A066] hover:text-[#D9A066] px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm transition-all duration-300 disabled:opacity-40 ${isAr ? "flex-row-reverse" : ""}`}
              >
                <FiRefreshCw className={`text-sm ${loading ? "animate-spin" : ""}`} />
                {t.updateCart}
              </button>
              <button
                onClick={clearCart}
                disabled={loading}
                className={`flex items-center gap-2 border border-red-200 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm transition-all duration-300 disabled:opacity-40 ${isAr ? "flex-row-reverse" : ""}`}
              >
                <FiTrash2 className="text-sm" />
                {t.clearCart}
              </button>
            </div>

            {/* ══════════════════════════════════════════════════
                YOU MAY ALSO LIKE — Related products section
            ══════════════════════════════════════════════════ */}
            {(relatedLoading || related.length > 0) && (
              <div className="mt-10 sm:mt-12" dir={isAr ? "rtl" : "ltr"}>

                {/* Section header */}
                <div className={`flex items-center gap-3 mb-5 sm:mb-6 ${isAr ? "flex-row-reverse" : ""}`}>
                  <FiStar className="text-[#D9A066] text-lg sm:text-xl shrink-0" />
                  <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white">
                    {t.youMayLike}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#D9A066]/40 to-transparent dark:from-[#D9A066]/20" />
                </div>

                {/* Skeleton loader */}
                {relatedLoading && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-[#111] rounded-[20px] overflow-hidden border border-black/5 dark:border-white/5 animate-pulse"
                      >
                        <div className="h-[140px] sm:h-[180px] bg-[#e8ddd4] dark:bg-[#222]" />
                        <div className="p-3 sm:p-4 flex flex-col gap-2">
                          <div className="h-4 bg-[#e8ddd4] dark:bg-[#222] rounded-full w-3/4" />
                          <div className="h-3 bg-[#e8ddd4] dark:bg-[#222] rounded-full w-1/2" />
                          <div className="h-8 bg-[#e8ddd4] dark:bg-[#222] rounded-full mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Product cards */}
                {!relatedLoading && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    <AnimatePresence>
                      {related.map((product, idx) => {
                        const productImage = getProductImage(product)
                        const productName  = product.name ?? product.product_name ?? "—"
                        const productPrice = parseFloat(product.price ?? product.product_price ?? 0)
                        const productSlug  = product.slug ?? product.id
                        const rating       = parseFloat(product.rating ?? 0)
                        const inWishlist   = wishlist.includes(`related-${product.id}`)

                        return (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06, duration: 0.35 }}
                            className="group bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[20px] overflow-hidden hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1"
                          >
                            {/* Image area */}
                            <Link
                              to={`/product/${productSlug}`}
                              className="block relative h-[140px] sm:h-[180px] bg-[#F7F2EE] dark:bg-[#1a1a1a] overflow-hidden"
                            >
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={productName}
                                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                  onError={(e) => {
                                    e.target.style.display = "none"
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-4xl font-bold text-[#D9A066]/40">
                                    {productName?.[0]?.toUpperCase() ?? "G"}
                                  </span>
                                </div>
                              )}

                              {/* Wishlist button overlay */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  toggleWishlist(`related-${product.id}`)
                                }}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white dark:hover:bg-black"
                              >
                                <FiHeart
                                  className={`text-sm transition-colors ${inWishlist ? "text-[#D9A066] fill-[#D9A066]" : "text-gray-400"}`}
                                />
                              </button>
                            </Link>

                            {/* Info area */}
                            <div className="p-3 sm:p-4" dir={isAr ? "rtl" : "ltr"}>
                              <Link to={`/product/${productSlug}`}>
                                <h3 className="font-semibold text-black dark:text-white text-xs sm:text-sm mb-1 line-clamp-1 hover:text-[#D9A066] transition-colors">
                                  {productName}
                                </h3>
                              </Link>

                              {/* Rating stars */}
                              {rating > 0 && (
                                <div className={`flex items-center gap-1 mb-2 ${isAr ? "flex-row-reverse" : ""}`}>
                                  {Array.from({ length: 5 }).map((_, s) => (
                                    <FiStar
                                      key={s}
                                      className={`text-xs ${s < Math.round(rating) ? "text-[#D9A066] fill-[#D9A066]" : "text-gray-300 dark:text-gray-600"}`}
                                    />
                                  ))}
                                  <span className="text-xs text-gray-400 mx-1">{rating.toFixed(1)}</span>
                                </div>
                              )}

                              <div className={`flex items-center justify-between gap-2 mt-2 ${isAr ? "flex-row-reverse" : ""}`}>
                                <span className="font-bold text-[#D9A066] text-sm sm:text-base">
                                  {productPrice.toLocaleString()} {t.currency}
                                </span>
                                <Link
                                  to={`/product/${productSlug}`}
                                  className="flex items-center gap-1 bg-[#D9A066] hover:bg-[#c98d54] text-white text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-full transition-all duration-300 shrink-0"
                                >
                                  <FiShoppingBag className="text-xs" />
                                  {t.addToCart}
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════
              ORDER SUMMARY SIDEBAR
              ✅ عرض كامل تحت المنتجات على الموبايل/التابلت، وعمود ثابت بجانبهم من lg فأكبر
          ═══════════════════════════════════════════ */}
          <div className="hidden lg:flex lg:w-[360px] lg:shrink-0 flex-col gap-4 lg:sticky lg:top-[110px]">
            <div className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[24px] p-5 sm:p-7">
              <div className="flex items-center gap-2 mb-4">
                <MdOutlinePayment className="text-[#D9A066] text-xl" />
                <h2 className="font-bold text-black dark:text-white text-lg">{t.summary}</h2>
              </div>

              {/* ── Summary rows ── */}
              <div className="flex flex-col gap-3 mb-5">
                <div className={`flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 mb-1 ${isAr ? "flex-row-reverse" : ""}`}>
                  <span className="font-bold text-black dark:text-white text-base sm:text-lg">{t.totalLabel}</span>
                  <span className="font-bold text-[#D9A066] text-xl sm:text-2xl">{total.toLocaleString()} {t.currency}</span>
                </div>

                <div className={`flex items-center justify-between ${isAr ? "flex-row-reverse" : ""}`}>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {t.subtotal} ({totalQuantity} {t.items})
                  </span>
                  <span className="text-black dark:text-white font-semibold text-sm">
                    {subtotal.toLocaleString()} {t.currency}
                  </span>
                </div>

                {discount > 0 && (
                  <div className={`flex items-center justify-between ${isAr ? "flex-row-reverse" : ""}`}>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t.discountLabel}</span>
                    <span className="text-[#D9A066] font-semibold text-sm">- {discount} {t.currency}</span>
                  </div>
                )}

                <div className={`flex items-center justify-between ${isAr ? "flex-row-reverse" : ""}`}>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t.shipping}</span>
                  {qualifiesForFreeShipping ? (
                    <span className="text-green-500 font-semibold text-sm">{t.shippingFree}</span>
                  ) : (
                    <span className="text-black dark:text-white font-semibold text-sm">{t.shippingPaid}</span>
                  )}
                </div>
              </div>

              {/* ── Free Shipping Progress Banner ── */}
              <div className={`mb-5 rounded-[14px] overflow-hidden border ${qualifiesForFreeShipping
                ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
                : "border-[#D9A066]/30 bg-[#FFF8F0] dark:bg-[#1a1505]"}`}>

                <div className={`flex items-center gap-2 px-4 py-3 ${isAr ? "flex-row-reverse" : ""}`}>
                  <FiTruck className={`text-lg shrink-0 ${qualifiesForFreeShipping ? "text-green-500" : "text-[#D9A066]"}`} />
                  <p
                    className={`text-xs font-medium ${qualifiesForFreeShipping
                      ? "text-green-600 dark:text-green-400"
                      : "text-[#8a6a30] dark:text-[#D9A066]"}`}
                    dir={isAr ? "rtl" : "ltr"}
                  >
                    {qualifiesForFreeShipping
                      ? t.freeShippingReached
                      : t.freeShippingRemaining(remainingForFreeShipping)}
                  </p>
                </div>

                {!qualifiesForFreeShipping && (
                  <div className="h-1 bg-[#e8ddd0] dark:bg-[#2a2010] mx-4 mb-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D9A066] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* ── Coupon ── */}
              <div className={`flex items-center gap-2 mb-5 ${isAr ? "flex-row-reverse" : ""}`}>
                <div className={`flex-1 flex items-center gap-2 bg-[#F7F2EE] dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-full px-4 py-2.5 ${isAr ? "flex-row-reverse" : ""}`}>
                  <FiTag className="text-gray-400 text-sm shrink-0" />
                  <input
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder={t.couponPlaceholder}
                    className={`flex-1 bg-transparent outline-none text-sm text-black dark:text-white placeholder:text-gray-400 ${isAr ? "text-right" : "text-left"}`}
                  />
                </div>
                <button className="bg-[#D9A066] hover:bg-[#c98d54] text-white text-sm font-semibold px-4 py-2.5 rounded-full transition shrink-0">
                  {t.apply}
                </button>
              </div>

              {/* ── Checkout button ── */}
              <button
                onClick={handleCheckout}
                className={`w-full flex items-center justify-center gap-2 bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold text-base py-3.5 rounded-full transition-all duration-300 hover:scale-[1.02] shadow-[0_8px_25px_rgba(217,160,102,0.4)] ${isAr ? "flex-row-reverse" : ""}`}
              >
                <FiShoppingBag />
                {t.checkout}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ بار سفلي ثابت للموبايل/التابلت بس (زي نون): إجمالي + زرار إتمام الطلب،
          بدل ما نعرض ملخص الدفع كامل. من lg فأكبر مختفي لأن الكارت الجانبي ظاهر أصلاً */}
      <div className={`lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-[#111] border-t border-black/10 dark:border-white/10 px-4 py-3 flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
        <div className={isAr ? "text-right" : "text-left"}>
          <p className="text-[11px] text-gray-400">{t.totalLabel}</p>
          <p className="font-bold text-black dark:text-white text-lg leading-tight">{total.toLocaleString()} {t.currency}</p>
        </div>
        <button
          onClick={handleCheckout}
          className={`flex-1 flex items-center justify-center gap-2 bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold text-sm py-3 rounded-full transition-all duration-300 ${isAr ? "flex-row-reverse" : ""}`}
        >
          <FiShoppingBag />
          {t.checkout}
        </button>
      </div>
    </div>
  )
}

export default CartPage