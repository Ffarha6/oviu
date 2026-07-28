import { Monitor, Smartphone, Tablet } from "lucide-react";

const devices = [
  { icon: Monitor, label: "كمبيوتر", count: 15836, percent: 48.1, change: "11.3%", color: "bg-secondary" },
  { icon: Smartphone, label: "موبايل", count: 16240, percent: 49.3, change: "18.7%", color: "bg-primary" },
  { icon: Tablet, label: "تابلت", count: 780, percent: 2.6, change: "5.2%", color: "bg-primary/25" },
];

export default function DeviceBreakdownPanel() {
  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {devices.map((d) => (
          <div key={d.label} className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-secondary shrink-0">
              <d.icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-primary/50">{d.label}</p>
              <p className="text-sm font-bold text-primary">{d.count.toLocaleString()} <span className="font-normal text-primary/40">({d.percent}%)</span></p>
              <p className="text-[11px] text-emerald-600">↑ {d.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="h-2.5 rounded-full overflow-hidden flex">
        {devices.map((d) => (
          <div key={d.label} className={d.color} style={{ width: `${d.percent}%` }} />
        ))}
      </div>
    </div>
  );
}