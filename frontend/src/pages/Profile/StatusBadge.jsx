import { STATUS_CONFIG, DEFAULT_STATUS_CONFIG } from "./ProfileConstants"

// ملف مستقل لأنه مستخدم في مكانين مختلفين: FullOrderCard (جوه DeliveryStatusStrip)
// و OrderDetailsView. لو اتحط جوه أي واحد منهم هيتكرر الكود في التاني.
export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || DEFAULT_STATUS_CONFIG
  return (
    <span
      className="inline-flex items-center gap-[5px] px-[10px] py-1 rounded-[20px] text-sm font-semibold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      <span className="text-[10px]">{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}