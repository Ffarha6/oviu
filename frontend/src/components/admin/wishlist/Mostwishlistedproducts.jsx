import { useState, useEffect } from "react";
import api from "../../../api/axios";

export default function MostWishlistedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/wishlist/top-products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("فشل تحميل المنتجات الأكثر إضافة:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-xs text-primary/40 text-center py-6">جاري التحميل...</p>;
  if (products.length === 0) return <p className="text-xs text-primary/40 text-center py-6">مفيش بيانات كافية لسه</p>;

  return (
    <ul className="space-y-3.5">
      {products.map((p, i) => (
        <li key={p.product__id} className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {i + 1}
          </span>
          <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-lg shrink-0">👓</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-primary truncate">{p.product__name}</p>
            <p className="text-xs text-primary/40" dir="ltr">{p.product__sku}</p>
          </div>
          <span className="text-sm font-semibold text-primary shrink-0">{p.count.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}