import { useState, useEffect } from "react";
import { X, Crown, Save, UserX, Loader2 } from "lucide-react";
import api from "../../../api/axios";

const roleOptions = [
  { value: "admin", label: "أدمن" },
  { value: "manager", label: "مدير" },
  { value: "editor", label: "محرر" },
  { value: "support", label: "دعم فني" },
];

export default function AdminDetailPanel({ admin, loading, canManage, currentUserId, onClose, onToggleStatus, onDemote, onPermissionsUpdated, permissionModules }) {
  const [role, setRole] = useState("admin");
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRole(admin?.admin_role || "admin");
    setPermissions(admin?.admin_permissions || []);
  }, [admin?.id]);

  if (loading) {
    return (
      <aside className="bg-surface rounded-2xl p-6 w-full flex items-center justify-center text-sm text-primary/40">
        جاري التحميل...
      </aside>
    );
  }

  if (!admin) {
    return (
      <aside className="bg-surface rounded-2xl p-6 w-full flex items-center justify-center text-sm text-primary/40 text-center">
        اختاري مشرفًا من الجدول لعرض تفاصيله
      </aside>
    );
  }

  const isSelf = admin.id === currentUserId;
  const togglePermission = (key) => {
    setPermissions((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  };

  const hasChanges = role !== admin.admin_role || JSON.stringify([...permissions].sort()) !== JSON.stringify([...(admin.admin_permissions || [])].sort());

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/dashboard/admins/${admin.id}/permissions/`, { admin_role: role, admin_permissions: permissions });
      onPermissionsUpdated(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "حصل خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="bg-surface rounded-2xl p-5 w-full flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-secondary/20 text-secondary font-bold flex items-center justify-center shrink-0">
            {(admin.full_name?.trim() || admin.username).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-primary flex items-center gap-1.5">
              {admin.full_name?.trim() || admin.username}
              {admin.is_superuser && <Crown size={14} className="text-secondary" />}
            </p>
            <p className="text-xs text-primary/40" dir="ltr">{admin.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-primary/40 hover:text-primary" aria-label="إغلاق">
          <X size={17} />
        </button>
      </div>

      {admin.is_superuser ? (
        <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
          هذا الحساب سوبر أدمن وله كل الصلاحيات تلقائيًا، ولا يمكن تعديل صلاحياته من هنا.
        </p>
      ) : !canManage ? (
        <p className="text-sm text-primary/50 bg-background rounded-xl p-3">
          تعديل الأدوار والصلاحيات متاح للسوبر أدمن فقط.
        </p>
      ) : (
        <>
          {/* حالة الحساب */}
          <div className="flex items-center justify-between bg-background rounded-xl px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-primary">حالة الحساب</p>
              <p className={`text-xs mt-0.5 ${admin.is_active ? "text-emerald-600" : "text-red-500"}`}>
                {admin.is_active ? "نشط" : "غير نشط"}
              </p>
            </div>
            <button
              onClick={() => onToggleStatus(admin.id)}
              disabled={isSelf}
              className={`w-11 h-6 rounded-full relative transition-colors disabled:opacity-40 ${admin.is_active ? "bg-emerald-500" : "bg-primary/15"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${admin.is_active ? "left-0.5" : "right-0.5"}`} />
            </button>
          </div>

          {/* الدور */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">الدور الوظيفي</label>
            <div className="grid grid-cols-2 gap-2">
              {roleOptions.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`text-sm font-medium py-2 rounded-lg border transition ${
                    role === r.value ? "bg-primary text-background border-primary" : "bg-background text-primary/60 border-primary/10"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* الصلاحيات */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">الأقسام المسموح له بالتحكم فيها</label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {permissionModules.map((m) => (
                <label key={m.key} className="flex items-center gap-2 text-sm text-primary/70 cursor-pointer bg-background rounded-lg px-3 py-2">
                  <input type="checkbox" checked={permissions.includes(m.key)} onChange={() => togglePermission(m.key)} className="accent-secondary" />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center justify-center gap-2 bg-primary text-background text-sm font-semibold py-2.5 rounded-xl disabled:opacity-40"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            حفظ التعديلات
          </button>

          <button
            onClick={() => onDemote(admin.id)}
            disabled={isSelf}
            className="flex items-center justify-center gap-2 bg-red-50 text-red-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-red-100 transition disabled:opacity-40"
          >
            <UserX size={15} /> إلغاء صلاحيات الأدمن نهائيًا
          </button>
          {isSelf && <p className="text-xs text-primary/40 text-center -mt-2">لا يمكنك تعديل حالة حسابك أو إلغاء صلاحياتك الخاصة</p>}
        </>
      )}
    </aside>
  );
}