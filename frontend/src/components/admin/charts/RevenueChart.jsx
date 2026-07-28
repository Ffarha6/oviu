import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { month: "يناير", revenue: 300000, orders: 900 },
  { month: "فبراير", revenue: 420000, orders: 1050 },
  { month: "مارس", revenue: 480000, orders: 1150 },
  { month: "أبريل", revenue: 600000, orders: 1250 },
  { month: "مايو", revenue: 980000, orders: 1550 },
  { month: "يونيو", revenue: 900000, orders: 1450 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-primary/10 rounded-lg px-3 py-2 shadow-sm text-xs">
      <p className="text-primary/50 mb-1">{label}</p>
      <p className="text-primary font-semibold">
        {payload[0].value.toLocaleString()} ج.م
      </p>
      <p className="text-primary/50">{payload[1].value.toLocaleString()} طلب</p>
    </div>
  );
}

export default function RevenueChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-primary)" strokeOpacity={0.06} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-primary)", fontSize: 12, opacity: 0.5 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-primary)", fontSize: 12, opacity: 0.5 }}
            tickFormatter={(v) => `${v / 1000}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-secondary)"
            strokeWidth={2.5}
            fill="url(#revenueFill)"
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="var(--color-primary)"
            strokeOpacity={0.35}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}