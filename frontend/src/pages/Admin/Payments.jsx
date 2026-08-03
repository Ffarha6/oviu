import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  Download,
  Plus,
  CreditCard,
  CheckCircle2,
  RotateCcw,
  Clock,
  TrendingUp,
  Percent,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

import SectionCard from "../../components/dashboard/shared/SectionCard";
import PaymentsToolbar from "../../components/dashboard/payments/Paymentstoolbar";
import PaymentsTable, { payments } from "../../components/dashboard/payments/Paymentstable";
import PaymentDetailPanel from "../../components/dashboard/payments/Paymentdetailpanel";

export default function Payments() {
  const [selectedId, setSelectedId] = useState(payments[0].id);
  const selectedPayment = payments.find((p) => p.id === selectedId) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">المدفوعات</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/dashboard" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <span>المدفوعات</span>
            <ChevronLeft size={12} />
            <span className="text-primary/60">كل المدفوعات</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
            <Upload size={15} /> تصدير
          </button>
          <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
            <Download size={15} /> استيراد
          </button>
          <button className="flex items-center gap-2 bg-primary text-background text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition">
            <Plus size={16} /> دفعة جديدة
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={CreditCard} title="إجمالي المدفوعات" value="1,248,320 ج.م" change="18.6%" trend="up" />
        <StatCard icon={CheckCircle2} title="مدفوعات ناجحة" value="1,842" change="15.2%" trend="up" />
        <StatCard icon={RotateCcw} title="المبلغ المسترجع" value="24,680 ج.م" change="6.3%" trend="down" />
        <StatCard icon={Clock} title="مدفوعات قيد الانتظار" value="64" change="8.7%" trend="down" />
        <StatCard icon={TrendingUp} title="متوسط قيمة الطلب" value="676 ج.م" change="12.4%" trend="up" />
        <StatCard icon={Percent} title="معدل النجاح" value="98.4%" change="2.1%" trend="up" />
      </div>

      {/* Toolbar + table + detail panel */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <SectionCard className="!pt-4">
            <PaymentsToolbar />
          </SectionCard>

          <SectionCard>
            <PaymentsTable selectedId={selectedId} onSelect={setSelectedId} />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-primary/5">
              <p className="text-xs text-primary/50">عرض 1 إلى 8 من 1,842 دفعة</p>
              <div className="flex items-center gap-3">
                <Pagination />
                <button className="flex items-center gap-1 text-xs text-primary/60 bg-background border border-primary/10 rounded-lg px-2.5 py-1.5">
                  20 / صفحة <ChevronDown size={12} />
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        <PaymentDetailPanel payment={selectedPayment} onClose={() => setSelectedId(null)} />
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
          {isUp ? "↗" : "↘"} {change} <span className="text-primary/40 font-normal">مقارنة بآخر 30 يوم</span>
        </p>
      </div>
    </div>
  );
}

function Pagination() {
  const pages = [1, 2, 3, 4, "…", 93];
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