import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import api from "../../../api/axios"; // ✅ عدّلي المسار حسب مكان الملف عندك

const palette = ["var(--color-secondary)", "#8C6A52", "#E8C9AE", "#7A9B76", "#C9C4BC"];

export default function SalesByCategoryDonut({ dateRange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/reports/sales-by-category/", { params: dateRange })
      .then((res) => setData(res.data))
      .catch((err) => {
        console.log(err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [dateRange]);

  if (loading) {
    return <div className="h-56 animate-pulse bg-background rounded-xl" />;
  }

  if (data.length === 0) {
    return <p className="text-center text-sm text-primary/40 py-10">لا توجد بيانات في هذه الفترة</p>;
  }

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