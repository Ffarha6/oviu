import { X, Mail, Phone, MapPin, Calendar, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";

const genderLabel = { male: "ذكر", female: "أنثى" };

export default function CustomerDetailPanel({ customer, onClose, onToggleStatus, onToggleStaff, actionLoading }) {
  if (!customer) {
    return (
      <aside className="bg-surface rounded-2xl p-6 w-full lg:w-80 shrink-0 flex items-center justify-center text-sm text-primary/40 text-center">
        اختاري مستخدمًا من الجدول لعرض تفاصيله هنا
      </aside>
    );
  }

  const displayName = customer.full_name?.trim() || customer.username;

  return (
    <aside className="bg-surface rounded-2xl p-5 w-full lg:w-80 shrink-0 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary/20 text-secondary font-bold flex items-center justify-center shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-primary truncate">{displayName}</p>
              {customer.is_staff && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {customer.is_superuser ? "سوبر أدمن" : "أدمن"}
                </span>
              )}
            </div>
            <p className="text-xs text-primary/50 truncate" dir="ltr">{customer.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-primary/40 hover:text-primary shrink-0" aria-label="إغلاق">
          <X size={17} />
        </button>
      </div>

      {/* معلومات أساسية */}
      <div>
        <p className="text-xs font-bold text-primary/50 mb-2.5">معلومات المستخدم</p>
        <div className="space-y-2.5 text-xs">
          <InfoRow icon={Mail} label={customer.email} />
          <InfoRow icon={Phone} label={customer.phone || "لا يوجد رقم هاتف"} />
          <InfoRow icon={MapPin} label={customer.address || "لا يوجد عنوان"} />
          <InfoRow icon={Calendar} label={`عضو منذ ${customer.date_joined}`} />
        </div>
      </div>

      {/* بيانات إضافية */}
      <div className="grid grid-cols-2 gap-y-3 text-xs">
        <InfoField label="الجنس" value={genderLabel[customer.gender] || "غير محدد"} />
        <InfoField label="المحافظة" value={customer.governorate || "غير محدد"} />
        <InfoField label="تفعيل البريد" value={customer.email_verified ? "مفعل" : "غير مفعل"} valueClass={customer.email_verified ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"} />
        <InfoField label="اسم المستخدم" value={customer.username} />
      </div>

      {/* تحكم الأدمن */}
      <div className="border-t border-primary/10 pt-4 space-y-2.5">
        <p className="text-xs font-bold text-primary/50 mb-1">صلاحيات وتحكم</p>

        <ControlRow
          label="حالة الحساب"
          active={customer.is_active}
          activeLabel="مفعل"
          inactiveLabel="موقوف"
          onToggle={() => onToggleStatus(customer.id)}
          loading={actionLoading === "status"}
        />

        {!customer.is_superuser && (
          <ControlRow
            label="صلاحية الأدمن"
            active={customer.is_staff}
            activeLabel="أدمن"
            inactiveLabel="عميل عادي"
            icon={customer.is_staff ? ShieldCheck : ShieldOff}
            onToggle={() => onToggleStaff(customer.id)}
            loading={actionLoading === "staff"}
          />
        )}
      </div>
    </aside>
  );
}

function InfoRow({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-primary/70">
      <Icon size={13} className="text-secondary shrink-0" />
      <span className="truncate" dir="ltr">{label}</span>
    </div>
  );
}

function InfoField({ label, value, valueClass = "text-primary" }) {
  return (
    <div>
      <p className="text-primary/40 mb-0.5">{label}</p>
      <p className={valueClass}>{value}</p>
    </div>
  );
}

function ControlRow({ label, active, activeLabel, inactiveLabel, icon: Icon, onToggle, loading }) {
  return (
    <div className="flex items-center justify-between bg-background rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-2 text-xs text-primary/70">
        {Icon && <Icon size={14} className={active ? "text-emerald-600" : "text-primary/30"} />}
        <span>{label}: <span className={`font-semibold ${active ? "text-emerald-600" : "text-primary/50"}`}>{active ? activeLabel : inactiveLabel}</span></span>
      </div>
      <button
        onClick={onToggle}
        disabled={loading}
        className={`w-10 h-5 rounded-full relative transition-colors disabled:opacity-50 ${
          active ? "bg-emerald-500" : "bg-primary/15"
        }`}
      >
        {loading ? (
          <Loader2 size={11} className="animate-spin absolute inset-0 m-auto text-white" />
        ) : (
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${active ? "left-0.5" : "right-0.5"}`} />
        )}
      </button>
    </div>
  );
}