import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  Download,
  Users,
  UserCheck,
  ShieldCheck,
  UserPlus,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

import api from "../../api/axios";
import SectionCard from "../../components/admin/shared/SectionCard";
import CustomersToolbar from "../../components/admin/customers/CustomersToolbar";
import CustomersTable from "../../components/admin/customers/CustomersTable";
import CustomerDetailPanel from "../../components/admin/customers/CustomerDetailPanel";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [count, setCount] = useState(0);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const [selectedId, setSelectedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    api.get("/dashboard/users/stats/")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("فشل تحميل إحصائيات المستخدمين:", err))
      .finally(() => setStatsLoading(false));
  }, []);

  const fetchCustomers = useCallback(() => {
    setCustomersLoading(true);
    api.get("/dashboard/users/", {
      params: {
        search: search || undefined,
        status: status || undefined,
        role: role || undefined,
        page,
      },
    })
      .then((res) => {
        setCustomers(res.data.results);
        setCount(res.data.count);
        // لو مفيش عنصر متحدد لسه، اختاري أول واحد تلقائي
        setSelectedId((prev) => prev ?? res.data.results[0]?.id ?? null);
      })
      .catch((err) => console.error("فشل تحميل المستخدمين:", err))
      .finally(() => setCustomersLoading(false));
  }, [search, status, role, page]);

  useEffect(() => {
    setPage(1);
  }, [search, status, role]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const selectedCustomer = customers.find((c) => c.id === selectedId) || null;

  const handleToggleStatus = async (userId) => {
    setActionLoading("status");
    try {
      const res = await api.patch(`/dashboard/users/${userId}/toggle-status/`);
      setCustomers((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, is_active: res.data.is_active } : c))
      );
    } catch (err) {
      console.error("فشل تغيير حالة الحساب:", err);
      alert(err.response?.data?.error || "حصل خطأ، جربي تاني");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStaff = async (userId) => {
    setActionLoading("staff");
    try {
      const res = await api.patch(`/dashboard/users/${userId}/toggle-staff/`);
      setCustomers((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, is_staff: res.data.is_staff } : c))
      );
    } catch (err) {
      console.error("فشل تغيير صلاحية الأدمن:", err);
      alert(err.response?.data?.error || "حصل خطأ، جربي تاني");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">العملاء والمستخدمين</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/dashboard" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <span className="text-primary/60">كل المستخدمين</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
            <Upload size={15} /> تصدير
          </button>
          <button className="flex items-center gap-2 bg-surface text-primary text-sm font-medium px-4 py-2.5 rounded-xl">
            <Download size={15} /> استيراد
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} iconBg="bg-purple-50" iconColor="text-purple-600" title="إجمالي المستخدمين" value={statsLoading ? "..." : stats?.total_customers ?? 0} />
        <StatCard icon={UserCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="حسابات مفعّلة" value={statsLoading ? "..." : stats?.active_customers ?? 0} />
        <StatCard icon={ShieldCheck} iconBg="bg-blue-50" iconColor="text-blue-600" title="عدد الأدمن" value={statsLoading ? "..." : stats?.staff_count ?? 0} />
        <StatCard icon={UserPlus} iconBg="bg-amber-50" iconColor="text-amber-600" title="مستخدمون جدد" value={statsLoading ? "..." : stats?.new_this_month ?? 0} />
      </div>

      {/* Toolbar + table + detail panel */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <SectionCard className="!pt-4">
            <CustomersToolbar
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={setStatus}
              role={role}
              onRoleChange={setRole}
            />
          </SectionCard>

          <SectionCard>
            <CustomersTable
              customers={customers}
              loading={customersLoading}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onToggleStatus={handleToggleStatus}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-primary/5">
              <p className="text-xs text-primary/50">
                عرض {customers.length === 0 ? 0 : (page - 1) * pageSize + 1} إلى {Math.min(page * pageSize, count)} من {count} مستخدم
              </p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </SectionCard>
        </div>

        <CustomerDetailPanel
          customer={selectedCustomer}
          onClose={() => setSelectedId(null)}
          onToggleStatus={handleToggleStatus}
          onToggleStaff={handleToggleStaff}
          actionLoading={actionLoading}
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, iconBg, iconColor, title, value }) {
  return (
    <div className="bg-surface rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
        <Icon size={17} />
      </div>
      <div>
        <p className="text-lg font-bold text-primary leading-none">{value}</p>
        <p className="text-xs text-primary/50 mt-1">{title}</p>
      </div>
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
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-7 h-7 rounded-lg text-xs flex items-center justify-center text-primary/40 border border-primary/10 disabled:opacity-40"
      >
        ‹
      </button>
      {pages.map((p, i) => (
        <button
          key={i}
          onClick={() => typeof p === "number" && onPageChange(p)}
          disabled={p === "…"}
          className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center ${
            p === page ? "bg-primary text-background font-semibold" : "text-primary/60 hover:bg-background"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-7 h-7 rounded-lg text-xs flex items-center justify-center text-primary/40 border border-primary/10 disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}