import { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import api from "../../../api/axios";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-primary/10 rounded-lg px-3 py-2 shadow-sm text-xs">
      <p className="text-primary/50 mb-1">{label}</p>
      <p className="text-primary font-semibold">{payload[0].value.toLocaleString()} عنصر</p>
    </div>
  );
}

export default function WishlistOverviewChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/wishlist/overview/")
      .then((res) => {
        setData(
          res.data.map((d) => ({
            day: new Date(d.day).toLocaleDateString("ar-EG", { day: "numeric", month: "short" }),
            count: d.count,
          }))
        );
      })
      .catch((err) => console.error("فشل تحميل اتجاه المفضلة:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-xs text-primary/40 text-center py-8">جاري التحميل...</p>;
  if (data.length === 0) return <p className="text-xs text-primary/40 text-center py-8">مفيش نشاط كافي لعرضه لسه</p>;

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="wishlistFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-primary)" strokeOpacity={0.06} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--color-primary)", fontSize: 10, opacity: 0.5 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--color-primary)", fontSize: 11, opacity: 0.5 }} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="count" stroke="var(--color-secondary)" strokeWidth={2.5} fill="url(#wishlistFill)" dot={{ r: 2, fill: "var(--color-secondary)", strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}