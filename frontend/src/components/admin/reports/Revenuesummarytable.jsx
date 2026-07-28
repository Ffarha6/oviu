import { Download, ArrowLeft } from "lucide-react";

const reports = [
  { name: "تقرير ملخص المبيعات", type: "المبيعات", date: "18 يونيو 2025", time: "10:30 ص" },
  { name: "تقرير تحليل الطلبات", type: "الطلبات", date: "18 يونيو 2025", time: "10:15 ص" },
  { name: "تقرير العملاء", type: "العملاء", date: "18 يونيو 2025", time: "09:45 ص" },
  { name: "تقرير أداء المنتجات", type: "المنتجات", date: "18 يونيو 2025", time: "09:20 ص" },
  { name: "تقرير المخزون", type: "المخزون", date: "18 يونيو 2025", time: "08:50 ص" },
];

const typeStyles = {
  "المبيعات": "bg-secondary/15 text-secondary",
  "الطلبات": "bg-blue-50 text-blue-600",
  "العملاء": "bg-purple-50 text-purple-600",
  "المنتجات": "bg-emerald-50 text-emerald-700",
  "المخزون": "bg-amber-50 text-amber-700",
};

export default function RecentReportsTable() {
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
          {reports.map((r) => (
            <tr key={r.name} className="border-b border-primary/5 last:border-0">
              <td className="py-2.5 text-primary font-medium">{r.name}</td>
              <td className="py-2.5">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeStyles[r.type]}`}>{r.type}</span>
              </td>
              <td className="py-2.5 text-primary/50">
                <p>{r.date}</p>
                <p className="text-xs">{r.time}</p>
              </td>
              <td className="py-2.5">
                <button className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-primary/50 hover:text-secondary transition">
                  <Download size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="flex items-center gap-1.5 text-sm font-medium text-secondary mt-3">
        عرض كل التقارير <ArrowLeft size={14} />
      </button>
    </div>
  );
}