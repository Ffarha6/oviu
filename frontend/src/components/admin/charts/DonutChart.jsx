import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// data: [{ label: "Sunglasses", value: 42 }, ...]
// centerLabel / centerValue: النص في نص الدونات
// palette: مصفوفة ألوان اختيارية (لو مبعتتهاش هتستخدم درجات لون الـ secondary)
const defaultPalette = [
  "var(--color-secondary)",
  "var(--color-primary)",
  "#D9A87C",
  "#8C6A52",
  "#E8C9AE",
  "#4A4A4A",
];

export default function DonutChart({ data, centerLabel, centerValue, palette = defaultPalette }) {
  return (
    <div className="flex items-center gap-6">
      <div className="w-40 h-40 shrink-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={entry.label} fill={palette[i % palette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerValue && (
              <span className="text-sm font-bold text-primary">{centerValue}</span>
            )}
            {centerLabel && (
              <span className="text-[11px] text-primary/50">{centerLabel}</span>
            )}
          </div>
        )}
      </div>

      <ul className="flex-1 space-y-2.5">
        {data.map((entry, i) => (
          <li key={entry.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-primary/70">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: palette[i % palette.length] }}
              />
              {entry.label}
            </span>
            <span className="font-semibold text-primary">{entry.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}