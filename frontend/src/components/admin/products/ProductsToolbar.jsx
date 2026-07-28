import { Search, ChevronDown, List, LayoutGrid } from "lucide-react";

const categories = [
  { value: "", label: "كل الفئات" },
  { value: "sunglasses", label: "نظارات شمسية" },
  { value: "medical", label: "نظارات طبية" },
  { value: "reading", label: "نظارات قراءة" },
  { value: "lenses", label: "عدسات لاصقة" },
];

const stockOptions = [
  { value: "", label: "كل حالات المخزون" },
  { value: "in", label: "متوفر" },
  { value: "low", label: "مخزون منخفض" },
  { value: "out", label: "غير متوفر" },
];

// ✅ ملحوظة: مفيش Brand model في الباك اند دلوقتي، فبدّلنا فلتر "الماركة"
// بفلتر "حالة المخزون" اللي عندنا بيانات حقيقية ليه.
export default function ProductsToolbar({ view, onViewChange, search, onSearchChange, category, onCategoryChange, stockStatus, onStockStatusChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5">
        <Search size={16} className="text-primary/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحثي عن منتج بالاسم أو الـ SKU..."
          className="bg-transparent outline-none text-sm flex-1 text-primary placeholder:text-primary/40"
        />
      </div>

      <SelectDropdown value={category} onChange={onCategoryChange} options={categories} />
      <SelectDropdown value={stockStatus} onChange={onStockStatusChange} options={stockOptions} />

      <div className="flex items-center gap-1 bg-background border border-primary/10 rounded-xl p-1">
        <button
          onClick={() => onViewChange("list")}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
            view === "list" ? "bg-secondary text-primary" : "text-primary/40"
          }`}
          aria-label="عرض قائمة"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => onViewChange("grid")}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
            view === "grid" ? "bg-secondary text-primary" : "text-primary/40"
          }`}
          aria-label="عرض كروت"
        >
          <LayoutGrid size={16} />
        </button>
      </div>
    </div>
  );
}

function SelectDropdown({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-background border border-primary/10 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-primary/70 min-w-[150px] cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="text-primary/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}