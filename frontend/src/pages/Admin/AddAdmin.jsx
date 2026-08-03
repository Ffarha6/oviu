import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Search, Check, Loader2 } from "lucide-react";
import api from "../../api/axios";
import SectionCard from "../../components/admin/shared/SectionCard";

const roleOptions = [
  { value: "admin", label: "أدمن" },
  { value: "manager", label: "مدير" },
  { value: "editor", label: "محرر" },
  { value: "support", label: "دعم فني" },
];

export default function AddAdmin() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState("admin");
  const [permissions, setPermissions] = useState([]);
  const [permissionModules, setPermissionModules] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/dashboard/admins/permission-modules/").then((res) => setPermissionModules(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (search.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const timeout = setTimeout(() => {
      api.get("/dashboard/users/", { params: { search, role: "customer" } })
        .then((res) => setResults(res.data.results))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const togglePermission = (key) => {
    setPermissions((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  };

  const handlePromote = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await api.post(`/dashboard/admins/${selectedUser.id}/promote/`, { admin_role: role, admin_permissions: permissions });
      navigate("/dashboard/admins");
    } catch (err) {
      alert(err.response?.data?.error || "حصل خطأ أثناء التعيين");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-primary">إضافة مشرف جديد</h1>
        <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
          <Link to="/dashboard" className="hover:text-secondary">لوحة التحكم</Link>
          <ChevronLeft size={12} />
          <Link to="/dashboard/admins" className="hover:text-secondary">المشرفون</Link>
          <ChevronLeft size={12} />
          <span className="text-primary/60">إضافة</span>
        </div>
      </div>

      <SectionCard title="1. اختاري المستخدم">
        {!selectedUser ? (
          <>
            <div className="flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5">
              <Search size={16} className="text-primary/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحثي بالاسم أو البريد الإلكتروني..."
                className="bg-transparent outline-none text-sm flex-1 text-primary placeholder:text-primary/40"
              />
            </div>

            {searching && <p className="text-xs text-primary/40 mt-3">جاري البحث...</p>}

            {results.length > 0 && (
              <div className="mt-3 space-y-1.5 max-h-64 overflow-y-auto">
                {results.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className="w-full flex items-center gap-3 bg-background rounded-xl p-3 hover:bg-secondary/10 transition text-right"
                  >
                    <div className="w-9 h-9 rounded-full bg-secondary/20 text-secondary font-semibold flex items-center justify-center shrink-0 text-xs">
                      {(u.full_name?.trim() || u.username).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-primary truncate">{u.full_name?.trim() || u.username}</p>
                      <p className="text-xs text-primary/40 truncate" dir="ltr">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between bg-secondary/10 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary/20 text-secondary font-semibold flex items-center justify-center shrink-0 text-xs">
                {(selectedUser.full_name?.trim() || selectedUser.username).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-primary">{selectedUser.full_name?.trim() || selectedUser.username}</p>
                <p className="text-xs text-primary/40" dir="ltr">{selectedUser.email}</p>
              </div>
            </div>
            <button onClick={() => { setSelectedUser(null); setSearch(""); }} className="text-xs text-red-500 font-medium">تغيير</button>
          </div>
        )}
      </SectionCard>

      {selectedUser && (
        <>
          <SectionCard title="2. الدور الوظيفي">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {roleOptions.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`text-sm font-medium py-2.5 rounded-xl border transition ${
                    role === r.value ? "bg-primary text-background border-primary" : "bg-background text-primary/60 border-primary/10"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="3. الأقسام المسموح له بالتحكم فيها">
            <div className="grid grid-cols-2 gap-2">
              {permissionModules.map((m) => (
                <label key={m.key} className="flex items-center gap-2 text-sm text-primary/70 cursor-pointer bg-background rounded-lg px-3 py-2">
                  <input type="checkbox" checked={permissions.includes(m.key)} onChange={() => togglePermission(m.key)} className="accent-secondary" />
                  {m.label}
                </label>
              ))}
            </div>
          </SectionCard>

          <button
            onClick={handlePromote}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-primary text-background text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            تعيين كمشرف
          </button>
        </>
      )}
    </div>
  );
}