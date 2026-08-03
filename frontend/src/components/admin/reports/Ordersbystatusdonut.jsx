import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import api from "../../../api/axios"; // ✅ عدّلي المسار حسب مكان الملف عندك

const statusColors = {
  delivered: "#7A9B76",
  confirmed: "var(--color-secondary)",
  pending: "var(--color-secondary)",
  preparing: "#D9A87C",
  shipped: "#D9A87C",
  cancelled: "#E4867A",
};

export default function OrdersByStatusDonut({ dateRange }) {
  const [result, setResult] = useState({ total: 0, data: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/reports/orders-by-status/", { params: dateRange })
      .then((res) => setResult(res.data))
      .catch((err) => {
        console.log(err);
        setResult({ total: 0, data: [] });
      })
      .finally(() => setLoading(false));
  }, [dateRange]);

  if (loading) {
    return <div className="h-56 animate-pulse bg-background rounded-xl" />;
  }

  if (result.data.length === 0) {
    return <p className="text-center text-sm text-primary/40 py-10">لا توجد طلبات في هذه الفترة</p>;
  }

  return (
    <div>
      <div className="w-40 h-40 mx-auto relative mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={result.data} dataKey="percent" nameKey="label" innerRadius={54} outerRadius={72} paddingAngle={2} stroke="none">
              {result.data.map((entry) => (
                <Cell key={entry.status} fill={statusColors[entry.status] || "#C9C4BC"} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-primary">{result.total.toLocaleString()}</span>
          <span className="text-[11px] text-primary/50">إجمالي الطلبات</span>
        </div>
      </div>
      <ul className="space-y-2.5">
        {result.data.map((d) => (
          <li key={d.status} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-primary/70">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: statusColors[d.status] || "#C9C4BC" }} />
              {d.label}
            </span>
            <span className="text-xs text-primary/50">{d.count.toLocaleString()} ({d.percent}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}