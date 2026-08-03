import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  Download,
  ShoppingBag,
  Hourglass,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronDown,
  Loader2,
  Calendar,
} from "lucide-react";

import api from "../../api/axios";
import SectionCard from "../../components/admin/shared/SectionCard";
import OrdersToolbar from "../../components/admin/orders/OrdersToolbar";
import OrdersTable from "../../components/admin/orders/OrdersTable";

const statusToBackend = {
  "كل الحالات": "",
  "قيد الانتظار": "pending",
  "مؤكد": "confirmed",
  "قيد المعالجة": "preparing",
  "تم الشحن": "shipped",
  "تم التوصيل": "delivered",
  "ملغي": "cancelled",
};

function toISODate(d) {
  return d.toISOString().split("T")[0];
}

function getPresetRange(preset) {
  const today = new Date();
  if (preset === "today") return { from: toISODate(today), to: toISODate(today) };
  if (preset === "week") {
    const past = new Date(today);
    past.setDate(past.getDate() - 7);
    return { from: toISODate(past), to: toISODate(today) };
  }
  if (preset === "month") {
    const past = new Date(today);
    past.setMonth(past.getMonth() - 1);
    return { from: toISODate(past), to: toISODate(today) };
  }
  return { from: "", to: "" };
}

const exportPresets = [
  { value: "", label: "كل الطلبات" },
  { value: "today", label: "طلبات اليوم" },
  { value: "week", label: "آخر أسبوع" },
  { value: "month", label: "آخر شهر" },
  { value: "custom", label: "فترة مخصصة..." },
];

export default function Orders() {
  const [status, setStatus] = useState("كل الحالات");
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [datePreset, setDatePreset] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [count, setCount] = useState(0);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  // ── قائمة التصدير المنسدلة ──
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPreset, setExportPreset] = useState("");
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const effectiveRange = datePreset === "custom" ? { from: dateFrom, to: dateTo } : getPresetRange(datePreset);

  useEffect(() => {
    api.get("/dashboard/orders/stats/")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("فشل تحميل إحصائيات الطلبات:", err))
      .finally(() => setStatsLoading(false));
  }, []);

  const fetchOrders = useCallback(() => {
    setOrdersLoading(true);
    api.get("/dashboard/orders/", {
      params: {
        search: search || undefined,
        status: statusToBackend[status] || undefined,
        payment_method: paymentMethod || undefined,
        date_from: effectiveRange.from || undefined,
        date_to: effectiveRange.to || undefined,
        page,
      },
    })
      .then((res) => {
        setOrders(res.data.results);
        setCount(res.data.count);
      })
      .catch((err) => console.error("فشل تحميل الطلبات:", err))
      .finally(() => setOrdersLoading(false));
  }, [search, status, paymentMethod, effectiveRange.from, effectiveRange.to, page]);

  useEffect(() => {
    setPage(1);
  }, [search, status, paymentMethod, effectiveRange.from, effectiveRange.to]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleReset = () => {
    setSearch("");
    setStatus("كل الحالات");
    setPaymentMethod("");
    setDatePreset("");
    setDateFrom("");
    setDateTo("");
  };

  // ── تصدير مستقل عن فلتر الجدول، بفترة تختارينها من القائمة ──
  const runExport = async (range) => {
    setExporting(true);
    try {
      const res = await api.get("/dashboard/orders/export/", {
        params: {
          date_from: range.from || undefined,
          date_to: range.to || undefined,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `طلبات-${toISODate(new Date())}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setExportOpen(false);
    } catch (err) {
      console.error("فشل تصدير الطلبات:", err);
      alert("حصل خطأ أثناء التصدير");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPresetClick = (value) => {
    setExportPreset(value);
    if (value !== "custom") {
      runExport(getPresetRange(value));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">الطلبات</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/dashboard" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <span>الطلبات</span>
            <ChevronLeft size={12} />
            <span className="text-primary/60">كل الطلبات</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* زرار التصدير + القائمة المنسدلة */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen((v) => !v)}
              disabled={exporting}
              className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl disabled:opacity-50"
            >
              {exporting ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              تصدير
              <ChevronDown size={13} className="text-primary/40" />
            </button>

            {exportOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-background border border-primary/10 rounded-xl shadow-lg z-20 p-2">
                <p className="text-xs font-bold text-primary/50 px-2 py-1.5">اختاري الفترة المطلوب تصديرها</p>
                {exportPresets.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => handleExportPresetClick(p.value)}
                    className={`w-full text-right text-sm px-3 py-2 rounded-lg transition ${
                      exportPreset === p.value ? "bg-secondary/15 text-primary font-semibold" : "text-primary/70 hover:bg-surface"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}

                {exportPreset === "custom" && (
                  <div className="p-2 space-y-2 border-t border-primary/10 mt-1 pt-3">
                    <label className="flex items-center justify-between gap-2 text-xs text-primary/60">
                      من
                      <input
                        type="date"
                        value={exportFrom}
                        onChange={(e) => setExportFrom(e.target.value)}
                        className="flex-1 bg-surface border border-primary/10 rounded-lg px-2 py-1.5 text-sm text-primary outline-none"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-2 text-xs text-primary/60">
                      إلى
                      <input
                        type="date"
                        value={exportTo}
                        onChange={(e) => setExportTo(e.target.value)}
                        className="flex-1 bg-surface border border-primary/10 rounded-lg px-2 py-1.5 text-sm text-primary outline-none"
                      />
                    </label>
                    <button
                      onClick={() => runExport({ from: exportFrom, to: exportTo })}
                      disabled={!exportFrom || !exportTo || exporting}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-background text-sm font-semibold py-2 rounded-lg disabled:opacity-40 mt-1"
                    >
                      <Calendar size={14} /> تحميل الملف
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
            <Download size={15} /> استيراد
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <OrderStatCard icon={ShoppingBag} iconBg="bg-blue-50" iconColor="text-blue-600" title="إجمالي الطلبات" value={statsLoading ? "..." : stats?.total_orders ?? 0} />
        <OrderStatCard icon={Hourglass} iconBg="bg-amber-50" iconColor="text-amber-600" title="قيد الانتظار" value={statsLoading ? "..." : stats?.pending ?? 0} />
        <OrderStatCard icon={Package} iconBg="bg-purple-50" iconColor="text-purple-600" title="قيد المعالجة" value={statsLoading ? "..." : stats?.processing ?? 0} />
        <OrderStatCard icon={Truck} iconBg="bg-blue-50" iconColor="text-blue-600" title="تم الشحن" value={statsLoading ? "..." : stats?.shipped ?? 0} />
        <OrderStatCard icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="تم التوصيل" value={statsLoading ? "..." : stats?.delivered ?? 0} />
        <OrderStatCard icon={XCircle} iconBg="bg-red-50" iconColor="text-red-600" title="ملغي" value={statsLoading ? "..." : stats?.cancelled ?? 0} />
      </div>

      {/* Toolbar + table */}
      <SectionCard className="!pt-4">
        <OrdersToolbar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          datePreset={datePreset}
          onDatePresetChange={setDatePreset}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onReset={handleReset}
        />
      </SectionCard>

      <SectionCard>
        <OrdersTable orders={orders} loading={ordersLoading} />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-primary/5">
          <p className="text-xs text-primary/50">
            عرض {orders.length === 0 ? 0 : (page - 1) * pageSize + 1} إلى {Math.min(page * pageSize, count)} من {count} طلب
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </SectionCard>
    </div>
  );
}

function OrderStatCard({ icon: Icon, iconBg, iconColor, title, value }) {
  return (
    <div className="bg-surface rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
          <Icon size={16} />
        </div>
        <p className="text-xs text-primary/50 leading-tight">{title}</p>
      </div>
      <p className="text-lg font-bold text-primary leading-none">{value}</p>
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
      <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="w-7 h-7 rounded-lg text-xs flex items-center justify-center text-primary/40 border border-primary/10 disabled:opacity-40">‹</button>
      {pages.map((p, i) => (
        <button
          key={i}
          onClick={() => typeof p === "number" && onPageChange(p)}
          disabled={p === "…"}
          className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center ${p === page ? "bg-primary text-background font-semibold" : "text-primary/60 hover:bg-background"}`}
        >
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="w-7 h-7 rounded-lg text-xs flex items-center justify-center text-primary/40 border border-primary/10 disabled:opacity-40">›</button>
    </div>
  );
}