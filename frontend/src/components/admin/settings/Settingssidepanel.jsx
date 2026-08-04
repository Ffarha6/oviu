import { useState, useEffect } from "react";
import { ChevronRight, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import SectionCard from "../shared/SectionCard";
import api from "../../api/axios";
const integrations = [
  { name: "جوجل OAuth", status: "متصل", statusColor: "bg-emerald-100 text-emerald-700", emoji: "🔵" },
  { name: "فيسبوك OAuth", status: "متصل", statusColor: "bg-emerald-100 text-emerald-700", emoji: "🔷" },
  { name: "Mailchimp", status: "غير متصل", statusColor: "bg-amber-100 text-amber-700", emoji: "🐵" },
];

export default function SettingsSidePanel({ settings, onSaved }) {
  const [colors, setColors] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setColors({
        primary: settings.primary_color,
        secondary: settings.secondary_color,
        background: settings.background_color,
      });
    }
  }, [settings]);

  if (!colors) return null;

  const saveColors = async (newColors) => {
    setSaving(true);
    try {
      const { data } = await api.patch("/dashboard/settings/", {
        primary_color: newColors.primary,
        secondary_color: newColors.secondary,
        background_color: newColors.background,
      });
      onSaved(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // حفظ بعد ثانية من آخر تغيير (Debounce) بدل ما نبعت request مع كل حرف
  const updateColor = (key, value) => {
    const updated = { ...colors, [key]: value };
    setColors(updated);
    clearTimeout(window.__colorSaveTimeout);
    window.__colorSaveTimeout = setTimeout(() => saveColors(updated), 800);
  };

  return (
    <div className="w-full lg:w-80 shrink-0 space-y-4">
      <SectionCard title="معاينة الهوية">
        <div className="bg-background rounded-xl py-8 flex flex-col items-center justify-center gap-2">
          <span className="text-4xl">👓</span>
          <p className="text-xl font-bold tracking-wide text-secondary">OVIU</p>
          <p className="text-[10px] tracking-widest text-primary/40">SEE BEAUTY, YOUR WAY</p>
        </div>
      </SectionCard>

      <SectionCard title="إعدادات الثيم">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {saving && <Loader2 size={13} className="animate-spin text-secondary" />}
          </div>
          <ColorField label="اللون الأساسي" value={colors.primary} onChange={(v) => updateColor("primary", v)} />
          <ColorField label="اللون الثانوي" value={colors.secondary} onChange={(v) => updateColor("secondary", v)} />
          <ColorField label="لون الخلفية" value={colors.background} onChange={(v) => updateColor("background", v)} />

          <div>
            <p className="text-xs font-medium text-primary mb-2">معاينة</p>
            <div className="flex flex-col gap-2">
              <button className="w-full text-sm font-semibold py-2.5 rounded-xl" style={{ background: colors.secondary, color: colors.primary }}>
                زر أساسي
              </button>
              <button className="w-full text-sm font-medium py-2.5 rounded-xl border" style={{ borderColor: colors.secondary, color: colors.primary }}>
                زر ثانوي
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* التكاملات ومنطقة الخطر لسه زي ما هي — خطوة جاية */}
      <SectionCard title="التكاملات">
        <p className="text-xs text-primary/50 -mt-3 mb-3">إدارة خدمات الطرف الثالث</p>
        <ul className="space-y-1">
          {integrations.map((i) => (
            <li key={i.name}>
              <button className="w-full flex items-center justify-between gap-2 py-2.5 border-b border-primary/5 last:border-0">
                <span className="flex items-center gap-2.5 text-sm text-primary">
                  <span className="text-lg">{i.emoji}</span> {i.name}
                </span>
                <span className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${i.statusColor}`}>{i.status}</span>
                  <ChevronRight size={14} className="text-primary/30 rotate-180" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
        <p className="flex items-center gap-1.5 text-sm font-bold text-red-600">
          <AlertTriangle size={15} /> منطقة الخطر
        </p>
        <p className="text-xs text-red-400 mt-0.5 mb-3">كوني حذرة مع هذه الإجراءات!</p>
        <div className="flex items-center justify-between gap-3 bg-white rounded-xl p-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Trash2 size={15} className="text-red-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary">إعادة تعيين بيانات المتجر</p>
              <p className="text-[11px] text-primary/40">سيحذف هذا كل بيانات المتجر نهائيًا</p>
            </div>
          </div>
          <button className="text-xs font-semibold text-red-600 border border-red-200 px-3 py-2 rounded-lg shrink-0">إعادة تعيين</button>
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium text-primary mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-2 py-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded-lg overflow-hidden border-0 cursor-pointer shrink-0" />
        <input value={value} onChange={(e) => onChange(e.target.value)} dir="ltr" className="bg-transparent outline-none text-sm flex-1 text-primary" />
      </div>
    </div>
  );
}