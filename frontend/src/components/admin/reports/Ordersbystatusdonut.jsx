import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { label: "تم التوصيل", percent: 64.4, count: 1582, color: "#7A9B76" },
  { label: "قيد المعالجة", percent: 22.1, count: 542, color: "var(--color-secondary)" },
  { label: "تم الشحن", percent: 8.3, count: 201, color: "#D9A87C" },
  { label: "ملغي", percent: 3.6, count: 89, color: "#E4867A" },
  { label: "مرتجع", percent: 1.7, count: 42, color: "#8C6A52" },
];

export default function OrdersByStatusDonut() {
  return (
    <div>
      <div className="w-40 h-40 mx-auto relative mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="percent" nameKey="label" innerRadius={54} outerRadius={72} paddingAngle={2} stroke="none">
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-primary">2,456</span>
          <span className="text-[11px] text-primary/50">إجمالي الطلبات</span>
        </div>
      </div>
      <ul className="space-y-2.5">
        {data.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-primary/70">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              {d.label}
            </span>
            <span className="text-xs text-primary/50">{d.count.toLocaleString()} ({d.percent}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}