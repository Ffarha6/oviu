import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import SettingsTabs from "../../components/dashboard/settings/Settingstabs";
import GeneralTab from "../../components/dashboard/settings/Generaltab";
import SettingsSidePanel from "../../components/dashboard/settings/Settingssidepanel";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("عام");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">الإعدادات</h1>
        <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
          <Link to="/dashboard" className="hover:text-secondary">لوحة التحكم</Link>
          <ChevronLeft size={12} />
          <span className="text-primary/60">الإعدادات</span>
        </div>
      </div>

      <SettingsTabs active={activeTab} onChange={setActiveTab} />

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0">
          {activeTab === "عام" ? (
            <GeneralTab />
          ) : (
            <div className="bg-surface rounded-2xl p-10 text-center text-sm text-primary/40">
              إعدادات "{activeTab}" هتتضاف قريبًا
            </div>
          )}
        </div>

        <SettingsSidePanel />
      </div>
    </div>
  );
}