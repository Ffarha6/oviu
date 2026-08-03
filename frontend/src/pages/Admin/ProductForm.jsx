import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Save, Loader2 } from "lucide-react";

import api from "../../api/axios";
import SectionCard from "../../components/admin/shared/SectionCard";
import ProductBasicInfoForm from "../../components/admin/products/ProductBasicInfoForm";
import ProductColorsManager from "../../components/admin/products/ProductColorsManager";

const emptyProduct = {
  name: "",
  sku: "",
  product_type: "sunglasses",
  audience: "unisex",
  lens_type: "",
  frame_shape: "",
  price: "",
  discount_price: "",
  stock: 0,
  description: "",
  lens_width: "",
  bridge_width: "",
  temple_length: "",
  meta_title: "",
  meta_description: "",
  is_active: true,
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState(emptyProduct);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEditMode) return;
    api.get(`/admin/products/${id}/`)
      .then((res) => {
        const data = res.data;
        setForm({
          name: data.name || "",
          sku: data.sku || "",
          product_type: data.product_type || "sunglasses",
          audience: data.audience || "unisex",
          lens_type: data.lens_type || "",
          frame_shape: data.frame_shape || "",
          price: data.price ?? "",
          discount_price: data.discount_price ?? "",
          stock: data.stock ?? 0,
          description: data.description || "",
          lens_width: data.lens_width ?? "",
          bridge_width: data.bridge_width ?? "",
          temple_length: data.temple_length ?? "",
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || "",
          is_active: data.is_active,
        });
        setColors(data.colors || []);
      })
      .catch((err) => console.error("فشل تحميل بيانات المنتج:", err))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});

    // تنظيف الحقول الاختيارية الفاضية عشان الباك اند مايرفضهاش
    const payload = { ...form };
    ["discount_price", "lens_width", "bridge_width", "temple_length"].forEach((f) => {
      if (payload[f] === "") payload[f] = null;
    });
    if (!payload.sku) delete payload.sku; // خليه يتولد أوتوماتيك لو فاضي

    try {
      if (isEditMode) {
        await api.patch(`/admin/products/${id}/`, payload);
        navigate("/dashboard/products");
      } else {
        const res = await api.post("/dashboard/products/", payload);
        // بعد الإنشاء، حوّليها لوضع التعديل لنفس المنتج عشان تضيف الألوان والصور
        navigate(`/admin/products/${res.data.id}/edit`, { replace: true });
      }
    } catch (err) {
      console.error("فشل حفظ المنتج:", err);
      if (err.response?.data) setErrors(err.response.data);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center text-sm text-primary/40 py-20">جاري تحميل بيانات المنتج...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {isEditMode ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/dashboard" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <Link to="/dashboard/products" className="hover:text-secondary">المنتجات</Link>
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
          {isEditMode ? "حفظ التعديلات" : "حفظ ومتابعة"}
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

      <div className="flex items-center gap-2 border-b border-primary/10">
        <TabBtn label="البيانات الأساسية" active={activeTab === "basic"} onClick={() => setActiveTab("basic")} />
        <TabBtn
          label="الألوان والصور"
          active={activeTab === "colors"}
          onClick={() => setActiveTab("colors")}
          disabled={!isEditMode}
          disabledHint="احفظي البيانات الأساسية الأول"
        />
      </div>

      {activeTab === "basic" && (
        <SectionCard>
          <ProductBasicInfoForm form={form} onChange={handleChange} />
        </SectionCard>
      )}

      {activeTab === "colors" && isEditMode && (
        <ProductColorsManager productId={id} colors={colors} onColorsChange={setColors} />
      )}
    </div>
  );
}

function TabBtn({ label, active, onClick, disabled, disabledHint }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={disabled ? disabledHint : undefined}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
        active
          ? "border-secondary text-primary"
          : disabled
          ? "border-transparent text-primary/25 cursor-not-allowed"
          : "border-transparent text-primary/50 hover:text-primary"
      }`}
    >
      {label}
    </button>
  );
}