import { FaEdit, FaCheck, FaTag } from "react-icons/fa"
import { genderLabel } from "./ProfileConstants"

// صف بيانات صغير (تسمية + قيمة) — مستخدم هنا بس
function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] text-[#aaa] dark:text-gray-500">{label}</span>
      <span className="text-base font-semibold text-[#222] dark:text-gray-100">{value || "—"}</span>
    </div>
  )
}

// كارت الطلب الصغير في ودجت "آخر الطلبات" — مستخدم هنا بس
function OrderCard({ order }) {
  const statusColor = order.status === "تم التوصيل" ? "#4caf50" : order.status === "جار التوصيل" ? "#E8821A" : "#888"
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#f5f5f5] dark:border-gray-700">
      <div className="w-12 h-12 bg-[#f5f5f5] dark:bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
        <FaTag className="text-[#ccc] dark:text-gray-500" />
      </div>
      <div className="flex-1">
        <p className="m-0 text-[15px] font-semibold text-[#222] dark:text-gray-100">#{order.id}</p>
        <p className="m-0 text-[13px] font-semibold" style={{ color: statusColor }}>{order.status}</p>
        <p className="m-0 text-[13px] text-[#aaa] dark:text-gray-500">{order.date}</p>
      </div>
      <span className="text-[15px] font-bold text-[#222] dark:text-gray-100">{order.price} ج.م</span>
    </div>
  )
}

const STATUS_MAP = {
  pending:   "قيد الانتظار",
  confirmed: "تم التأكيد",
  preparing: "جارٍ التحضير",
  shipped:   "جار التوصيل",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
}

export default function ProfileOverview({ user, orders, onEditClick, onSeeAllOrders }) {
  return (
    <>
      <div className="bg-white dark:bg-black rounded-2xl p-6 border border-[#f0f0f0] dark:border-gray-700">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="m-0 text-2xl font-bold text-[#222] dark:text-gray-100">الملف الشخصي</h2>
            <p className="mt-1 mb-0 text-[15px] text-[#aaa] dark:text-gray-500">إدارة معلوماتك الشخصية وتفاصيل حسابك</p>
          </div>
          <button
            onClick={onEditClick}
            className="flex items-center gap-2 px-[18px] py-[9px] border-[1.5px] border-[#E8821A] rounded-[10px] bg-white dark:bg-transparent text-[#E8821A] text-[15px] font-semibold cursor-pointer"
            style={{ fontFamily: "'Cairo',sans-serif" }}
          >
            <FaEdit /> تعديل الملف الشخصي
          </button>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <InfoRow label="الاسم الأول"      value={user?.first_name} />
          <InfoRow label="الاسم الأخير"     value={user?.last_name} />
          <InfoRow label="البريد الإلكتروني" value={
            <span className="flex items-center gap-1.5">
              {user?.email_verified && <FaCheck className="text-[#4caf50] text-[11px]" />}
              {user?.email}
            </span>
          } />
          <InfoRow label="رقم الجوال"   value={user?.phone} />
          <InfoRow label="تاريخ الميلاد" value={user?.date_of_birth} />
          <InfoRow label="الجنس"         value={genderLabel(user?.gender)} />
          <InfoRow label="المحافظة"      value={user?.governorate} />
          <InfoRow label="الدولة"        value="جمهورية مصر العربية" />
          <InfoRow label="العضوية"       value={`عضو منذ ${user?.date_joined}`} />
        </div>
      </div>

      <div className="bg-white dark:bg-black rounded-2xl p-5 border border-[#f0f0f0] dark:border-gray-700">
        <div className="flex justify-between items-center mb-3.5">
          <h3 className="m-0 text-[17px] font-bold text-[#222] dark:text-gray-100">آخر الطلبات</h3>
          <button
            onClick={onSeeAllOrders}
            className="bg-transparent border-none text-[#E8821A] text-sm cursor-pointer"
            style={{ fontFamily: "'Cairo',sans-serif" }}
          >
            عرض الكل
          </button>
        </div>
        {orders.length === 0
          ? (<p className="text-[#bbb] dark:text-gray-500 text-[15px] text-center py-5">لا توجد طلبات بعد</p>)
          : orders.slice(0, 3).map(o => (
              <OrderCard
                key={o.id}
                order={{ id: o.id, status: STATUS_MAP[o.status] || o.status, date: new Date(o.created_at).toLocaleDateString("ar-EG"), price: o.total_price }}
              />
            ))
        }
      </div>
    </>
  )
}