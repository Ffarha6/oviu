import { Crown, Eye } from "lucide-react";

const roleStyles = {
  "سوبر أدمن": "bg-amber-50 text-amber-700",
  "أدمن": "bg-orange-50 text-orange-600",
  "مدير": "bg-purple-50 text-purple-600",
  "محرر": "bg-blue-50 text-blue-600",
  "دعم فني": "bg-cyan-50 text-cyan-600",
};

function formatLastLogin(iso) {
  if (!iso) return "لم يسجل الدخول بعد";
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" }) +
    " - " + d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminsTable({ admins, loading, selectedId, onSelect }) {
  if (loading) {
    return <p className="text-center text-sm text-primary/40 py-10">جاري تحميل المشرفين...</p>;
  }

  if (!admins || admins.length === 0) {
    return <p className="text-center text-sm text-primary/40 py-10">مفيش مشرفين لعرضهم</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-primary/40 text-xs border-b border-primary/10">
            <th className="py-3 pr-2 text-right w-8"><input type="checkbox" className="accent-secondary" /></th>
            <th className="py-3 text-right font-medium">الأدمن</th>
            <th className="py-3 text-right font-medium">البريد الإلكتروني</th>
            <th className="py-3 text-right font-medium">الدور</th>
            <th className="py-3 text-right font-medium">الحالة</th>
            <th className="py-3 text-right font-medium">آخر دخول</th>
            <th className="py-3 text-right font-medium">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => {
            const isSelected = a.id === selectedId;
            const displayName = a.full_name?.trim() || a.username;
            return (
              <tr
                key={a.id}
                onClick={() => onSelect(a.id)}
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
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-medium text-primary flex items-center gap-1.5">
                      {displayName}
                      {a.is_superuser && <Crown size={13} className="text-secondary" />}
                    </p>
                  </div>
                </td>
                <td className="py-3.5 text-primary/60" dir="ltr">{a.email}</td>
                <td className="py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleStyles[a.role_display]}`}>{a.role_display}</span>
                </td>
                <td className="py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${a.is_active ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary/60"}`}>
                    {a.is_active ? "نشط" : "غير نشط"}
                  </span>
                </td>
                <td className="py-3.5 text-primary/60 text-xs">{formatLastLogin(a.last_login)}</td>
                <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    aria-label="عرض"
                    onClick={() => onSelect(a.id)}
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