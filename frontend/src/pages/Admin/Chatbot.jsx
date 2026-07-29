import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import api from "../../api/axios";

import ConversationsList from "../../components/admin/chatbot/Conversationslist";
import ChatWindow from "../../components/admin/chatbot/Chatwindow";
import ChatbotOverviewPanel from "../../components/admin/chatbot/Chatbotoverviewpanel";

export default function Chatbot() {
  const [activeId, setActiveId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = () => {
    api.get("/admin/chatbot/stats/")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("فشل تحميل إحصائيات الشات بوت:", err))
      .finally(() => setStatsLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">الشات بوت</h1>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 mt-1.5">
            <Link to="/admin" className="hover:text-secondary">لوحة التحكم</Link>
            <ChevronLeft size={12} />
            <span className="text-primary/60">الشات بوت</span>
          </div>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] gap-4 flex-1 min-h-[600px]">
        <ConversationsList
          activeId={activeId}
          onSelect={setActiveId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <ChatWindow conversationId={activeId} onStatusChanged={loadStats} />
        <ChatbotOverviewPanel stats={stats} loading={statsLoading} />
      </div>
    </div>
  );
}