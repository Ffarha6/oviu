import { Star, Eye, Check, X, Trash2 } from "lucide-react";

const statusStyles = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

const statusLabelAr = { approved: "معتمد", pending: "قيد المراجعة", rejected: "مرفوض" };

const categoryLabels = {
  sunglasses: "نظارات شمسية",
  medical: "نظارات طبية",
  reading: "نظارات قراءة",
  lenses: "عدسات لاصقة",
};

function formatDate(iso) {
  if (!iso) return { date: "—", time: "" };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
  };
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < rating ? "fill-secondary text-secondary" : "text-primary/15"} />
      ))}
    </div>
  );
}

export default function ReviewsTable({ reviews, loading, selectedId, onSelect, onApprove, onReject, onDelete }) {
  if (loading) {
    return <p className="text-center text-sm text-primary/40 py-10">جاري تحميل التقييمات...</p>;
  }

  if (!reviews || reviews.length === 0) {
    return <p className="text-center text-sm text-primary/40 py-10">مفيش تقييمات لعرضها</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-primary/40 text-xs border-b border-primary/10">
            <th className="py-3 pr-2 text-right w-8"><input type="checkbox" className="accent-secondary" /></th>
            <th className="py-3 text-right font-medium">التقييم</th>
            <th className="py-3 text-right font-medium">العميل</th>
            <th className="py-3 text-right font-medium">المنتج</th>
            <th className="py-3 text-right font-medium">النجوم</th>
            <th className="py-3 text-right font-medium">الحالة</th>
            <th className="py-3 text-right font-medium">التاريخ</th>
            <th className="py-3 text-right font-medium">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => {
            const isSelected = r.id === selectedId;
            const { date, time } = formatDate(r.created_at);
            return (
              <tr
                key={r.id}
                onClick={() => onSelect(r.id)}
                className={`border-b border-primary/5 last:border-0 cursor-pointer transition-colors ${
                  isSelected ? "bg-secondary/10" : "hover:bg-background"
                }`}
              >
                <td className="py-3.5 pr-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="accent-secondary" />
                </td>
                <td className="py-3.5 max-w-[220px]">
                  <Stars rating={r.rating} />
                  <p className="text-primary/70 text-xs mt-1 truncate">{r.comment}</p>
                </td>
                <td className="py-3.5">
                  <p className="font-medium text-primary">{r.customer_name}</p>
                  <p className="text-xs text-primary/40" dir="ltr">{r.customer_email}</p>
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-lg shrink-0">👓</div>
                    <div>
                      <p className="font-medium text-primary">{r.product_name}</p>
                      <p className="text-xs text-primary/40">{categoryLabels[r.product_type] || r.product_type}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 text-primary font-semibold">{r.rating}</td>
                <td className="py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[r.computed_status]}`}>
                    {statusLabelAr[r.computed_status]}
                  </span>
                </td>
                <td className="py-3.5">
                  <p className="text-primary/70">{date}</p>
                  <p className="text-xs text-primary/40">{time}</p>
                </td>
                <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <IconBtn icon={Eye} label="عرض" onClick={() => onSelect(r.id)} />
                    {r.computed_status !== "approved" && (
                      <IconBtn icon={Check} label="اعتماد" className="text-emerald-600" onClick={() => onApprove(r.id)} />
                    )}
                    {r.computed_status !== "rejected" && (
                      <IconBtn icon={X} label="رفض" className="text-red-500" onClick={() => onReject(r.id)} />
                    )}
                    <IconBtn icon={Trash2} label="حذف" className="text-red-500" onClick={() => onDelete(r.id)} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function IconBtn({ icon: Icon, label, onClick, className = "" }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-primary/50 hover:bg-surface hover:text-primary transition ${className}`}
    >
      <Icon size={15} />
    </button>
  );
}