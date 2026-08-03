import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Hourglass,
  CreditCard,
  Ticket,
  Star,
  Heart,
  Glasses,
  MessageCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  PackageX,
  UserPlus,
  Repeat,
} from "lucide-react";

import StatCard from "../../components/dashboard/shared/StatCard";
import MiniStatCard from "../../components/dashboard/shared/MiniStatCard";
import SectionCard from "../../components/dashboard/shared/SectionCard";
import RevenueChart from "../../components/dashboard/charts/RevenueChart";
import DonutChart from "../../components/dashboard/charts/DonutChart";

// بيانات تجريبية — استبدليها بالـ API بتاعتك (services/viona/...)
const recentOrders = [
  { id: "#ORD-1842", name: "سارة أحمد", date: "18 يونيو 2025", status: "قيد الانتظار", amount: "2,850 ج.م" },
  { id: "#ORD-1841", name: "محمد علي", date: "18 يونيو 2025", status: "مؤكد", amount: "1,650 ج.م" },
  { id: "#ORD-1840", name: "منة حسن", date: "17 يونيو 2025", status: "قيد التجهيز", amount: "3,200 ج.م" },
  { id: "#ORD-1839", name: "عمر مصطفى", date: "17 يونيو 2025", status: "تم الشحن", amount: "1,950 ج.م" },
  { id: "#ORD-1838", name: "نورهان عادل", date: "17 يونيو 2025", status: "تم التوصيل", amount: "2,100 ج.م" },
];

const statusStyles = {
  "قيد الانتظار": "bg-amber-100 text-amber-700",
  "مؤكد": "bg-blue-100 text-blue-700",
  "قيد التجهيز": "bg-secondary/15 text-secondary",
  "تم الشحن": "bg-indigo-100 text-indigo-700",
  "تم التوصيل": "bg-emerald-100 text-emerald-700",
  "مكتمل": "bg-emerald-100 text-emerald-700",
  "قيد المعالجة": "bg-amber-100 text-amber-700",
  "فشلت": "bg-red-100 text-red-700",
};

const recentPayments = [
  { id: "#PAY-2456", order: "#ORD-1842", date: "18 يونيو 2025", status: "مكتمل", amount: "2,850 ج.م" },
  { id: "#PAY-2455", order: "#ORD-1841", date: "18 يونيو 2025", status: "مكتمل", amount: "1,650 ج.م" },
  { id: "#PAY-2454", order: "#ORD-1840", date: "17 يونيو 2025", status: "قيد المعالجة", amount: "3,200 ج.م" },
  { id: "#PAY-2453", order: "#ORD-1839", date: "17 يونيو 2025", status: "مكتمل", amount: "1,950 ج.م" },
  { id: "#PAY-2452", order: "#ORD-1838", date: "17 يونيو 2025", status: "فشلت", amount: "2,100 ج.م" },
];

const recentReviews = [
  { name: "نورهان م.", product: "أفياتور كلاسيك", rating: 4, date: "18 يونيو 2025" },
  { name: "أحمد ت.", product: "بلو كت برو", rating: 4, date: "18 يونيو 2025" },
  { name: "سارة ك.", product: "راوند ميتال", rating: 4, date: "17 يونيو 2025" },
  { name: "مصطفى ر.", product: "بولارايزد برو", rating: 4, date: "17 يونيو 2025" },
  { name: "منة ع.", product: "كات آي بريميوم", rating: 4, date: "17 يونيو 2025" },
];

const quickInsights = [
  { icon: Glasses, label: "المنتج الأكثر مبيعًا", value: "أفياتور كلاسيك", sub: "1,248 مباع" },
  { icon: Glasses, label: "المنتج الأكثر مشاهدة", value: "بلو كت برو", sub: "2,856 مشاهدة" },
  { icon: Glasses, label: "الأكثر تجربة افتراضيًا", value: "راوند ميتال", sub: "952 تجربة" },
  { icon: Ticket, label: "الكوبون الأكثر استخدامًا", value: "OVIU10", sub: "248 مرة" },
  { icon: TrendingUp, label: "معدل التحويل", value: "3.24%", sub: "+0.86% مقارنة بآخر 30 يوم" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">أهلًا بعودتك، أدمن 👋</h1>
          <p className="text-sm text-primary/50 mt-1">
            ده اللي بيحصل في متجرك النهاردة.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
          <Calendar size={16} className="text-secondary" />
          18 مايو – 18 يونيو 2025
        </button>
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          title="إجمالي الإيرادات"
          value="1,248,320 ج.م"
          change="18.6%"
          trend="up"
          sparklineData={[{ v: 10 }, { v: 14 }, { v: 12 }, { v: 18 }, { v: 22 }, { v: 20 }, { v: 28 }]}
        />
        <StatCard
          icon={ShoppingBag}
          title="إجمالي الطلبات"
          value="1,842"
          change="12.4%"
          trend="up"
          sparklineData={[{ v: 8 }, { v: 10 }, { v: 9 }, { v: 13 }, { v: 15 }, { v: 14 }, { v: 18 }]}
        />
        <StatCard
          icon={Users}
          title="إجمالي العملاء"
          value="2,351"
          change="15.3%"
          trend="up"
          sparklineData={[{ v: 12 }, { v: 15 }, { v: 14 }, { v: 18 }, { v: 20 }, { v: 19 }, { v: 24 }]}
        />
        <StatCard
          icon={Package}
          title="إجمالي المنتجات"
          value="328"
          change="8.7%"
          trend="up"
          sparklineData={[{ v: 20 }, { v: 21 }, { v: 20 }, { v: 22 }, { v: 23 }, { v: 22 }, { v: 24 }]}
        />
      </div>

      {/* Secondary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <MiniStatCard icon={Hourglass} title="طلبات قيد الانتظار" value="64" change="6.3%" trend="down" />
        <MiniStatCard icon={CreditCard} title="إجمالي المدفوعات" value="1,182,720 ج.م" change="19.8%" trend="up" />
        <MiniStatCard icon={Ticket} title="كوبونات مفعّلة" value="12" change="5.2%" trend="up" />
        <MiniStatCard icon={Star} title="إجمالي التقييمات" value="356" change="22.1%" trend="up" />
        <MiniStatCard icon={Heart} title="عناصر المفضلة" value="1,285" change="10.4%" trend="up" />
        <MiniStatCard icon={Glasses} title="جلسات التجربة الافتراضية" value="842" change="14.7%" trend="up" />
        <MiniStatCard icon={MessageCircle} title="محادثات الشات بوت" value="1,256" change="11.3%" trend="up" />
      </div>

      {/* Revenue + category + store overview */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1.1fr_0.9fr] gap-4">
        <SectionCard title="نظرة عامة على الإيرادات" action="شهريًا">
          <RevenueChart />
        </SectionCard>

        <SectionCard title="المبيعات حسب الفئة">
          <DonutChart
            centerValue="1,248,320 ج.م"
            data={[
              { label: "نظارات شمسية", value: 42 },
              { label: "نظارات طبية", value: 28 },
              { label: "نظارات قراءة", value: 15 },
              { label: "نظارات أطفال", value: 10 },
              { label: "إكسسوارات", value: 5 },
            ]}
          />
        </SectionCard>

        <SectionCard title="نظرة عامة على المتجر">
          <ul className="space-y-4">
            <StoreOverviewRow icon={AlertTriangle} label="منتجات قاربت على النفاد" value="23" trend="up" />
            <StoreOverviewRow icon={PackageX} label="منتجات نفدت" value="8" trend="up" />
            <StoreOverviewRow icon={UserPlus} label="عملاء جدد" value="156" trend="up" />
            <StoreOverviewRow icon={Repeat} label="عملاء متكررون" value="1,248" trend="up" />
          </ul>
        </SectionCard>
      </div>

      {/* Recent orders / payments / reviews / payment methods */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <SectionCard title="أحدث الطلبات" action="عرض الكل">
          <ul className="divide-y divide-primary/5">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{o.id}</p>
                  <p className="text-xs text-primary/50">{o.name} · {o.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-1 ${statusStyles[o.status]}`}>
                    {o.status}
                  </span>
                  <p className="text-xs font-semibold text-primary">{o.amount}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="أحدث المدفوعات" action="عرض الكل">
          <ul className="divide-y divide-primary/5">
            {recentPayments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{p.id}</p>
                  <p className="text-xs text-primary/50">طلب {p.order} · {p.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-1 ${statusStyles[p.status]}`}>
                    {p.status}
                  </span>
                  <p className="text-xs font-semibold text-primary">{p.amount}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="أحدث التقييمات" action="عرض الكل">
          <ul className="divide-y divide-primary/5">
            {recentReviews.map((r) => (
              <li key={r.name + r.product} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-secondary text-xs font-semibold shrink-0">
                  {r.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary truncate">{r.name}</p>
                  <p className="text-xs text-primary/50 truncate">{r.product} · {r.date}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < r.rating ? "fill-secondary text-secondary" : "text-primary/15"}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="أكثر طرق الدفع استخدامًا">
          <DonutChart
            data={[
              { label: "بطاقة ائتمان", value: 58 },
              { label: "الدفع عند الاستلام", value: 25 },
              { label: "تحويل بنكي", value: 12 },
              { label: "محفظة رقمية", value: 5 },
            ]}
          />
        </SectionCard>
      </div>

      {/* Quick insights */}
      <SectionCard title="نظرة سريعة">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickInsights.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                <item.icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-primary/50 truncate">{item.label}</p>
                <p className="text-sm font-bold text-primary truncate">{item.value}</p>
                <p className="text-[11px] text-secondary font-medium truncate">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function StoreOverviewRow({ icon: Icon, label, value, trend }) {
  const Trend = trend === "up" ? TrendingUp : TrendingDown;
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2.5 text-sm text-primary/70">
        <Icon size={16} className="text-secondary" />
        {label}
      </span>
      <span className="flex items-center gap-1 text-sm font-semibold text-primary">
        {value}
        <Trend size={14} className="text-emerald-600" />
      </span>
    </li>
  );
}