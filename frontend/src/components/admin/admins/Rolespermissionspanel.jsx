import { Crown, User, Briefcase, Pencil, Headphones } from "lucide-react";

const roleRows = [
  { key: "super_admin", icon: Crown, label: "سوبر أدمن", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  { key: "admin", icon: User, label: "أدمن", iconBg: "bg-orange-50", iconColor: "text-orange-500" },
  { key: "manager", icon: Briefcase, label: "مدير", iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  { key: "editor", icon: Pencil, label: "محرر", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { key: "support", icon: Headphones, label: "دعم فني", iconBg: "bg-cyan-50", iconColor: "text-cyan-600" },
];

export default function RolesPermissionsPanel({ roleCounts, loading }) {
  return (
    <ul className="space-y-1">
      {roleRows.map((r) => (
        <li key={r.key}>
          <div className="flex items-center justify-between gap-2 py-2.5 border-b border-primary/5 last:border-0">
            <span className="flex items-center gap-2.5 text-sm text-primary">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.iconBg} ${r.iconColor}`}>
                <r.icon size={15} />
              </span>
              {r.label}
            </span>
            <span className="text-sm font-semibold text-primary">{loading ? "..." : roleCounts?.[r.key] ?? 0}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}