import { Eye, ShieldCheck, ShieldOff } from "lucide-react";

function initials(name) {
  if (!name) return "؟";
  return name.trim().charAt(0).toUpperCase();
}

export default function CustomersTable({ customers, loading, selectedId, onSelect, onToggleStatus }) {
  if (loading) {
    return <p className="text-center text-sm text-primary/40 py-10">جاري تحميل العملاء...</p>;
  }

  if (!customers || customers.length === 0) {
    return <p className="text-center text-sm text-primary/40 py-10">مفيش مستخدمين لعرضهم</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-primary/40 text-xs border-b border-primary/10">
            <th className="py-3 pr-2 text-right w-8"><input type="checkbox" className="accent-secondary" /></th>
            <th className="py-3 text-right font-medium">المستخدم</th>
            <th className="py-3 text-right font-medium">البريد الإلكتروني</th>
            <th className="py-3 text-right font-medium">الهاتف</th>
            <th className="py-3 text-right font-medium">تاريخ الانضمام</th>
            <th className="py-3 text-right font-medium">الدور</th>
            <th className="py-3 text-right font-medium">الحالة</th>
            <th className="py-3 text-right font-medium">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => {
            const isSelected = c.id === selectedId;
            const displayName = c.full_name?.trim() || c.username;
            return (
              <tr
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`border-b border-primary/5 last:border-0 cursor-pointer transition-colors ${
                  isSelected ? "bg-secondary/10" : "hover:bg-background"
                }`}
              >
                <td className="py-3.5 pr-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="accent-secondary" />
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary font-semibold flex items-center justify-center shrink-0 text-xs">
                      {initials(displayName)}
                    </div>
                    <p className="font-medium text-primary">{displayName}</p>
                  </div>
                </td>
                <td className="py-3.5 text-primary/60" dir="ltr">{c.email}</td>
                <td className="py-3.5 text-primary/60" dir="ltr">{c.phone || "—"}</td>
                <td className="py-3.5 text-primary/60">{c.date_joined}</td>
                <td className="py-3.5">
                  {c.is_staff ? (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 w-fit">
                      <ShieldCheck size={12} /> {c.is_superuser ? "سوبر أدمن" : "أدمن"}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 w-fit">
                      عميل
                    </span>
                  )}
                </td>
                <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleStatus(c.id)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${
                      c.is_active ? "bg-emerald-500" : "bg-primary/15"
                    }`}
                    aria-label="تفعيل/إيقاف الحساب"
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        c.is_active ? "left-0.5" : "right-0.5"
                      }`}
                    />
                  </button>
                  <p className="text-[11px] text-primary/40 mt-1">{c.is_active ? "مفعل" : "موقوف"}</p>
                </td>
                <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    aria-label="عرض"
                    onClick={() => onSelect(c.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-primary/50 hover:bg-surface hover:text-primary transition"
                  >
                    <Eye size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}