import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { label: "فعّال", count: 12, percent: 50, color: "#7A9B76" },
  { label: "مجدول", count: 5, percent: 20.8, color: "var(--color-secondary)" },
  { label: "منتهي", count: 7, percent: 29.2, color: "#E4867A" },
];

export default function OffersOverviewDonut() {
  return (
    <div className="flex items-center gap-6">
      <div className="w-32 h-32 shrink-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="percent" nameKey="label" innerRadius={44} outerRadius={62} paddingAngle={2} stroke="none">
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-primary">24</span>
          <span className="text-[10px] text-primary/50">إجمالي العروض</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2.5">
        {data.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-primary/70">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              {d.label}
            </span>
            <span className="text-xs text-primary/50">{d.count} ({d.percent}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}