import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Plus,
  Tag,
  ShoppingBag,
  Clock,
  Hourglass,
  Percent,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

import SectionCard from "../../components/dashboard/shared/SectionCard";
import OffersToolbar from "../../components/dashboard/offers/Offerstoolbar";
import OffersTable, { offers } from "../../components/dashboard/offers/Offerstable";
import OffersOverviewDonut from "../../components/dashboard/offers/Offersoverviewdonut";
import DiscountPerformanceChart from "../../components/dashboard/offers/Discountperformancechart";
import TopPerformingOffersTable from "../../components/dashboard/offers/Topperformingofferstable";

export default function Offers() {
  const [selectedCode, setSelectedCode] = useState(offers[0].code);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">العروض</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/dashboard" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <span className="text-primary/60">العروض</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
            <Download size={15} /> استيراد العروض
          </button>
          <button className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition">
            <Plus size={16} /> إنشاء عرض جديد
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={Tag} title="إجمالي العروض" value="24" change="20%" trend="up" />
        <StatCard icon={ShoppingBag} title="عروض فعّالة" value="12" change="9.1%" trend="up" />
        <StatCard icon={Clock} title="عروض مجدولة" value="5" change="25%" trend="up" />
        <StatCard icon={Hourglass} title="عروض منتهية" value="7" change="12.5%" trend="down" />
        <StatCard icon={Percent} title="إجمالي الخصومات" value="48,650 ج.م" change="15.3%" trend="up" />
      </div>

      {/* Toolbar + table + side panel */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <SectionCard className="!pt-4">
            <OffersToolbar />
          </SectionCard>

          <SectionCard>
            <OffersTable selectedCode={selectedCode} onSelect={setSelectedCode} />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-primary/5">
              <p className="text-xs text-primary/50">عرض 1 إلى 8 من 24 عرض</p>
              <div className="flex items-center gap-3">
                <Pagination />
                <button className="flex items-center gap-1 text-xs text-primary/60 bg-background border border-primary/10 rounded-lg px-2.5 py-1.5">
                  10 / صفحة <ChevronDown size={12} />
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <SectionCard title="نظرة عامة على العروض" action="18 مايو - 18 يونيو">
            <OffersOverviewDonut />
          </SectionCard>

          <SectionCard title="أداء الخصومات" action="آخر 30 يوم">
            <DiscountPerformanceChart />
          </SectionCard>

          <SectionCard title="الأفضل أداءً" action="عرض الكل">
            <TopPerformingOffersTable />
          </SectionCard>
        </div>
      </div>
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
          {isUp ? "↑" : "↓"} {change} <span className="text-primary/40 font-normal">مقارنة بآخر 30 يوم</span>
        </p>
      </div>
    </div>
  );
}

function Pagination() {
  const pages = [1, 2, 3];
  return (
    <div className="flex items-center gap-1">
      <PageBtn label="‹" />
      {pages.map((p) => (
        <button
          key={p}
          className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center ${
            p === 1 ? "bg-primary text-background font-semibold" : "text-primary/60 hover:bg-background"
          }`}
        >
          {p}
        </button>
      ))}
      <PageBtn label="›" />
    </div>
  );
}

function PageBtn({ label }) {
  return (
    <button className="w-7 h-7 rounded-lg text-xs flex items-center justify-center text-primary/40 border border-primary/10">
      {label}
    </button>
  );
}