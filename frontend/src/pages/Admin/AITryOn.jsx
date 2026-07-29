import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  Trash2,
  Settings,
  BarChart3,
  Camera,
  ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

import SectionCard from "../../components/admin/shared/SectionCard";
import DonutChart from "../../components/admin/charts/DonutChart";
import TryOnSessionsChart from "../../components/admin/tryon/Tryonsessionschart";
import TopTriedGlasses from "../../components/admin/tryon/Toptriedglasses";
import TryOnToolbar from "../../components/admin/tryon/Tryontoolbar";
import TryOnTable, { sessions } from "../../components/admin/tryon/Tryontable";
import SessionDetailPanel from "../../components/admin/tryon/Sessiondetailpanel";

export default function AiTryOn() {
  const [selectedId, setSelectedId] = useState(sessions[0].id);
  const selectedSession = sessions.find((s) => s.id === selectedId) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">التجربة الافتراضية بالذكاء الاصطناعي</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/admin" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <span className="text-primary/60">التجربة الافتراضية</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
            <Upload size={15} /> تصدير الجلسات
          </button>
          <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
            <Trash2 size={15} /> حذف الجلسات القديمة
          </button>
          <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
            <Settings size={15} /> إعدادات الذكاء الاصطناعي
          </button>
          <button className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition">
            <BarChart3 size={15} /> عرض التحليلات
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Camera} title="إجمالي الجلسات" value="18,532" change="16.4%" trend="up" />
        <StatCard icon={ImageIcon} title="الصور المرفوعة" value="22,910" change="14.7%" trend="up" />
        <StatCard icon={CheckCircle2} title="تجارب ناجحة" value="16,542" change="17.8%" trend="up" />
        <StatCard icon={XCircle} title="جلسات فاشلة" value="1,990" change="8.3%" trend="down" />
        <StatCard icon={Clock} title="متوسط وقت المعالجة" value="2.48 ث" change="0.41 ث" trend="down" />
        <StatCard icon={Star} title="متوسط درجة الثقة" value="94.6%" change="1.2%" trend="up" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr_1fr] gap-4">
        <SectionCard title="جلسات التجربة الافتراضية" action="آخر 30 يوم">
          <TryOnSessionsChart />
        </SectionCard>

        <SectionCard title="دقة اكتشاف الوجه" action="آخر 30 يوم">
          <DonutChart
            centerValue="92.1%"
            centerLabel="معدل النجاح"
            palette={["#10b981", "#ef4444"]}
            data={[
              { label: "ناجحة", value: 92.1 },
              { label: "فاشلة", value: 7.9 },
            ]}
          />
        </SectionCard>

        <SectionCard title="الأكثر تجربة" action="عرض الكل">
          <TopTriedGlasses />
        </SectionCard>
      </div>

      {/* Toolbar + table + detail panel */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <SectionCard className="!pt-4">
            <TryOnToolbar />
          </SectionCard>

          <SectionCard>
            <TryOnTable selectedId={selectedId} onSelect={setSelectedId} />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-primary/5">
              <p className="text-xs text-primary/50">عرض 1 إلى 5 من 18,532 جلسة</p>
              <div className="flex items-center gap-3">
                <Pagination />
                <button className="flex items-center gap-1 text-xs text-primary/60 bg-background border border-primary/10 rounded-lg px-2.5 py-1.5">
                  5 / صفحة <ChevronDown size={12} />
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        <SessionDetailPanel session={selectedSession} onClose={() => setSelectedId(null)} />
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
  const pages = [1, 2, 3, "…", 3707];
  return (
    <div className="flex items-center gap-1">
      <PageBtn label="‹" />
      {pages.map((p, i) => (
        <button
          key={i}
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