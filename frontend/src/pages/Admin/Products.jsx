import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus, ChevronLeft, ChevronDown, Download, Upload,
  Tag, Sparkles, Wallet, AlertTriangle, CheckCircle2, Boxes,
  CheckCheck, XCircle, Trash2, Loader2,
} from "lucide-react";

import api from "../../api/axios";
import ProductFiltersSidebar from "../../components/admin/products/ProductFiltersSidebar";
import ProductsToolbar from "../../components/admin/products/ProductsToolbar";
import ProductsTable from "../../components/admin/products/ProductsTable";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [importing, setImporting] = useState(false);

  // ── تحميل المنتجات من الباك إند ─────────────────────────────
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.product_type = category;
      if (stockStatus) params.stock_status = stockStatus;

      const res = await api.get("/dashboard/products/", { params });
      // بعض الباك إندات بترجع array مباشرة، وبعضها بيرجع { results, count } (pagination)
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setProducts(list);
    } catch (err) {
      console.error("فشل تحميل المنتجات:", err);
      setError("مقدرناش نجيب المنتجات، حاولي تحدّثي الصفحة");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, stockStatus]);

  useEffect(() => {
    // debounce بسيط عشان البحث ميضربش طلب مع كل حرف
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  // ── تفعيل/إيقاف منتج واحد ────────────────────────────────────
  const handleToggleStatus = async (id) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    // تحديث فوري في الواجهة، ولو الطلب فشل بنرجعه زي ما كان
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p)));
    try {
      await api.patch(`/dashboard/products/${id}/`, { is_active: !target.is_active });
    } catch (err) {
      console.error("فشل تحديث حالة المنتج:", err);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: target.is_active } : p)));
      alert("مقدرناش نحدث حالة المنتج، حاولي تاني");
    }
  };

  // ── الاختيار الجماعي ─────────────────────────────────────────
  const toggleOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleAll = () => {
    setSelectedIds((prev) => (prev.length === products.length ? [] : products.map((p) => p.id)));
  };

  const handleBulkActivate = async (activate) => {
    if (selectedIds.length === 0) return;
    setBulkRunning(true);
    try {
      await Promise.all(selectedIds.map((id) => api.patch(`/dashboard/products/${id}/`, { is_active: activate })));
      setProducts((prev) => prev.map((p) => (selectedIds.includes(p.id) ? { ...p, is_active: activate } : p)));
      setSelectedIds([]);
    } catch (err) {
      console.error("فشل الإجراء الجماعي:", err);
      alert("حصلت مشكلة أثناء تنفيذ الإجراء على بعض المنتجات");
      loadProducts();
    } finally {
      setBulkRunning(false);
      setBulkOpen(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`هل تريدين حذف ${selectedIds.length} منتج؟ الإجراء ده مش هيترجع.`)) return;
    setBulkRunning(true);
    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/dashboard/products/${id}/`)));
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error("فشل الحذف الجماعي:", err);
      alert("حصلت مشكلة أثناء حذف بعض المنتجات");
      loadProducts();
    } finally {
      setBulkRunning(false);
      setBulkOpen(false);
    }
  };

  // ── تصدير المنتجات المعروضة حاليًا لملف CSV (من غير الحاجة لـ endpoint في الباك إند) ──
  const handleExport = () => {
    if (products.length === 0) return;
    const headers = ["الاسم", "SKU", "الفئة", "الجنس", "السعر", "سعر الخصم", "المخزون", "الحالة"];
    const rows = products.map((p) => [
      p.name, p.sku, p.product_type, p.audience, p.price, p.discount_price ?? "", p.stock, p.is_active ? "مفعل" : "غير مفعل",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ⚠️ الـ endpoint ده تخمين (/dashboard/products/import/) — عدّليه لو مختلف عندك في الباك إند
  const handleImportFile = async (file) => {
    if (!file) return;
    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post("/dashboard/products/import/", formData);
      await loadProducts();
      alert("تم استيراد المنتجات بنجاح");
    } catch (err) {
      console.error("فشل الاستيراد:", err);
      alert("مقدرناش نستورد الملف، تأكدي من صيغته أو من رابط الاستيراد في الباك إند");
    } finally {
      setImporting(false);
    }
  };

  // ── حساب أرقام الكروت العلوية من نفس المنتجات المحمّلة ─────────
  const stats = useMemo(() => {
    const total = products.length;
    const categoriesCount = new Set(products.map((p) => p.product_type)).size;
    const now = new Date();
    const newThisMonth = products.filter((p) => {
      if (!p.created_at) return false;
      const d = new Date(p.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    const inStockCount = products.filter((p) => (p.stock ?? 0) > 0).length;
    const lowStockCount = products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10).length;
    const activeCount = products.filter((p) => p.is_active).length;

    return {
      total,
      categoriesCount,
      newThisMonth,
      inStockCount,
      inStockPercent: total ? Math.round((inStockCount / total) * 1000) / 10 : 0,
      lowStockCount,
      activeCount,
      activePercent: total ? Math.round((activeCount / total) * 1000) / 10 : 0,
    };
  }, [products]);

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">المنتجات</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/dashboard" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <span className="text-primary/60">كل المنتجات</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* الإجراءات الجماعية */}
          <div className="relative">
            <button
              onClick={() => setBulkOpen((v) => !v)}
              disabled={selectedIds.length === 0 || bulkRunning}
              className="flex items-center gap-1.5 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl hover:opacity-80 transition disabled:opacity-40"
            >
              {bulkRunning ? <Loader2 size={15} className="animate-spin" /> : <ChevronDown size={15} />}
              إجراءات جماعية {selectedIds.length > 0 && `(${selectedIds.length})`}
            </button>
            {bulkOpen && selectedIds.length > 0 && (
              <div className="absolute left-0 top-full mt-1.5 w-52 bg-background border border-primary/10 rounded-xl shadow-lg overflow-hidden z-10">
                <button onClick={() => handleBulkActivate(true)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-surface transition">
                  <CheckCheck size={14} className="text-emerald-600" /> تفعيل المحدد
                </button>
                <button onClick={() => handleBulkActivate(false)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-surface transition">
                  <XCircle size={14} className="text-amber-600" /> إيقاف المحدد
                </button>
                <button onClick={handleBulkDelete} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                  <Trash2 size={14} /> حذف المحدد
                </button>
              </div>
            )}
          </div>

          <label className="flex items-center gap-1.5 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl hover:opacity-80 transition cursor-pointer">
            {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            استيراد
            <input
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => { handleImportFile(e.target.files?.[0]); e.target.value = ""; }}
            />
          </label>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl hover:opacity-80 transition"
          >
            <Download size={15} /> تصدير
          </button>

          <Link
            to="/dashboard/products/add"
            className="flex items-center gap-1.5 bg-primary text-background text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition"
          >
            <Plus size={16} /> إضافة منتج
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4">{error}</div>
      )}

      {/* كروت الإحصائيات */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Tag} label="الفئات" value={stats.categoriesCount} sub="فئة منتج" />
        <StatCard icon={Sparkles} label="جديد هذا الشهر" value={stats.newThisMonth} sub="أضيف هذا الشهر" />
        <StatCard icon={Wallet} label="متوفر بالمخزون" value={stats.inStockCount} sub={`${stats.inStockPercent}% من الإجمالي`} highlight="text-emerald-600" />
        <StatCard icon={AlertTriangle} label="مخزون منخفض" value={stats.lowStockCount} sub="المخزون ≤ 10" highlight="text-amber-600" />
        <StatCard icon={CheckCircle2} label="منتجات مفعلة" value={stats.activeCount} sub={`${stats.activePercent}% من الإجمالي`} highlight="text-emerald-600" />
        <StatCard icon={Boxes} label="إجمالي المنتجات" value={stats.total} sub="كل المنتجات" />
      </div>

      {/* الفلاتر + الجدول */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <ProductFiltersSidebar />

        <div className="flex-1 min-w-0 w-full bg-surface rounded-2xl p-5 space-y-4">
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

          <ProductsTable
            products={products}
            loading={loading}
            onToggleStatus={handleToggleStatus}
            selectedIds={selectedIds}
            onToggleOne={toggleOne}
            onToggleAll={toggleAll}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, highlight }) {
  return (
    <div className="bg-surface rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-primary/50">{label}</span>
        <Icon size={16} className="text-primary/30" />
      </div>
      <p className={`text-2xl font-bold ${highlight || "text-primary"}`}>{value}</p>
      <p className={`text-[11px] ${highlight || "text-primary/40"}`}>{sub}</p>
    </div>
  );
}