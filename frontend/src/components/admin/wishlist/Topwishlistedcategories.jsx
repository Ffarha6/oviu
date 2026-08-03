import { useState, useEffect } from "react";
import api from "../../../api/axios";

const categoryLabels = {
  sunglasses: "نظارات شمسية",
  medical: "نظارات طبية",
  reading: "نظارات قراءة",
  lenses: "عدسات لاصقة",
};

const categoryIcons = {
  sunglasses: "🕶️",
  medical: "👓",
  reading: "📖",
  lenses: "💧",
};

export default function TopWishlistedCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/wishlist/top-categories/")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("فشل تحميل الفئات الأكثر إضافة:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-xs text-primary/40 text-center py-6">جاري التحميل...</p>;
  if (categories.length === 0) return <p className="text-xs text-primary/40 text-center py-6">مفيش بيانات كافية لسه</p>;

  const maxCount = Math.max(...categories.map((c) => c.count));

  return (
    <ul className="space-y-3.5">
      {categories.map((c) => (
        <li key={c.category} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-lg shrink-0">
            {categoryIcons[c.category] || "👓"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-primary truncate">{categoryLabels[c.category] || c.category}</p>
              <span className="text-sm font-semibold text-primary shrink-0">{c.count.toLocaleString()}</span>
            </div>
            <div className="h-1.5 rounded-full bg-primary/10 overflow-hidden mt-1.5">
              <div className="h-full rounded-full bg-secondary" style={{ width: `${(c.count / maxCount) * 100}%` }} />
            </div>
          </div>
          <span className="text-[11px] font-medium text-primary/40 shrink-0">{c.percent}%</span>
        </li>
      ))}
    </ul>
  );
}