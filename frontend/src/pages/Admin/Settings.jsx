import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import api from "../../services/api";

import SettingsTabs from "../../components/admin/settings/Settingstabs";
import GeneralTab from "../../components/admin/settings/Generaltab";
import SettingsSidePanel from "../../components/admin/settings/Settingssidepanel";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("عام");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/settings/")
      .then((res) => setSettings(res.data))
      .catch((err) => console.error("Failed to load settings", err))
      .finally(() => setLoading(false));
  }, []);

  // يستخدمها أي كارت بعد الحفظ عشان يحدث النسخة المشتركة فوق
  const applyUpdate = (updated) => {
    setSettings((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">الإعدادات</h1>
        <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
          <Link to="/dashboard" className="hover:text-secondary">لوحة التحكم</Link>
          <ChevronLeft size={12} />
          <span className="text-primary/60">الإعدادات</span>
        </div>
      </div>

      <SettingsTabs active={activeTab} onChange={setActiveTab} />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-primary/40">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex-1 min-w-0">
            {activeTab === "عام" ? (
              <GeneralTab settings={settings} onSaved={applyUpdate} />
            ) : (
              <div className="bg-surface rounded-2xl p-10 text-center text-sm text-primary/40">
                إعدادات "{activeTab}" هتتضاف قريبًا
              </div>
            )}
          </div>

          <SettingsSidePanel settings={settings} onSaved={applyUpdate} />
        </div>
      )}
    </div>
  );
}