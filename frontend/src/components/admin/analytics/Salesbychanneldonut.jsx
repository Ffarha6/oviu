import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { label: "الموقع الإلكتروني", percent: 62.7, value: 782945 },
  { label: "تطبيق الموبايل", percent: 22.3, value: 278451 },
  { label: "التجربة الافتراضية", percent: 8.4, value: 104872 },
  { label: "أخرى", percent: 6.6, value: 82294 },
];

const palette = ["var(--color-secondary)", "#D9A87C", "#E8C9AE", "#C9C4BC"];

export default function SalesByChannelDonut() {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <div className="w-36 h-36 mx-auto relative mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="percent" nameKey="label" innerRadius={48} outerRadius={66} paddingAngle={2} stroke="none">
              {data.map((entry, i) => (
                <Cell key={entry.label} fill={palette[i % palette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm font-bold text-primary">{total.toLocaleString()}</span>
          <span className="text-[11px] text-primary/50">ج.م</span>
        </div>
      </div>

      <ul className="space-y-2.5">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-primary/70">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: palette[i % palette.length] }} />
              {d.label}
            </span>
            <span className="text-xs text-primary/50 text-left shrink-0">
              {d.percent}% <span className="text-primary/30">({d.value.toLocaleString()} ج.م)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}