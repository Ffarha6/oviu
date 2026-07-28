import { useState } from "react";
import { MessageSquare, CheckCircle2, AlertCircle, Target, Clock, BookOpen, Reply } from "lucide-react";
import KnowledgeBasePanel from "./KnowledgeBasePanel";
import CannedResponsesPanel from "./CannedResponsesPanel";

function formatSeconds(sec) {
  if (!sec) return "—";
  if (sec < 60) return `${sec} ث`;
  return `${Math.round(sec / 60)} د`;
}

export default function ChatbotOverviewPanel({ stats, loading }) {
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [showCannedResponses, setShowCannedResponses] = useState(false);

  const items = [
    { icon: MessageSquare, label: "إجمالي المحادثات", value: stats?.total_conversations ?? 0 },
    { icon: CheckCircle2, label: "تم الرد عليها", value: stats?.answered ?? 0 },
    { icon: AlertCircle, label: "بدون رد", value: stats?.unanswered ?? 0 },
    { icon: Target, label: "معدل الحل", value: `${stats?.resolution_rate ?? 0}%` },
    { icon: Clock, label: "متوسط وقت الرد", value: formatSeconds(stats?.avg_response_seconds) },
  ];

  return (
    <div className="w-full lg:w-80 shrink-0 space-y-4 h-full overflow-y-auto">
      <div className="bg-surface rounded-2xl p-4">
        <h3 className="text-sm font-bold text-primary mb-3">نظرة عامة على الشات بوت</h3>
        {loading ? (
          <p className="text-xs text-primary/40 text-center py-4">جاري التحميل...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((s) => (
              <div key={s.label} className="bg-background rounded-xl p-3">
                <div className="w-7 h-7 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary mb-1.5">
                  <s.icon size={14} />
                </div>
                <p className="text-[11px] text-primary/40 leading-tight">{s.label}</p>
                <p className="text-base font-bold text-primary leading-tight">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface rounded-2xl p-4">
        <h3 className="text-sm font-bold text-primary mb-3">إدارة الشات بوت</h3>
        <div className="grid grid-cols-1 gap-2.5">
          <button
            onClick={() => setShowKnowledgeBase(true)}
            className="flex items-center gap-2 bg-background text-primary/70 text-sm font-medium px-3 py-2.5 rounded-xl hover:text-secondary transition text-right"
          >
            <BookOpen size={15} className="shrink-0" /> قاعدة المعرفة (الأسئلة الشائعة)
          </button>
          <button
            onClick={() => setShowCannedResponses(true)}
            className="flex items-center gap-2 bg-background text-primary/70 text-sm font-medium px-3 py-2.5 rounded-xl hover:text-secondary transition text-right"
          >
            <Reply size={15} className="shrink-0" /> الردود الجاهزة
          </button>
        </div>
      </div>

      {showKnowledgeBase && <KnowledgeBasePanel onClose={() => setShowKnowledgeBase(false)} />}
      {showCannedResponses && <CannedResponsesPanel onClose={() => setShowCannedResponses(false)} />}
    </div>
  );
}