import { Search, ChevronDown, SlidersHorizontal, Download } from "lucide-react";

export default function OffersToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5">
        <Search size={16} className="text-primary/40" />
        <input
          type="text"
          placeholder="ابحثي عن عرض بالاسم أو الكود..."
          className="bg-transparent outline-none text-sm flex-1 text-primary placeholder:text-primary/40"
        />
      </div>

      <Dropdown label="كل الحالات" />
      <Dropdown label="كل الأنواع" />
      <Dropdown label="كل القنوات" />

      <button className="flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5 text-sm text-primary/70">
        <SlidersHorizontal size={15} />
        فلاتر إضافية
      </button>

      <button className="w-10 h-10 rounded-xl bg-background border border-primary/10 flex items-center justify-center text-primary/50 shrink-0">
        <Download size={15} />
      </button>
    </div>
  );
}

function Dropdown({ label }) {
  return (
    <button className="flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5 text-sm text-primary/70 min-w-[120px] justify-between">
      {label}
      <ChevronDown size={14} className="text-primary/40" />
    </button>
  );
}