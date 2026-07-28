import { Globe, Search, Share2, MousePointerClick, Mail, Link2 } from "lucide-react";

const sources = [
  { icon: Globe, label: "مباشر", sessions: 12458, percent: "37.9%", change: "12.4%", trend: "up" },
  { icon: Search, label: "بحث عضوي", sessions: 9652, percent: "29.4%", change: "18.6%", trend: "up" },
  { icon: Share2, label: "السوشيال ميديا", sessions: 4320, percent: "13.1%", change: "7.8%", trend: "up" },
  { icon: MousePointerClick, label: "إعلانات مدفوعة", sessions: 3845, percent: "11.7%", change: "2.3%", trend: "down" },
  { icon: Mail, label: "البريد الإلكتروني", sessions: 1832, percent: "5.6%", change: "9.1%", trend: "up" },
  { icon: Link2, label: "إحالة", sessions: 1247, percent: "3.8%", change: "4.6%", trend: "up" },
];

export default function TrafficSourcesTable() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-primary/40 text-xs border-b border-primary/10">
          <th className="py-2.5 text-right font-medium">المصدر</th>
          <th className="py-2.5 text-right font-medium">الجلسات</th>
          <th className="py-2.5 text-right font-medium">%</th>
          <th className="py-2.5 text-right font-medium">التغيير</th>
        </tr>
      </thead>
      <tbody>
        {sources.map((s) => (
          <tr key={s.label} className="border-b border-primary/5 last:border-0">
            <td className="py-2.5">
              <span className="flex items-center gap-2 text-primary">
                <s.icon size={14} className="text-secondary" /> {s.label}
              </span>
            </td>
            <td className="py-2.5 text-primary/70">{s.sessions.toLocaleString()}</td>
            <td className="py-2.5 text-primary/70">{s.percent}</td>
            <td className={`py-2.5 font-medium ${s.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
              {s.trend === "up" ? "↑" : "↓"} {s.change}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}