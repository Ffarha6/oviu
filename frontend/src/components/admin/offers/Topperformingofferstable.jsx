const topOffers = [
  { rank: 1, tag: "SUMMER SALE", name: "عرض الصيف 2025", code: "SUMMER25", usage: 1248, revenue: 18450 },
  { rank: 2, tag: "NEW USER", name: "عرض العميل الجديد", code: "NEW10", usage: 3215, revenue: 12780 },
  { rank: 3, tag: "EID SPECIAL", name: "عرض العيد الخاص", code: "EID20", usage: 4521, revenue: 9430 },
  { rank: 4, tag: "FREE SHIPPING", name: "شحن مجاني", code: "FREESHIP", usage: 2876, revenue: 7560 },
  { rank: 5, tag: "STUDENT 15%", name: "خصم الطلاب", code: "STUDENT15", usage: 624, revenue: 3280 },
];

export default function TopPerformingOffersTable() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-primary/40 text-xs border-b border-primary/10">
          <th className="py-2.5 text-right font-medium">العرض</th>
          <th className="py-2.5 text-right font-medium">الاستخدام</th>
          <th className="py-2.5 text-right font-medium">الإيرادات</th>
        </tr>
      </thead>
      <tbody>
        {topOffers.map((o) => (
          <tr key={o.code} className="border-b border-primary/5 last:border-0">
            <td className="py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                  {o.rank}
                </span>
                <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary text-[7px] font-bold text-center leading-tight px-1 shrink-0">
                  {o.tag}
                </div>
                <div className="min-w-0">
                  <p className="text-primary font-medium truncate">{o.name}</p>
                  <p className="text-xs text-primary/40" dir="ltr">{o.code}</p>
                </div>
              </div>
            </td>
            <td className="py-2.5 text-primary/70">{o.usage.toLocaleString()}</td>
            <td className="py-2.5 font-semibold text-primary">{o.revenue.toLocaleString()} ج.م</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}