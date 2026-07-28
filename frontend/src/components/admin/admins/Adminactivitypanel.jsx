function formatLastLogin(iso) {
  if (!iso) return "لم يسجل الدخول بعد";
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" }) +
    " - " + d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

// بيانات حقيقية من آخر تسجيل دخول لكل مشرف — سجل نشاط تفصيلي (مين عدّل إيه بالظبط)
// محتاج نظام تتبع منفصل (Audit Log) لسه مش موجود في المشروع، ممكن نضيفه بعدين لو احتجتيه
export default function AdminActivityPanel({ admins, loading }) {
  if (loading) {
    return <p className="text-xs text-primary/40 text-center py-4">جاري التحميل...</p>;
  }

  const sorted = [...(admins || [])]
    .filter((a) => a.last_login)
    .sort((a, b) => new Date(b.last_login) - new Date(a.last_login))
    .slice(0, 6);

  if (sorted.length === 0) {
    return <p className="text-xs text-primary/40 text-center py-4">مفيش تسجيلات دخول بعد</p>;
  }

  return (
    <ul className="space-y-3">
      {sorted.map((a) => (
        <li key={a.id} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-secondary/20 text-secondary font-semibold flex items-center justify-center shrink-0 text-[11px]">
              {(a.full_name?.trim() || a.username).charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-medium text-primary truncate">{a.full_name?.trim() || a.username}</p>
          </div>
          <span className="text-[11px] text-primary/40 shrink-0">{formatLastLogin(a.last_login)}</span>
        </li>
      ))}
    </ul>
  );
}