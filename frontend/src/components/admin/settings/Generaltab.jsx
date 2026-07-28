import { useState } from "react";
import {
  Save,
  Mail,
  Phone,
  MapPin,
  Globe,
  Moon,
  Heart,
  Package,
  MessageCircle,
  Send,
  Database,
  Download,
  Trash2,
} from "lucide-react";
import SectionCard from "../shared/SectionCard";

const preferences = [
  { icon: Globe, label: "دعم تعدد اللغات", desc: "السماح للعملاء بتصفح الموقع بأكثر من لغة", checked: true },
  { icon: Package, label: "تنبيهات المخزون المنخفض", desc: "إشعار عند اقتراب نفاد مخزون منتج", checked: true },
  { icon: Moon, label: "الوضع الليلي", desc: "السماح للمستخدمين بالتبديل بين الوضع الفاتح والداكن", checked: true },
  { icon: MessageCircle, label: "الشات المباشر / الشات بوت", desc: "تفعيل الشات بوت لدعم العملاء", checked: true },
  { icon: Heart, label: "المفضلة", desc: "تفعيل خاصية المفضلة للعملاء", checked: true },
  { icon: Send, label: "الرسائل التسويقية", desc: "إرسال رسائل ترويجية للعملاء", checked: true },
];

export default function GeneralTab() {
  const [toggles, setToggles] = useState(preferences.map((p) => p.checked));
  const [description, setDescription] = useState(
    "OVIU هي وجهتك المميزة للنظارات الأنيقة وعالية الجودة. من النظارات الشمسية للنظارات الطبية، بنساعدك تشوف الجمال بطريقتك."
  );

  const toggle = (i) => setToggles((t) => t.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="space-y-4">
      {/* General information */}
      <SectionCard>
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <h3 className="text-base font-bold text-primary">المعلومات العامة</h3>
            <p className="text-xs text-primary/50 mt-0.5">إدارة المعلومات الأساسية لمتجرك</p>
          </div>
          <button className="flex items-center gap-2 bg-secondary text-primary text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition shrink-0">
            <Save size={15} /> حفظ التغييرات
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="اسم المتجر" defaultValue="OVIU" />
          <Field label="شعار المتجر" defaultValue="أسلوبك، رؤيتك" />
          <Field label="البريد الإلكتروني للمتجر" defaultValue="contact@oviu.com" icon={Mail} dir="ltr" />
          <Field label="هاتف المتجر" defaultValue="+20 10 1234 5678" icon={Phone} dir="ltr" />
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-primary mb-1.5 block">عنوان المتجر</label>
          <div className="flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5">
            <MapPin size={15} className="text-secondary shrink-0" />
            <input defaultValue="القاهرة، مصر" className="bg-transparent outline-none text-sm flex-1 text-primary" />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-primary mb-1.5 block">وصف المتجر</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            rows={3}
            className="w-full bg-background border border-primary/10 rounded-xl px-3.5 py-2.5 text-sm text-primary outline-none resize-none"
          />
          <p className="text-left text-xs text-primary/30 mt-1">{description.length}/500</p>
        </div>
      </SectionCard>

      {/* Store preferences */}
      <SectionCard>
        <h3 className="text-base font-bold text-primary">تفضيلات المتجر</h3>
        <p className="text-xs text-primary/50 mt-0.5 mb-4">إعداد خيارات متجرك</p>

        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
          {preferences.map((p, i) => (
            <div key={p.label} className="flex items-center justify-between gap-3">
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
                onClick={() => toggle(i)}
                className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${
                  toggles[i] ? "bg-secondary" : "bg-primary/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    toggles[i] ? "left-0.5" : "right-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Data management */}
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

function Field({ label, defaultValue, icon: Icon, dir }) {
  return (
    <div>
      <label className="text-sm font-medium text-primary mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5">
        {Icon && <Icon size={15} className="text-secondary shrink-0" />}
        <input defaultValue={defaultValue} dir={dir} className="bg-transparent outline-none text-sm flex-1 text-primary" />
      </div>
    </div>
  );
}