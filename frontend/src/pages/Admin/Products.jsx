import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  Download,
  ChevronDown,
  Plus,
  Package,
  CheckCircle2,
  AlertTriangle,
  PackageX,
  Star,
  Tags,
  ChevronLeft,
} from "lucide-react";

import api from "../../api/axios";
import MiniStatCard from "../../components/admin/shared/MiniStatCard";
import SectionCard from "../../components/admin/shared/SectionCard";
import ProductsToolbar from "../../components/admin/products/ProductsToolbar";
import ProductsTable from "../../components/admin/products/ProductsTable";
import ProductFiltersSidebar from "../../components/admin/products/ProductFiltersSidebar";

export default function Products() {
  const [view, setView] = useState("list");

  // ── فلاتر وبحث ──
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [page, setPage] = useState(1);

  // ── بيانات حقيقية من الباك اند ──
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  // ── هاتي الإحصائيات مرة واحدة عند فتح الصفحة ──
  useEffect(() => {
    api.get("/dashboard/products/stats/")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("فشل تحميل إحصائيات المنتجات:", err))
      .finally(() => setStatsLoading(false));
  }, []);

  // ── هاتي قائمة المنتجات كل ما البحث/الفلتر/الصفحة تتغير ──
  const fetchProducts = useCallback(() => {
    setProductsLoading(true);
    api.get("/dashboard/products/", {
      params: {
        search: search || undefined,
        category: category || undefined,
        stock_status: stockStatus || undefined,
        page,
      },
    })
      .then((res) => {
        setProducts(res.data.results);
        setCount(res.data.count);
      })
      .catch((err) => console.error("فشل تحميل المنتجات:", err))
      .finally(() => setProductsLoading(false));
  }, [search, category, stockStatus, page]);

  useEffect(() => {
    // ✅ لما البحث/الفلتر يتغير نرجع لصفحة 1
    setPage(1);
  }, [search, category, stockStatus]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── تفعيل / إيقاف منتج ──
  const handleToggleStatus = async (productId) => {
    // تحديث فوري في الواجهة (optimistic) قبل ما نستنى رد السيرفر
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_active: !p.is_active } : p))
    );
    try {
      await api.patch(`/dashboard/products/${productId}/toggle-status/`);
    } catch (err) {
      console.error("فشل تغيير حالة المنتج:", err);
      // لو فشل، رجّعي الحالة زي ما كانت
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_active: !p.is_active } : p))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">المنتجات</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/dashboard" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <span>المنتجات</span>
            <ChevronLeft size={12} />
            <span className="text-primary/60">كل المنتجات</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
            <Upload size={15} /> تصدير
          </button>
          <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
            <Download size={15} /> استيراد
          </button>
          <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
            إجراءات جماعية <ChevronDown size={14} className="text-primary/40" />
          </button>
          <Link
            to="/dashboard/products/add"
            className="flex items-center gap-2 bg-primary text-background text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition"
          >
            <Plus size={16} /> إضافة منتج
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MiniStatCard icon={Package} title="إجمالي المنتجات" value={statsLoading ? "..." : stats?.total_products ?? 0} change={null} />
        <StatWithNote
          icon={CheckCircle2}
          title="منتجات مفعّلة"
          value={statsLoading ? "..." : stats?.active_products ?? 0}
          note={statsLoading ? "" : `${stats?.active_percent ?? 0}% من الإجمالي`}
          noteColor="text-emerald-600"
        />
        <StatWithNote
          icon={AlertTriangle}
          title="مخزون منخفض"
          value={statsLoading ? "..." : stats?.low_stock ?? 0}
          note="المخزون ≤ 10"
          noteColor="text-amber-600"
        />
        <StatWithNote
          icon={PackageX}
          title="نفد من المخزون"
          value={statsLoading ? "..." : stats?.out_of_stock ?? 0}
          note={statsLoading ? "" : `${stats?.out_of_stock_percent ?? 0}% من الإجمالي`}
          noteColor="text-red-500"
        />
        <StatWithNote
          icon={Star}
          title="جديد هذا الشهر"
          value={statsLoading ? "..." : stats?.new_this_month ?? 0}
          note="أُضيف هذا الشهر"
          noteColor="text-primary/40"
        />
        <StatWithNote
          icon={Tags}
          title="الفئات"
          value={statsLoading ? "..." : stats?.categories ?? 0}
          note="فئة منتج"
          noteColor="text-primary/40"
        />
      </div>

      {/* Toolbar + table + filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <SectionCard className="!pt-4">
            <ProductsToolbar
              view={view}
              onViewChange={setView}
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
              stockStatus={stockStatus}
              onStockStatusChange={setStockStatus}
            />
          </SectionCard>

          <SectionCard>
            <ProductsTable
              products={products}
              loading={productsLoading}
              onToggleStatus={handleToggleStatus}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-primary/5">
              <p className="text-xs text-primary/50">
                عرض {products.length === 0 ? 0 : (page - 1) * pageSize + 1} إلى {Math.min(page * pageSize, count)} من {count} منتج
              </p>
              <div className="flex items-center gap-3">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </div>
          </SectionCard>
        </div>

        <ProductFiltersSidebar />
      </div>
    </div>
  );
}

function StatWithNote({ icon: Icon, title, value, note, noteColor }) {
  return (
    <div className="bg-surface rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
          <Icon size={16} />
        </div>
        <p className="text-xs text-primary/50 leading-tight">{title}</p>
      </div>
      <div>
        <p className="text-lg font-bold text-primary leading-none">{value}</p>
        <p className={`text-[11px] mt-1.5 font-medium ${noteColor}`}>{note}</p>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-7 h-7 rounded-lg text-xs flex items-center justify-center text-primary/40 border border-primary/10 disabled:opacity-40"
      >
        ‹
      </button>
      {pages.map((p, i) => (
        <button
          key={i}
          onClick={() => typeof p === "number" && onPageChange(p)}
          disabled={p === "…"}
          className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center ${
            p === page ? "bg-primary text-background font-semibold" : "text-primary/60 hover:bg-background"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-7 h-7 rounded-lg text-xs flex items-center justify-center text-primary/40 border border-primary/10 disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}