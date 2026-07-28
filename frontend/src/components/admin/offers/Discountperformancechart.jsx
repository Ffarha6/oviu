import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const data = [
  { day: "18 مايو", amount: 12000 },
  { day: "25 مايو", amount: 18000 },
  { day: "1 يونيو", amount: 15000 },
  { day: "8 يونيو", amount: 28000 },
  { day: "15 يونيو", amount: 24000 },
  { day: "18 يونيو", amount: 48650 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-primary/10 rounded-lg px-3 py-2 shadow-sm text-xs">
      <p className="text-primary/50 mb-1">{label}</p>
      <p className="text-primary font-semibold">{payload[0].value.toLocaleString()} ج.م</p>
    </div>
  );
}

export default function DiscountPerformanceChart() {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="discountFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-primary)" strokeOpacity={0.06} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--color-primary)", fontSize: 10, opacity: 0.5 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--color-primary)", fontSize: 11, opacity: 0.5 }} tickFormatter={(v) => `${v / 1000}K`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="amount" stroke="var(--color-secondary)" strokeWidth={2.5} fill="url(#discountFill)" dot={{ r: 3, fill: "var(--color-secondary)", strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}