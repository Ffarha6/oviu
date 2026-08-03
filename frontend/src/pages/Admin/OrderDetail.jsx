import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Check,
  Loader2,
  X,
  Printer,
  Truck,
  Package,
  Hourglass,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";
import api from "../../api/axios";
import SectionCard from "../../components/admin/shared/SectionCard";

const steps = [
  { key: "pending", label: "قيد الانتظار", icon: Hourglass },
  { key: "confirmed", label: "مؤكد", icon: ClipboardCheck },
  { key: "preparing", label: "قيد المعالجة", icon: Package },
  { key: "shipped", label: "تم الشحن", icon: Truck },
  { key: "delivered", label: "تم التوصيل", icon: CheckCircle2 },
];

const paymentLabelAr = {
  cash: "الدفع عند الاستلام",
  card: "بطاقة ائتمان",
  wallet: "محفظة",
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }) +
    " · " + d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);

  const [trackingInput, setTrackingInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [savingField, setSavingField] = useState(null);

  const fetchOrder = () => {
    setLoading(true);
    api.get(`/admin/orders/${id}/`)
      .then((res) => {
        setOrder(res.data);
        setTrackingInput(res.data.tracking_number || "");
        setNotesInput(res.data.notes || "");
      })
      .catch((err) => console.error("فشل تحميل الطلب:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <p className="text-center text-sm text-primary/40 py-20">جاري تحميل الطلب...</p>;
  }

  if (!order) {
    return <p className="text-center text-sm text-primary/40 py-20">الطلب غير موجود</p>;
  }

  const isCancelled = order.status === "cancelled";
  const currentStepIndex = steps.findIndex((s) => s.key === order.status);
  const nextStep = !isCancelled && currentStepIndex >= 0 && currentStepIndex < steps.length - 1
    ? steps[currentStepIndex + 1]
    : null;
  const canCancel = !isCancelled && order.status !== "delivered";

  const handleAdvance = async () => {
    if (!nextStep) return;
    setChangingStatus(true);
    try {
      const res = await api.patch(`/orders/${order.id}/status/`, { status: nextStep.key });
      setOrder((prev) => ({ ...prev, status: res.data.status }));
    } catch (err) {
      alert(err.response?.data?.error || "حصل خطأ أثناء تغيير الحالة");
    } finally {
      setChangingStatus(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("هل أنتِ متأكدة من إلغاء هذا الطلب؟")) return;
    setChangingStatus(true);
    try {
      const res = await api.patch(`/orders/${order.id}/status/`, { status: "cancelled" });
      setOrder((prev) => ({ ...prev, status: res.data.status }));
    } catch (err) {
      alert(err.response?.data?.error || "حصل خطأ أثناء إلغاء الطلب");
    } finally {
      setChangingStatus(false);
    }
  };

  const updateOrderField = async (field, value) => {
    setSavingField(field);
    try {
      const res = await api.patch(`/admin/orders/${order.id}/`, { [field]: value });
      setOrder((prev) => ({ ...prev, ...res.data }));
    } catch (err) {
      alert("حصل خطأ أثناء الحفظ");
    } finally {
      setSavingField(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/orders")}
            className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-primary/60 hover:text-primary transition"
            aria-label="رجوع"
          >
            <ArrowRight size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">طلب #{order.id}</h1>
            <p className="text-xs text-primary/40 mt-1">{formatDate(order.created_at)}</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
          <Printer size={15} /> طباعة الفاتورة
        </button>
      </div>

      {/* حالة الطلب - أكبر وأوضح عنصر في الصفحة */}
      <SectionCard>
        {isCancelled ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <X size={20} />
              </div>
              <div>
                <p className="font-bold text-primary">هذا الطلب ملغي</p>
                <p className="text-xs text-primary/50">لا يمكن اتخاذ أي إجراء آخر عليه</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stepper */}
            <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
              {steps.map((step, i) => {
                const isDone = i < currentStepIndex;
                const isCurrent = i === currentStepIndex;
                const StepIcon = step.icon;
                return (
                  <div key={step.key} className="flex items-center flex-1 min-w-[90px] last:flex-none">
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                          isCurrent
                            ? "bg-primary text-background"
                            : isDone
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-background text-primary/25"
                        }`}
                      >
                        {isDone ? <Check size={16} /> : <StepIcon size={16} />}
                      </div>
                      <span className={`text-[11px] font-medium whitespace-nowrap ${isCurrent ? "text-primary" : "text-primary/40"}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 ${i < currentStepIndex ? "bg-emerald-300" : "bg-background"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* أزرار التحكم — كبيرة وواضحة */}
            <div className="flex flex-wrap items-center gap-3">
              {nextStep && (
                <button
                  onClick={handleAdvance}
                  disabled={changingStatus}
                  className="flex items-center gap-2 bg-primary text-background text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                >
                  {changingStatus ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  تأكيد الانتقال إلى: {nextStep.label}
                </button>
              )}
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={changingStatus}
                  className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-semibold px-5 py-3 rounded-xl hover:bg-red-100 transition disabled:opacity-50"
                >
                  <X size={16} /> إلغاء الطلب
                </button>
              )}
              {!nextStep && !canCancel && (
                <p className="text-sm text-emerald-600 font-medium">✓ تم توصيل الطلب بنجاح</p>
              )}
            </div>
          </>
        )}
      </SectionCard>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* العمود الرئيسي: المنتجات */}
        <div className="flex-1 min-w-0 space-y-4">
          <SectionCard title={`المنتجات (${order.items?.length || 0})`}>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-background rounded-xl p-3">
                  <div className="w-16 h-16 rounded-xl bg-surface overflow-hidden shrink-0 flex items-center justify-center text-2xl">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      "👓"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary truncate">{item.product_name}</p>
                    <div className="flex items-center gap-3 text-xs text-primary/50 mt-1">
                      {item.color_name && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full border border-primary/10" style={{ background: item.color_code }} />
                          {item.color_name}
                        </span>
                      )}
                      <span>الكمية: {item.quantity}</span>
                      <span>السعر: {Number(item.price_at_time).toLocaleString()} ج.م</span>
                    </div>
                  </div>
                  <p className="font-bold text-primary text-lg shrink-0">{Number(item.total).toLocaleString()} ج.م</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary/10">
              <span className="text-sm font-medium text-primary/60">الإجمالي الكلي</span>
              <span className="text-xl font-bold text-primary">{Number(order.total_price).toLocaleString()} ج.م</span>
            </div>
          </SectionCard>

          <SectionCard title="ملاحظات على الطلب">
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              rows={4}
              placeholder="اكتبي ملاحظة على هذا الطلب..."
              className="w-full bg-background border border-primary/10 rounded-xl p-3 text-sm text-primary outline-none focus:border-secondary/50 resize-none"
            />
            <button
              onClick={() => updateOrderField("notes", notesInput)}
              disabled={savingField === "notes" || notesInput === (order.notes || "")}
              className="mt-3 flex items-center gap-2 bg-primary text-background text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-40"
            >
              {savingField === "notes" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              حفظ الملاحظة
            </button>
          </SectionCard>
        </div>

        {/* العمود الجانبي */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <SectionCard title="العميل">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-secondary/20 text-secondary font-bold flex items-center justify-center shrink-0">
                {order.customer_name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-primary truncate">{order.customer_name}</p>
                <p className="text-xs text-primary/40 truncate" dir="ltr">{order.customer_email}</p>
              </div>
            </div>
            <a
              href={`tel:${order.phone}`}
              className="flex items-center justify-center gap-2 bg-background text-primary text-sm font-medium py-2.5 rounded-xl mt-3 hover:bg-primary/5 transition"
              dir="ltr"
            >
              <Phone size={14} /> {order.phone}
            </a>
          </SectionCard>

          <SectionCard title="عنوان الشحن">
            <p className="flex items-start gap-2 text-sm text-primary/70 leading-relaxed">
              <MapPin size={15} className="text-secondary shrink-0 mt-0.5" />
              {order.address || "لا يوجد عنوان مسجل"}
            </p>
          </SectionCard>

          <SectionCard title="الدفع والتتبع">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary/60">طريقة الدفع</span>
                <span className="text-sm font-medium text-primary">{paymentLabelAr[order.payment_method]}</span>
              </div>

              <div className="flex items-center justify-between bg-background rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-primary">حالة الدفع</p>
                  <p className={`text-xs mt-0.5 ${order.is_paid ? "text-emerald-600" : "text-red-500"}`}>
                    {order.is_paid ? "تم الدفع" : "لم يتم الدفع بعد"}
                  </p>
                </div>
                <button
                  onClick={() => updateOrderField("is_paid", !order.is_paid)}
                  disabled={savingField === "is_paid"}
                  className={`w-11 h-6 rounded-full relative transition-colors disabled:opacity-50 ${
                    order.is_paid ? "bg-emerald-500" : "bg-primary/15"
                  }`}
                >
                  {savingField === "is_paid" ? (
                    <Loader2 size={12} className="animate-spin absolute inset-0 m-auto text-white" />
                  ) : (
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${order.is_paid ? "left-0.5" : "right-0.5"}`} />
                  )}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">رقم التتبع</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="أدخلي رقم التتبع..."
                    dir="ltr"
                    className="flex-1 bg-background border border-primary/10 rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-secondary/50"
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
          </SectionCard>
        </div>
      </div>
    </div>
  );
}