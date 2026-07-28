import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { day: "19 مايو", sessions: 480 },
  { day: "22 مايو", sessions: 560 },
  { day: "24 مايو", sessions: 410 },
  { day: "27 مايو", sessions: 620 },
  { day: "29 مايو", sessions: 540 },
  { day: "1 يونيو", sessions: 690 },
  { day: "3 يونيو", sessions: 580 },
  { day: "5 يونيو", sessions: 750 },
  { day: "8 يونيو", sessions: 721 },
  { day: "10 يونيو", sessions: 640 },
  { day: "13 يونيو", sessions: 810 },
  { day: "15 يونيو", sessions: 700 },
  { day: "18 يونيو", sessions: 860 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-primary/10 rounded-lg px-3 py-2 shadow-sm text-xs">
      <p className="text-primary/50 mb-1">{label}</p>
      <p className="text-primary font-semibold">{payload[0].value.toLocaleString()} جلسة</p>
    </div>
  );
}

export default function TryOnSessionsChart() {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="sessionsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-primary)" strokeOpacity={0.06} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            interval={2}
            tick={{ fill: "var(--color-primary)", fontSize: 11, opacity: 0.5 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-primary)", fontSize: 12, opacity: 0.5 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="var(--color-secondary)"
            strokeWidth={2.5}
            fill="url(#sessionsFill)"
            dot={{ r: 2, fill: "var(--color-secondary)", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}