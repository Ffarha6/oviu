import { useState, useRef, useEffect } from "react";
import api from "../../api/axios";
import { useSettings } from "../../context/SettingsContext";
const BASE_URL = "https://oviu-production.up.railway.app/api";

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function getTime() {
  return new Date().toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const QUICK_ACTIONS = [
  { label: "📦 تتبع الطلب", msg: "كيف أتتبع طلبي؟" },
  { label: "↩️ سياسة الإرجاع", msg: "ما هي سياسة الإرجاع؟" },
  { label: "💳 طرق الدفع", msg: "طرق الدفع المتاحة" },
  { label: "🚚 الشحن", msg: "هل يوجد شحن مجاني؟" },
];

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [hasNotif, setHasNotif] = useState(true);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const msgsEndRef = useRef(null);

  // ✅ historyLoaded في ref عشان نقدر نوصله جوه الـ event handler
  const historyLoadedRef = useRef(false);
  const { settings, loading } = useSettings();
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ✅ الـ event listener اللي بيفتح الشات لما حد يدوس "تواصل معنا"
  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
      setHasNotif(false);
      if (!historyLoadedRef.current) {
        loadHistory();
        historyLoadedRef.current = true;
        setHistoryLoaded(true);
      }
    };
    window.addEventListener("open-chatbot", handler);
    return () => window.removeEventListener("open-chatbot", handler);
  }, []); // ✅ [] — بيتسجل مرة واحدة بس ومفيش stale closure

  const toggleChat = () => {
    setIsOpen((prev) => {
      if (!prev) {
        setHasNotif(false);
        if (!historyLoadedRef.current) {
          loadHistory();
          historyLoadedRef.current = true;
          setHistoryLoaded(true);
        }
      }
      return !prev;
    });
  };

  const addMessage = (text, isUser) => {
    setMessages((prev) => [...prev, { text, isUser, time: getTime() }]);
    if (!isUser) setShowQuick(false);
  };

  const loadHistory = async () => {
    setMessages([
      {
        text: "مرحباً! 👋\nأنا مساعد OVIU، كيف يمكنني مساعدتك اليوم؟",
        isUser: false,
        time: getTime(),
      },
    ]);
    try {
      const res = await fetch(`${BASE_URL}/chatbot/history/`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.length) {
        setShowQuick(false);
        setMessages((prev) => [
          prev[0],
          ...data.map((m) => ({
            text: m.message,
            isUser: m.is_user,
            time: m.created_at.slice(11, 16),
          })),
        ]);
      }
    } catch (e) {}
  };

  const sendMessage = async (textOverride) => {
    if (isBusy) return;
    const text = (textOverride || input).trim();
    if (!text) return;
    setInput("");
    addMessage(text, true);
    setIsBusy(true);
    setIsTyping(true);
    try {
      const csrfToken = getCookie("csrftoken");
      const res = await fetch(`${BASE_URL}/chatbot/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        credentials: "include",
        body: JSON.stringify({ message: text }),
      });
      setIsTyping(false);
      setIsBusy(false);
      if (!res.ok) {
        addMessage("حدث خطأ، حاول مرة أخرى.", false);
        return;
      }
      const data = await res.json();
      addMessage(data.reply, false);
    } catch (e) {
      setIsTyping(false);
      setIsBusy(false);
      addMessage("تعذر الاتصال بالخادم. تأكد من تشغيل Django.", false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        text: "مرحباً! 👋\nأنا مساعد OVIU، كيف يمكنني مساعدتك اليوم؟",
        isUser: false,
        time: getTime(),
      },
    ]);
    setShowQuick(true);
  };

  if (loading) {
  return null;
}

if (!settings?.enable_chatbot) {
  return null;
}

  return (
    <>
      {/* FAB Button — ✅ position بقت جوه class اسمه oviu-chat-fab بدل inline
          style ثابتة، عشان نقدر نستخدم media query تحت وترفعه فوق الـ
          BottomNav على الموبايل بس، وتسيبه في مكانه الأصلي على الديسكتوب */}
      <button
        onClick={toggleChat}
        aria-label="فتح المحادثة"
        className="oviu-chat-fab"
        style={{
          position: "fixed",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#f97316",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(249,115,22,0.45)",
          zIndex: 9999,
          transition: "transform 0.2s, bottom 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {hasNotif && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 14,
              height: 14,
              background: "#ef4444",
              borderRadius: "50%",
              border: "2px solid #fff",
            }}
          />
        )}
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat Window — ✅ نفس فكرة الـ class عشان الشات كمان يرتفع شوية على
          الموبايل ومايبقاش لاصق تحت البار السفلي مباشرة */}
      <div
        className="oviu-chat-window"
        style={{
          position: "fixed",
          left: 0,
          width: "min(480px, 100vw)",
          background: "#fff",
          borderRadius: "0 22px 0 0",
          border: "0.5px solid #e5e7eb",
          boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
          zIndex: 9998,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transformOrigin: "bottom left",
          transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s",
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(30px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "all" : "none",
          fontFamily: "'Cairo', sans-serif",
          direction: "rtl",
        }}
      >
        {/* Header */}
        <div style={{ padding: "14px 16px", borderBottom: "0.5px solid #f3f4f6", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, background: "#fff4ed", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
            🤖
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>مساعد OVIU</div>
            <div style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
              متاح الآن لجميع استفساراتك
            </div>
          </div>
          <button onClick={clearChat} title="محادثة جديدة" style={{ background: "none", border: "none", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.1" />
            </svg>
          </button>
          <button onClick={toggleChat} aria-label="إغلاق" style={{ background: "none", border: "none", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 8, flexDirection: m.isUser ? "row-reverse" : "row" }}>
              {!m.isUser && (
                <div style={{ width: 30, height: 30, background: "#fff4ed", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🤖</div>
              )}
              <div>
                <div style={{
                  maxWidth: 290,
                  padding: "10px 14px",
                  borderRadius: 18,
                  borderBottomRightRadius: m.isUser ? 18 : 5,
                  borderBottomLeftRadius: m.isUser ? 5 : 18,
                  fontSize: 13.5,
                  lineHeight: 1.65,
                  background: m.isUser ? "#f97316" : "#f9fafb",
                  color: m.isUser ? "#fff" : "#374151",
                  border: m.isUser ? "none" : "0.5px solid #f3f4f6",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {m.text}
                </div>
                <div style={{ fontSize: 10, color: "#d1d5db", marginTop: 3, textAlign: m.isUser ? "left" : "right" }}>
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div style={{ width: 30, height: 30, background: "#fff4ed", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
              <div style={{ background: "#f9fafb", border: "0.5px solid #f3f4f6", borderRadius: 18, borderBottomRightRadius: 5, padding: "12px 16px", display: "flex", gap: 5 }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <span key={i} style={{
                    width: 7, height: 7, background: "#d1d5db", borderRadius: "50%", display: "inline-block",
                    animation: `typingBounce 1.2s ${delay}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={msgsEndRef} />
        </div>

        {/* Quick Actions */}
        {showQuick && (
          <div style={{ padding: "0 14px 12px", display: "flex", flexWrap: "wrap", gap: 7 }}>
            {QUICK_ACTIONS.map((qa) => (
              <button key={qa.msg} onClick={() => sendMessage(qa.msg)}
                style={{ background: "#fff", color: "#f97316", border: "1px solid #fed7aa", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontFamily: "'Cairo', sans-serif", cursor: "pointer" }}>
                {qa.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "10px 14px", borderTop: "0.5px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => sendMessage()} aria-label="إرسال"
            style={{ width: 40, height: 40, background: "#f97316", borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="اكتب رسالتك..."
            style={{ flex: 1, border: "0.5px solid #e5e7eb", borderRadius: 24, padding: "10px 16px", fontSize: 13, fontFamily: "'Cairo', sans-serif", direction: "rtl", outline: "none", background: "#f9fafb", color: "#1f2937" }}
          />
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); background: #d1d5db; }
          30% { transform: translateY(-5px); background: #f97316; }
        }

        /* ✅ الديسكتوب: زرار الشات في مكانه الأصلي تحت وعلى الشمال */
        .oviu-chat-fab {
          bottom: 30px;
          left: 30px;
        }
        .oviu-chat-window {
          bottom: 0;
          height: calc(100vh - 80px);
        }

        /* ✅ الموبايل: بنرفع زرار الشات ونافذته فوق الـ BottomNav الثابت تحت
           (ارتفاعه تقريبًا 56-64px + مساحة الأمان)، بدل ما يتراكبوا فوقه */
        @media (max-width: 1023px) {
          .oviu-chat-fab {
            bottom: calc(72px + env(safe-area-inset-bottom));
            left: 16px;
            width: 52px;
            height: 52px;
          }
          .oviu-chat-window {
            bottom: calc(72px + env(safe-area-inset-bottom));
            height: calc(100vh - 152px);
          }
        }
      `}</style>
    </>
  );
}