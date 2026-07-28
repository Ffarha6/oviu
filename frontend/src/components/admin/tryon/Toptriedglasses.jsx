const topGlasses = [
  { rank: 1, name: "أفياتور كلاسيك", sku: "OV-AVI-001", count: 1523 },
  { rank: 2, name: "كات آي شيك", sku: "OV-CAT-005", count: 1320 },
  { rank: 3, name: "راوند ميتال", sku: "OV-ROU-003", count: 1150 },
  { rank: 4, name: "سكوير إيليت", sku: "OV-SQE-002", count: 980 },
  { rank: 5, name: "ويفارر برو", sku: "OV-WAY-004", count: 845 },
];

const rankColors = {
  1: "bg-secondary text-primary",
  2: "bg-primary/10 text-primary",
  3: "bg-primary/10 text-primary",
  4: "bg-primary/10 text-primary",
  5: "bg-primary/10 text-primary",
};

export default function TopTriedGlasses() {
  return (
    <ul className="space-y-3.5">
      {topGlasses.map((g) => (
        <li key={g.rank} className="flex items-center gap-3">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rankColors[g.rank]}`}>
            {g.rank}
          </span>
          <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-lg shrink-0">
            👓
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-primary truncate">{g.name}</p>
            <p className="text-xs text-primary/40">{g.sku}</p>
          </div>
          <span className="text-sm font-semibold text-primary shrink-0">{g.count.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}