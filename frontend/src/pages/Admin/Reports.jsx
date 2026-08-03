import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Download,
  DollarSign,
  ShoppingBag,
  Users,
  Target,
  ShoppingCart,
  RotateCcw,
  ChevronLeft,
} from "lucide-react";

import api from "../../api/axios"; // ✅ عدّلي المسار لو مختلف عندك
import SectionCard from "../../components/admin/shared/SectionCard";
import ReportsTabs from "../../components/admin/reports/Reportstabs";
import SalesByCategoryDonut from "../../components/admin/reports/Salesbycategorydonut";
import OrdersByStatusDonut from "../../components/admin/reports/Ordersbystatusdonut";
import RecentReportsTable from "../../components/admin/reports/Recentreportstable";
import RevenueSummaryTable from "../../components/admin/reports/Revenuesummarytable";

import RevenueOverviewChart from "../../components/admin/analytics/Revenueoverviewchart";
import SalesByChannelDonut from "../../components/admin/analytics/Salesbychanneldonut";
import TopSellingProductsTable from "../../components/admin/analytics/Topsellingproductstable";

function toISO(d) {
  return d.toISOString().split("T")[0];
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState("نظرة عامة");

  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start: toISO(start), end: toISO(end) };
  });

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [reportsRefreshKey, setReportsRefreshKey] = useState(0);

  const fetchOverview = useCallback(() => {
    setLoading(true);
    api
      .get("/reports/overview/", { params: dateRange })
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.log(err);
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, [dateRange]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.post(
        "/reports/export/",
        { report_type: "overview", format: "xlsx", ...dateRange },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `تقرير_${dateRange.start}_${dateRange.end}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      // ✅ نحدّث جدول "أحدث التقارير" عشان يظهر التقرير الجديد فورًا
      setReportsRefreshKey((k) => k + 1);
    } catch (err) {
      console.log(err);
      alert("حصل خطأ أثناء تصدير التقرير");
    } finally {
      setExporting(false);
    }
  };

  const fmt = (n) => `${Number(n || 0).toLocaleString()} ج.م`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">التقارير</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/dashboard" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <span className="text-primary/60">التقارير</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
            <Calendar size={15} className="text-secondary" />
            <input
              type="date"
              value={dateRange.start}
              max={dateRange.end}
              onChange={(e) => setDateRange((d) => ({ ...d, start: e.target.value }))}
              className="bg-transparent outline-none"
            />
            <span className="text-primary/30">—</span>
            <input
              type="date"
              value={dateRange.end}
              min={dateRange.start}
              onChange={(e) => setDateRange((d) => ({ ...d, end: e.target.value }))}
              className="bg-transparent outline-none"
            />
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            <Download size={15} /> {exporting ? "جاري التصدير..." : "تصدير التقرير"}
          </button>
        </div>
      </div>

      <ReportsTabs active={activeTab} onChange={setActiveTab} />

      {activeTab !== "نظرة عامة" ? (
        <div className="bg-surface rounded-2xl p-10 text-center text-sm text-primary/40">
          تقارير "{activeTab}" هتتضاف قريبًا
        </div>
      ) : (
        <>
          {/* Stats */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface rounded-2xl p-4 h-24 animate-pulse" />
              ))}
            </div>
          ) : !stats ? (
            <div className="bg-surface rounded-2xl p-10 text-center text-sm text-primary/40">
              تعذر تحميل الإحصائيات
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon={DollarSign} title="إجمالي الإيرادات" value={fmt(stats.total_revenue)} change={stats.changes.revenue} />
              <StatCard icon={ShoppingBag} title="إجمالي الطلبات" value={stats.total_orders.toLocaleString()} change={stats.changes.orders} />
              <StatCard icon={Users} title="إجمالي العملاء" value={stats.total_customers.toLocaleString()} change={stats.changes.customers} />
              <StatCard icon={Target} title="معدل التحويل" value={`${stats.conversion_rate}%`} change={stats.changes.conversion_rate} />
              <StatCard icon={ShoppingCart} title="متوسط قيمة الطلب" value={fmt(stats.avg_order_value)} change={stats.changes.avg_order_value} />
              <StatCard icon={RotateCcw} title="المرتجعات" value={fmt(stats.returns)} change={stats.changes.returns} trendReversed />
            </div>
          )}

          {/* Sales overview + channel + category */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr_1fr] gap-4">
            <SectionCard title="نظرة عامة على المبيعات" action="يوميًا">
              <RevenueOverviewChart dateRange={dateRange} />
            </SectionCard>
            <SectionCard title="المبيعات حسب القناة">
              <SalesByChannelDonut dateRange={dateRange} />
            </SectionCard>
            <SectionCard title="المبيعات حسب الفئة" action="عرض الكل">
              <SalesByCategoryDonut dateRange={dateRange} />
            </SectionCard>
          </div>

          {/* Top products + orders by status + recent reports */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard title="الأكثر مبيعًا" action="عرض الكل">
              <TopSellingProductsTable dateRange={dateRange} />
            </SectionCard>
            <SectionCard title="الطلبات حسب الحالة">
              <OrdersByStatusDonut dateRange={dateRange} />
            </SectionCard>
            <SectionCard title="أحدث التقارير" action="عرض الكل">
              <RecentReportsTable refreshKey={reportsRefreshKey} />
            </SectionCard>
          </div>

          {/* Revenue summary */}
          <SectionCard title="ملخص الإيرادات">
            <RevenueSummaryTable dateRange={dateRange} />
          </SectionCard>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, change, trendReversed }) {
  // ✅ للمرتجعات: زيادة المرتجعات حاجة سيئة، فبنعكس اللون (احمر لو زادت)
  const isPositive = trendReversed ? change.trend === "down" : change.trend === "up";
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
        <p className={`text-[11px] mt-1.5 font-medium ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
          {change.trend === "up" ? "↑" : "↓"} {change.change}% <span className="text-primary/40 font-normal">مقارنة بالفترة السابقة</span>
        </p>
      </div>
    </div>
  );
}