import { useState, useEffect } from "react";
import { X, Star, Check, MessageSquare, Ban, Trash2, Loader2, RotateCcw } from "lucide-react";

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

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }) +
    " - " + d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

export default function ReviewDetailPanel({ review, loading, onClose, onApprove, onReject, onResetStatus, onDelete, onReply, actionLoading }) {
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    setReplyText(review?.admin_reply || "");
  }, [review?.id]);

  if (loading) {
    return (
      <aside className="bg-surface rounded-2xl p-6 w-full lg:w-80 shrink-0 flex items-center justify-center text-sm text-primary/40">
        جاري التحميل...
      </aside>
    );
  }

  if (!review) {
    return (
      <aside className="bg-surface rounded-2xl p-6 w-full lg:w-80 shrink-0 flex items-center justify-center text-sm text-primary/40 text-center">
        اختاري تقييمًا من الجدول لعرض تفاصيله هنا
      </aside>
    );
  }

  return (
    <aside className="bg-surface rounded-2xl p-5 w-full lg:w-80 shrink-0 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className={i < review.rating ? "fill-secondary text-secondary" : "text-primary/15"} />
            ))}
          </div>
          <p className="text-xs text-primary/40 mt-1">{formatDateTime(review.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[review.computed_status]}`}>
            {statusLabelAr[review.computed_status]}
          </span>
          <button onClick={onClose} className="text-primary/40 hover:text-primary" aria-label="إغلاق">
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Product */}
      <div className="flex items-center gap-3 bg-background rounded-xl p-3">
        <div className="w-11 h-11 rounded-lg bg-surface flex items-center justify-center text-xl shrink-0">👓</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary truncate">{review.product_name}</p>
          <p className="text-xs text-primary/40">{categoryLabels[review.product_type] || review.product_type}</p>
        </div>
      </div>

      {/* Customer information */}
      <div>
        <p className="text-xs font-bold text-primary/50 mb-2.5">معلومات العميل</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary font-bold flex items-center justify-center shrink-0">
            {review.customer_name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-primary">{review.customer_name}</p>
            <p className="text-xs text-primary/40" dir="ltr">{review.customer_email}</p>
            {review.customer_phone && <p className="text-xs text-primary/40" dir="ltr">{review.customer_phone}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          <div className="bg-background rounded-xl p-2.5">
            <p className="text-sm font-bold text-primary">{review.customer_orders_count} طلب</p>
            <p className="text-[11px] text-primary/40">إجمالي الطلبات</p>
          </div>
          <div className="bg-background rounded-xl p-2.5">
            <p className="text-sm font-bold text-primary">{Number(review.customer_total_spent).toLocaleString()} ج.م</p>
            <p className="text-[11px] text-primary/40">إجمالي الإنفاق</p>
          </div>
        </div>
      </div>

      {/* Review text */}
      <div>
        {review.title && <p className="text-sm font-semibold text-primary mb-1">{review.title}</p>}
        <p className="text-xs font-bold text-primary/50 mb-2">التقييم</p>
        <p className="text-sm text-primary/80 leading-relaxed">{review.comment}</p>
      </div>

      {/* Images */}
      {(review.image1_url || review.image2_url) && (
        <div>
          <p className="text-xs font-bold text-primary/50 mb-2.5">صور التقييم</p>
          <div className="flex items-center gap-2">
            {review.image1_url && (
              <img src={review.image1_url} alt="صورة التقييم" className="w-16 h-16 rounded-xl object-cover" />
            )}
            {review.image2_url && (
              <img src={review.image2_url} alt="صورة التقييم" className="w-16 h-16 rounded-xl object-cover" />
            )}
          </div>
        </div>
      )}

      {/* الرد على التقييم */}
      <div>
        <p className="text-xs font-bold text-primary/50 mb-2">رد الأدمن</p>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          rows={3}
          placeholder="اكتبي ردًا على تقييم العميل..."
          className="w-full bg-background border border-primary/10 rounded-xl p-3 text-sm text-primary outline-none focus:border-secondary/50 resize-none"
        />
        <button
          onClick={() => onReply(review.id, replyText)}
          disabled={actionLoading === "reply" || replyText === (review.admin_reply || "")}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-background border border-primary/10 text-primary text-sm font-medium py-2 rounded-xl disabled:opacity-40"
        >
          {actionLoading === "reply" ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
          حفظ الرد
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        {review.computed_status !== "approved" && (
          <button
            onClick={() => onApprove(review.id)}
            disabled={actionLoading === "approve"}
            className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-100 transition disabled:opacity-50"
          >
            {actionLoading === "approve" ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            اعتماد التقييم
          </button>
        )}
        {review.computed_status !== "rejected" && (
          <button
            onClick={() => onReject(review.id)}
            disabled={actionLoading === "reject"}
            className="flex items-center justify-center gap-2 bg-red-50 text-red-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-red-100 transition disabled:opacity-50"
          >
            {actionLoading === "reject" ? <Loader2 size={15} className="animate-spin" /> : <Ban size={15} />}
            رفض التقييم
          </button>
        )}
        {review.computed_status !== "pending" && (
          <button
            onClick={() => onResetStatus(review.id)}
            disabled={actionLoading === "reset"}
            className="flex items-center justify-center gap-2 bg-background border border-primary/10 text-primary text-sm font-medium py-2.5 rounded-xl hover:bg-primary/5 transition disabled:opacity-50"
          >
            {actionLoading === "reset" ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
            إعادة لقيد المراجعة
          </button>
        )}
        <button
          onClick={() => onDelete(review.id)}
          disabled={actionLoading === "delete"}
          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-red-100 transition disabled:opacity-50"
        >
          {actionLoading === "delete" ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          حذف التقييم نهائيًا
        </button>
      </div>
    </aside>
  );
}