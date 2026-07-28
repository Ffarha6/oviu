import { Search, ChevronDown, RotateCcw } from "lucide-react";

const statusOptions = [
  { value: "", label: "كل الحالات" },
  { value: "active", label: "فعّال" },
  { value: "scheduled", label: "مجدول" },
  { value: "expired", label: "منتهي" },
  { value: "inactive", label: "موقوف" },
];

const typeOptions = [
  { value: "", label: "كل الأنواع" },
  { value: "percentage", label: "نسبة مئوية" },
  { value: "fixed", label: "قيمة ثابتة" },
];

export default function CouponsToolbar({ search, onSearchChange, status, onStatusChange, discountType, onDiscountTypeChange, onReset }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5">
        <Search size={16} className="text-primary/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحثي بالكود أو الاسم..."
          className="bg-transparent outline-none text-sm flex-1 text-primary placeholder:text-primary/40"
        />
      </div>

      <SelectField value={status} onChange={onStatusChange} options={statusOptions} />
      <SelectField value={discountType} onChange={onDiscountTypeChange} options={typeOptions} />

      <button onClick={onReset} className="flex items-center gap-2 text-sm text-primary/50 px-3 py-2.5 hover:text-primary transition">
        <RotateCcw size={14} />
        إعادة تعيين
      </button>
    </div>
  );
}

function SelectField({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-background border border-primary/10 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-primary/70 min-w-[130px] cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="text-primary/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}