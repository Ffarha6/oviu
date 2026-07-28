import { Tag, Layers, VenusAndMars, Aperture, Square, SlidersHorizontal, PackageCheck, CircleCheck } from "lucide-react";

export default function ProductFiltersSidebar() {
  return (
    <aside className="bg-surface rounded-2xl p-5 flex flex-col gap-5 w-full lg:w-72 shrink-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-primary">الفلاتر</h3>
        <button className="text-xs font-medium text-red-500 hover:underline">إعادة تعيين الكل</button>
      </div>

      <FilterSelect icon={Tag} label="الفئة" placeholder="كل الفئات" />
      <FilterSelect icon={Layers} label="الماركة" placeholder="كل الماركات" />
      <FilterSelect icon={VenusAndMars} label="الجنس" placeholder="كل الأجناس" />
      <FilterSelect icon={Aperture} label="نوع العدسة" placeholder="كل الأنواع" />
      <FilterSelect icon={Square} label="شكل الإطار" placeholder="كل الأشكال" />

      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
          <SlidersHorizontal size={15} className="text-secondary" /> نطاق السعر
        </p>
        <input type="range" className="w-full accent-secondary" />
        <div className="flex items-center justify-between text-xs text-primary/50 mt-1">
          <span>0 ج.م</span>
          <span>+5,000 ج.م</span>
        </div>
      </div>

      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
          <PackageCheck size={15} className="text-secondary" /> حالة المخزون
        </p>
        <div className="space-y-2">
          <CheckboxRow label="متوفر" />
          <CheckboxRow label="مخزون منخفض" />
          <CheckboxRow label="غير متوفر" />
        </div>
      </div>

      <FilterSelect icon={CircleCheck} label="الحالة" placeholder="كل الحالات" />

      <div className="space-y-2">
        <ToggleRow label="مميز" />
        <ToggleRow label="عليه خصم" />
      </div>

      <button className="w-full bg-primary text-background text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition">
        تطبيق الفلاتر
      </button>
    </aside>
  );
}

function FilterSelect({ icon: Icon, label, placeholder }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
        <Icon size={15} className="text-secondary" /> {label}
      </p>
      <button className="w-full flex items-center justify-between bg-background border border-primary/10 rounded-lg px-3 py-2 text-sm text-primary/60">
        {placeholder}
        <span className="text-primary/30">▾</span>
      </button>
    </div>
  );
}

function CheckboxRow({ label }) {
  return (
    <label className="flex items-center gap-2 text-sm text-primary/70 cursor-pointer">
      <input type="checkbox" className="accent-secondary" />
      {label}
    </label>
  );
}

function ToggleRow({ label }) {
  return (
    <label className="flex items-center justify-between text-sm text-primary/70 cursor-pointer">
      {label}
      <input type="checkbox" className="accent-secondary" />
    </label>
  );
}