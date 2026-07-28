import { Search, ChevronDown, Calendar, SlidersHorizontal, RotateCcw } from "lucide-react";

export default function PaymentsToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5">
        <Search size={16} className="text-primary/40" />
        <input
          type="text"
          placeholder="ابحثي عن دفعة، رقم طلب، أو عميل..."
          className="bg-transparent outline-none text-sm flex-1 text-primary placeholder:text-primary/40"
        />
      </div>

      <Dropdown label="كل الحالات" />

      <button className="flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5 text-sm text-primary/70">
        <Calendar size={15} className="text-secondary" />
        18 مايو – 18 يونيو 2025
        <ChevronDown size={14} className="text-primary/40" />
      </button>

      <Dropdown label="كل طرق الدفع" />

      <button className="flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5 text-sm text-primary/70">
        <SlidersHorizontal size={15} />
        فلاتر إضافية
      </button>

      <button className="flex items-center gap-2 text-sm text-primary/50 px-3 py-2.5">
        <RotateCcw size={14} />
        إعادة تعيين
      </button>
    </div>
  );
}

function Dropdown({ label }) {
  return (
    <button className="flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5 text-sm text-primary/70 min-w-[130px] justify-between">
      {label}
      <ChevronDown size={14} className="text-primary/40" />
    </button>
  );
}