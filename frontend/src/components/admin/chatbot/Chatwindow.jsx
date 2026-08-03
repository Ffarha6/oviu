import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Ban, PlayCircle, Reply } from "lucide-react";
import api from "../../../api/axios";
import CannedResponsesPanel from "./CannedResponsesPanel";

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWindow({ conversationId, onStatusChanged }) {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showCanned, setShowCanned] = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = () => {
    if (!conversationId) return;
    setLoading(true);
    api.get(`/dashboard/chatbot/${conversationId}/messages/`)
      .then((res) => {
        setSession(res.data.session);
        setMessages(res.data.messages);
      })
      .catch((err) => console.error("فشل تحميل الرسائل:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/dashboard/chatbot/${conversationId}/reply/`, { message: message.trim() });
      setMessages((prev) => [...prev, res.data]);
      setMessage("");
    } catch (err) {
      alert("حصل خطأ أثناء إرسال الرد");
    } finally {
      setSending(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const res = await api.patch(`/dashboard/chatbot/${conversationId}/toggle-status/`);
      setSession((prev) => ({ ...prev, is_closed: res.data.is_closed }));
      onStatusChanged?.();
    } catch (err) {
      alert("حصل خطأ أثناء تغيير حالة المحادثة");
    }
  };

  if (!conversationId) {
    return (
      <div className="bg-surface rounded-2xl flex items-center justify-center h-full text-sm text-primary/40">
        اختاري محادثة لعرضها
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl flex items-center justify-center h-full text-sm text-primary/40">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary font-semibold flex items-center justify-center shrink-0">
            {session?.customer_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{session?.customer_name}</p>
            {session?.customer_email && <p className="text-xs text-primary/40" dir="ltr">{session.customer_email}</p>}
          </div>
        </div>
        <button
          onClick={handleToggleStatus}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
            session?.is_closed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {session?.is_closed ? <PlayCircle size={13} /> : <Ban size={13} />}
          {session?.is_closed ? "إعادة فتح المحادثة" : "إغلاق المحادثة"}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-primary/40 py-10">مفيش رسائل في المحادثة دي لسه</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.is_user ? "justify-end" : "justify-start"}`}>
              {!m.is_user && (
                <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center text-[10px] font-bold shrink-0 ml-2">
                  {m.is_admin_reply ? "أد" : "OV"}
                </div>
              )}
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                m.is_user ? "bg-secondary/20 text-primary" : "bg-background text-primary"
              }`}>
                <p>{m.message}</p>
                <p className="text-[10px] text-primary/40 mt-1 text-left">{formatTime(m.created_at)}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-primary/10 p-4">
        <div className="bg-background border border-primary/10 rounded-xl p-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={2}
            placeholder="اكتبي ردك على العميل..."
            className="w-full bg-transparent outline-none text-sm text-primary placeholder:text-primary/40 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => setShowCanned(true)}
              className="flex items-center gap-1.5 text-xs text-primary/50 hover:text-secondary transition"
            >
              <Reply size={13} /> ردود جاهزة
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="flex items-center gap-1.5 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition disabled:opacity-50"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              إرسال
            </button>
          </div>
        </div>
      </div>

      {showCanned && (
        <CannedResponsesPanel
          onClose={() => setShowCanned(false)}
          onPick={(text) => { setMessage(text); setShowCanned(false); }}
        />
      )}
    </div>
  );
}