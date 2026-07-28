import { Search } from "lucide-react";

// ✅ فلاتر "المستخدمين/الحالة/الأجهزة" وتاريخ اتشالت لأن الباك اند مش بيتتبعها
export default function WishlistToolbar({ search, onSearchChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5">
        <Search size={16} className="text-primary/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحثي عن مستخدم بالاسم أو الإيميل..."
          className="bg-transparent outline-none text-sm flex-1 text-primary placeholder:text-primary/40"
        />
      </div>
    </div>
  );
}