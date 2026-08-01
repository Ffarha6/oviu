import { FaEdit, FaCheck, FaTag } from "react-icons/fa"
import { useTranslation } from "react-i18next"
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
function OrderCard({ order, t }) {
  const statusColor =
    order.statusKey === "delivered" ? "#4caf50" :
    order.statusKey === "shipped"   ? "#E8821A" :
    "#888"

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#f5f5f5] dark:border-gray-700">
      <div className="w-12 h-12 bg-[#f5f5f5] dark:bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
        <FaTag className="text-[#ccc] dark:text-gray-500" />
      </div>
      <div className="flex-1">
        <p className="m-0 text-[15px] font-semibold text-[#222] dark:text-gray-100">#{order.id}</p>
        <p className="m-0 text-[13px] font-semibold" style={{ color: statusColor }}>{order.statusLabel}</p>
        <p className="m-0 text-[13px] text-[#aaa] dark:text-gray-500">{order.date}</p>
      </div>
      <span className="text-[15px] font-bold text-[#222] dark:text-gray-100">
        {order.price} {t("common.currency")}
      </span>
    </div>
  )
}

export default function ProfileOverview({ user, orders, onEditClick, onSeeAllOrders }) {
  const { t, i18n } = useTranslation()

  // نفس فكرة الملف القديم، بس دلوقتي مفاتيح ترجمة بدل نص عربي ثابت
  const STATUS_KEYS = {
    pending:   "orderStatus.pending",
    confirmed: "orderStatus.confirmed",
    preparing: "orderStatus.preparing",
    shipped:   "orderStatus.shipped",
    delivered: "orderStatus.delivered",
    cancelled: "orderStatus.cancelled",
  }

  // تنسيق التاريخ بيتبع اللغة الحالية بدل ما يبقى ar-EG ثابت
  const dateLocale = i18n.language === "ar" ? "ar-EG" : "en-GB"

  return (
    <>
      <div className="bg-white dark:bg-black rounded-2xl p-6 border border-[#f0f0f0] dark:border-gray-700">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="m-0 text-2xl font-bold text-[#222] dark:text-gray-100">
              {t("profile.title")}
            </h2>
            <p className="mt-1 mb-0 text-[15px] text-[#aaa] dark:text-gray-500">
              {t("profile.subtitle")}
            </p>
          </div>
          <button
            onClick={onEditClick}
            className="flex items-center gap-2 px-[18px] py-[9px] border-[1.5px] border-[#E8821A] rounded-[10px] bg-white dark:bg-transparent text-[#E8821A] text-[15px] font-semibold cursor-pointer"
            style={{ fontFamily: "'Cairo',sans-serif" }}
          >
            <FaEdit /> {t("profile.editButton")}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <InfoRow label={t("profile.firstName")} value={user?.first_name} />
          <InfoRow label={t("profile.lastName")}  value={user?.last_name} />
          <InfoRow label={t("profile.email")} value={
            <span className="flex items-center gap-1.5">
              {user?.email_verified && <FaCheck className="text-[#4caf50] text-[11px]" />}
              {user?.email}
            </span>
          } />
          <InfoRow label={t("profile.phone")}        value={user?.phone} />
          <InfoRow label={t("profile.dateOfBirth")}  value={user?.date_of_birth} />
          <InfoRow label={t("profile.gender")}       value={genderLabel(user?.gender, t)} />
          <InfoRow label={t("profile.governorate")}  value={user?.governorate} />
          <InfoRow label={t("profile.country")}      value={t("profile.egypt")} />
          <InfoRow
            label={t("profile.membership")}
            value={t("profile.memberSince", { date: user?.date_joined })}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-black rounded-2xl p-5 border border-[#f0f0f0] dark:border-gray-700">
        <div className="flex justify-between items-center mb-3.5">
          <h3 className="m-0 text-[17px] font-bold text-[#222] dark:text-gray-100">
            {t("profile.recentOrders")}
          </h3>
          <button
            onClick={onSeeAllOrders}
            className="bg-transparent border-none text-[#E8821A] text-sm cursor-pointer"
            style={{ fontFamily: "'Cairo',sans-serif" }}
          >
            {t("profile.viewAll")}
          </button>
        </div>
        {orders.length === 0
          ? (<p className="text-[#bbb] dark:text-gray-500 text-[15px] text-center py-5">{t("profile.noOrders")}</p>)
          : orders.slice(0, 3).map(o => (
              <OrderCard
                key={o.id}
                t={t}
                order={{
                  id: o.id,
                  statusKey: o.status,
                  statusLabel: t(STATUS_KEYS[o.status] || o.status),
                  date: new Date(o.created_at).toLocaleDateString(dateLocale),
                  price: o.total_price,
                }}
              />
            ))
        }
      </div>
    </>
  )
}