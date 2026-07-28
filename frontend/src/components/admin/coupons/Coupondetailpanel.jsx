import { Link } from "react-router-dom";
import { X, Ticket, Copy, Pencil, Ban, PlayCircle, Trash2, Loader2 } from "lucide-react";

const statusStyles = {
  active: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-amber-100 text-amber-700",
  expired: "bg-red-100 text-red-700",
  inactive: "bg-gray-100 text-gray-500",
};

const statusLabelAr = { active: "فعّال", scheduled: "مجدول", expired: "منتهي", inactive: "موقوف" };
const typeLabelAr = { percentage: "نسبة مئوية", fixed: "قيمة ثابتة" };

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }) +
    " - " + d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

export default function CouponDetailPanel({ coupon, loading, onClose, onToggleStatus, onDelete, actionLoading }) {
  if (loading) {
    return (
      <aside className="bg-surface rounded-2xl p-6 w-full lg:w-80 shrink-0 flex items-center justify-center text-sm text-primary/40">
        جاري التحميل...
      </aside>
    );
  }

  if (!coupon) {
    return (
      <aside className="bg-surface rounded-2xl p-6 w-full lg:w-80 shrink-0 flex items-center justify-center text-sm text-primary/40 text-center">
        اختاري كوبونًا من الجدول لعرض تفاصيله هنا
      </aside>
    );
  }

  const discountDisplay = coupon.discount_type === "percentage"
    ? `${coupon.discount_value}%${coupon.max_discount_amount ? ` (حد أقصى ${coupon.max_discount_amount} ج.م)` : ""}`
    : `${Number(coupon.discount_value).toLocaleString()} ج.م`;

  return (
    <aside className="bg-surface rounded-2xl p-5 w-full lg:w-80 shrink-0 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-primary">تفاصيل الكوبون</h3>
        <button onClick={onClose} className="text-primary/40 hover:text-primary" aria-label="إغلاق">
          <X size={17} />
        </button>
      </div>

      {/* Icon + code */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
          <Ticket size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-primary" dir="ltr">{coupon.code}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[coupon.computed_status]}`}>
              {statusLabelAr[coupon.computed_status]}
            </span>
          </div>
          <p className="text-xs text-primary/50">{coupon.name}</p>
        </div>
      </div>

      <button
        onClick={() => navigator.clipboard.writeText(coupon.code)}
        className="flex items-center justify-center gap-1.5 bg-background text-primary text-xs font-medium py-2.5 rounded-xl"
      >
        <Copy size={13} /> نسخ الكود
      </button>

      {/* Info fields */}
      <div className="space-y-2.5 text-xs">
        <InfoRow label="نوع الكوبون" value={typeLabelAr[coupon.discount_type]} />
        <InfoRow label="قيمة الخصم" value={discountDisplay} />
        <InfoRow label="أقل مبلغ للطلب" value={`${Number(coupon.min_order_amount).toLocaleString()} ج.م`} />
        <InfoRow label="حد الاستخدام الكلي" value={coupon.usage_limit || "غير محدود"} />
        <InfoRow label="حد الاستخدام لكل مستخدم" value={coupon.usage_limit_per_user} />
        <InfoRow label="مرات الاستخدام" value={`${coupon.used_count} مرة`} />
        <InfoRow label="صالح من" value={formatDateTime(coupon.valid_from)} />
        <InfoRow label="صالح حتى" value={formatDateTime(coupon.valid_to)} />
        <InfoRow label="مخصص لأول طلب فقط" value={coupon.is_first_order_only ? "نعم" : "لا"} />
        <InfoRow
          label="المحافظات"
          value={coupon.governorates?.length > 0 ? coupon.governorates.join("، ") : "كل المحافظات"}
        />
        <InfoRow label="تاريخ الإنشاء" value={formatDateTime(coupon.created_at)} />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        <Link
          to={`/admin/coupons/${coupon.id}/edit`}
          className="flex items-center justify-center gap-2 bg-primary text-background text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition"
        >
          <Pencil size={15} /> تعديل الكوبون
        </Link>
        <button
          onClick={() => onToggleStatus(coupon.id)}
          disabled={actionLoading === "toggle"}
          className={`flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl transition disabled:opacity-50 ${
            coupon.is_active ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          {actionLoading === "toggle" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : coupon.is_active ? (
            <Ban size={15} />
          ) : (
            <PlayCircle size={15} />
          )}
          {coupon.is_active ? "إيقاف الكوبون مؤقتًا" : "تفعيل الكوبون"}
        </button>
        <button
          onClick={() => onDelete(coupon.id)}
          disabled={actionLoading === "delete"}
          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-red-100 transition disabled:opacity-50"
        >
          {actionLoading === "delete" ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          حذف الكوبون
        </button>
      </div>
    </aside>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-primary/40 shrink-0">{label}</span>
      <span className="text-primary font-medium text-left">{value}</span>
    </div>
  );
}