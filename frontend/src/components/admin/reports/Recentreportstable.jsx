import { useState, useEffect } from "react";
import { Download, ArrowLeft } from "lucide-react";
import api from "../../../api/axios"; // ✅ عدّلي المسار حسب مكان الملف عندك

const typeStyles = {
  overview: "bg-secondary/15 text-secondary",
  sales: "bg-secondary/15 text-secondary",
  orders: "bg-blue-50 text-blue-600",
  customers: "bg-purple-50 text-purple-600",
  products: "bg-emerald-50 text-emerald-700",
};

export default function RecentReportsTable({ refreshKey }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/reports/history/")
      .then((res) => setReports(res.data))
      .catch((err) => {
        console.log(err);
        setReports([]);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return <div className="h-56 animate-pulse bg-background rounded-xl" />;
  }

  if (reports.length === 0) {
    return <p className="text-center text-sm text-primary/40 py-10">لا توجد تقارير مُصدَّرة بعد</p>;
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-primary/40 text-xs border-b border-primary/10">
            <th className="py-2.5 text-right font-medium">اسم التقرير</th>
            <th className="py-2.5 text-right font-medium">النوع</th>
            <th className="py-2.5 text-right font-medium">تاريخ الإنشاء</th>
            <th className="py-2.5 text-right font-medium">إجراء</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => {
            const date = new Date(r.created_at);
            return (
              <tr key={r.id} className="border-b border-primary/5 last:border-0">
                <td className="py-2.5 text-primary font-medium">{r.name}</td>
                <td className="py-2.5">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeStyles[r.report_type] || "bg-gray-100 text-gray-600"}`}>
                    {r.type_display}
                  </span>
                </td>
                <td className="py-2.5 text-primary/50">
                  <p>{date.toLocaleDateString("ar-EG")}</p>
                  <p className="text-xs">{date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</p>
                </td>
                <td className="py-2.5">
                  <a
                    href={r.file_url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-primary/50 hover:text-secondary transition"
                  >
                    <Download size={14} />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button className="flex items-center gap-1.5 text-sm font-medium text-secondary mt-3">
        عرض كل التقارير <ArrowLeft size={14} />
      </button>
    </div>
  );
}