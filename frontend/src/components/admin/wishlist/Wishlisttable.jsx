import { Eye, MoreVertical } from "lucide-react";

function formatDate(iso) {
  if (!iso) return { date: "—", time: "" };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
  };
}

// ✅ users دلوقتي بتيجي من الـ API الحقيقي (كل صف = مستخدم وقائمة أمنياته)
export default function WishlistTable({ users, loading }) {
  if (loading) {
    return <p className="text-center text-sm text-primary/40 py-10">جاري تحميل قوائم الأمنيات...</p>;
  }

  if (!users || users.length === 0) {
    return <p className="text-center text-sm text-primary/40 py-10">مفيش مستخدمين عندهم قوائم أمنيات لسه</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-primary/40 text-xs border-b border-primary/10">
            <th className="py-3 pr-2 text-right w-8"><input type="checkbox" className="accent-secondary" /></th>
            <th className="py-3 text-right font-medium">المستخدم</th>
            <th className="py-3 text-right font-medium">العناصر</th>
            <th className="py-3 text-right font-medium">إجمالي العناصر</th>
            <th className="py-3 text-right font-medium">آخر نشاط</th>
            <th className="py-3 text-right font-medium">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const { date, time } = formatDate(u.last_activity);
            return (
              <tr key={u.user_id} className="border-b border-primary/5 last:border-0 hover:bg-background transition-colors">
                <td className="py-3.5 pr-2"><input type="checkbox" className="accent-secondary" /></td>
                <td className="py-3.5">
                  <p className="font-medium text-primary">{u.name}</p>
                  <p className="text-xs text-primary/40" dir="ltr">{u.email}</p>
                </td>
                <td className="py-3.5">
                  <div className="flex items-center -space-x-2 rtl:space-x-reverse">
                    {u.preview_products.slice(0, 4).map((p, idx) => (
                      <div
                        key={p.id}
                        title={p.name}
                        className="w-8 h-8 rounded-lg bg-surface border-2 border-background flex items-center justify-center text-sm"
                        style={{ zIndex: 4 - idx }}
                      >
                        👓
                      </div>
                    ))}
                    {u.items_count > 4 && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] font-semibold text-primary/60">
                        +{u.items_count - 4}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3.5 text-primary font-medium">{u.items_count} عناصر</td>
                <td className="py-3.5">
                  <p className="text-primary/70">{date}</p>
                  <p className="text-xs text-primary/40">{time}</p>
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-1">
                    <IconBtn icon={Eye} label="عرض" />
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

function IconBtn({ icon: Icon, label }) {
  return (
    <button
      aria-label={label}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-primary/50 hover:bg-surface hover:text-primary transition"
    >
      <Icon size={15} />
    </button>
  );
}