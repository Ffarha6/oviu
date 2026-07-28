import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { day: "18 مايو", revenue: 620000, orders: 55 },
  { day: "23 مايو", revenue: 980000, orders: 88 },
  { day: "28 مايو", revenue: 540000, orders: 60 },
  { day: "2 يونيو", revenue: 870000, orders: 78 },
  { day: "7 يونيو", revenue: 610000, orders: 65 },
  { day: "12 يونيو", revenue: 1120000, orders: 100 },
  { day: "18 يونيو", revenue: 900000, orders: 82 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-primary/10 rounded-lg px-3 py-2 shadow-sm text-xs">
      <p className="text-primary/50 mb-1">{label}</p>
      <p className="text-primary font-semibold">{payload[0].value.toLocaleString()} ج.م</p>
      <p className="text-primary/50">{payload[1].value.toLocaleString()} طلب</p>
    </div>
  );
}

export default function RevenueOverviewChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="analyticsRevFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-primary)" strokeOpacity={0.06} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--color-primary)", fontSize: 11, opacity: 0.5 }} />
          <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: "var(--color-primary)", fontSize: 11, opacity: 0.5 }} tickFormatter={(v) => `${v / 1000}K`} />
          <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: "var(--color-primary)", fontSize: 11, opacity: 0.5 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span style={{ color: "var(--color-primary)", opacity: 0.6, fontSize: 12 }}>{value}</span>}
          />
          <Area yAxisId="left" type="monotone" dataKey="revenue" name="الإيرادات (ج.م)" stroke="var(--color-secondary)" strokeWidth={2.5} fill="url(#analyticsRevFill)" />
          <Line yAxisId="right" type="monotone" dataKey="orders" name="الطلبات" stroke="var(--color-primary)" strokeOpacity={0.4} strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}