import { Monitor, Smartphone, Eye, MoreVertical } from "lucide-react";

// بيانات تجريبية — هتتستبدل بالـ API بتاعة /tryon/ لاحقًا
export const sessions = [
  { id: "TRY-2041", customer: "سارة أحمد", email: "sarah.ahmed@example.com", avatar: "https://i.pravatar.cc/64?img=47", uploadedImg: "https://i.pravatar.cc/80?img=47", glasses: "أفياتور كلاسيك", sku: "OV-AVI-001", confidence: 96, status: "نجاح", date: "18 يونيو 2025", time: "10:30 ص", device: "desktop" },
  { id: "TRY-2040", customer: "محمد علي", email: "mohamed.ali@example.com", avatar: "https://i.pravatar.cc/64?img=12", uploadedImg: "https://i.pravatar.cc/80?img=12", glasses: "كات آي شيك", sku: "OV-CAT-005", confidence: 91, status: "نجاح", date: "18 يونيو 2025", time: "09:45 ص", device: "mobile" },
  { id: "TRY-2039", customer: "منة حسن", email: "menna.hassan@example.com", avatar: "https://i.pravatar.cc/64?img=32", uploadedImg: "https://i.pravatar.cc/80?img=32", glasses: "راوند ميتال", sku: "OV-ROU-003", confidence: 88, status: "نجاح", date: "18 يونيو 2025", time: "09:20 ص", device: "desktop" },
  { id: "TRY-2038", customer: "عمر مصطفى", email: "omar.mostafa@example.com", avatar: "https://i.pravatar.cc/64?img=14", uploadedImg: "https://i.pravatar.cc/80?img=14", glasses: "سكوير إيليت", sku: "OV-SQE-002", confidence: 35, status: "فشل", date: "18 يونيو 2025", time: "08:55 ص", device: "mobile" },
  { id: "TRY-2037", customer: "نورهان عادل", email: "nourhan.adel@example.com", avatar: "https://i.pravatar.cc/64?img=45", uploadedImg: "https://i.pravatar.cc/80?img=45", glasses: "ويفارر برو", sku: "OV-WAY-004", confidence: 93, status: "نجاح", date: "18 يونيو 2025", time: "08:40 ص", device: "desktop" },
];

const statusStyles = {
  "نجاح": "bg-emerald-100 text-emerald-700",
  "فشل": "bg-red-100 text-red-700",
};

export default function TryOnTable({ selectedId, onSelect }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-primary/40 text-xs border-b border-primary/10">
            <th className="py-3 pr-2 text-right w-8"><input type="checkbox" className="accent-secondary" /></th>
            <th className="py-3 text-right font-medium">رقم الجلسة</th>
            <th className="py-3 text-right font-medium">العميل</th>
            <th className="py-3 text-right font-medium">الصورة المرفوعة</th>
            <th className="py-3 text-right font-medium">النظارة المختارة</th>
            <th className="py-3 text-right font-medium">الثقة</th>
            <th className="py-3 text-right font-medium">الحالة</th>
            <th className="py-3 text-right font-medium">التاريخ والوقت</th>
            <th className="py-3 text-right font-medium">الجهاز</th>
            <th className="py-3 text-right font-medium">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => {
            const DeviceIcon = s.device === "desktop" ? Monitor : Smartphone;
            const isSelected = s.id === selectedId;
            return (
              <tr
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`border-b border-primary/5 last:border-0 cursor-pointer transition-colors ${
                  isSelected ? "bg-secondary/10" : "hover:bg-background"
                }`}
              >
                <td className="py-3.5 pr-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="accent-secondary" />
                </td>
                <td className="py-3.5 font-medium text-primary">{s.id}</td>
                <td className="py-3.5">
                  <div className="flex items-center gap-2.5">
                    <img src={s.avatar} alt={s.customer} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div>
                      <p className="font-medium text-primary">{s.customer}</p>
                      <p className="text-xs text-primary/40" dir="ltr">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5">
                  <img src={s.uploadedImg} alt="صورة العميل" className="w-9 h-9 rounded-lg object-cover" />
                </td>
                <td className="py-3.5">
                  <p className="font-medium text-primary">{s.glasses}</p>
                  <p className="text-xs text-primary/40">{s.sku}</p>
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-2 w-24">
                    <div className="flex-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.confidence >= 70 ? "bg-secondary" : "bg-red-400"}`}
                        style={{ width: `${s.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-primary/60">{s.confidence}%</span>
                  </div>
                </td>
                <td className="py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[s.status]}`}>
                    {s.status}
                  </span>
                </td>
                <td className="py-3.5">
                  <p className="text-primary/70">{s.date}</p>
                  <p className="text-xs text-primary/40">{s.time}</p>
                </td>
                <td className="py-3.5 text-primary/50">
                  <DeviceIcon size={16} />
                </td>
                <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <IconBtn icon={Eye} label="عرض" onClick={() => onSelect(s.id)} />
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