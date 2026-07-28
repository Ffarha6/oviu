import { ResponsiveContainer, LineChart, Line } from "recharts";

const sparkData = [
  { v: 20 }, { v: 28 }, { v: 22 }, { v: 35 }, { v: 30 }, { v: 42 }, { v: 38 }, { v: 50 }, { v: 45 }, { v: 60 },
];

export default function VisitorsOverviewPanel() {
  return (
    <div>
      <p className="text-2xl font-bold text-primary">32,856</p>
      <p className="text-xs text-primary/50 mb-1">إجمالي الزوار</p>
      <p className="text-[11px] font-medium text-emerald-600 mb-3">↑ 16.8%</p>

      <div className="h-16 -mx-1 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line type="monotone" dataKey="v" stroke="var(--color-secondary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm border-t border-primary/10 pt-3">
        <Stat label="زوار فريدون" value="24,195" change="16.1%" />
        <Stat label="مشاهدات الصفحة" value="78,512" change="19.7%" />
        <Stat label="متوسط مدة الجلسة" value="02:45" change="8.3%" />
      </div>
    </div>
  );
}

function Stat({ label, value, change }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-primary/50 text-xs">{label}</span>
      <div className="text-left">
        <p className="font-semibold text-primary">{value}</p>
        <p className="text-[11px] text-emerald-600">↑ {change}</p>
      </div>
    </div>
  );
}