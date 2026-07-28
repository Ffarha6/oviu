import { Copy, Eye, Pencil, MoreVertical } from "lucide-react";

// بيانات تجريبية — هتتستبدل بالـ API لاحقًا
export const offers = [
  { code: "SUMMER25", tag: "SUMMER SALE", name: "عرض الصيف 2025", type: "نسبة مئوية", typeStyle: "bg-purple-50 text-purple-600", discount: "خصم 25%", condition: "بحد أقصى 1,000 ج.م", status: "فعّال", from: "18 مايو 2025", to: "30 يونيو 2025", used: 1248, limit: 5000, percent: 25, revenue: 18450 },
  { code: "NEW10", tag: "NEW USER", name: "عرض العميل الجديد", type: "نسبة مئوية", typeStyle: "bg-purple-50 text-purple-600", discount: "خصم 10%", condition: "بحد أقصى 500 ج.م", status: "فعّال", from: "1 مايو 2025", to: "31 ديسمبر 2025", used: 3215, limit: 10000, percent: 32, revenue: 12780 },
  { code: "BOGO", tag: "BUY 1 GET 1", name: "اشتري 1 واحصل على 1 مجانًا", type: "BOGO", typeStyle: "bg-blue-50 text-blue-600", discount: "اشتري 1 واحصل على 1", condition: "على منتجات مختارة", status: "مجدول", from: "20 يونيو 2025", to: "5 يوليو 2025", used: 0, limit: 2000, percent: 0, revenue: 0 },
  { code: "EID20", tag: "EID SPECIAL", name: "عرض العيد الخاص", type: "نسبة مئوية", typeStyle: "bg-purple-50 text-purple-600", discount: "خصم 20%", condition: "بحد أقصى 800 ج.م", status: "منتهي", from: "25 مارس 2025", to: "5 أبريل 2025", used: 4521, limit: 5000, percent: 90, revenue: 9430 },
  { code: "FREESHIP", tag: "FREE SHIPPING", name: "شحن مجاني", type: "شحن مجاني", typeStyle: "bg-emerald-50 text-emerald-700", discount: "شحن مجاني", condition: "أقل طلب 500 ج.م", status: "فعّال", from: "1 مايو 2025", to: "30 يونيو 2025", used: 2876, limit: null, percent: null, revenue: 7560 },
  { code: "FLASH30", tag: "FLASH SALE", name: "عرض الفلاش", type: "نسبة مئوية", typeStyle: "bg-purple-50 text-purple-600", discount: "خصم 30%", condition: "بحد أقصى 1,500 ج.م", status: "منتهي", from: "10 مايو 2025", to: "12 مايو 2025", used: 1850, limit: 2000, percent: 92, revenue: 5200 },
  { code: "STUDENT15", tag: "STUDENT 15%", name: "خصم الطلاب", type: "نسبة مئوية", typeStyle: "bg-purple-50 text-purple-600", discount: "خصم 15%", condition: "بحد أقصى 700 ج.م", status: "فعّال", from: "5 مايو 2025", to: "1 سبتمبر 2025", used: 624, limit: 3000, percent: 21, revenue: 3280 },
  { code: "WELCOME5", tag: "WELCOME GIFT", name: "هدية الترحيب", type: "مبلغ ثابت", typeStyle: "bg-pink-50 text-pink-600", discount: "خصم 50 ج.م", condition: "أقل طلب 200 ج.م", status: "مجدول", from: "25 يونيو 2025", to: "31 ديسمبر 2025", used: 0, limit: 1500, percent: 0, revenue: 0 },
];

const statusStyles = {
  "فعّال": "bg-emerald-100 text-emerald-700",
  "مجدول": "bg-amber-100 text-amber-700",
  "منتهي": "bg-red-100 text-red-700",
};

const barColors = {
  "فعّال": "bg-secondary",
  "مجدول": "bg-amber-400",
  "منتهي": "bg-red-400",
};

export default function OffersTable({ selectedCode, onSelect }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-primary/40 text-xs border-b border-primary/10">
            <th className="py-3 pr-2 text-right w-8"><input type="checkbox" className="accent-secondary" /></th>
            <th className="py-3 text-right font-medium">العرض</th>
            <th className="py-3 text-right font-medium">النوع</th>
            <th className="py-3 text-right font-medium">الخصم</th>
            <th className="py-3 text-right font-medium">الحالة</th>
            <th className="py-3 text-right font-medium">فترة الصلاحية</th>
            <th className="py-3 text-right font-medium">الاستخدام</th>
            <th className="py-3 text-right font-medium">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((o) => {
            const isSelected = o.code === selectedCode;
            return (
              <tr
                key={o.code}
                onClick={() => onSelect(o.code)}
                className={`border-b border-primary/5 last:border-0 cursor-pointer transition-colors ${
                  isSelected ? "bg-secondary/10" : "hover:bg-background"
                }`}
              >
                <td className="py-3.5 pr-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="accent-secondary" />
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary text-[9px] font-bold text-center leading-tight shrink-0 px-1">
                      {o.tag}
                    </div>
                    <div>
                      <p className="font-medium text-primary">{o.name}</p>
                      <span className="flex items-center gap-1 text-xs text-primary/40" dir="ltr">
                        {o.code} <Copy size={11} />
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${o.typeStyle}`}>{o.type}</span>
                </td>
                <td className="py-3.5">
                  <p className="font-semibold text-primary">{o.discount}</p>
                  <p className="text-xs text-primary/40">{o.condition}</p>
                </td>
                <td className="py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-3.5">
                  <p className="text-primary/70">{o.from}</p>
                  <p className="text-xs text-primary/40">{o.to}</p>
                </td>
                <td className="py-3.5 w-32">
                  <p className="text-xs text-primary/60 mb-1">{o.used.toLocaleString()} / {o.limit ? o.limit.toLocaleString() : "∞"}</p>
                  {o.percent !== null && (
                    <div className="h-1.5 rounded-full bg-primary/10 overflow-hidden">
                      <div className={`h-full rounded-full ${barColors[o.status]}`} style={{ width: `${o.percent}%` }} />
                    </div>
                  )}
                </td>
                <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <IconBtn icon={Eye} label="عرض" onClick={() => onSelect(o.code)} />
                    <IconBtn icon={Pencil} label="تعديل" />
                    <IconBtn icon={MoreVertical} label="المزيد" />
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