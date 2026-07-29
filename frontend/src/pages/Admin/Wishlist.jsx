import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, Users, ChevronDown, ChevronLeft } from "lucide-react";

import api from "../../api/axios";
import SectionCard from "../../components/admin/shared/SectionCard";
import WishlistToolbar from "../../components/admin/wishlist/Wishlisttoolbar";
import WishlistTable from "../../components/admin/wishlist/Wishlisttable";
import WishlistOverviewChart from "../../components/admin/wishlist/Wishlistoverviewchart";
import TopWishlistedCategories from "../../components/admin/wishlist/Topwishlistedcategories";
import MostWishlistedProducts from "../../components/admin/wishlist/Mostwishlistedproducts";

export default function Wishlist() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [count, setCount] = useState(0);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  useEffect(() => {
    api.get("/admin/wishlist/stats/")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("فشل تحميل إحصائيات المفضلة:", err))
      .finally(() => setStatsLoading(false));
  }, []);

  const fetchUsers = useCallback(() => {
    setUsersLoading(true);
    api.get("/admin/wishlist/", { params: { search: search || undefined, page } })
      .then((res) => {
        setUsers(res.data.results);
        setCount(res.data.count);
      })
      .catch((err) => console.error("فشل تحميل قوائم الأمنيات:", err))
      .finally(() => setUsersLoading(false));
  }, [search, page]);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">المفضلة</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/admin" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <span className="text-primary/60">المفضلة</span>
          </div>
        </div>
      </div>

      {/* Stats — بس اللي متتبّع فعليًا في الباك اند */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-md">
        <StatCard icon={Heart} title="إجمالي العناصر في كل القوائم" value={statsLoading ? "..." : stats?.total_items ?? 0} />
        <StatCard icon={Users} title="مستخدمون عندهم مفضلة" value={statsLoading ? "..." : stats?.unique_users ?? 0} />
      </div>

      {/* Table + side panel */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <SectionCard className="!pt-4">
            <WishlistToolbar search={search} onSearchChange={setSearch} />
          </SectionCard>

          <SectionCard>
            <WishlistTable users={users} loading={usersLoading} />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-primary/5">
              <p className="text-xs text-primary/50">عرض {users.length === 0 ? 0 : (page - 1) * pageSize + 1} إلى {Math.min(page * pageSize, count)} من {count} مستخدم</p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </SectionCard>
        </div>

        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <SectionCard title="نظرة عامة على المفضلة" action="آخر 30 يوم">
            <WishlistOverviewChart />
          </SectionCard>

          <SectionCard title="الفئات الأكثر إضافة للمفضلة">
            <TopWishlistedCategories />
          </SectionCard>

          <SectionCard title="المنتجات الأكثر إضافة للمفضلة">
            <MostWishlistedProducts />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value }) {
  return (
    <div className="bg-surface rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
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
      <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
        className="w-7 h-7 rounded-lg text-xs flex items-center justify-center text-primary/40 border border-primary/10 disabled:opacity-40">‹</button>
      {pages.map((p, i) => (
        <button key={i} onClick={() => typeof p === "number" && onPageChange(p)} disabled={p === "…"}
          className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center ${p === page ? "bg-primary text-background font-semibold" : "text-primary/60 hover:bg-background"}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        className="w-7 h-7 rounded-lg text-xs flex items-center justify-center text-primary/40 border border-primary/10 disabled:opacity-40">›</button>
    </div>
  );
}