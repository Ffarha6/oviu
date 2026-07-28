import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

// title: عنوان صغير, value: الرقم الأساسي, change: نسبة التغيير, trend: "up" | "down"
// icon: أيقونة lucide, sparklineData: array بسيطة زي [{v:10},{v:14},{v:12}...]
export default function StatCard({
  icon: Icon,
  title,
  value,
  change,
  trend = "up",
  sparklineData,
}) {
  const isUp = trend === "up";

  return (
    <div className="bg-surface rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-primary/50 truncate">{title}</p>
          <p className="text-xl font-bold text-primary leading-tight">
            {value}
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <span
          className={`flex items-center gap-0.5 text-xs font-semibold ${
            isUp ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change} <span className="text-primary/40 font-normal">مقارنة بآخر 30 يوم</span>
        </span>
      </div>

      {sparklineData && (
        <div className="h-10 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="var(--color-secondary)"
                strokeWidth={2}
                fill={`url(#spark-${title})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}