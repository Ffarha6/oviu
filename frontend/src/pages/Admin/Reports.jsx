import { useState } from "react";
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
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

import SectionCard from "../../components/admin/shared/SectionCard";
import ReportsTabs from "../../components/admin/reports/Reportstabs";
import SalesByCategoryDonut from "../../components/admin/reports/Salesbycategorydonut";
import OrdersByStatusDonut from "../../components/admin/reports/Ordersbystatusdonut";
import RecentReportsTable from "../../components/admin/reports/Recentreportstable";
import RevenueSummaryTable from "../../components/admin/reports/Revenuesummarytable";

// ✅ إعادة استخدام مكونات جاهزة من صفحة Analytics بدل ما نكررهم
import RevenueOverviewChart from "../../components/admin/analytics/Revenueoverviewchart";
import SalesByChannelDonut from "../../components/admin/analytics/Salesbychanneldonut";
import TopSellingProductsTable from "../../components/admin/analytics/Topsellingproductstable";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("نظرة عامة");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">التقارير</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/admin" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <span className="text-primary/60">التقارير</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
            <Calendar size={15} className="text-secondary" /> 18 مايو - 18 يونيو 2025
            <ChevronDown size={14} className="text-primary/40" />
          </button>
          <button className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition">
            <Download size={15} /> تصدير التقرير
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={DollarSign} title="إجمالي الإيرادات" value="1,248,562 ج.م" change="18.6%" trend="up" />
            <StatCard icon={ShoppingBag} title="إجمالي الطلبات" value="2,456" change="15.2%" trend="up" />
            <StatCard icon={Users} title="إجمالي العملاء" value="8,732" change="12.4%" trend="up" />
            <StatCard icon={Target} title="معدل التحويل" value="3.24%" change="8.7%" trend="up" />
            <StatCard icon={ShoppingCart} title="متوسط قيمة الطلب" value="508 ج.م" change="5.3%" trend="up" />
            <StatCard icon={RotateCcw} title="المرتجعات" value="18,420 ج.م" change="8.1%" trend="down" />
          </div>

          {/* Sales overview + channel + category */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr_1fr] gap-4">
            <SectionCard title="نظرة عامة على المبيعات" action="يوميًا">
              <RevenueOverviewChart />
            </SectionCard>
            <SectionCard title="المبيعات حسب القناة">
              <SalesByChannelDonut />
            </SectionCard>
            <SectionCard title="المبيعات حسب الفئة" action="عرض الكل">
              <SalesByCategoryDonut />
            </SectionCard>
          </div>

          {/* Top products + orders by status + recent reports */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard title="الأكثر مبيعًا" action="عرض الكل">
              <TopSellingProductsTable />
            </SectionCard>
            <SectionCard title="الطلبات حسب الحالة">
              <OrdersByStatusDonut />
            </SectionCard>
            <SectionCard title="أحدث التقارير" action="عرض الكل">
              <RecentReportsTable />
            </SectionCard>
          </div>

          {/* Revenue summary */}
          <SectionCard title="ملخص الإيرادات">
            <RevenueSummaryTable />
          </SectionCard>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, change, trend }) {
  const isUp = trend === "up";
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
        <p className={`text-[11px] mt-1.5 font-medium ${isUp ? "text-emerald-600" : "text-red-500"}`}>
          {isUp ? "↑" : "↓"} {change} <span className="text-primary/40 font-normal">مقارنة بالفترة السابقة</span>
        </p>
      </div>
    </div>
  );
}