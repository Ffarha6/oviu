import { useState, useEffect } from "react";
import api from "../../../api/axios"; // ✅ عدّلي المسار حسب مكان الملف عندك

export default function RevenueSummaryTable({ dateRange }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/reports/revenue-summary/", { params: dateRange })
      .then((res) => setRows(res.data))
      .catch((err) => {
        console.log(err);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [dateRange]);

  if (loading) {
    return <div className="h-64 animate-pulse bg-background rounded-xl" />;
  }

  if (rows.length === 0) {
    return <p className="text-center text-sm text-primary/40 py-10">لا توجد بيانات في هذه الفترة</p>;
  }

  const fmt = (n) => `${Number(n).toLocaleString()} ج.م`;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-primary/40 text-xs border-b border-primary/10">
            <th className="py-2.5 text-right font-medium">التاريخ</th>
            <th className="py-2.5 text-right font-medium">عدد الطلبات</th>
            <th className="py-2.5 text-right font-medium">الإيرادات</th>
            <th className="py-2.5 text-right font-medium">المرتجعات</th>
            <th className="py-2.5 text-right font-medium">صافي الإيرادات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.date} className="border-b border-primary/5 last:border-0">
              <td className="py-2.5 text-primary font-medium">
                {new Date(r.date).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}
              </td>
              <td className="py-2.5 text-primary/70">{r.orders_count.toLocaleString()}</td>
              <td className="py-2.5 text-primary/70">{fmt(r.revenue)}</td>
              <td className="py-2.5 text-red-500">{r.refunds > 0 ? `- ${fmt(r.refunds)}` : "—"}</td>
              <td className="py-2.5 text-primary font-semibold">{fmt(r.net_revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}