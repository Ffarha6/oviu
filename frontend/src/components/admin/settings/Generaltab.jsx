import { useState, useEffect } from "react";
import {
  Save, Mail, Phone, MapPin, Globe, Moon, Heart,
  Package, MessageCircle, Send, Database, Download, Trash2, Loader2,
} from "lucide-react";
import SectionCard from "../shared/SectionCard";
import api from "../../../api/axios";
const PREFERENCE_FIELDS = [
  {
    key: "enable_multilanguage",
    icon: Globe,
    label: "تعدد اللغات",
    desc: "السماح للمستخدمين بتغيير لغة الموقع",
  },

  {
    key: "enable_dark_mode",
    icon: Moon,
    label: "الوضع الليلي",
    desc: "السماح للمستخدمين باستخدام الوضع الداكن",
  },

  {
    key: "enable_chatbot",
    icon: MessageCircle,
    label: "تشغيل الشات بوت",
    desc: "تفعيل نظام الشات بوت",
  },

  {
    key: "show_chatbot_button",
    icon: MessageCircle,
    label: "إظهار زر الشات",
    desc: "إظهار الزر العائم الخاص بالشات",
  },

  {
    key: "enable_virtual_tryon",
    icon: Heart,
    label: "التجربة الافتراضية",
    desc: "تشغيل خدمة تجربة النظارات",
  },

  {
    key: "show_virtual_tryon_in_home",
    icon: Heart,
    label: "إظهار التجربة في الصفحة الرئيسية",
    desc: "إظهار قسم التجربة الافتراضية داخل الصفحة الرئيسية",
  },

  {
    key: "show_virtual_tryon_in_navbar",
    icon: Heart,
    label: "إظهار التجربة في القائمة",
    desc: "إظهار رابط التجربة الافتراضية داخل الـ Navbar",
  },

  {
    key: "enable_wishlist",
    icon: Heart,
    label: "المفضلة",
    desc: "السماح باستخدام قائمة المفضلة",
  },

  {
    key: "enable_reviews",
    icon: Heart,
    label: "التقييمات",
    desc: "السماح بعرض وإضافة التقييمات",
  },

  {
    key: "enable_offers",
    icon: Package,
    label: "العروض",
    desc: "تشغيل قسم العروض بالموقع",
  },

  {
    key: "enable_coupons",
    icon: Package,
    label: "الكوبونات",
    desc: "تشغيل أكواد الخصم",
  },

  {
    key: "allow_registration",
    icon: Mail,
    label: "السماح بالتسجيل",
    desc: "السماح بإنشاء حسابات جديدة",
  },

  {
    key: "allow_orders",
    icon: Package,
    label: "السماح بالطلبات",
    desc: "السماح بإتمام عمليات الشراء",
  },

  {
    key: "show_home_banner",
    icon: Globe,
    label: "بانر الصفحة الرئيسية",
    desc: "إظهار البانر الرئيسي",
  },

  {
    key: "show_categories",
    icon: Globe,
    label: "التصنيفات",
    desc: "إظهار قسم التصنيفات",
  },

  {
    key: "show_featured_products",
    icon: Package,
    label: "المنتجات المميزة",
    desc: "إظهار قسم المنتجات المميزة",
  },

  {
    key: "show_brands",
    icon: Globe,
    label: "العلامات التجارية",
    desc: "إظهار قسم العلامات التجارية",
  },

  {
    key: "show_newsletter",
    icon: Send,
    label: "النشرة البريدية",
    desc: "إظهار الاشتراك في النشرة البريدية",
  },

  {
    key: "maintenance_mode",
    icon: Database,
    label: "وضع الصيانة",
    desc: "إيقاف الموقع للزوار مع السماح للأدمن بالدخول",
  },
];

export default function GeneralTab({ settings, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  if (!form) return null;

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const saveGeneralInfo = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch("/dashboard/settings/", {
        store_name: form.store_name,
        store_tagline: form.store_tagline,
        store_email: form.store_email,
        store_phone: form.store_phone,
        store_address: form.store_address,
        store_description: form.store_description,
      });
      onSaved(data);
    } catch (err) {
      console.error(err);
      alert("حصل خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const savePreference = async (key, value) => {
    // Optimistic update
    setField(key, value);
    try {
      const { data } = await api.patch("/dashboard/settings/", { [key]: value });
      onSaved(data);
    } catch (err) {
      console.error(err);
      setField(key, !value); // رجّع القيمة القديمة لو حصل خطأ
      alert("حصل خطأ أثناء تحديث الإعداد");
    }
  };

  return (
    <div className="space-y-4">
      {/* General information */}
      <SectionCard>
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <h3 className="text-base font-bold text-primary">المعلومات العامة</h3>
            <p className="text-xs text-primary/50 mt-0.5">إدارة المعلومات الأساسية لمتجرك</p>
          </div>
          <button
            onClick={saveGeneralInfo}
            disabled={saving}
            className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition shrink-0 disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} حفظ التغييرات
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="اسم المتجر" value={form.store_name} onChange={(v) => setField("store_name", v)} />
          <Field label="شعار المتجر" value={form.store_tagline} onChange={(v) => setField("store_tagline", v)} />
          <Field label="البريد الإلكتروني للمتجر" value={form.store_email} onChange={(v) => setField("store_email", v)} icon={Mail} dir="ltr" />
          <Field label="هاتف المتجر" value={form.store_phone} onChange={(v) => setField("store_phone", v)} icon={Phone} dir="ltr" />
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-primary mb-1.5 block">عنوان المتجر</label>
          <div className="flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5">
            <MapPin size={15} className="text-secondary shrink-0" />
            <input
              value={form.store_address}
              onChange={(e) => setField("store_address", e.target.value)}
              className="bg-transparent outline-none text-sm flex-1 text-primary"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-primary mb-1.5 block">وصف المتجر</label>
          <textarea
            value={form.store_description}
            onChange={(e) => setField("store_description", e.target.value.slice(0, 500))}
            rows={3}
            className="w-full bg-background border border-primary/10 rounded-xl px-3.5 py-2.5 text-sm text-primary outline-none resize-none"
          />
          <p className="text-left text-xs text-primary/30 mt-1">{(form.store_description || "").length}/500</p>
        </div>
      </SectionCard>

      {/* Store preferences */}
      <SectionCard>
        <h3 className="text-base font-bold text-primary">تفضيلات المتجر</h3>
        <p className="text-xs text-primary/50 mt-0.5 mb-4">إعداد خيارات متجرك</p>

        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
          {PREFERENCE_FIELDS.map((p) => (
            <div key={p.key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                  <p.icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary">{p.label}</p>
                  <p className="text-xs text-primary/40">{p.desc}</p>
                </div>
              </div>
              <button
                onClick={() => savePreference(p.key, !form[p.key])}
                className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${
                  form[p.key] ? "bg-secondary" : "bg-primary/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    form[p.key] ? "left-0.5" : "right-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Data management — لسه مش متربطة، خطوة جاية */}
      <SectionCard>
        <h3 className="text-base font-bold text-primary">إدارة البيانات</h3>
        <p className="text-xs text-primary/50 mt-0.5 mb-4">إدارة بيانات متجرك</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between gap-3 bg-background rounded-xl p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                <Database size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary">نسخ احتياطي للبيانات</p>
                <p className="text-xs text-primary/40">تحميل نسخة احتياطية من بيانات متجرك</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 bg-surface text-primary text-xs font-semibold px-3 py-2 rounded-lg shrink-0">
              <Download size={13} /> إنشاء نسخة
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 bg-background rounded-xl p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                <Trash2 size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary">مسح الكاش</p>
                <p className="text-xs text-primary/40">مسح كاش النظام لتحسين الأداء</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-2 rounded-lg shrink-0">
              <Trash2 size={13} /> مسح الكاش
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function Field({ label, value, onChange, icon: Icon, dir }) {
  return (
    <div>
      <label className="text-sm font-medium text-primary mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5">
        {Icon && <Icon size={15} className="text-secondary shrink-0" />}
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} dir={dir} className="bg-transparent outline-none text-sm flex-1 text-primary" />
      </div>
    </div>
  );
}