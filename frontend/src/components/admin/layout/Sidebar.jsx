import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  Ticket,
  Star,
  Heart,
  Glasses,
  MessageCircle,
  BarChart3,
  Gift,
  FileText,
  Settings,
  ShieldCheck,
  Crown,
} from "lucide-react";
import api from "../../../api/axios";

const bottomItems = [
  { label: "الإعدادات", to: "/dashboard/settings", icon: Settings },
  { label: "المشرفين", to: "/dashboard/admins", icon: ShieldCheck },
];

export default function Sidebar() {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(null);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(null);

  useEffect(() => {
    api.get("/dashboard/orders/stats/")
      .then((res) => setPendingOrdersCount(res.data.pending || null))
      .catch(() => setPendingOrdersCount(null));

    api.get("/dashboard/reviews/stats/")
      .then((res) => setPendingReviewsCount(res.data.pending || null))
      .catch(() => setPendingReviewsCount(null));
  }, []);

  const navItems = [
    { label: "لوحة التحكم", to: "/dashboard", icon: LayoutDashboard, end: true },
    { label: "المنتجات", to: "/dashboard/products", icon: Package, end: true },
    { label: "الطلبات", to: "/dashboard/orders", icon: ShoppingBag, badge: pendingOrdersCount },
    { label: "العملاء", to: "/dashboard/customers", icon: Users },
    { label: "المدفوعات", to: "/dashboard/payments", icon: CreditCard },
    { label: "الكوبونات", to: "/dashboard/coupons", icon: Ticket },
    { label: "التقييمات", to: "/dashboard/reviews", icon: Star, badge: pendingReviewsCount },
    { label: "المفضلة", to: "/dashboard/wishlist", icon: Heart },
    { label: "التجربة الافتراضية", to: "/dashboard/ai-try-on", icon: Glasses },
    { label: "الشات بوت", to: "/dashboard/chatbot", icon: MessageCircle },
    { label: "التحليلات", to: "/dashboard/analytics", icon: BarChart3 },
    { label: "العروض", to: "/dashboard/offers", icon: Gift },
    { label: "التقارير", to: "/dashboard/reports", icon: FileText },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 h-screen sticky top-0 bg-primary text-background overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold tracking-wide text-background">
          OVIU
        </h1>
        <p className="text-[11px] text-background/50 mt-0.5 tracking-widest">
          أسلوبك، رؤيتك
        </p>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>

      {/* Divider + bottom nav */}
      <div className="px-3 pt-2 pb-1 border-t border-background/10 mt-2 space-y-1">
        {bottomItems.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </div>

      {/* Upgrade card */}
      <div className="m-3 mt-4 rounded-xl bg-secondary/15 p-4">
        <div className="flex items-center gap-2 text-secondary">
          <Crown size={18} />
          <span className="text-sm font-semibold">قم بترقية باقتك</span>
        </div>
        <p className="text-xs text-background/60 mt-1.5 leading-relaxed">
          افتحي المزيد من المميزات ونمّي متجرك بشكل أسرع.
        </p>
        <button className="mt-3 w-full bg-secondary text-primary text-sm font-semibold py-2 rounded-lg hover:opacity-90 transition">
          الترقية الآن
        </button>
      </div>

      {/* Store footer */}
      <div className="flex items-center gap-3 px-4 py-4 border-t border-background/10">
        <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-sm font-semibold">
          OV
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">متجر OVIU</p>
          <p className="text-xs text-background/50">باقة مميزة</p>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ label, to, icon: Icon, badge, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
          isActive
            ? "bg-secondary text-primary font-semibold"
            : "text-background/70 hover:bg-background/5 hover:text-background"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="flex items-center gap-3">
            <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
            {label}
          </span>
          {badge ? (
            <span
              className={`text-[11px] font-semibold rounded-full px-1.5 py-0.5 min-w-[20px] text-center ${
                isActive ? "bg-primary/15 text-primary" : "bg-background/10 text-background/70"
              }`}
            >
              {badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}