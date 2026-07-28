const orders = [
  { id: "#ORD-2041", customer: "سارة أحمد", avatar: "https://i.pravatar.cc/64?img=47", date: "18 يونيو 2025", time: "10:30 ص", total: 2450, status: "تم التوصيل" },
  { id: "#ORD-2040", customer: "محمد علي", avatar: "https://i.pravatar.cc/64?img=12", date: "18 يونيو 2025", time: "09:45 ص", total: 1870, status: "قيد المعالجة" },
  { id: "#ORD-2039", customer: "منة حسن", avatar: "https://i.pravatar.cc/64?img=32", date: "18 يونيو 2025", time: "09:20 ص", total: 990, status: "تم الشحن" },
  { id: "#ORD-2038", customer: "عمر مصطفى", avatar: "https://i.pravatar.cc/64?img=14", date: "18 يونيو 2025", time: "08:55 ص", total: 1200, status: "ملغي" },
  { id: "#ORD-2037", customer: "نورهان عادل", avatar: "https://i.pravatar.cc/64?img=45", date: "18 يونيو 2025", time: "08:40 ص", total: 760, status: "تم التوصيل" },
];

const statusStyles = {
  "تم التوصيل": "bg-emerald-100 text-emerald-700",
  "قيد المعالجة": "bg-amber-100 text-amber-700",
  "تم الشحن": "bg-blue-100 text-blue-700",
  "ملغي": "bg-red-100 text-red-700",
};

export default function RecentOrdersMiniTable() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-primary/40 text-xs border-b border-primary/10">
          <th className="py-2.5 text-right font-medium">رقم الطلب</th>
          <th className="py-2.5 text-right font-medium">العميل</th>
          <th className="py-2.5 text-right font-medium">الإجمالي</th>
          <th className="py-2.5 text-right font-medium">الحالة</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id} className="border-b border-primary/5 last:border-0">
            <td className="py-2.5 text-primary/70" dir="ltr">{o.id}</td>
            <td className="py-2.5">
              <span className="flex items-center gap-2 text-primary">
                <img src={o.avatar} alt={o.customer} className="w-6 h-6 rounded-full object-cover shrink-0" />
                {o.customer}
              </span>
            </td>
            <td className="py-2.5 font-semibold text-primary">{o.total.toLocaleString()} ج.م</td>
            <td className="py-2.5">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[o.status]}`}>
                {o.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}