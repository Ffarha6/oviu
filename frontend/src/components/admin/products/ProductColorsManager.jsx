import { useState, useMemo } from "react";
import { Plus, Trash2, Upload, Star, X, Loader2, Palette } from "lucide-react";
import api from "../../../api/axios";
import SectionCard from "../shared/SectionCard";

// خريطة أسماء الألوان العربية الشائعة → كود الهيكس
// كل ما المستخدم يكتب اسم قريب من دول، الدائرة والكود بيتحدثوا تلقائي
const COLOR_NAME_MAP = {
  "أسود": "#000000", "اسود": "#000000",
  "أبيض": "#FFFFFF", "ابيض": "#FFFFFF",
  "أحمر": "#DC2626", "احمر": "#DC2626",
  "أزرق": "#2563EB", "ازرق": "#2563EB",
  "أزرق فاتح": "#60A5FA", "ازرق فاتح": "#60A5FA", "سماوي": "#38BDF8",
  "أزرق غامق": "#1E3A8A", "ازرق غامق": "#1E3A8A", "كحلي": "#1E3A8A",
  "أخضر": "#16A34A", "اخضر": "#16A34A",
  "أخضر فاتح": "#4ADE80", "اخضر فاتح": "#4ADE80",
  "أخضر غامق": "#166534", "اخضر غامق": "#166534", "زيتي": "#65733F",
  "أصفر": "#EAB308", "اصفر": "#EAB308",
  "برتقالي": "#EA580C",
  "بنفسجي": "#9333EA", "موف": "#A855F7",
  "وردي": "#EC4899", "روز": "#F472B6",
  "بني": "#78350F", "بني فاتح": "#A16207", "بني غامق": "#451A03",
  "بيج": "#E8DCC8", "كريمي": "#F5F0E1",
  "رمادي": "#6B7280", "رصاصي": "#6B7280",
  "رمادي فاتح": "#D1D5DB", "رمادي غامق": "#374151",
  "ذهبي": "#D4AF37", "دهبي": "#D4AF37",
  "فضي": "#C0C0C0",
  "خمري": "#7F1D1D", "نبيتي": "#7F1D1D",
  "تركواز": "#14B8A6", "فيروزي": "#14B8A6",
  "شفاف": "#F1F5F9",
};

// بيدور على أقرب تطابق: تطابق كامل الأول، بعدين لو الاسم بيحتوي على كلمة من القاموس
function matchColorFromName(name) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  if (COLOR_NAME_MAP[trimmed]) return COLOR_NAME_MAP[trimmed];

  // ابحثي عن أطول اسم موجود في القاموس يظهر جوه النص المكتوب
  const candidates = Object.keys(COLOR_NAME_MAP)
    .filter((key) => trimmed.includes(key))
    .sort((a, b) => b.length - a.length);

  return candidates.length > 0 ? COLOR_NAME_MAP[candidates[0]] : null;
}

// حالة المخزون بتاعة اللون نفسه، مش المنتج ككل
function getStockStatus(stock) {
  const n = Number(stock) || 0;
  if (n <= 0) return { label: "غير متوفر", className: "text-red-600 bg-red-50" };
  if (n <= 3) return { label: "مخزون منخفض", className: "text-amber-600 bg-amber-50" };
  return { label: "متوفر", className: "text-emerald-600 bg-emerald-50" };
}

export default function ProductColorsManager({ productId, colors, onColorsChange }) {
  const [newColorName, setNewColorName] = useState("");
  const [newColorCode, setNewColorCode] = useState("#CCCCCC");
  const [newColorStock, setNewColorStock] = useState(0);
  const [codeManuallySet, setCodeManuallySet] = useState(false);
  const [addingColor, setAddingColor] = useState(false);
  const [savingStockId, setSavingStockId] = useState(null);

  const matchedAutomatically = useMemo(
    () => !codeManuallySet && matchColorFromName(newColorName),
    [newColorName, codeManuallySet]
  );

  // إجمالي الكمية = مجموع كميات كل الألوان (للعرض فقط هنا، القيمة الفعلية بتتحسب في الباك اند)
  const totalStock = useMemo(
    () => colors.reduce((sum, c) => sum + (Number(c.stock) || 0), 0),
    [colors]
  );

  const handleNameChange = (value) => {
    setNewColorName(value);
    if (!codeManuallySet) {
      const matched = matchColorFromName(value);
      if (matched) setNewColorCode(matched);
    }
  };

  const handleManualColorChange = (value) => {
    setNewColorCode(value);
    setCodeManuallySet(true);
  };

  const resetForm = () => {
    setNewColorName("");
    setNewColorCode("#CCCCCC");
    setNewColorStock(0);
    setCodeManuallySet(false);
  };

  const handleAddColor = async () => {
    if (!newColorName.trim()) return;
    setAddingColor(true);
    try {
      const res = await api.post(`/dashboard/products/${productId}/colors/`, {
        name: newColorName.trim(),
        code: newColorCode,
        stock: Number(newColorStock) || 0,
      });
      onColorsChange([...colors, { ...res.data, images: [] }]);
      resetForm();
    } catch (err) {
      console.error("فشل إضافة اللون:", err);
      alert("مقدرناش نضيف اللون، جربي اسم مختلف");
    } finally {
      setAddingColor(false);
    }
  };

  const handleDeleteColor = async (colorId) => {
    if (!confirm("هل تريدين حذف هذا اللون وكل صوره؟")) return;
    try {
      await api.delete(`/dashboard/products/colors/${colorId}/`);
      onColorsChange(colors.filter((c) => c.id !== colorId));
    } catch (err) {
      console.error("فشل حذف اللون:", err);
    }
  };

  // تحديث كمية لون معين لوحده
  const handleUpdateStock = async (colorId, newStock) => {
    const value = Math.max(0, Number(newStock) || 0);
    setSavingStockId(colorId);
    try {
      await api.patch(`/dashboard/products/colors/${colorId}/`, { stock: value });
      onColorsChange(
        colors.map((c) => (c.id === colorId ? { ...c, stock: value } : c))
      );
    } catch (err) {
      console.error("فشل تحديث الكمية:", err);
      alert("مقدرناش نحدث الكمية، حاولي تاني");
    } finally {
      setSavingStockId(null);
    }
  };

  const handleUploadImage = async (colorId, file) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("is_primary", (colors.find((c) => c.id === colorId)?.images || []).length === 0);
    try {
      const res = await api.post(`/dashboard/products/colors/${colorId}/images/`, formData);
      onColorsChange(
        colors.map((c) => (c.id === colorId ? { ...c, images: [...(c.images || []), res.data] } : c))
      );
    } catch (err) {
      console.error("فشل رفع الصورة:", err);
    }
  };

  const handleDeleteImage = async (colorId, imageId) => {
    try {
      await api.delete(`/dashboard/products/images/${imageId}/`);
      onColorsChange(
        colors.map((c) =>
          c.id === colorId ? { ...c, images: c.images.filter((img) => img.id !== imageId) } : c
        )
      );
    } catch (err) {
      console.error("فشل حذف الصورة:", err);
    }
  };

  const handleSetPrimary = async (colorId, imageId) => {
    try {
      await api.patch(`/dashboard/products/images/${imageId}/`, { is_primary: true });
      onColorsChange(
        colors.map((c) =>
          c.id === colorId
            ? { ...c, images: c.images.map((img) => ({ ...img, is_primary: img.id === imageId })) }
            : c
        )
      );
    } catch (err) {
      console.error("فشل تحديد الصورة الرئيسية:", err);
    }
  };

  return (
    <div className="space-y-4">
      <SectionCard title="إضافة لون جديد">
        <div className="flex flex-wrap items-end gap-4">
          {/* دائرة اللون — بتتلون تلقائي حسب اسم اللون المكتوب، وقابلة للتعديل اليدوي لو محتاجة */}
          <div className="flex flex-col items-center gap-1.5">
            <label className="relative cursor-pointer group" title="اضغطي لاختيار لون يدويًا">
              <div
                className="w-14 h-14 rounded-full border-2 border-primary/10 shadow-sm group-hover:scale-105 transition"
                style={{ background: newColorCode }}
              />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-primary text-background flex items-center justify-center border-2 border-background">
                <Palette size={11} />
              </div>
              <input
                type="color"
                value={newColorCode}
                onChange={(e) => handleManualColorChange(e.target.value)}
                className="absolute inset-0 w-14 h-14 opacity-0 cursor-pointer"
              />
            </label>
            <span dir="ltr" className="text-[11px] font-mono text-primary/50">
              {newColorCode.toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-medium text-primary/60 mb-1.5">اسم اللون</label>
            <input
              type="text"
              value={newColorName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="مثال: أسود، أزرق كحلي، بني فاتح..."
              className="w-full bg-background border border-primary/10 rounded-xl px-3.5 py-2.5 text-sm text-primary outline-none focus:border-secondary/50 transition"
            />
            {newColorName.trim() && (
              <p className="text-[11px] mt-1.5">
                {matchedAutomatically ? (
                  <span className="text-emerald-600">✓ اتعرّف على اللون تلقائيًا</span>
                ) : (
                  <span className="text-amber-600">اللون مش معروف، اضغطي على الدائرة لاختيار الكود يدويًا</span>
                )}
              </p>
            )}
          </div>

          <div className="w-28">
            <label className="block text-xs font-medium text-primary/60 mb-1.5">الكمية</label>
            <input
              type="number"
              min={0}
              value={newColorStock}
              onChange={(e) => setNewColorStock(e.target.value)}
              className="w-full bg-background border border-primary/10 rounded-xl px-3.5 py-2.5 text-sm text-primary outline-none focus:border-secondary/50 transition"
            />
          </div>

          <button
            onClick={handleAddColor}
            disabled={addingColor || !newColorName.trim()}
            className="flex items-center gap-1.5 bg-primary text-background text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {addingColor ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            إضافة لون
          </button>
        </div>
      </SectionCard>

      {colors.length === 0 && (
        <p className="text-center text-sm text-primary/40 py-8">لسه مفيش ألوان مضافة لهذا المنتج</p>
      )}

      {colors.length > 0 && (
        <div className="flex items-center justify-between bg-surface/60 rounded-xl px-4 py-2.5">
          <span className="text-xs text-primary/50">إجمالي الكمية بكل الألوان</span>
          <span className="text-sm font-bold text-primary">{totalStock}</span>
        </div>
      )}

      {colors.map((color) => {
        const stockStatus = getStockStatus(color.stock);
        return (
          <SectionCard key={color.id}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-7 h-7 rounded-full border border-primary/10 shrink-0 shadow-sm"
                  style={{ background: color.code || color.hex_code }}
                />
                <div>
                  <p className="font-medium text-primary leading-tight">{color.name}</p>
                  <p dir="ltr" className="text-[11px] font-mono text-primary/40">
                    {(color.code || color.hex_code || "").toUpperCase()}
                  </p>
                </div>
                <span className="text-xs text-primary/40">· {(color.images || []).length} صور</span>
              </div>

              <div className="flex items-center gap-3">
                {/* كمية المخزون الخاصة بهذا اللون فقط */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-primary/50">الكمية:</label>
                  <input
                    type="number"
                    min={0}
                    defaultValue={color.stock ?? 0}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (val !== (color.stock ?? 0)) handleUpdateStock(color.id, val);
                    }}
                    className="w-20 bg-background border border-primary/10 rounded-lg px-2 py-1.5 text-sm text-primary outline-none focus:border-secondary/50 transition"
                  />
                  {savingStockId === color.id && (
                    <Loader2 size={13} className="animate-spin text-primary/40" />
                  )}
                </div>

                <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${stockStatus.className}`}>
                  {stockStatus.label}
                </span>

                <button
                  onClick={() => handleDeleteColor(color.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition"
                  aria-label="حذف اللون"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {(color.images || []).map((img) => (
                <div key={img.id} className="relative w-24 h-24 rounded-xl overflow-hidden border border-primary/10 group">
                  <img src={img.url} alt={img.alt_text || color.name} className="w-full h-full object-cover" />
                  {img.is_primary && (
                    <span className="absolute top-1 right-1 bg-secondary text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star size={9} fill="currentColor" /> رئيسية
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                    {!img.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(color.id, img.id)}
                        title="تحديد كصورة رئيسية"
                        className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-primary"
                      >
                        <Star size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteImage(color.id, img.id)}
                      title="حذف الصورة"
                      className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-red-500"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}

              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-primary/15 flex flex-col items-center justify-center gap-1.5 text-primary/40 cursor-pointer hover:border-secondary hover:text-secondary transition">
                <Upload size={18} />
                <span className="text-[11px]">رفع صور</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadImage(color.id, file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}