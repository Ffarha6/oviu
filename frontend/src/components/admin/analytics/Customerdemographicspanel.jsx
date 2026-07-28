import { Globe2 } from "lucide-react";

const countries = [
  { name: "مصر", count: 7648, percent: "87.6%" },
  { name: "السعودية", count: 583, percent: "6.7%" },
  { name: "الإمارات", count: 286, percent: "3.3%" },
  { name: "الكويت", count: 145, percent: "1.6%" },
  { name: "أخرى", count: 70, percent: "0.8%" },
];

export default function CustomerDemographicsPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p className="text-xs font-bold text-primary/50 mb-3">أكثر الدول</p>
        <ul className="space-y-2.5">
          {countries.map((c) => (
            <li key={c.name} className="flex items-center justify-between text-sm">
              <span className="text-primary">{c.name}</span>
              <span className="text-primary/50">
                {c.count.toLocaleString()} <span className="text-primary/30">({c.percent})</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-background flex items-center justify-center min-h-[160px]">
        <div className="flex flex-col items-center gap-1.5 text-primary/30">
          <Globe2 size={32} />
          <span className="text-xs">خريطة توزيع العملاء</span>
        </div>
      </div>
    </div>
  );
}