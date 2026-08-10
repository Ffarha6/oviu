import { useState } from "react"
import { FaBoxOpen, FaChevronLeft, FaCheck, FaTimesCircle } from "react-icons/fa"
import StatusBadge from "./StatusBadge"
import { STATUS_CONFIG, DEFAULT_STATUS_CONFIG } from "./ProfileConstants"

const BASE_URL = "https://oviu-production.up.railway.app"

// ✅ الباك إند بيرجّع مسار الصورة نسبي أحيانًا (زي /media/products/xyz.jpg) من غير
// الدومين، فبنضيف الدومين لو مش موجود أصلاً
function resolveImageUrl(path) {
  if (!path) return ""
  if (/^https?:\/\//i.test(path)) return path
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`
}

// دالة تنسيق تاريخ عربي (يوم الأسبوع + اليوم + الشهر) — مستخدمة هنا بس
function formatArabicDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" })
}

// شريط حالة التوصيل الصغير جوه كارت الطلب — مستخدم هنا بس، فمش محتاج ملف لوحده
function DeliveryStatusStrip({ order }) {
  const cfg = STATUS_CONFIG[order.status] || DEFAULT_STATUS_CONFIG
  const isDelivered = order.status === "delivered"
  const isCancelled = order.status === "cancelled"

  let dateText
  if (isDelivered) {
    dateText = order.delivered_date ? `تم التسليم في ${formatArabicDate(order.delivered_date)}` : "تم التسليم"
  } else if (isCancelled) {
    dateText = "تم إلغاء الطلب"
  } else if (order.estimated_delivery_date) {
    dateText = `التسليم المتوقع في ${formatArabicDate(order.estimated_delivery_date)}`
  } else if (order.status === "shipped") {
    dateText = "في الطريق إليك"
  } else {
    dateText = "جاري تجهيز طلبك"
  }

  return (
    <div
      className="flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 flex-wrap"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <div className="flex items-center gap-2.5 flex-wrap min-w-0">
        <StatusBadge status={order.status} />
        <span className="text-[13px] sm:text-sm font-semibold text-[#444] dark:text-gray-300">{dateText}</span>
      </div>
      {!isCancelled && (
        <div
          className="w-[26px] h-[26px] rounded-full shrink-0 flex items-center justify-center text-[11px]"
          style={{
            background: isDelivered ? "#10b981" : "transparent",
            border: `2px solid ${isDelivered ? "#10b981" : cfg.color}`,
            color: isDelivered ? "#fff" : cfg.color,
          }}
        >
          <FaCheck />
        </div>
      )}
    </div>
  )
}

// ✅ الحالات اللي لسه ينفع تلغي فيها الطلب — أول ما يتشحن (shipped) أو يتسلم (delivered)
// مينفعش تلغي، بنفس منطق الباك إند في cancel_order (نفس الدالة الموجودة في OrderDetailsView)
const CANCELLABLE_STATUSES = ["pending", "confirmed", "preparing"]
function canCancelOrder(status) {
  return CANCELLABLE_STATUSES.includes(status)
}

export default function FullOrderCard({ order, onViewDetails, onCancelOrder }) {
  // 🔧 مؤقت للتشخيص فقط — امسحها بعد ما تتأكد من القيمة
  console.log("order.status =", JSON.stringify(order.status), "canCancel =", canCancelOrder(order.status))
  const firstItem = order.items?.[0]
  const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0
  const imageUrl = resolveImageUrl(firstItem?.product_image)

  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState("")

  // ✅ خطوة أولى بتفتح تأكيد، خطوة تانية (لما يبقى confirmingCancel=true) بتنفذ الإلغاء الفعلي
  const handleCancelClick = async () => {
    if (!confirmingCancel) {
      setConfirmingCancel(true)
      return
    }
    setCancelling(true)
    setCancelError("")
    try {
      await onCancelOrder?.(order.id)
    } catch (err) {
      setCancelError("فشل الإلغاء")
      setConfirmingCancel(false)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="bg-white dark:bg-black rounded-2xl border border-[#f0f0f0] dark:border-gray-700 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-4">

        {/* ── الصورة: عريضة وفوق على الموبايل، مربعة وعلى الجنب على الشاشات الكبيرة ── */}
        <div className="w-full h-44 sm:w-[90px] sm:h-[90px] sm:m-4 shrink-0 sm:rounded-xl bg-[#fafafa] sm:bg-white border-b sm:border border-gray-100 sm:border-gray-200 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={firstItem?.product_name || "صورة المنتج"}
              className="w-full h-full object-contain p-3 sm:p-2"
              draggable={false}
              loading="lazy"
            />
          ) : (
            <FaBoxOpen className="text-gray-300 text-4xl sm:text-3xl" />
          )}
        </div>

        {/* ── المحتوى: باقي التفاصيل ── */}
        <div className="flex-1 min-w-0 px-4 py-4 sm:px-0 sm:py-4 sm:pl-0">
          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
            <span className="text-base sm:text-[17px] font-bold text-[#222] dark:text-gray-100">طلب رقم #{order.order_number || order.id}</span>
          </div>
          <div className="text-xs sm:text-sm text-[#aaa] dark:text-gray-500 mb-2 sm:mb-1">
            تاريخ الطلب: {new Date(order.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm text-[#666] dark:text-gray-400 mb-3 flex-wrap">
            <span>عدد المنتجات: <strong className="text-[#222] dark:text-gray-100">{itemCount} {itemCount === 1 ? "منتج" : "منتجات"}</strong></span>
            <span>الإجمالي: <strong className="text-[#E8821A]">{order.total_price} ج.م</strong></span>
          </div>

          <DeliveryStatusStrip order={order} />
        </div>

        {/* ── زرار عرض التفاصيل + إلغاء الطلب ── */}
        <div className="px-4 pb-4 sm:px-4 sm:pb-0 sm:pr-4 shrink-0 flex flex-col gap-2 sm:w-[160px]">
          <button
            onClick={() => onViewDetails(order)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-[10px] border-[1.5px] border-[#E8821A] bg-white dark:bg-transparent text-[#E8821A] text-sm font-semibold cursor-pointer transition-all duration-200"
            style={{ fontFamily: "'Cairo',sans-serif" }}
          >
            عرض التفاصيل
            <FaChevronLeft className="text-[10px]" />
          </button>

          {/* ✅ زرار إلغاء الطلب — يظهر بس لو الحالة لسه قبل الشحن */}
          {canCancelOrder(order.status) && !confirmingCancel && (
            <button
              onClick={handleCancelClick}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-[10px] border-[1.5px] border-red-400 bg-white dark:bg-transparent text-red-500 text-sm font-semibold cursor-pointer transition-all duration-200"
            >
              <FaTimesCircle className="text-xs" />
              إلغاء الطلب
            </button>
          )}

          {canCancelOrder(order.status) && confirmingCancel && (
            <div className="flex flex-col gap-1.5">
              <p className="m-0 text-[11px] text-[#888] dark:text-gray-400 text-center leading-snug">
                تأكيد الإلغاء؟
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setConfirmingCancel(false)}
                  disabled={cancelling}
                  className="flex-1 py-2 rounded-[8px] border border-[#e0e0e0] dark:border-gray-600 text-[#666] dark:text-gray-400 text-xs font-semibold bg-white dark:bg-transparent cursor-pointer"
                >
                  تراجع
                </button>
                <button
                  onClick={handleCancelClick}
                  disabled={cancelling}
                  className="flex-1 py-2 rounded-[8px] border-none bg-red-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
                >
                  {cancelling ? "..." : "تأكيد"}
                </button>
              </div>
              {cancelError && (
                <p className="m-0 text-[10px] text-red-500 text-center">{cancelError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}