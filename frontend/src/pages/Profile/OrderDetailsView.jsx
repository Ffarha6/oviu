import { FaChevronLeft, FaCheck, FaBox } from "react-icons/fa"
import StatusBadge from "./StatusBadge"

// خطوات تتبع الطلب (تم الطلب → تم التأكيد → ... → تم التسليم) — مستخدمة هنا بس
function OrderProgress({ status }) {
  const steps = [
    { key: "pending",   label: "تم الطلب" },
    { key: "confirmed", label: "تم التأكيد" },
    { key: "preparing", label: "جاري التجهيز" },
    { key: "shipped",   label: "قيد التوصيل" },
    { key: "delivered", label: "تم التسليم" },
  ]
  if (status === "cancelled") return null
  const currentIdx = steps.findIndex(s => s.key === status)

  return (
    <div className="flex items-start mt-4">
      {steps.map((step, i) => {
        const done = i <= currentIdx
        const isCurrent = i === currentIdx
        return (
          <div key={step.key} className="flex items-start" style={{ flex: i < steps.length - 1 ? 1 : "none" }}>
            <div className="flex flex-col items-center" style={{ width: 90 }}>
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[13px] transition-all duration-300
                  ${done
                    ? "bg-[#E8821A] border-2 border-[#E8821A] text-white"
                    : "bg-white dark:bg-black border-2 border-[#e0e0e0] dark:border-gray-600 text-[#ccc] dark:text-gray-500"}
                `}
                style={{ boxShadow: isCurrent ? "0 0 0 4px #fff4ea" : "none" }}
              >
                {done ? <FaCheck /> : <span className="w-1.5 h-1.5 rounded-full bg-[#e0e0e0] dark:bg-gray-600" />}
              </div>
              <span
                className={`mt-1.5 text-[12.5px] text-center leading-snug
                  ${isCurrent ? "text-[#E8821A] font-bold" : done ? "text-[#444] dark:text-gray-300 font-medium" : "text-[#bbb] dark:text-gray-500 font-medium"}
                `}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mt-[15px] transition-all duration-300 ${i < currentIdx ? "bg-[#E8821A]" : "bg-[#eee] dark:bg-gray-700"}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function OrderDetailsView({ order, onBack }) {
  const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0

  return (
    <div className="flex flex-col gap-5">

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

      <div className="bg-white dark:bg-black rounded-2xl p-6 border border-[#f0f0f0] dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-bold text-[#444] dark:text-gray-300">حالة الطلب</span>
          <StatusBadge status={order.status} />
        </div>
        <OrderProgress status={order.status} />
      </div>

      <div className="bg-white dark:bg-black rounded-2xl p-6 border border-[#f0f0f0] dark:border-gray-700">
        <p className="mb-3.5 mt-0 text-base font-bold text-[#222] dark:text-gray-100">المنتجات ({itemCount})</p>
        <div className="flex flex-col gap-2.5">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#fafafa] dark:bg-gray-700/50 rounded-[10px] px-3.5 py-3 border border-[#f0f0f0] dark:border-gray-700">
              <div className="w-16 h-16 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden border border-[#eeeeee] dark:border-gray-600">
  {item.product_image ? (
    <img
      src={item.product_image}
      alt={item.product_name || "صورة المنتج"}
      className="w-full h-full object-contain p-1.5"
    />
  ) : (
    <FaBox className="text-[#ddd] dark:text-gray-500 text-base" />
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
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-black rounded-2xl p-6 border border-[#f0f0f0] dark:border-gray-700">
        <p className="mb-3.5 mt-0 text-base font-bold text-[#222] dark:text-gray-100">تفاصيل الطلب</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "طريقة الدفع", value: order.payment_method_display },
            { label: "العنوان", value: order.address },
            { label: "رقم التتبع", value: order.tracking_number || "—" },
            { label: "تاريخ الشحن", value: order.shipped_date ? new Date(order.shipped_date).toLocaleDateString("ar-EG") : "—" },
            { label: "تاريخ التسليم", value: order.delivered_date ? new Date(order.delivered_date).toLocaleDateString("ar-EG") : "—" },
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
  )
}