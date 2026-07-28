import { CreditCard, Truck, Wallet, Landmark, MoreVertical } from "lucide-react";

// بيانات تجريبية — هتتستبدل بالـ API بتاعة /api/payment/ لاحقًا
export const payments = [
  { id: "#PAY-2456", orderId: "#ORD-1842", customer: "سارة أحمد", email: "sarah.ahmed@example.com", avatar: "https://i.pravatar.cc/64?img=47", method: "credit_card", amount: 2850, status: "مكتمل", date: "18 يونيو 2025", time: "10:30 ص",
    cardLast4: "4242", txnId: "txn_8f29k29d8s9d", gateway: "Paymob", subtotal: 2550, shipping: 200, tax: 260, discount: 160 },
  { id: "#PAY-2455", orderId: "#ORD-1841", customer: "محمد علي", email: "mohamed.ali@example.com", avatar: "https://i.pravatar.cc/64?img=12", method: "cod", amount: 1650, status: "مكتمل", date: "18 يونيو 2025", time: "09:15 ص",
    cardLast4: null, txnId: "txn_7a18j18c7r8c", gateway: "الدفع عند الاستلام", subtotal: 1500, shipping: 150, tax: 150, discount: 150 },
  { id: "#PAY-2454", orderId: "#ORD-1840", customer: "منة حسن", email: "menna.hassan@example.com", avatar: "https://i.pravatar.cc/64?img=32", method: "credit_card", amount: 3200, status: "مكتمل", date: "17 يونيو 2025", time: "11:45 م",
    cardLast4: "1189", txnId: "txn_6b07i07b6q7b", gateway: "Paymob", subtotal: 2900, shipping: 150, tax: 300, discount: 150 },
  { id: "#PAY-2453", orderId: "#ORD-1839", customer: "عمر مصطفى", email: "omar.mostafa@example.com", avatar: "https://i.pravatar.cc/64?img=14", method: "wallet", amount: 1950, status: "مكتمل", date: "17 يونيو 2025", time: "08:20 م",
    cardLast4: null, txnId: "txn_5c96h96a5p6a", gateway: "فودافون كاش", subtotal: 1800, shipping: 100, tax: 180, discount: 130 },
  { id: "#PAY-2452", orderId: "#ORD-1838", customer: "نورهان عادل", email: "nourhan.adel@example.com", avatar: "https://i.pravatar.cc/64?img=45", method: "bank_transfer", amount: 2100, status: "مكتمل", date: "17 يونيو 2025", time: "04:10 م",
    cardLast4: null, txnId: "txn_4d85g85z4o5z", gateway: "تحويل بنكي", subtotal: 1900, shipping: 150, tax: 190, discount: 140 },
  { id: "#PAY-2451", orderId: "#ORD-1837", customer: "أحمد طارق", email: "ahmed.tarek@example.com", avatar: "https://i.pravatar.cc/64?img=15", method: "cod", amount: 2650, status: "قيد الانتظار", date: "17 يونيو 2025", time: "02:05 م",
    cardLast4: null, txnId: "txn_3e74f74y3n4y", gateway: "الدفع عند الاستلام", subtotal: 2400, shipping: 150, tax: 240, discount: 140 },
  { id: "#PAY-2450", orderId: "#ORD-1836", customer: "رانيا سامي", email: "rania.samir@example.com", avatar: "https://i.pravatar.cc/64?img=48", method: "credit_card", amount: 950, status: "مكتمل", date: "17 يونيو 2025", time: "01:30 م",
    cardLast4: "7734", txnId: "txn_2f63e63x2m3x", gateway: "Paymob", subtotal: 850, shipping: 50, tax: 85, discount: 35 },
  { id: "#PAY-2449", orderId: "#ORD-1835", customer: "خالد إبراهيم", email: "khaled.ibrahim@example.com", avatar: "https://i.pravatar.cc/64?img=51", method: "wallet", amount: 1780, status: "فشلت", date: "17 يونيو 2025", time: "12:20 م",
    cardLast4: null, txnId: "txn_1g52d52w1l2w", gateway: "فودافون كاش", subtotal: 1600, shipping: 100, tax: 160, discount: 80 },
];

const statusStyles = {
  "مكتمل": "bg-emerald-100 text-emerald-700",
  "قيد الانتظار": "bg-amber-100 text-amber-700",
  "فشلت": "bg-red-100 text-red-700",
};

const methodInfo = {
  credit_card: { label: "بطاقة ائتمان", icon: CreditCard, className: "bg-blue-50 text-blue-600" },
  cod: { label: "الدفع عند الاستلام", icon: Truck, className: "bg-emerald-50 text-emerald-600" },
  wallet: { label: "محفظة", icon: Wallet, className: "bg-purple-50 text-purple-600" },
  bank_transfer: { label: "تحويل بنكي", icon: Landmark, className: "bg-amber-50 text-amber-700" },
};

export default function PaymentsTable({ selectedId, onSelect }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-primary/40 text-xs border-b border-primary/10">
            <th className="py-3 pr-2 text-right w-8"><input type="checkbox" className="accent-secondary" /></th>
            <th className="py-3 text-right font-medium">رقم الدفعة</th>
            <th className="py-3 text-right font-medium">رقم الطلب</th>
            <th className="py-3 text-right font-medium">العميل</th>
            <th className="py-3 text-right font-medium">الطريقة</th>
            <th className="py-3 text-right font-medium">المبلغ</th>
            <th className="py-3 text-right font-medium">الحالة</th>
            <th className="py-3 text-right font-medium">التاريخ</th>
            <th className="py-3 text-right font-medium">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => {
            const method = methodInfo[p.method];
            const isSelected = p.id === selectedId;
            return (
              <tr
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`border-b border-primary/5 last:border-0 cursor-pointer transition-colors ${
                  isSelected ? "bg-secondary/10" : "hover:bg-background"
                }`}
              >
                <td className="py-3.5 pr-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="accent-secondary" />
                </td>
                <td className="py-3.5 font-semibold text-secondary" dir="ltr">{p.id}</td>
                <td className="py-3.5 text-primary/70" dir="ltr">{p.orderId}</td>
                <td className="py-3.5">
                  <div className="flex items-center gap-2.5">
                    <img src={p.avatar} alt={p.customer} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div>
                      <p className="font-medium text-primary">{p.customer}</p>
                      <p className="text-xs text-primary/40" dir="ltr">{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${method.className}`}>
                    <method.icon size={12} /> {method.label}
                  </span>
                </td>
                <td className="py-3.5 font-semibold text-primary">{p.amount.toLocaleString()} ج.م</td>
                <td className="py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[p.status]}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3.5">
                  <p className="text-primary/70">{p.date}</p>
                  <p className="text-xs text-primary/40">{p.time}</p>
                </td>
                <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                  <IconBtn icon={MoreVertical} label="المزيد" onClick={() => onSelect(p.id)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function IconBtn({ icon: Icon, label, onClick }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-primary/50 hover:bg-surface hover:text-primary transition"
    >
      <Icon size={15} />
    </button>
  );
}