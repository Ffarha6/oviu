import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { LanguageContext } from "../../context/LanguageContext"
import {
  FiCheck, FiPackage, FiMapPin, FiCreditCard,
  FiCopy, FiShield
} from "react-icons/fi"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

function authFetch(endpoint) {
  const token = localStorage.getItem("access_token")
  return fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  })
}

// ✅ الباك إند بيرجّع مسار الصورة نسبي أحيانًا (زي /media/products/xyz.jpg) من غير
// الدومين، والفرونت شغال على بورت مختلف (5173) عن الباك إند (8000)، فالمتصفح كان
// بيحاول يجيب الصورة من بورت الفرونت نفسه (مش موجودة هناك) بدل بورت الباك إند.
// الدالة دي بتضيف الدومين الصح لو الرابط مش كامل أصلاً
function resolveImageUrl(path) {
  if (!path) return ""
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { language } = useContext(LanguageContext)
  const isAr = language === "ar"

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    authFetch(`/api/orders/${orderId}/`)
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [orderId])

  const t = isAr
    ? {
        topBar: "توصيل وطلبات مؤمّنة بالكامل — محتاج مساعدة؟ تواصل معنا في أي وقت",
        thankYou: "تم إستلام طلبك",
        subtitle: "هنبعتلك تحديث بمجرد ما طلبك يتشحن",
        orderNumber: "رقم الطلب",
        copy: "نسخ",
        copied: "تم النسخ",
        summary: "ملخص الطلب",
        product: "منتج", products: "منتجات",
        address: "عنوان التوصيل",
        payment: "طريقة الدفع",
        total: "الإجمالي",
        trackOrder: "متابعة الطلب",
        continueShopping: "متابعة التسوق",
        loadingText: "جاري تحميل تفاصيل الطلب...",
        notFound: "تعذر تحميل تفاصيل هذا الطلب",
      }
    : {
        topBar: "Secure delivery & orders — need help? Contact us anytime",
        thankYou: "Order Received",
        subtitle: "We'll let you know the moment it ships",
        orderNumber: "Order Number",
        copy: "Copy",
        copied: "Copied",
        summary: "Order Summary",
        product: "item", products: "items",
        address: "Delivery Address",
        payment: "Payment Method",
        total: "Total",
        trackOrder: "Track Order",
        continueShopping: "Continue Shopping",
        loadingText: "Loading order details...",
        notFound: "Couldn't load this order's details",
      }

  const handleCopy = () => {
    navigator.clipboard.writeText(String(orderId))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // ✅ عدد "المنتجات" لازم يبقى إجمالي عدد القطع (مجموع الكميات)، مش عدد الأنواع
  // المختلفة (order.items.length)، عشان لو نوعين وكل واحد كميته أكتر من 1 يبقى
  // العدد الحقيقي أكبر من 2
  const totalQuantity = order?.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ?? 0

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#F7F2EE] dark:bg-[#050505]">

      {/* ── Top trust bar (نفس فكرة الشريط اللي فوق في نون) ── */}
      <div className="w-full bg-[#D9A066] text-white">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium">
          <FiShield className="shrink-0" />
          <span>{t.topBar}</span>
        </div>
      </div>

      <div className="flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-[560px]">

          {/* ── Signature moment: checkmark draw-in ── */}
          <div className="flex flex-col items-center text-center mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="w-20 h-20 rounded-full bg-[#D9A066] flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(217,160,102,0.35)]"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                <FiCheck className="text-white text-4xl" strokeWidth={3} />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-black dark:text-white mb-2"
            >
              {t.thankYou}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="text-gray-400 text-sm"
            >
              {t.subtitle}
            </motion.p>
          </div>

          {/* ── Actions (اتنقلوا لفوق، نفس ترتيب نون: زرارين تحت العنوان على طول) ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className={`flex gap-3 mb-6 ${isAr ? "flex-row-reverse" : ""}`}
          >
            <button
              onClick={() => navigate("/profile", { state: { tab: "orders" } })}
              className={`flex-1 flex items-center justify-center gap-2 bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold text-sm py-3.5 rounded-full transition ${isAr ? "flex-row-reverse" : ""}`}
            >
              <FiPackage />
              {t.trackOrder}
            </button>
            {/* ✅ اتشال السهم جنب "متابعة التسوق" */}
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 border border-black/10 dark:border-white/10 text-black dark:text-white font-semibold text-sm py-3.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              {t.continueShopping}
            </Link>
          </motion.div>

          {/* ── Order number chip ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className={`flex items-center justify-between bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[16px] px-5 py-4 mb-4 ${isAr ? "flex-row-reverse" : ""}`}
          >
            <div className={isAr ? "text-right" : "text-left"}>
              <p className="text-xs text-gray-400 mb-1">{t.orderNumber}</p>
              <p className="font-bold text-black dark:text-white text-lg">#{orderId}</p>
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border transition ${
                copied
                  ? "border-green-300 text-green-500 bg-green-50 dark:bg-green-900/10"
                  : "border-black/10 dark:border-white/10 text-gray-500 hover:border-[#D9A066] hover:text-[#D9A066]"
              } ${isAr ? "flex-row-reverse" : ""}`}
            >
              <FiCopy className="text-xs" />
              {copied ? t.copied : t.copy}
            </button>
          </motion.div>

          {loading ? (
            <div className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[20px] p-8 text-center text-gray-400 text-sm">
              {t.loadingText}
            </div>
          ) : !order ? (
            <div className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[20px] p-8 text-center text-gray-400 text-sm">
              {t.notFound}
            </div>
          ) : (
            <>
              {/* ── Address card (كارت لوحده، زي شكل نون: أيقونة موقع في دايرة + التفاصيل) ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[16px] p-5 mb-4"
              >
                <div className={`flex items-start gap-3 ${isAr ? "flex-row-reverse text-right" : "text-left"}`}>
                  <div className="w-10 h-10 rounded-full bg-[#D9A066]/10 flex items-center justify-center shrink-0">
                    <FiMapPin className="text-[#D9A066]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">{t.address}</p>
                    <p className="text-sm text-black dark:text-white font-medium leading-relaxed">{order.address}</p>
                  </div>
                </div>
              </motion.div>

              {/* ── Order details / items card ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.56 }}
                className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[20px] p-6 mb-6"
              >
                <h2 className="font-bold text-black dark:text-white text-base mb-4">
                  {t.summary} <span className="text-[#D9A066]">({totalQuantity} {totalQuantity === 1 ? t.product : t.products})</span>
                </h2>

                {/* Items */}
                <div className="flex flex-col gap-4 mb-5">
                  {order.items?.map((item, i) => {
                    const imageUrl = resolveImageUrl(item.product_image)
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""} ${i !== order.items.length - 1 ? "pb-4 border-b border-black/5 dark:border-white/5" : ""}`}
                      >
                        {/* صورة المنتج + شارة الكمية xN */}
                        <div className="relative w-14 h-14 rounded-[12px] bg-[#F7F2EE] dark:bg-[#1a1a1a] flex items-center justify-center shrink-0 overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt=""
                              className="w-full h-full object-contain p-1.5"
                              onError={(e) => {
                                // ✅ لو الصورة فشلت تحمل حتى بعد تصحيح الرابط، نرجع لأيقونة
                                // بديلة بدل ما تفضل أيقونة "صورة مكسورة" من المتصفح
                                e.target.style.display = "none"
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = "flex"
                                }
                              }}
                            />
                          ) : null}
                          <FiPackage
                            className="text-gray-300 text-lg"
                            style={{ display: imageUrl ? "none" : "flex" }}
                          />
                          {item.quantity > 1 && (
                            <span className={`absolute bottom-0.5 ${isAr ? "left-0.5" : "right-0.5"} bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md`}>
                              x{item.quantity}
                            </span>
                          )}
                        </div>

                        <div className={`flex-1 min-w-0 ${isAr ? "text-right" : "text-left"}`}>
                          <p className="font-semibold text-black dark:text-white text-sm truncate">{item.product_name}</p>
                          {item.color_name && <p className="text-gray-400 text-xs mt-0.5">{item.color_name}</p>}
                        </div>

                        <span className="font-bold text-[#D9A066] text-sm shrink-0">
                          {item.price_at_time} {isAr ? "ج.م" : "EGP"}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Payment method */}
                <div className={`flex items-center gap-2 pt-1 ${isAr ? "flex-row-reverse text-right" : "text-left"}`}>
                  <FiCreditCard className="text-[#D9A066] text-sm shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{t.payment}</p>
                    <p className="text-sm text-black dark:text-white font-medium">{order.payment_method_display}</p>
                  </div>
                </div>

                <div className={`flex items-center justify-between mt-5 pt-4 border-t border-black/5 dark:border-white/5 ${isAr ? "flex-row-reverse" : ""}`}>
                  <span className="font-bold text-black dark:text-white text-base">{t.total}</span>
                  <span className="font-bold text-[#D9A066] text-xl">{order.total_price} {isAr ? "ج.م" : "EGP"}</span>
                </div>
              </motion.div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}