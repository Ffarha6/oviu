import { Link } from "react-router-dom";
import { Eye, Pencil, MoreVertical, Mars, Venus, VenusAndMars, Baby } from "lucide-react";

const categoryLabels = {
  sunglasses: "نظارات شمسية",
  medical: "نظارات طبية",
  reading: "نظارات قراءة",
  lenses: "عدسات لاصقة",
};

const categoryStyles = {
  sunglasses: "bg-red-50 text-red-600",
  medical: "bg-indigo-50 text-indigo-600",
  reading: "bg-amber-50 text-amber-700",
  lenses: "bg-emerald-50 text-emerald-700",
};

const genderIcon = { men: Mars, women: Venus, unisex: VenusAndMars, kids: Baby };
const genderLabel = { men: "رجالي", women: "حريمي", unisex: "للجنسين", kids: "أطفال" };

const stockStyles = {
  in: { label: "متوفر", className: "text-emerald-600" },
  low: { label: "مخزون منخفض", className: "text-amber-600" },
  out: { label: "غير متوفر", className: "text-red-600" },
};

// ✅ selectedIds / onToggleOne / onToggleAll اختياريين — لو الصفحة اللي بتستخدم
// الجدول مش محتاجة اختيار جماعي، الجدول بيشتغل عادي زي الأول من غيرهم
export default function ProductsTable({
  products,
  loading,
  onToggleStatus,
  selectedIds = [],
  onToggleOne,
  onToggleAll,
}) {
  if (loading) {
    return <p className="text-center text-sm text-primary/40 py-10">جاري تحميل المنتجات...</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-center text-sm text-primary/40 py-10">مفيش منتجات لعرضها</p>;
  }

  const allSelected = products.length > 0 && selectedIds.length === products.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-primary/40 text-xs border-b border-primary/10">
            <th className="py-3 pr-2 text-right w-8">
              <input
                type="checkbox"
                className="accent-secondary"
                checked={allSelected}
                onChange={() => onToggleAll?.()}
              />
            </th>
            <th className="py-3 text-right font-medium">المنتج</th>
            <th className="py-3 text-right font-medium">SKU</th>
            <th className="py-3 text-right font-medium">الفئة</th>
            <th className="py-3 text-right font-medium">الجنس</th>
            <th className="py-3 text-right font-medium">السعر</th>
            <th className="py-3 text-right font-medium">الخصم</th>
            <th className="py-3 text-right font-medium">المخزون</th>
            <th className="py-3 text-right font-medium">الحالة</th>
            <th className="py-3 text-right font-medium">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const GenderIcon = genderIcon[p.audience] || VenusAndMars;
            const stock = stockStyles[p.stock_status] || stockStyles.in;
            return (
              <tr key={p.id} className="border-b border-primary/5 last:border-0">
                <td className="py-3.5 pr-2">
                  <input
                    type="checkbox"
                    className="accent-secondary"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => onToggleOne?.(p.id)}
                  />
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-xl shrink-0 overflow-hidden">
                      {p.primary_image ? (
                        <img src={p.primary_image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        "👓"
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-primary">{p.name}</p>
                      {p.colors_count > 0 && <p className="text-xs text-primary/40">{p.colors_count} ألوان</p>}
                    </div>
                  </div>
                </td>
                <td className="py-3.5 text-primary/60" dir="ltr">{p.sku}</td>
                <td className="py-3.5">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${categoryStyles[p.product_type] || "bg-primary/10 text-primary/60"}`}>
                    {categoryLabels[p.product_type] || p.product_type}
                  </span>
                </td>
                <td className="py-3.5">
                  <span className="flex items-center gap-1.5 text-primary/60">
                    <GenderIcon size={14} />
                    {genderLabel[p.audience] || p.audience}
                  </span>
                </td>
                <td className="py-3.5">
                  <p className="font-semibold text-primary">{Number(p.current_price).toLocaleString()} ج.م</p>
                  {p.discount_price && (
                    <p className="text-xs text-primary/30 line-through">{Number(p.price).toLocaleString()} ج.م</p>
                  )}
                </td>
                <td className="py-3.5">
                  {p.discount_percent ? (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      {p.discount_percent}%
                    </span>
                  ) : (
                    <span className="text-primary/30">—</span>
                  )}
                </td>
                <td className="py-3.5">
                  <p className="font-medium text-primary">{p.stock}</p>
                  <p className={`text-xs ${stock.className}`}>{stock.label}</p>
                </td>
                <td className="py-3.5">
                  <button
                    onClick={() => onToggleStatus(p.id)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${
                      p.is_active ? "bg-emerald-500" : "bg-primary/15"
                    }`}
                    aria-label="تفعيل/إيقاف المنتج"
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        p.is_active ? "left-0.5" : "right-0.5"
                      }`}
                    />
                  </button>
                  <p className="text-[11px] text-primary/40 mt-1">{p.is_active ? "مفعل" : "غير مفعل"}</p>
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-1">
                    <IconLink to={`/dashboard/products/${p.id}/edit`} icon={Eye} label="عرض" />
                    <IconLink to={`/dashboard/products/${p.id}/edit`} icon={Pencil} label="تعديل" />
                    <IconBtn icon={MoreVertical} label="المزيد" />
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

function IconBtn({ icon: Icon, label, onClick }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-primary/50 hover:bg-surface hover:text-primary transition"
    >
      <Icon size={15} />
    </button>
  );
}

function IconLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-primary/50 hover:bg-surface hover:text-primary transition"
    >
      <Icon size={15} />
    </Link>
  );
}