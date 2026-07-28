import { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import api from "../../../api/axios";

const tabs = [
  { key: "all", label: "الكل" },
  { key: "open", label: "مفتوحة" },
  { key: "unanswered", label: "بدون رد" },
];

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
}

export default function ConversationsList({ activeId, onSelect, activeTab, onTabChange }) {
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ all: 0, open: 0, unanswered: 0 });

  const fetchConversations = () => {
    setLoading(true);
    api.get("/admin/chatbot/", { params: { search: search || undefined, tab: activeTab } })
      .then((res) => {
        setConversations(res.data.results);
        setCounts((prev) => ({ ...prev, [activeTab]: res.data.count }));
      })
      .catch((err) => console.error("فشل تحميل المحادثات:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(fetchConversations, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeTab]);

  return (
    <div className="bg-surface rounded-2xl p-4 flex flex-col gap-4 h-full">
      <h3 className="text-sm font-bold text-primary">المحادثات</h3>

      <div className="flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3 py-2">
        <Search size={15} className="text-primary/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحثي عن محادثة..."
          className="bg-transparent outline-none text-sm flex-1 text-primary placeholder:text-primary/40"
        />
      </div>

      <div className="flex items-center gap-1 border-b border-primary/10 pb-2 -mt-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
              activeTab === tab.key ? "bg-secondary text-primary" : "text-primary/50 hover:bg-background"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-1">
        {loading ? (
          <p className="text-center text-xs text-primary/40 py-6">جاري التحميل...</p>
        ) : conversations.length === 0 ? (
          <p className="text-center text-xs text-primary/40 py-6">مفيش محادثات</p>
        ) : (
          conversations.map((c) => {
            const isActive = c.id === activeId;
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-right transition-colors ${
                  isActive ? "bg-secondary/15" : "hover:bg-background"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary font-semibold flex items-center justify-center shrink-0 text-sm">
                  {c.customer_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-primary truncate">{c.customer_name}</p>
                    <span className="text-[11px] text-primary/40 shrink-0">{formatTime(c.last_message_time)}</span>
                  </div>
                  <p className="text-xs text-primary/50 truncate">{c.last_message || "لا توجد رسائل"}</p>
                </div>
                {c.unread_count > 0 && (
                  <span className="w-5 h-5 rounded-full bg-secondary text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                    {c.unread_count}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}