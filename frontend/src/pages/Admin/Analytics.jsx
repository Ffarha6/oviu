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

import SectionCard from "../../components/dashboard/shared/SectionCard";
import AnalyticsTabs from "../../components/dashboard/analytics/Analyticstabs";
import RevenueOverviewChart from "../../components/dashboard/analytics/Revenueoverviewchart";
import SalesByChannelDonut from "../../components/dashboard/analytics/Salesbychanneldonut";
import VisitorsOverviewPanel from "../../components/dashboard/analytics/Visitorsoverviewpanel";
import TrafficSourcesTable from "../../components/dashboard/analytics/Trafficsourcestable";
import TopSellingProductsTable from "../../components/dashboard/analytics/Topsellingproductstable";
import RecentOrdersMiniTable from "../../components/dashboard/analytics/Recentordersminitable";
import DeviceBreakdownPanel from "../../components/dashboard/analytics/Devicebreakdownpanel";
import CustomerDemographicsPanel from "../../components/dashboard/analytics/Customerdemographicspanel";

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("نظرة عامة");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">التحليلات</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/dashboard" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <span className="text-primary/60">التحليلات</span>
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

      <AnalyticsTabs active={activeTab} onChange={setActiveTab} />

      {activeTab !== "نظرة عامة" ? (
        <div className="bg-surface rounded-2xl p-10 text-center text-sm text-primary/40">
          تحليلات "{activeTab}" هتتضاف قريبًا
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

          {/* Revenue + channel + visitors */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr_1fr] gap-4">
            <SectionCard title="نظرة عامة على الإيرادات" action="يوميًا">
              <RevenueOverviewChart />
            </SectionCard>
            <SectionCard title="المبيعات حسب القناة">
              <SalesByChannelDonut />
            </SectionCard>
            <SectionCard title="نظرة عامة على الزوار" action="آخر 7 أيام">
              <VisitorsOverviewPanel />
            </SectionCard>
          </div>

          {/* Traffic + top products + recent orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard title="مصادر الزيارات" action="آخر 30 يوم">
              <TrafficSourcesTable />
            </SectionCard>
            <SectionCard title="الأكثر مبيعًا" action="عرض الكل">
              <TopSellingProductsTable />
            </SectionCard>
            <SectionCard title="أحدث الطلبات" action="عرض الكل">
              <RecentOrdersMiniTable />
            </SectionCard>
          </div>

          {/* Device breakdown + demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="توزيع الأجهزة" action="آخر 30 يوم">
              <DeviceBreakdownPanel />
            </SectionCard>
            <SectionCard title="التركيبة السكانية للعملاء" action="عرض التقرير الكامل">
              <CustomerDemographicsPanel />
            </SectionCard>
          </div>
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