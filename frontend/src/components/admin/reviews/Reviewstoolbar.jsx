import { Search, ChevronDown, RotateCcw } from "lucide-react";

const statusOptions = [
  { value: "", label: "كل الحالات" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "approved", label: "معتمد" },
  { value: "rejected", label: "مرفوض" },
];

const ratingOptions = [
  { value: "", label: "كل التقييمات" },
  { value: "5", label: "5 نجوم" },
  { value: "4", label: "4 نجوم" },
  { value: "3", label: "3 نجوم" },
  { value: "2", label: "نجمتان" },
  { value: "1", label: "نجمة واحدة" },
];

export default function ReviewsToolbar({ search, onSearchChange, status, onStatusChange, rating, onRatingChange, onReset }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5">
        <Search size={16} className="text-primary/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحثي في التقييمات أو المنتجات..."
          className="bg-transparent outline-none text-sm flex-1 text-primary placeholder:text-primary/40"
        />
      </div>

      <SelectField value={status} onChange={onStatusChange} options={statusOptions} />
      <SelectField value={rating} onChange={onRatingChange} options={ratingOptions} />

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