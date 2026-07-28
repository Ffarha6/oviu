import { Link } from "react-router-dom";
import { CreditCard, Truck, Wallet, Eye, MoreVertical } from "lucide-react";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabelAr = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  preparing: "قيد المعالجة",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

const paymentInfo = {
  cash: { label: "عند الاستلام", icon: Truck, className: "bg-emerald-50 text-emerald-600" },
  card: { label: "بطاقة ائتمان", icon: CreditCard, className: "bg-blue-50 text-blue-600" },
  wallet: { label: "محفظة", icon: Wallet, className: "bg-purple-50 text-purple-600" },
};

function formatDate(iso) {
  if (!iso) return { date: "—", time: "" };
  const d = new Date(iso);
  const date = d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

function initials(name) {
  if (!name) return "؟";
  return name.trim().charAt(0).toUpperCase();
}

export default function OrdersTable({ orders, loading }) {
  if (loading) {
    return <p className="text-center text-sm text-primary/40 py-10">جاري تحميل الطلبات...</p>;
  }

  if (!orders || orders.length === 0) {
    return <p className="text-center text-sm text-primary/40 py-10">مفيش طلبات لعرضها</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-primary/40 text-xs border-b border-primary/10">
            <th className="py-3 pr-2 text-right w-8"><input type="checkbox" className="accent-secondary" /></th>
            <th className="py-3 text-right font-medium">رقم الطلب</th>
            <th className="py-3 text-right font-medium">العميل</th>
            <th className="py-3 text-right font-medium">الإجمالي</th>
            <th className="py-3 text-right font-medium">الدفع</th>
            <th className="py-3 text-right font-medium">الحالة</th>
            <th className="py-3 text-right font-medium">التاريخ</th>
            <th className="py-3 text-right font-medium">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const pay = paymentInfo[o.payment_method] || paymentInfo.cash;
            const { date, time } = formatDate(o.created_at);
            return (
              <tr key={o.id} className="border-b border-primary/5 last:border-0 hover:bg-background transition-colors">
                <td className="py-3.5 pr-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="accent-secondary" />
                </td>
                <td className="py-3.5">
                  <Link to={`/admin/orders/${o.id}`} className="font-medium text-primary hover:text-secondary transition">#{o.id}</Link>
                  <p className="text-xs text-primary/40">{o.items_count} عناصر</p>
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary font-semibold flex items-center justify-center shrink-0 text-xs">
                      {initials(o.customer_name)}
                    </div>
                    <div>
                      <p className="font-medium text-primary">{o.customer_name}</p>
                      <p className="text-xs text-primary/40" dir="ltr">{o.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 font-semibold text-primary">{Number(o.total_price).toLocaleString()} ج.م</td>
                <td className="py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${pay.className}`}>
                    <pay.icon size={12} /> {pay.label}
                  </span>
                </td>
                <td className="py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[o.status]}`}>
                    {statusLabelAr[o.status] || o.status}
                  </span>
                </td>
                <td className="py-3.5">
                  <p className="text-primary/70">{date}</p>
                  <p className="text-xs text-primary/40">{time}</p>
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/admin/orders/${o.id}`}
                      aria-label="عرض التفاصيل"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-primary/50 hover:bg-surface hover:text-primary transition"
                    >
                      <Eye size={15} />
                    </Link>
                    <button
                      aria-label="المزيد"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-primary/50 hover:bg-surface hover:text-primary transition"
                    >
                      <MoreVertical size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}