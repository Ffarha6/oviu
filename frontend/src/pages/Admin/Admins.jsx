import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, ShieldCheck, UserPlus, Ban, ChevronLeft, ShieldAlert } from "lucide-react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import SectionCard from "../../components/admin/shared/SectionCard";
import AdminsToolbar from "../../components/admin/admins/Adminstoolbar";
import AdminsTable from "../../components/admin/admins/Adminstable";
import AdminDetailPanel from "../../components/admin/admins/AdminDetailPanel";
import RolesPermissionsPanel from "../../components/admin/admins/Rolespermissionspanel";
import AdminActivityPanel from "../../components/admin/admins/Adminactivitypanel";

export default function Admins() {
  const { user } = useAuth();
  const canManage = !!user?.is_superuser;

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [permissionModules, setPermissionModules] = useState([]);

  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const [selectedId, setSelectedId] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadStats = () => {
    api.get("/admin/admins/stats/").then((res) => setStats(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadStats();
    setStatsLoading(false);
    api.get("/admin/admins/permission-modules/").then((res) => setPermissionModules(res.data)).catch(() => {});
  }, []);

  const fetchAdmins = useCallback(() => {
    setAdminsLoading(true);
    api.get("/admin/admins/", {
      params: { search: search || undefined, role: role || undefined, status: status || undefined, page },
    })
      .then((res) => {
        setAdmins(res.data.results);
        setCount(res.data.count);
      })
      .catch((err) => console.error("فشل تحميل المشرفين:", err))
      .finally(() => setAdminsLoading(false));
  }, [search, role, status, page]);

  useEffect(() => { setPage(1); }, [search, role, status]);
  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  useEffect(() => {
    if (!selectedId) { setSelectedAdmin(null); return; }
    setDetailLoading(true);
    api.get(`/admin/admins/${selectedId}/`)
      .then((res) => setSelectedAdmin(res.data))
      .catch((err) => console.error("فشل تحميل تفاصيل المشرف:", err))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-status/`);
      setAdmins((prev) => prev.map((a) => (a.id === userId ? { ...a, is_active: res.data.is_active } : a)));
      setSelectedAdmin((prev) => (prev && prev.id === userId ? { ...prev, is_active: res.data.is_active } : prev));
      loadStats();
    } catch (err) {
      alert(err.response?.data?.error || "حصل خطأ");
    }
  };

  const handlePermissionsUpdated = (updated) => {
    setAdmins((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
    setSelectedAdmin(updated);
    loadStats();
  };

  const handleDemote = async (userId) => {
    if (!confirm("هل أنتِ متأكدة من إلغاء صلاحيات هذا المشرف نهائيًا؟")) return;
    try {
      await api.delete(`/admin/admins/${userId}/demote/`);
      setAdmins((prev) => prev.filter((a) => a.id !== userId));
      setSelectedId(null);
      loadStats();
    } catch (err) {
      alert(err.response?.data?.error || "حصل خطأ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">إدارة المشرفين</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/dashboard" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <span className="text-primary/60">المشرفون</span>
          </div>
        </div>

        {canManage && (
          <Link to="/admin/admins/add" className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition">
            <Plus size={16} /> إضافة مشرف جديد
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} title="إجمالي المشرفين" value={statsLoading ? "..." : stats?.total_admins ?? 0} />
        <StatCard icon={ShieldCheck} title="مشرفون نشطون" value={statsLoading ? "..." : stats?.active_admins ?? 0} />
        <StatCard icon={UserPlus} title="مشرفون جدد هذا الشهر" value={statsLoading ? "..." : stats?.new_this_month ?? 0} />
        <StatCard icon={Ban} title="غير نشطين" value={statsLoading ? "..." : stats?.inactive_admins ?? 0} />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <SectionCard className="!pt-4">
            <AdminsToolbar search={search} onSearchChange={setSearch} role={role} onRoleChange={setRole} status={status} onStatusChange={setStatus} />
          </SectionCard>

          <SectionCard>
            <AdminsTable admins={admins} loading={adminsLoading} selectedId={selectedId} onSelect={setSelectedId} />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-primary/5">
              <p className="text-xs text-primary/50">
                عرض {admins.length === 0 ? 0 : (page - 1) * pageSize + 1} إلى {Math.min(page * pageSize, count)} من {count} مشرف
              </p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </SectionCard>

          {selectedId && (
            <AdminDetailPanel
              admin={selectedAdmin}
              loading={detailLoading}
              canManage={canManage}
              currentUserId={user?.id}
              onClose={() => setSelectedId(null)}
              onToggleStatus={handleToggleStatus}
              onDemote={handleDemote}
              onPermissionsUpdated={handlePermissionsUpdated}
              permissionModules={permissionModules}
            />
          )}
        </div>

        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <SectionCard title="عدد المشرفين حسب الدور">
            <RolesPermissionsPanel roleCounts={stats?.role_counts} loading={statsLoading} />
          </SectionCard>

          <SectionCard title="آخر تسجيلات الدخول">
            <AdminActivityPanel admins={admins} loading={adminsLoading} />
          </SectionCard>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="flex items-center gap-1.5 text-sm font-bold text-amber-700">
              <ShieldAlert size={15} /> تذكير أمني
            </p>
            <p className="text-xs text-amber-600/80 mt-1">
              تعديل الأدوار والصلاحيات والتعيين والإلغاء متاح للسوبر أدمن فقط، حفاظًا على أمان الحسابات.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value }) {
  return (
    <div className="bg-surface rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
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
      <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="w-7 h-7 rounded-lg text-xs flex items-center justify-center text-primary/40 border border-primary/10 disabled:opacity-40">‹</button>
      {pages.map((p, i) => (
        <button key={i} onClick={() => typeof p === "number" && onPageChange(p)} disabled={p === "…"} className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center ${p === page ? "bg-primary text-background font-semibold" : "text-primary/60 hover:bg-background"}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="w-7 h-7 rounded-lg text-xs flex items-center justify-center text-primary/40 border border-primary/10 disabled:opacity-40">›</button>
    </div>
  );
}