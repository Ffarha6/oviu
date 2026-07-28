const products = [
  { name: "أفياتور كلاسيك", sold: 1245, revenue: 373500 },
  { name: "راوند ميتال", sold: 943, revenue: 245180 },
  { name: "كات آي شيك", sold: 812, revenue: 186760 },
  { name: "بلو كت برو", sold: 689, revenue: 151580 },
  { name: "سبورت ماكس", sold: 654, revenue: 138240 },
];

export default function TopSellingProductsTable() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-primary/40 text-xs border-b border-primary/10">
          <th className="py-2.5 text-right font-medium">المنتج</th>
          <th className="py-2.5 text-right font-medium">المباع</th>
          <th className="py-2.5 text-right font-medium">الإيرادات</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.name} className="border-b border-primary/5 last:border-0">
            <td className="py-2.5">
              <span className="flex items-center gap-2 text-primary">
                <span className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center text-sm shrink-0">👓</span>
                {p.name}
              </span>
            </td>
            <td className="py-2.5 text-primary/70">{p.sold.toLocaleString()}</td>
            <td className="py-2.5 font-semibold text-primary">{p.revenue.toLocaleString()} ج.م</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}