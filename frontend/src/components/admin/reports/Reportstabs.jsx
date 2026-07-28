export const tabs = ["نظرة عامة", "المبيعات", "الطلبات", "العملاء", "المنتجات", "التسويق", "المخزون", "المالية", "تقارير مخصصة"];

export default function ReportsTabs({ active, onChange }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-primary/10">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`whitespace-nowrap text-sm font-medium px-3.5 pb-3 -mb-px border-b-2 transition-colors ${
            active === tab ? "border-secondary text-primary" : "border-transparent text-primary/40 hover:text-primary/70"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}