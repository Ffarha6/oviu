import { useState } from "react"
import {
  FaChevronLeft, FaBox, FaMapMarkerAlt, FaCopy,
  FaClock, FaCheckCircle, FaSpinner, FaTruck
} from "react-icons/fa"
import StatusBadge from "./StatusBadge"

const BASE_URL = "https://oviu-production.up.railway.app"

// ✅ الباك إند بيرجّع مسار الصورة نسبي أحيانًا (زي /media/products/xyz.jpg) من غير
// الدومين، فبنضيف الدومين لو مش موجود أصلاً
function resolveImageUrl(path) {
  if (!path) return ""
  if (/^https?:\/\//i.test(path)) return path
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`
}

// ✅ الموقع عربي بس، فطريقة الدفع بترجع دايمًا بالعربي حتى لو الباك إند راجعها إنجليزي
const PAYMENT_METHOD_AR = {
  "Cash on Delivery": "الدفع عند الاستلام",
  "Cash On Delivery": "الدفع عند الاستلام",
  "COD": "الدفع عند الاستلام",
  "Card": "بطاقة ائتمان",
  "Credit Card": "بطاقة ائتمان",
  "Online Payment": "دفع إلكتروني",
}
function resolvePaymentMethod(value) {
  if (!value) return ""
  return PAYMENT_METHOD_AR[value] || value
}

// خطوات تتبع الطلب (تم الطلب → تم التأكيد → ... → تم التسليم)
const STEPS = [
  { key: "pending",   label: "تم الطلب",     color: "#f59e0b", icon: <FaClock /> },
  { key: "confirmed", label: "تم التأكيد",   color: "#3b82f6", icon: <FaCheckCircle /> },
  { key: "preparing", label: "جاري التجهيز", color: "#8b5cf6", icon: <FaSpinner /> },
  { key: "shipped",   label: "قيد التوصيل",  color: "#E8821A", icon: <FaTruck /> },
  { key: "delivered", label: "تم التسليم",   color: "#10b981", icon: <FaCheckCircle /> },
]

// ✅ التواريخ المتأكدين إنها موجودة في الباك إند بس: تاريخ إنشاء الطلب، الشحن،
// والتسليم. باقي الخطوات بتتعرض من غير تاريخ لحد ما يتأكد إنها موجودة في الـ API
function dateForStep(order, key) {
  if (key === "pending") return order.created_at
  if (key === "shipped") return order.shipped_date
  if (key === "delivered") return order.delivered_date
  return null
}
function formatShortDate(value) {
  if (!value) return null
  return new Date(value).toLocaleDateString("ar-EG", { day: "numeric", month: "long" })
}

// ── تايم لاين رأسي كامل (بيظهر بس لما يتفتح) ──────────────────────
function OrderProgress({ status, order }) {
  if (status === "cancelled") return null
  const currentIdx = STEPS.findIndex(s => s.key === status)

  return (
    <div className="flex flex-col mt-4">
      {STEPS.map((step, i) => {
        const done = i <= currentIdx
        const date = formatShortDate(dateForStep(order, step.key))
        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center w-3 shrink-0">
              <span
                className="w-[11px] h-[11px] rounded-full shrink-0"
                style={{ background: done ? step.color : "#e5e5e5" }}
              />
              {i !== STEPS.length - 1 && (
                <span
                  className="w-0.5 flex-1"
                  style={{ background: i < currentIdx ? step.color : "#e5e5e5", minHeight: 26 }}
                />
              )}
            </div>
            <div className={i !== STEPS.length - 1 ? "pb-4" : ""}>
              <p className={`m-0 text-[13px] font-bold ${done ? "text-[#222] dark:text-gray-100" : "text-[#bbb] dark:text-gray-500"}`}>
                {step.label}
              </p>
              {date && <p className="mt-0.5 mb-0 text-[11.5px] text-[#aaa] dark:text-gray-500">{date}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── رقم الطلب + نسخ ─────────────────────────────────────────────
function OrderNumberChip({ order }) {
  const [copied, setCopied] = useState(false)
  const value = order.order_number || order.id

  const handleCopy = () => {
    navigator.clipboard.writeText(String(value))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="bg-white dark:bg-black rounded-2xl px-5 py-4 border border-[#f0f0f0] dark:border-gray-700 flex items-center justify-between">
      <div>
        <p className="m-0 text-xs text-[#aaa] dark:text-gray-500 mb-1">رقم الطلب</p>
        <p className="m-0 text-lg font-bold text-[#222] dark:text-gray-100">#{value}</p>
      </div>
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border transition
          ${copied
            ? "border-green-300 text-green-500 bg-green-50 dark:bg-green-900/10"
            : "border-[#e0e0e0] dark:border-gray-600 text-[#888] dark:text-gray-400 hover:border-[#E8821A] hover:text-[#E8821A]"}
        `}
      >
        <FaCopy className="text-xs" />
        {copied ? "تم النسخ" : "نسخ"}
      </button>
    </div>
  )
}

export default function OrderDetailsView({ order, onBack }) {
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0

  const isCancelled = order.status === "cancelled"
  const currentStep = STEPS.find(s => s.key === order.status)
  const summaryDate = currentStep ? formatShortDate(dateForStep(order, currentStep.key)) : null

  return (
    <div className="flex flex-col gap-4">

      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-[10px] border border-[#f0f0f0] dark:border-gray-700 bg-white dark:bg-black flex items-center justify-center cursor-pointer shrink-0"
        >
          <FaChevronLeft className="text-[13px] text-[#666] dark:text-gray-400" style={{ transform: "rotate(180deg)" }} />
        </button>
        <div>
          <h2 className="m-0 text-[22px] font-bold text-[#222] dark:text-gray-100">طلب رقم #{order.id}</h2>
          <p className="mt-1 mb-0 text-sm text-[#aaa] dark:text-gray-500">
            {new Date(order.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* ── رقم الطلب + نسخ ── */}
      <OrderNumberChip order={order} />

      {/* ── عنوان التوصيل (كارت لوحده، زي نون) ── */}
      {order.address && (
        <div className="bg-white dark:bg-black rounded-2xl p-5 border border-[#f0f0f0] dark:border-gray-700 flex items-start gap-3">
          <FaMapMarkerAlt className="text-[#E8821A] text-base mt-0.5 shrink-0" />
          <div>
            <p className="m-0 text-xs text-[#aaa] dark:text-gray-500 mb-1">عنوان التوصيل</p>
            <p className="m-0 text-sm font-semibold text-[#333] dark:text-gray-200 leading-relaxed">{order.address}</p>
          </div>
        </div>
      )}

      {/* ── حالة الطلب + تتبع قابل للطي ── */}
      <div className="bg-white dark:bg-black rounded-2xl p-6 border border-[#f0f0f0] dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-bold text-[#444] dark:text-gray-300">حالة الطلب</span>
          <StatusBadge status={order.status} />
        </div>

        {!isCancelled && (
          <>
            <button
              onClick={() => setTimelineOpen(v => !v)}
              className="w-full flex items-center justify-between gap-2 mt-4 bg-transparent border-none cursor-pointer p-0"
            >
              <span className="text-[13px] font-semibold text-[#888] dark:text-gray-400">
                {timelineOpen ? "إخفاء التتبع الكامل" : "عرض التتبع الكامل"}
                {!timelineOpen && summaryDate && (
                  <span className="text-[#aaa] dark:text-gray-500 font-normal"> · {summaryDate}</span>
                )}
              </span>
              <FaChevronLeft
                className="text-[11px] text-[#ccc] transition-transform duration-200"
                style={{ transform: timelineOpen ? "rotate(-90deg)" : "none" }}
              />
            </button>

            {timelineOpen && <OrderProgress status={order.status} order={order} />}
          </>
        )}
      </div>

      {/* ── ملخص الطلب / الفاتورة قابل للطي ── */}
      <div className="bg-white dark:bg-black rounded-2xl border border-[#f0f0f0] dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setInvoiceOpen(v => !v)}
          className="w-full flex items-center justify-between gap-2 p-6 bg-transparent border-none cursor-pointer"
        >
          <span className="text-base font-bold text-[#222] dark:text-gray-100">عرض ملخص الطلب / الفاتورة</span>
          <FaChevronLeft
            className="text-[11px] text-[#ccc] transition-transform duration-200"
            style={{ transform: invoiceOpen ? "rotate(-90deg)" : "none" }}
          />
        </button>

        {invoiceOpen && (
          <div className="px-6 pb-6 flex flex-col gap-5">
            <div>
              <p className="mb-3.5 mt-0 text-base font-bold text-[#222] dark:text-gray-100">المنتجات ({itemCount})</p>
              <div className="flex flex-col gap-2.5">
                {order.items?.map((item, i) => {
                  const imageUrl = resolveImageUrl(item.product_image)
                  return (
                    <div key={i} className="flex items-center gap-3 bg-[#fafafa] dark:bg-gray-700/50 rounded-[10px] px-3.5 py-3 border border-[#f0f0f0] dark:border-gray-700">
                      <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product_name || "صورة المنتج"}
                            className="w-full h-full object-contain p-1"
                            draggable={false}
                            loading="lazy"
                          />
                        ) : (
                          <FaBox className="text-gray-300 text-lg" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="m-0 text-[15px] font-semibold text-[#222] dark:text-gray-100">{item.product_name}</p>
                        <p className="m-0 text-[13px] text-[#aaa] dark:text-gray-500">
                          الكمية: {item.quantity}
                          {item.color_name && ` · اللون: ${item.color_name}`}
                        </p>
                      </div>
                      <span className="text-[15px] font-bold text-[#222] dark:text-gray-100">{item.price_at_time} ج.م</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="mb-3.5 mt-0 text-base font-bold text-[#222] dark:text-gray-100">تفاصيل الطلب</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "طريقة الدفع", value: resolvePaymentMethod(order.payment_method_display) },
                  { label: "رقم التتبع", value: order.tracking_number || "—" },
                  { label: "حالة الدفع", value: order.is_paid ? "✅ مدفوع" : "⏳ غير مدفوع" },
                ].map((meta, i) => (
                  <div key={i} className="bg-[#fafafa] dark:bg-gray-700/50 rounded-lg px-3 py-2.5 border border-[#f0f0f0] dark:border-gray-700">
                    <p className="mb-0.5 mt-0 text-[13px] text-[#aaa] dark:text-gray-500">{meta.label}</p>
                    <p className="m-0 text-sm font-semibold text-[#333] dark:text-gray-200">{meta.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#fff4ea] dark:bg-[#3a2410] rounded-2xl px-6 py-[18px] border border-[#fed7aa] dark:border-[#5c3d1a] flex justify-between items-center">
              <span className="text-base font-semibold text-[#444] dark:text-gray-300">الإجمالي الكلي</span>
              <span className="text-[22px] font-bold text-[#E8821A]">{order.total_price} ج.م</span>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}