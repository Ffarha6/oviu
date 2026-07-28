import { Settings2, Store, CreditCard, Truck, Glasses, Mail, Shield, Users } from "lucide-react";

export const tabs = [
  { key: "عام", icon: Settings2 },
  { key: "المتجر", icon: Store },
  { key: "المدفوعات", icon: CreditCard },
  { key: "الشحن", icon: Truck },
  { key: "التجربة الافتراضية", icon: Glasses },
  { key: "البريد الإلكتروني", icon: Mail },
  { key: "الأمان", icon: Shield },
  { key: "المشرفون", icon: Users },
];

export default function SettingsTabs({ active, onChange }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto bg-surface rounded-2xl p-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-1.5 whitespace-nowrap text-sm font-medium px-3.5 py-2 rounded-xl transition-colors ${
            active === tab.key ? "bg-secondary text-primary" : "text-primary/50 hover:bg-background"
          }`}
        >
          <tab.icon size={15} /> {tab.key}
        </button>
      ))}
    </div>
  );
}