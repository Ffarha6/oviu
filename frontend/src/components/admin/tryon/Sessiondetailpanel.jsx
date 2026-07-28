import { useState } from "react";
import {
  X,
  ArrowLeft,
  User,
  Monitor,
  Compass,
  Globe,
  Clock,
  Download,
  UserRound,
  Trash2,
  ExternalLink,
} from "lucide-react";

const tabs = ["نظرة عامة", "معلومات الذكاء الاصطناعي", "سجل النشاط"];

const statusStyles = {
  "نجاح": "bg-emerald-100 text-emerald-700",
  "فشل": "bg-red-100 text-red-700",
};

export default function SessionDetailPanel({ session, onClose }) {
  const [activeTab, setActiveTab] = useState("نظرة عامة");

  if (!session) {
    return (
      <aside className="bg-surface rounded-2xl p-6 w-full lg:w-80 shrink-0 flex items-center justify-center text-sm text-primary/40 text-center">
        اختاري جلسة من الجدول لعرض تفاصيلها هنا
      </aside>
    );
  }

  return (
    <aside className="bg-surface rounded-2xl p-5 w-full lg:w-80 shrink-0 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-primary">{session.id}</h3>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[session.status]}`}>
            {session.status}
          </span>
        </div>
        <button onClick={onClose} className="text-primary/40 hover:text-primary" aria-label="إغلاق">
          <X size={17} />
        </button>
      </div>
      <p className="text-xs text-primary/40 -mt-3">{session.date} - {session.time}</p>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-primary/10 -mt-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-medium px-2.5 pb-2.5 -mb-px border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab ? "border-secondary text-primary" : "border-transparent text-primary/40"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab !== "نظرة عامة" ? (
        <p className="text-xs text-primary/40 text-center py-6">
          محتوى تاب "{activeTab}" هيتضاف قريبًا
        </p>
      ) : (
        <>
          {/* Before / After images */}
          <div>
            <p className="text-xs font-bold text-primary/50 mb-2.5">الصورة المرفوعة والنتيجة</p>
            <div className="flex items-center gap-2">
              <img src={session.uploadedImg.replace("80", "200")} alt="الصورة المرفوعة" className="flex-1 aspect-square rounded-xl object-cover" />
              <ArrowLeft size={16} className="text-secondary shrink-0" />
              <img src={session.uploadedImg.replace("80", "200")} alt="نتيجة التجربة" className="flex-1 aspect-square rounded-xl object-cover" />
            </div>
          </div>

          {/* Selected product */}
          <div>
            <p className="text-xs font-bold text-primary/50 mb-2.5">المنتج المختار</p>
            <div className="flex items-center gap-3 bg-background rounded-xl p-3">
              <div className="w-11 h-11 rounded-lg bg-surface flex items-center justify-center text-xl shrink-0">👓</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary truncate">{session.glasses}</p>
                <p className="text-xs text-primary/40">{session.sku}</p>
              </div>
              <button className="flex items-center gap-1 text-xs font-medium text-secondary shrink-0">
                عرض المنتج <ExternalLink size={12} />
              </button>
            </div>
          </div>

          {/* Session information */}
          <div>
            <p className="text-xs font-bold text-primary/50 mb-2.5">معلومات الجلسة</p>
            <div className="space-y-2.5 text-xs">
              <InfoRow icon={User} label="العميل" value={session.customer} />
              <InfoRow icon={Monitor} label="الجهاز" value={session.device === "desktop" ? "كمبيوتر (Windows)" : "موبايل"} />
              <InfoRow icon={Compass} label="المتصفح" value="Chrome 125.0.0" />
              <InfoRow icon={Globe} label="عنوان الـ IP" value="197.45.23.142" dir="ltr" />
              <InfoRow icon={Clock} label="بدأت الساعة" value={`${session.time}`} />
              <InfoRow icon={Clock} label="مدة الجلسة" value="2.48 ثانية" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            <button className="flex items-center justify-center gap-2 bg-background border border-primary/10 text-primary text-sm font-medium py-2.5 rounded-xl hover:bg-primary/5 transition">
              <Download size={15} /> تحميل النتيجة
            </button>
            <button className="flex items-center justify-center gap-2 bg-background border border-primary/10 text-primary text-sm font-medium py-2.5 rounded-xl hover:bg-primary/5 transition">
              <UserRound size={15} /> عرض العميل
            </button>
            <button className="flex items-center justify-center gap-2 bg-red-50 text-red-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-red-100 transition">
              <Trash2 size={15} /> حذف الجلسة
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

function InfoRow({ icon: Icon, label, value, dir }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-primary/50">
        <Icon size={13} className="text-secondary" /> {label}
      </span>
      <span className="text-primary font-medium" dir={dir}>{value}</span>
    </div>
  );
}