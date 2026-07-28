export default function MiniStatCard({ icon: Icon, title, value, change, trend = "up" }) {
  const isUp = trend === "up";

  return (
    <div className="bg-surface rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
          <Icon size={16} />
        </div>
        <p className="text-xs text-primary/50 leading-tight">{title}</p>
      </div>
      <div>
        <p className="text-lg font-bold text-primary leading-none">{value}</p>
        {change && (
          <p
            className={`text-[11px] mt-1.5 font-medium ${
              isUp ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {isUp ? "↗" : "↘"} {change}{" "}
            <span className="text-primary/40 font-normal">مقارنة بآخر 30 يوم</span>
          </p>
        )}
      </div>
    </div>
  );
}