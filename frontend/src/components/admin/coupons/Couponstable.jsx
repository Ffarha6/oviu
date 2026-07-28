import { Eye, Pencil, MoreVertical } from "lucide-react";

// بيانات تجريبية — هتتستبدل بالـ API بتاعة /api/coupons/ لاحقًا
export const coupons = [
  { code: "OVIU10", name: "خصم 10% على كل الطلبات", type: "نسبة مئوية", discount: "10%", minOrder: "500 ج.م", used: 243, limit: null, validFrom: "18 مايو 2025", validTo: "30 يونيو 2025", status: "فعّال", usagePercent: 60,
    typeStyle: "bg-purple-50 text-purple-600", usageLimit: "غير محدود", validFromFull: "18 مايو 2025 - 12:00 ص", validToFull: "30 يونيو 2025 - 11:59 م", applicableTo: "كل المنتجات", applicableUsers: "كل المستخدمين", createdAt: "18 مايو 2025 10:30 ص" },
  { code: "WELCOME20", name: "عرض الترحيب", type: "نسبة مئوية", discount: "20%", minOrder: "1,000 ج.م", used: 156, limit: 500, validFrom: "15 مايو 2025", validTo: "30 يونيو 2025", status: "فعّال", usagePercent: 31,
    typeStyle: "bg-purple-50 text-purple-600", usageLimit: "500 استخدام", validFromFull: "15 مايو 2025 - 12:00 ص", validToFull: "30 يونيو 2025 - 11:59 م", applicableTo: "كل المنتجات", applicableUsers: "عملاء جدد", createdAt: "15 مايو 2025 09:00 ص" },
  { code: "FREESHIP", name: "شحن مجاني", type: "شحن مجاني", discount: "—", minOrder: "0 ج.م", used: 342, limit: null, validFrom: "1 مايو 2025", validTo: "31 ديسمبر 2025", status: "فعّال", usagePercent: 70,
    typeStyle: "bg-blue-50 text-blue-600", usageLimit: "غير محدود", validFromFull: "1 مايو 2025 - 12:00 ص", validToFull: "31 ديسمبر 2025 - 11:59 م", applicableTo: "كل المنتجات", applicableUsers: "كل المستخدمين", createdAt: "1 مايو 2025 08:00 ص" },
  { code: "SUMMER15", name: "عرض الصيف", type: "نسبة مئوية", discount: "15%", minOrder: "800 ج.م", used: 89, limit: 300, validFrom: "1 يونيو 2025", validTo: "30 يونيو 2025", status: "مجدول", usagePercent: 30,
    typeStyle: "bg-purple-50 text-purple-600", usageLimit: "300 استخدام", validFromFull: "1 يونيو 2025 - 12:00 ص", validToFull: "30 يونيو 2025 - 11:59 م", applicableTo: "النظارات الشمسية", applicableUsers: "كل المستخدمين", createdAt: "20 مايو 2025 01:00 م" },
  { code: "OVIU50", name: "خصم 50 جنيه ثابت", type: "مبلغ ثابت", discount: "50 ج.م", minOrder: "300 ج.م", used: 512, limit: null, validFrom: "10 مايو 2025", validTo: "20 يونيو 2025", status: "فعّال", usagePercent: 85,
    typeStyle: "bg-pink-50 text-pink-600", usageLimit: "غير محدود", validFromFull: "10 مايو 2025 - 12:00 ص", validToFull: "20 يونيو 2025 - 11:59 م", applicableTo: "كل المنتجات", applicableUsers: "كل المستخدمين", createdAt: "10 مايو 2025 11:00 ص" },
  { code: "NEWUSER25", name: "خصم للعملاء الجدد", type: "نسبة مئوية", discount: "25%", minOrder: "1,500 ج.م", used: 78, limit: 200, validFrom: "10 مايو 2025", validTo: "10 يونيو 2025", status: "منتهي", usagePercent: 39,
    typeStyle: "bg-purple-50 text-purple-600", usageLimit: "200 استخدام", validFromFull: "10 مايو 2025 - 12:00 ص", validToFull: "10 يونيو 2025 - 11:59 م", applicableTo: "كل المنتجات", applicableUsers: "عملاء جدد", createdAt: "1 مايو 2025 10:00 ص" },
  { code: "EID2025", name: "عرض عيد الفطر", type: "نسبة مئوية", discount: "30%", minOrder: "1,000 ج.م", used: 305, limit: 500, validFrom: "20 مارس 2025", validTo: "5 أبريل 2025", status: "منتهي", usagePercent: 61,
    typeStyle: "bg-purple-50 text-purple-600", usageLimit: "500 استخدام", validFromFull: "20 مارس 2025 - 12:00 ص", validToFull: "5 أبريل 2025 - 11:59 م", applicableTo: "كل المنتجات", applicableUsers: "كل المستخدمين", createdAt: "10 مارس 2025 09:00 ص" },
  { code: "BLACKFRIDAY", name: "الجمعة السوداء", type: "نسبة مئوية", discount: "40%", minOrder: "2,000 ج.م", used: 0, limit: 1000, validFrom: "28 نوفمبر 2025", validTo: "30 نوفمبر 2025", status: "مجدول", usagePercent: 0,
    typeStyle: "bg-purple-50 text-purple-600", usageLimit: "1,000 استخدام", validFromFull: "28 نوفمبر 2025 - 12:00 ص", validToFull: "30 نوفمبر 2025 - 11:59 م", applicableTo: "كل المنتجات", applicableUsers: "كل المستخدمين", createdAt: "1 نوفمبر 2025 12:00 م" },
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

export default function CouponsTable({ selectedCode, onSelect }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-primary/40 text-xs border-b border-primary/10">
            <th className="py-3 pr-2 text-right w-8"><input type="checkbox" className="accent-secondary" /></th>
            <th className="py-3 text-right font-medium">كود الكوبون</th>
            <th className="py-3 text-right font-medium">النوع</th>
            <th className="py-3 text-right font-medium">الخصم</th>
            <th className="py-3 text-right font-medium">أقل طلب</th>
            <th className="py-3 text-right font-medium">الاستخدام</th>
            <th className="py-3 text-right font-medium">الصلاحية</th>
            <th className="py-3 text-right font-medium">الحالة</th>
            <th className="py-3 text-right font-medium">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => {
            const isSelected = c.code === selectedCode;
            return (
              <tr
                key={c.code}
                onClick={() => onSelect(c.code)}
                className={`border-b border-primary/5 last:border-0 cursor-pointer transition-colors ${
                  isSelected ? "bg-secondary/10" : "hover:bg-background"
                }`}
              >
                <td className="py-3.5 pr-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="accent-secondary" />
                </td>
                <td className="py-3.5">
                  <p className="font-semibold text-secondary" dir="ltr">{c.code}</p>
                  <p className="text-xs text-primary/40">{c.name}</p>
                </td>
                <td className="py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.typeStyle}`}>{c.type}</span>
                </td>
                <td className="py-3.5 font-semibold text-primary">{c.discount}</td>
                <td className="py-3.5 text-primary/60">{c.minOrder}</td>
                <td className="py-3.5 w-32">
                  <p className="text-xs text-primary/60 mb-1">{c.used} / {c.limit ?? "∞"}</p>
                  <div className="h-1.5 rounded-full bg-primary/10 overflow-hidden">
                    <div className={`h-full rounded-full ${barColors[c.status]}`} style={{ width: `${c.usagePercent}%` }} />
                  </div>
                </td>
                <td className="py-3.5">
                  <p className="text-primary/70">{c.validFrom}</p>
                  <p className="text-xs text-primary/40">{c.validTo}</p>
                </td>
                <td className="py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <IconBtn icon={Eye} label="عرض" onClick={() => onSelect(c.code)} />
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