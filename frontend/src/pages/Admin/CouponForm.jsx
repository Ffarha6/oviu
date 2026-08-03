import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import api from "../../api/axios";
import SectionCard from "../../components/dashboard/shared/SectionCard";

const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة",
  "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية",
  "الوادي الجديد", "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد",
  "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر",
  "قنا", "شمال سيناء", "سوهاج",
];

function toDatetimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyForm = {
  code: "",
  name: "",
  description: "",
  discount_type: "percentage",
  discount_value: "",
  max_discount_amount: "",
  min_order_amount: "0",
  valid_from: "",
  valid_to: "",
  usage_limit: "",
  usage_limit_per_user: "1",
  is_active: true,
  is_first_order_only: false,
  governorates: [],
  audience: "all", // "all" | "first_order" | "governorates" — حقل مساعد بس للفرونت
};

export default function CouponForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEditMode) return;
    api.get(`/dashboard/coupons/${id}/`)
      .then((res) => {
        const d = res.data;
        let audience = "all";
        if (d.is_first_order_only) audience = "first_order";
        else if (d.governorates?.length > 0) audience = "governorates";

        setForm({
          code: d.code || "",
          name: d.name || "",
          description: d.description || "",
          discount_type: d.discount_type || "percentage",
          discount_value: d.discount_value ?? "",
          max_discount_amount: d.max_discount_amount ?? "",
          min_order_amount: d.min_order_amount ?? "0",
          valid_from: toDatetimeLocal(d.valid_from),
          valid_to: toDatetimeLocal(d.valid_to),
          usage_limit: d.usage_limit || "",
          usage_limit_per_user: d.usage_limit_per_user ?? "1",
          is_active: d.is_active,
          is_first_order_only: d.is_first_order_only,
          governorates: d.governorates || [],
          audience,
        });
      })
      .catch((err) => console.error("فشل تحميل الكوبون:", err))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleGovernorate = (gov) => {
    setForm((prev) => ({
      ...prev,
      governorates: prev.governorates.includes(gov)
        ? prev.governorates.filter((g) => g !== gov)
        : [...prev.governorates, gov],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});

    const payload = {
      code: form.code,
      name: form.name,
      description: form.description,
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      max_discount_amount: form.max_discount_amount || null,
      min_order_amount: form.min_order_amount || 0,
      valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
      valid_to: form.valid_to ? new Date(form.valid_to).toISOString() : null,
      usage_limit: form.usage_limit || 0,
      usage_limit_per_user: form.usage_limit_per_user || 1,
      is_active: form.is_active,
      // منطق الجمهور المستهدف: "أول طلب" أو "محافظات معينة" أو الكل
      is_first_order_only: form.audience === "first_order",
      governorates: form.audience === "governorates" ? form.governorates : [],
    };

    try {
      if (isEditMode) {
        await api.patch(`/dashboard/coupons/${id}/`, payload);
      } else {
        await api.post("/dashboard/coupons/", payload);
      }
      navigate("/dashboard/coupons");
    } catch (err) {
      console.error("فشل حفظ الكوبون:", err);
      if (err.response?.data) setErrors(err.response.data);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center text-sm text-primary/40 py-20">جاري تحميل بيانات الكوبون...</p>;
  }

  const inputClass = "w-full bg-background border border-primary/10 rounded-xl px-3.5 py-2.5 text-sm text-primary outline-none focus:border-secondary/50 transition";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">{isEditMode ? "تعديل الكوبون" : "إضافة كوبون جديد"}</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/dashboard" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <Link to="/dashboard/coupons" className="hover:text-secondary">الكوبونات</Link>
            <ChevronLeft size={12} />
            <span className="text-primary/60">{isEditMode ? "تعديل" : "إضافة"}</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-background text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          حفظ الكوبون
        </button>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4">
          <p className="font-medium mb-1">فيه مشكلة في البيانات:</p>
          <ul className="list-disc pr-5 space-y-0.5">
            {Object.entries(errors).map(([field, msgs]) => (
              <li key={field}>{field}: {Array.isArray(msgs) ? msgs.join(" ") : String(msgs)}</li>
            ))}
          </ul>
        </div>
      )}

      <SectionCard title="البيانات الأساسية">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="كود الكوبون" required>
            <input type="text" value={form.code} onChange={(e) => handleChange("code", e.target.value.toUpperCase())} dir="ltr" placeholder="OVIU10" className={inputClass} />
          </Field>
          <Field label="اسم الكوبون (يظهر للعميل)">
            <input type="text" value={form.name} onChange={(e) => handleChange("name", e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="الوصف (اختياري)">
            <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} className={`${inputClass} resize-none`} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="نوع الخصم وقيمته">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="نوع الخصم" required>
            <div className="flex gap-2">
              <RadioBtn label="نسبة مئوية %" active={form.discount_type === "percentage"} onClick={() => handleChange("discount_type", "percentage")} />
              <RadioBtn label="مبلغ ثابت ج.م" active={form.discount_type === "fixed"} onClick={() => handleChange("discount_type", "fixed")} />
            </div>
          </Field>

          <Field label={form.discount_type === "percentage" ? "نسبة الخصم %" : "قيمة الخصم (ج.م)"} required>
            <input type="number" step="0.01" value={form.discount_value} onChange={(e) => handleChange("discount_value", e.target.value)} className={inputClass} />
          </Field>

          {form.discount_type === "percentage" && (
            <Field label="الحد الأقصى للخصم (ج.م، اختياري)">
              <input type="number" step="0.01" value={form.max_discount_amount} onChange={(e) => handleChange("max_discount_amount", e.target.value)} className={inputClass} />
            </Field>
          )}

          <Field label="أقل قيمة طلب لاستخدام الكوبون (ج.م)">
            <input type="number" step="0.01" value={form.min_order_amount} onChange={(e) => handleChange("min_order_amount", e.target.value)} className={inputClass} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="الجمهور المستهدف">
        <div className="space-y-3">
          <RadioRow
            label="كل المستخدمين"
            description="أي عميل يقدر يستخدم الكوبون"
            active={form.audience === "all"}
            onClick={() => handleChange("audience", "all")}
          />
          <RadioRow
            label="أول طلب فقط"
            description="الكوبون مخصص للعملاء اللي بيطلبوا لأول مرة بس"
            active={form.audience === "first_order"}
            onClick={() => handleChange("audience", "first_order")}
          />
          <RadioRow
            label="محافظات معينة"
            description="الكوبون يشتغل بس للعملاء في المحافظات المحددة"
            active={form.audience === "governorates"}
            onClick={() => handleChange("audience", "governorates")}
          />
        </div>

        {form.audience === "governorates" && (
          <div className="mt-4 pt-4 border-t border-primary/10">
            <p className="text-xs font-medium text-primary/60 mb-3">اختاري المحافظات المشمولة</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GOVERNORATES.map((gov) => (
                <label key={gov} className="flex items-center gap-2 text-sm text-primary/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.governorates.includes(gov)}
                    onChange={() => toggleGovernorate(gov)}
                    className="accent-secondary"
                  />
                  {gov}
                </label>
              ))}
            </div>
            {form.governorates.length === 0 && (
              <p className="text-xs text-amber-600 mt-3">اختاري محافظة واحدة على الأقل</p>
            )}
          </div>
        )}
      </SectionCard>

      <SectionCard title="حدود الاستخدام والصلاحية">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="عدد مرات الاستخدام الكلي (فارغ = غير محدود)">
            <input type="number" value={form.usage_limit} onChange={(e) => handleChange("usage_limit", e.target.value)} placeholder="غير محدود" className={inputClass} />
          </Field>
          <Field label="عدد مرات الاستخدام لكل مستخدم" required>
            <input type="number" value={form.usage_limit_per_user} onChange={(e) => handleChange("usage_limit_per_user", e.target.value)} className={inputClass} />
          </Field>
          <Field label="تاريخ ووقت البداية" required>
            <input type="datetime-local" value={form.valid_from} onChange={(e) => handleChange("valid_from", e.target.value)} className={inputClass} />
          </Field>
          <Field label="تاريخ ووقت الانتهاء" required>
            <input type="datetime-local" value={form.valid_to} onChange={(e) => handleChange("valid_to", e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="mt-5">
          <label className="flex items-center gap-2 text-sm text-primary/70 cursor-pointer w-fit">
            <input type="checkbox" checked={form.is_active} onChange={(e) => handleChange("is_active", e.target.checked)} className="accent-secondary" />
            الكوبون مفعّل ويشتغل حاليًا
          </label>
        </div>
      </SectionCard>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-primary/70 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function RadioBtn({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 text-sm font-medium py-2.5 rounded-xl border transition ${
        active ? "bg-primary text-background border-primary" : "bg-background text-primary/60 border-primary/10"
      }`}
    >
      {label}
    </button>
  );
}

function RadioRow({ label, description, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-3 text-right p-3.5 rounded-xl border transition ${
        active ? "bg-secondary/10 border-secondary" : "bg-background border-primary/10 hover:border-primary/20"
      }`}
    >
      <span className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${active ? "border-secondary" : "border-primary/20"}`}>
        {active && <span className="w-2 h-2 rounded-full bg-secondary" />}
      </span>
      <span>
        <p className="text-sm font-medium text-primary">{label}</p>
        <p className="text-xs text-primary/50 mt-0.5">{description}</p>
      </span>
    </button>
  );
}