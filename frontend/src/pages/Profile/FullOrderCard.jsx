import { FaBoxOpen, FaChevronLeft, FaCheck, FaBox } from "react-icons/fa"
import StatusBadge from "./StatusBadge"
import { STATUS_CONFIG, DEFAULT_STATUS_CONFIG } from "./ProfileConstants"

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
      className="flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <div className="flex items-center gap-2.5 flex-wrap">
        <StatusBadge status={order.status} />
        <span className="text-sm font-semibold text-[#444] dark:text-gray-300">{dateText}</span>
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

export default function FullOrderCard({ order, onViewDetails }) {
  const firstItem = order.items?.[0]
  const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0

  return (
    <div className="bg-white dark:bg-black rounded-2xl border border-[#f0f0f0] dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-4">

        <div className="w-16 h-16 rounded-[10px] bg-[#f8f8f8] dark:bg-gray-700 border border-[#f0f0f0] dark:border-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
          {firstItem?.product_image
            ? <img src={firstItem.product_image} alt="" className="w-full h-full object-cover" />
            : <FaBoxOpen className="text-[#ddd] dark:text-gray-500 text-2xl" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <span className="text-[17px] font-bold text-[#222] dark:text-gray-100">طلب رقم #{order.id}</span>
          </div>
          <div className="text-sm text-[#aaa] dark:text-gray-500 mb-1">
            تاريخ الطلب: {new Date(order.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div className="flex gap-4 text-sm text-[#666] dark:text-gray-400 mb-3">
            <span>عدد المنتجات: <strong className="text-[#222] dark:text-gray-100">{itemCount} {itemCount === 1 ? "منتج" : "منتجات"}</strong></span>
            <span>الإجمالي: <strong className="text-[#E8821A]">{order.total_price} ج.م</strong></span>
          </div>

          <DeliveryStatusStrip order={order} />
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={() => onViewDetails(order)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border-[1.5px] border-[#E8821A] bg-white dark:bg-transparent text-[#E8821A] text-sm font-semibold cursor-pointer transition-all duration-200"
            style={{ fontFamily: "'Cairo',sans-serif" }}
          >
            عرض التفاصيل
            <FaChevronLeft className="text-[10px]" />
          </button>
        </div>
      </div>
    </div>
  )
}