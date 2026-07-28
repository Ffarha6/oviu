import { X, CheckCircle2, Clock, XCircle, FileText, RotateCcw } from "lucide-react";

const statusConfig = {
  "مكتمل": { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600", label: "مكتمل" },
  "قيد الانتظار": { icon: Clock, className: "bg-amber-50 text-amber-600", label: "قيد الانتظار" },
  "فشلت": { icon: XCircle, className: "bg-red-50 text-red-600", label: "فشلت" },
};

const methodLabel = {
  credit_card: "بطاقة ائتمان",
  cod: "الدفع عند الاستلام",
  wallet: "محفظة",
  bank_transfer: "تحويل بنكي",
};

export default function PaymentDetailPanel({ payment, onClose }) {
  if (!payment) {
    return (
      <aside className="bg-surface rounded-2xl p-6 w-full lg:w-80 shrink-0 flex items-center justify-center text-sm text-primary/40 text-center">
        اختاري دفعة من الجدول لعرض تفاصيلها هنا
      </aside>
    );
  }

  const status = statusConfig[payment.status];

  return (
    <aside className="bg-surface rounded-2xl p-5 w-full lg:w-80 shrink-0 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-primary">تفاصيل الدفعة</h3>
        <button onClick={onClose} className="text-primary/40 hover:text-primary" aria-label="إغلاق">
          <X size={17} />
        </button>
      </div>

      {/* Status + amount */}
      <div className="flex flex-col items-center text-center gap-2 py-2">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${status.className}`}>
          <status.icon size={26} />
        </div>
        <span className="text-xs font-semibold text-emerald-600">{status.label}</span>
        <p className="text-2xl font-bold text-primary">{payment.amount.toLocaleString()} ج.م</p>
        <p className="text-xs text-primary/40" dir="ltr">رقم الدفعة {payment.id}</p>
      </div>

      <div className="space-y-2.5 text-xs">
        <InfoRow label="رقم الطلب" value={payment.orderId} dir="ltr" />
      </div>

      {/* Customer */}
      <div>
        <p className="text-xs font-bold text-primary/50 mb-2">العميل</p>
        <div className="flex items-center gap-2.5">
          <img src={payment.avatar} alt={payment.customer} className="w-9 h-9 rounded-full object-cover shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary truncate">{payment.customer}</p>
            <p className="text-xs text-primary/40 truncate" dir="ltr">{payment.email}</p>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <p className="text-xs font-bold text-primary/50 mb-2">طريقة الدفع</p>
        <p className="text-sm text-primary">
          {methodLabel[payment.method]}
          {payment.cardLast4 && <span className="text-primary/40" dir="ltr"> (Visa •••• {payment.cardLast4})</span>}
        </p>
      </div>

      <div className="space-y-2.5 text-xs">
        <InfoRow label="رقم العملية" value={payment.txnId} dir="ltr" />
        <InfoRow label="بوابة الدفع" value={payment.gateway} />
        <InfoRow label="وقت الدفع" value={`${payment.date} ${payment.time}`} />
        <InfoRow label="العملة" value="جنيه مصري (EGP)" />
      </div>

      {/* Cost breakdown */}
      <div className="border-t border-primary/10 pt-3 space-y-2 text-xs">
        <InfoRow label="الإجمالي الفرعي" value={`${payment.subtotal.toLocaleString()} ج.م`} />
        <InfoRow label="تكلفة الشحن" value={`${payment.shipping.toLocaleString()} ج.م`} />
        <InfoRow label="الضريبة (10%)" value={`${payment.tax.toLocaleString()} ج.م`} />
        <InfoRow label="الخصم" value={`- ${payment.discount.toLocaleString()} ج.م`} valueClass="text-red-500" />
        <div className="flex items-center justify-between pt-2 border-t border-primary/10">
          <span className="text-sm font-bold text-primary">الإجمالي الكلي</span>
          <span className="text-sm font-bold text-primary">{payment.amount.toLocaleString()} ج.م</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        <button className="flex items-center justify-center gap-2 bg-background border border-primary/10 text-primary text-sm font-medium py-2.5 rounded-xl hover:bg-primary/5 transition">
          <FileText size={15} /> عرض تفاصيل الطلب
        </button>
        <button className="flex items-center justify-center gap-2 bg-primary text-background text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition">
          <RotateCcw size={15} /> استرجاع المبلغ
        </button>
      </div>
    </aside>
  );
}

function InfoRow({ label, value, dir, valueClass = "text-primary" }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-primary/40">{label}</span>
      <span className={`font-medium ${valueClass}`} dir={dir}>{value}</span>
    </div>
  );
}