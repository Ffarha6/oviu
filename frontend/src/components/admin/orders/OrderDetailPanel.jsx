import { useState, useEffect } from "react";
import { X, Phone, Mail, MapPin, Printer, Loader2, Check } from "lucide-react";
import api from "../../../api/axios";

const tabs = ["نظرة عامة", "العناصر", "الدفع والتتبع", "ملاحظات"];

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabelAr = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  preparing: "قيد المعالجة",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

const paymentLabelAr = {
  cash: "الدفع عند الاستلام",
  card: "بطاقة ائتمان",
  wallet: "محفظة",
};

// نفس منطق الـ valid_transitions الموجود في الباك اند بالظبط
const validTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }) +
    " · " + d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

export default function OrderDetailPanel({ order, onClose, onStatusChanged, onOrderUpdated }) {
  const [activeTab, setActiveTab] = useState("نظرة عامة");
  const [changingStatus, setChangingStatus] = useState(false);

  // ── حقول التعديل (رقم التتبع + الملاحظات) ──
  const [trackingInput, setTrackingInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [savingField, setSavingField] = useState(null); // "tracking" | "notes" | "paid" | null

  useEffect(() => {
    setTrackingInput(order?.tracking_number || "");
    setNotesInput(order?.notes || "");
  }, [order?.id]);

  if (!order) {
    return (
      <aside className="bg-surface rounded-2xl p-6 w-full lg:w-80 shrink-0 flex items-center justify-center text-sm text-primary/40 text-center">
        اختاري طلبًا من الجدول لعرض تفاصيله هنا
      </aside>
    );
  }

  const nextStatuses = validTransitions[order.status] || [];

  const handleStatusChange = async (newStatus) => {
    setChangingStatus(true);
    try {
      const res = await api.patch(`/orders/${order.id}/status/`, { status: newStatus });
      onStatusChanged(order.id, res.data.status);
    } catch (err) {
      console.error("فشل تغيير حالة الطلب:", err);
      alert(err.response?.data?.error || "حصل خطأ أثناء تغيير الحالة");
    } finally {
      setChangingStatus(false);
    }
  };

  // تعديلات عامة (تتبع / ملاحظات / حالة الدفع) بتستخدم endpoint واحد
  const updateOrderField = async (field, value) => {
    setSavingField(field);
    try {
      const res = await api.patch(`/dashboard/orders/${order.id}/`, { [field]: value });
      onOrderUpdated(order.id, res.data);
    } catch (err) {
      console.error(`فشل تحديث ${field}:`, err);
      alert("حصل خطأ أثناء الحفظ");
    } finally {
      setSavingField(null);
    }
  };

  return (
    <aside className="bg-surface rounded-2xl p-5 w-full lg:w-80 shrink-0 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-primary">طلب #{order.id}</h3>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[order.status]}`}>
            {statusLabelAr[order.status] || order.status}
          </span>
        </div>
        <button onClick={onClose} className="text-primary/40 hover:text-primary" aria-label="إغلاق">
          <X size={17} />
        </button>
      </div>

      {/* تغيير الحالة — أهم أداة تحكم للأدمن */}
      {nextStatuses.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {nextStatuses.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={changingStatus}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50 ${
                s === "cancelled"
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-primary text-background hover:opacity-90"
              }`}
            >
              {changingStatus && <Loader2 size={12} className="animate-spin" />}
              نقل إلى: {statusLabelAr[s]}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-primary/40 bg-background rounded-lg px-3 py-2">
          هذا الطلب في حالة نهائية ولا يمكن تغييرها
        </p>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-primary/10 -mt-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-medium px-2.5 pb-2.5 -mb-px border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab ? "border-secondary text-primary" : "border-transparent text-primary/40"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "العناصر" && (
        <div className="space-y-2.5">
          {order.items?.length > 0 ? order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 bg-background rounded-xl p-3 text-xs">
              <div className="min-w-0">
                <p className="font-medium text-primary truncate">{item.product_name}</p>
                {item.color_name && (
                  <p className="flex items-center gap-1.5 text-primary/40 mt-0.5">
                    <span className="w-2.5 h-2.5 rounded-full border border-primary/10" style={{ background: item.color_code }} />
                    {item.color_name}
                  </p>
                )}
                <p className="text-primary/40 mt-0.5">الكمية: {item.quantity}</p>
              </div>
              <p className="font-semibold text-primary shrink-0">{Number(item.total).toLocaleString()} ج.م</p>
            </div>
          )) : (
            <p className="text-xs text-primary/40 text-center py-6">مفيش عناصر</p>
          )}
        </div>
      )}

      {activeTab === "الدفع والتتبع" && (
        <div className="space-y-4">
          {/* حالة الدفع */}
          <div className="flex items-center justify-between bg-background rounded-xl px-3 py-2.5">
            <div>
              <p className="text-xs font-medium text-primary">حالة الدفع</p>
              <p className={`text-xs mt-0.5 ${order.is_paid ? "text-emerald-600" : "text-red-500"}`}>
                {order.is_paid ? "مدفوع" : "غير مدفوع"}
              </p>
            </div>
            <button
              onClick={() => updateOrderField("is_paid", !order.is_paid)}
              disabled={savingField === "is_paid"}
              className={`w-10 h-5 rounded-full relative transition-colors disabled:opacity-50 ${
                order.is_paid ? "bg-emerald-500" : "bg-primary/15"
              }`}
            >
              {savingField === "is_paid" ? (
                <Loader2 size={11} className="animate-spin absolute inset-0 m-auto text-white" />
              ) : (
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${order.is_paid ? "left-0.5" : "right-0.5"}`} />
              )}
            </button>
          </div>

          {/* رقم التتبع */}
          <div>
            <p className="text-xs font-medium text-primary mb-1.5">رقم التتبع</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="أدخلي رقم التتبع..."
                dir="ltr"
                className="flex-1 bg-background border border-primary/10 rounded-lg px-3 py-2 text-xs text-primary outline-none focus:border-secondary/50"
              />
              <button
                onClick={() => updateOrderField("tracking_number", trackingInput)}
                disabled={savingField === "tracking_number" || trackingInput === (order.tracking_number || "")}
                className="w-9 h-9 rounded-lg bg-primary text-background flex items-center justify-center shrink-0 disabled:opacity-40"
              >
                {savingField === "tracking_number" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ملاحظات" && (
        <div className="space-y-2.5">
          <textarea
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            rows={5}
            placeholder="اكتبي ملاحظة على هذا الطلب..."
            className="w-full bg-background border border-primary/10 rounded-xl p-3 text-xs text-primary outline-none focus:border-secondary/50 resize-none"
          />
          <button
            onClick={() => updateOrderField("notes", notesInput)}
            disabled={savingField === "notes" || notesInput === (order.notes || "")}
            className="w-full flex items-center justify-center gap-2 bg-primary text-background text-xs font-semibold py-2 rounded-lg disabled:opacity-40"
          >
            {savingField === "notes" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            حفظ الملاحظة
          </button>
        </div>
      )}

      {activeTab === "نظرة عامة" && (
        <>
          {/* Customer */}
          <div>
            <p className="text-xs font-bold text-primary/50 mb-2.5">العميل</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary font-bold flex items-center justify-center shrink-0">
                {order.customer_name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary truncate">{order.customer_name}</p>
                <p className="text-xs text-primary/40" dir="ltr">{order.phone}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <MiniIconBtn icon={Phone} />
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-primary/50 mt-2" dir="ltr">
              <Mail size={12} /> {order.customer_email}
            </p>
          </div>

          {/* Order info */}
          <div>
            <p className="text-xs font-bold text-primary/50 mb-2.5">معلومات الطلب</p>
            <div className="grid grid-cols-2 gap-y-3 text-xs">
              <InfoField label="تاريخ الطلب" value={formatDate(order.created_at)} />
              <InfoField label="حالة الطلب" value={statusLabelAr[order.status]} />
              <InfoField label="طريقة الدفع" value={paymentLabelAr[order.payment_method]} />
              <InfoField
                label="حالة الدفع"
                value={order.is_paid ? "مدفوع" : "غير مدفوع"}
                valueClass={order.is_paid ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}
              />
              <InfoField label="الإجمالي" value={`${Number(order.total_price).toLocaleString()} ج.م`} valueClass="font-semibold" />
              <InfoField label="رقم التتبع" value={order.tracking_number || "—"} />
            </div>
          </div>

          {/* Shipping address */}
          <div>
            <p className="text-xs font-bold text-primary/50 mb-2.5">عنوان الشحن</p>
            <p className="flex items-start gap-1.5 text-xs text-primary/70 leading-relaxed">
              <MapPin size={13} className="text-secondary shrink-0 mt-0.5" />
              {order.address || "لا يوجد عنوان مسجل"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            <button className="flex items-center justify-center gap-2 bg-background border border-primary/10 text-primary text-sm font-medium py-2.5 rounded-xl hover:bg-primary/5 transition">
              <Printer size={15} /> طباعة الفاتورة
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

function InfoField({ label, value, valueClass = "text-primary" }) {
  return (
    <div>
      <p className="text-primary/40 mb-0.5">{label}</p>
      <p className={valueClass}>{value}</p>
    </div>
  );
}

function MiniIconBtn({ icon: Icon }) {
  return (
    <button className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-primary/60 hover:text-secondary transition">
      <Icon size={14} />
    </button>
  );
}