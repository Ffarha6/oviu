const inputClass =
  "w-full bg-background border border-primary/10 rounded-xl px-3.5 py-2.5 text-sm text-primary outline-none focus:border-secondary/50 transition";

const productTypes = [
  { value: "sunglasses", label: "نظارات شمسية" },
  { value: "medical", label: "نظارات طبية" },
  { value: "reading", label: "نظارات قراءة" },
  { value: "lenses", label: "عدسات لاصقة" },
];

const audiences = [
  { value: "men", label: "رجالي" },
  { value: "women", label: "حريمي" },
  { value: "unisex", label: "للجنسين" },
  { value: "kids", label: "أطفال" },
];

const lensTypes = [
  { value: "", label: "بدون تحديد" },
  { value: "glass", label: "زجاج" },
  { value: "plastic", label: "بلاستيك" },
  { value: "blue_cut", label: "بلو كت" },
  { value: "contact", label: "عدسة لاصقة" },
];

const frameShapes = [
  { value: "", label: "بدون تحديد" },
  { value: "round", label: "دائري" },
  { value: "square", label: "مربع" },
  { value: "rectangle", label: "مستطيل" },
  { value: "aviator", label: "أفياتور" },
  { value: "cat_eye", label: "عين القطة" },
];

// hasColors: لو المنتج عنده ألوان، الكمية بتتحسب تلقائيًا من مجموع كميات الألوان
// وبتتعرض للقراءة فقط هنا، والتعديل الفعلي بيبقى من تبويب "الألوان والصور"
export default function ProductBasicInfoForm({ form, onChange, hasColors }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="اسم المنتج" required>
          <input type="text" value={form.name} onChange={(e) => onChange("name", e.target.value)} className={inputClass} />
        </Field>

        <Field label="SKU (اختياري، هيتولد أوتوماتيك لو فاضي)">
          <input type="text" value={form.sku} onChange={(e) => onChange("sku", e.target.value)} dir="ltr" className={inputClass} />
        </Field>

        <Field label="الفئة" required>
          <select value={form.product_type} onChange={(e) => onChange("product_type", e.target.value)} className={inputClass}>
            {productTypes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="الجنس" required>
          <select value={form.audience} onChange={(e) => onChange("audience", e.target.value)} className={inputClass}>
            {audiences.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="نوع العدسة">
          <select value={form.lens_type || ""} onChange={(e) => onChange("lens_type", e.target.value)} className={inputClass}>
            {lensTypes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="شكل الإطار">
          <select value={form.frame_shape || ""} onChange={(e) => onChange("frame_shape", e.target.value)} className={inputClass}>
            {frameShapes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="السعر الأساسي (ج.م)" required>
          <input type="number" step="0.01" value={form.price} onChange={(e) => onChange("price", e.target.value)} className={inputClass} />
        </Field>

        <Field label="سعر الخصم (اختياري)">
          <input type="number" step="0.01" value={form.discount_price ?? ""} onChange={(e) => onChange("discount_price", e.target.value)} className={inputClass} />
        </Field>

        <Field label={hasColors ? "الكمية الإجمالية بالمخزون" : "الكمية بالمخزون"} required={!hasColors}>
          {hasColors ? (
            <div className={`${inputClass} bg-primary/5 text-primary/60 cursor-not-allowed flex items-center justify-between`}>
              <span>{form.stock ?? 0}</span>
              <span className="text-[11px] text-primary/40">بتتحسب تلقائيًا من كميات الألوان</span>
            </div>
          ) : (
            <input type="number" value={form.stock} onChange={(e) => onChange("stock", e.target.value)} className={inputClass} />
          )}
        </Field>

        <Field label="الحالة">
          <label className="flex items-center gap-2 h-[42px] px-1 text-sm text-primary/70 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => onChange("is_active", e.target.checked)} className="accent-secondary" />
            منتج مفعّل وظاهر في المتجر
          </label>
        </Field>
      </div>

      <Field label="الوصف" required>
        <textarea value={form.description} onChange={(e) => onChange("description", e.target.value)} rows={5} className={`${inputClass} resize-none`} />
      </Field>

      <div>
        <p className="text-sm font-bold text-primary mb-3">المقاسات (بالمليمتر، اختياري)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="عرض العدسة">
            <input type="number" value={form.lens_width ?? ""} onChange={(e) => onChange("lens_width", e.target.value)} className={inputClass} />
          </Field>
          <Field label="عرض الجسر">
            <input type="number" value={form.bridge_width ?? ""} onChange={(e) => onChange("bridge_width", e.target.value)} className={inputClass} />
          </Field>
          <Field label="طول الذراع">
            <input type="number" value={form.temple_length ?? ""} onChange={(e) => onChange("temple_length", e.target.value)} className={inputClass} />
          </Field>
        </div>
      </div>

      <div>
        <p className="text-sm font-bold text-primary mb-3">SEO (اختياري)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="عنون الميتا">
            <input type="text" maxLength={60} value={form.meta_title} onChange={(e) => onChange("meta_title", e.target.value)} className={inputClass} />
          </Field>
          <Field label="وصف الميتا">
            <input type="text" maxLength={160} value={form.meta_description} onChange={(e) => onChange("meta_description", e.target.value)} className={inputClass} />
          </Field>
        </div>
      </div>
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