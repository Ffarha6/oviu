import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { label: "نظارات شمسية", percent: 40.2, value: 502215 },
  { label: "نظارات طبية", percent: 27.6, value: 344568 },
  { label: "عدسات لاصقة", percent: 15.3, value: 191284 },
  { label: "إكسسوارات", percent: 11.8, value: 147200 },
  { label: "أخرى", percent: 5.1, value: 63295 },
];

const palette = ["var(--color-secondary)", "#8C6A52", "#E8C9AE", "#7A9B76", "#C9C4BC"];

export default function SalesByCategoryDonut() {
  return (
    <div>
      <div className="w-36 h-36 mx-auto mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="percent" nameKey="label" innerRadius={48} outerRadius={66} paddingAngle={2} stroke="none">
              {data.map((entry, i) => (
                <Cell key={entry.label} fill={palette[i % palette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
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