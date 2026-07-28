import { createContext, useContext, useState, useCallback } from "react"

const ToastContext = createContext(null)

let idCounter = 0

/**
 * ToastProvider
 * لازم يتحط مرة واحدة لافّ التطبيق كله (في App.jsx أو main.jsx)
 * عشان أي كومبوننت في أي صفحة يقدر يعرض رسالة منبثقة عن طريق useToast()
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = "success") => {
    const id = ++idCounter
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* حاوية الرسائل - ثابتة فوق منتصف الشاشة، مش بتاخد أي كليكات (pointer-events: none) */}
      <div
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "none",
          width: "max-content",
          maxWidth: "90vw",
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background:
                t.type === "error" ? "#e53935" :
                t.type === "info"  ? "#333"    :
                "#D9A066",
              color: "#fff",
              padding: "12px 22px",
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 700,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              fontFamily: "'Cairo', 'Segoe UI', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 8,
              animation: "viona-toast-in 0.25s ease",
              direction: "rtl",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes viona-toast-in {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast لازم يتستخدم جوه <ToastProvider>")
  }
  return ctx
}