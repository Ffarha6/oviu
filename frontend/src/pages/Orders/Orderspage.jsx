import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  FaBox, FaChevronLeft, FaFilter, FaSearch,
  FaTruck, FaCheckCircle, FaClock, FaTimesCircle,
  FaSpinner, FaBoxOpen, FaHeadset
} from "react-icons/fa"

const BASE_URL = "http://localhost:8000"

function getCookie(name) {
  const v = `; ${document.cookie}`
  const p = v.split(`; ${name}=`)
  if (p.length === 2) return p.pop().split(";").shift()
  return null
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "X-CSRFToken": getCookie("csrftoken") },
})

// ── Status config ────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: "قيد المعالجة", color: "#f59e0b", bg: "#fffbeb", icon: <FaClock />,        border: "#fde68a" },
  confirmed: { label: "تم التأكيد",   color: "#3b82f6", bg: "#eff6ff", icon: <FaCheckCircle />,  border: "#bfdbfe" },
  preparing: { label: "جاري التجهيز", color: "#8b5cf6", bg: "#f5f3ff", icon: <FaSpinner />,      border: "#ddd6fe" },
  shipped:   { label: "جاري التوصيل", color: "#E8821A", bg: "#fff4ea", icon: <FaTruck />,         border: "#fed7aa" },
  delivered: { label: "تم التوصيل",   color: "#10b981", bg: "#ecfdf5", icon: <FaCheckCircle />,  border: "#a7f3d0" },
  cancelled: { label: "ملغي",         color: "#ef4444", bg: "#fef2f2", icon: <FaTimesCircle />,  border: "#fecaca" },
}

const FILTERS = [
  { key: "all",       label: "الكل" },
  { key: "pending",   label: "قيد المعالجة" },
  { key: "shipped",   label: "تم الشحن" },
  { key: "delivered", label: "تم التوصيل" },
  { key: "cancelled", label: "ملغاة" },
]

// ── Status Badge ─────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#888", bg: "#f5f5f5", icon: <FaBox />, border: "#e0e0e0" }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ fontSize: 10 }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}

// ── Progress Steps ────────────────────────────────────────────────
function OrderProgress({ status }) {
  const steps = ["pending", "confirmed", "preparing", "shipped", "delivered"]
  if (status === "cancelled") return null
  const currentIdx = steps.indexOf(status)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 12 }}>
      {steps.map((step, i) => {
        const done = i <= currentIdx
        const cfg = STATUS_CONFIG[step]
        return (
          <div key={step} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: done ? "#E8821A" : "#f0f0f0",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: done ? "#fff" : "#bbb",
              transition: "all .3s",
            }}>
              {cfg.icon}
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2,
                background: i < currentIdx ? "#E8821A" : "#f0f0f0",
                transition: "all .3s",
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Order Card ────────────────────────────────────────────────────
function OrderCard({ order, onExpand, expanded }) {
  const firstItem = order.items?.[0]
  const itemCount = order.items?.length || 0

  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0",
      overflow: "hidden", transition: "box-shadow .2s",
      boxShadow: expanded ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
    }}>
      {/* Main row */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>

        {/* Product thumbnail */}
        <div style={{
          width: 64, height: 64, borderRadius: 10,
          background: "#f8f8f8", border: "1px solid #f0f0f0",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, overflow: "hidden",
        }}>
          {firstItem?.product_image
            ? <img src={firstItem.product_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <FaBoxOpen style={{ color: "#ddd", fontSize: 24 }} />
          }
        </div>

        {/* Order info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#222" }}>طلب رقم #{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>
            تاريخ الطلب: {new Date(order.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#666" }}>
            <span>عدد المنتجات: <strong style={{ color: "#222" }}>{itemCount} {itemCount === 1 ? "منتج" : "منتجات"}</strong></span>
            <span>الإجمالي: <strong style={{ color: "#E8821A" }}>{order.total_price} ج.م</strong></span>
          </div>

          {/* Progress bar */}
          <OrderProgress status={order.status} />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => onExpand(order.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 10,
              border: "1.5px solid #E8821A", background: expanded ? "#E8821A" : "#fff",
              color: expanded ? "#fff" : "#E8821A",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Cairo',sans-serif", transition: "all .2s",
            }}
          >
            عرض التفاصيل
            <FaChevronLeft style={{ fontSize: 10, transform: expanded ? "rotate(-90deg)" : "rotate(0)", transition: "transform .2s" }} />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: "1px solid #f5f5f5", padding: "16px 20px", background: "#fafafa" }}>

          {/* Items list */}
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#444" }}>المنتجات:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {order.items?.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#fff", borderRadius: 10, padding: "10px 14px",
                border: "1px solid #f0f0f0",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FaBox style={{ color: "#ddd", fontSize: 14 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{item.product_name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>
                    الكمية: {item.quantity}
                    {item.color_name && ` · اللون: ${item.color_name}`}
                  </p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>{item.price_at_time} ج.م</span>
              </div>
            ))}
          </div>

          {/* Order meta */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
            {[
              { label: "طريقة الدفع", value: order.payment_method_display },
              { label: "العنوان", value: order.address },
              { label: "رقم التتبع", value: order.tracking_number || "—" },
              { label: "تاريخ الشحن", value: order.shipped_date ? new Date(order.shipped_date).toLocaleDateString("ar-EG") : "—" },
              { label: "تاريخ التسليم", value: order.delivered_date ? new Date(order.delivered_date).toLocaleDateString("ar-EG") : "—" },
              { label: "حالة الدفع", value: order.is_paid ? "✅ مدفوع" : "⏳ غير مدفوع" },
            ].map((meta, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", border: "1px solid #f0f0f0" }}>
                <p style={{ margin: "0 0 2px", fontSize: 11, color: "#aaa" }}>{meta.label}</p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#333" }}>{meta.value}</p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#fff", borderRadius: 10, border: "1px solid #f0f0f0" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#444" }}>الإجمالي الكلي</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#E8821A" }}>{order.total_price} ج.م</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────
export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    api.get("/api/orders/my-orders/")
      .then(res => setOrders(res.data))
      .catch(err => {
        if (err.response?.status === 401) navigate("/login")
        else setError("حدث خطأ في جلب الطلبات")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleExpand = (id) => setExpandedId(prev => prev === id ? null : id)

  const filtered = orders.filter(o => {
    const matchFilter = activeFilter === "all" || o.status === activeFilter
    const matchSearch = search === "" || String(o.id).includes(search)
    return matchFilter && matchSearch
  })

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #f0f0f0", borderTop: "3px solid #E8821A", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo','Segoe UI',sans-serif", minHeight: "100vh", background: "#f8f8f8", color: "#222", paddingTop: 100 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 48px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: "#888", display: "flex", gap: 6, marginBottom: 24 }}>
          <Link to="/" style={{ color: "#E8821A", textDecoration: "none" }}>الرئيسية</Link>
          <span>›</span>
          <Link to="/profile" style={{ color: "#E8821A", textDecoration: "none" }}>حسابي</Link>
          <span>›</span>
          <span style={{ color: "#222" }}>طلباتي</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>طلباتي</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#aaa" }}>
              تتبع جميع طلباتك وحالة الشحن الخاصة بها
            </p>
          </div>
          <span style={{ fontSize: 13, color: "#888", background: "#fff", padding: "6px 14px", borderRadius: 20, border: "1px solid #f0f0f0" }}>
            {orders.length} طلب
          </span>
        </div>

        {/* Search + Filters */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #f0f0f0", marginBottom: 20 }}>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8f8f8", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
            <FaSearch style={{ color: "#ccc", fontSize: 14 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث برقم الطلب..."
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, fontFamily: "'Cairo',sans-serif", flex: 1, direction: "rtl" }}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#888", marginLeft: 4 }}>
              <FaFilter style={{ fontSize: 11 }} /> تصفية:
            </span>
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  padding: "6px 14px", borderRadius: 20, border: "1.5px solid",
                  borderColor: activeFilter === f.key ? "#E8821A" : "#e0e0e0",
                  background: activeFilter === f.key ? "#fff4ea" : "#fff",
                  color: activeFilter === f.key ? "#E8821A" : "#666",
                  fontSize: 12, fontWeight: activeFilter === f.key ? 700 : 400,
                  cursor: "pointer", fontFamily: "'Cairo',sans-serif",
                  transition: "all .15s",
                }}
              >
                {f.label}
                <span style={{ marginRight: 4, fontSize: 11, color: activeFilter === f.key ? "#E8821A" : "#aaa" }}>
                  ({f.key === "all" ? orders.length : orders.filter(o => o.status === f.key).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 16, marginBottom: 20, color: "#ef4444", fontSize: 14, textAlign: "center" }}>
            {error}
          </div>
        )}

        {/* Orders list */}
        {filtered.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: 60, border: "1px solid #f0f0f0", textAlign: "center" }}>
            <FaBoxOpen style={{ fontSize: 48, color: "#e0e0e0", marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: "#aaa", margin: "0 0 8px" }}>لا توجد طلبات</p>
            <p style={{ fontSize: 13, color: "#ccc", margin: "0 0 24px" }}>
              {search ? "لم يتم العثور على طلب بهذا الرقم" : "لم تقم بأي طلبات بعد"}
            </p>
            <Link to="/" style={{
              display: "inline-block", padding: "10px 24px", background: "#E8821A",
              color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600,
            }}>
              تسوق الآن
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn .3s ease" }}>
            {filtered.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={expandedId === order.id}
                onExpand={handleExpand}
              />
            ))}
          </div>
        )}

        {/* Help banner */}
        <div style={{
          marginTop: 32, background: "#fff4ea", borderRadius: 16,
          padding: "20px 24px", display: "flex", alignItems: "center",
          justifyContent: "space-between", border: "1px solid #fed7aa",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <FaHeadset style={{ fontSize: 28, color: "#E8821A" }} />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>تحتاج مساعدة في طلبك؟</p>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>فريق الدعم متاح 24/7 لمساعدتك</p>
            </div>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
            style={{
              padding: "10px 20px", background: "#E8821A", color: "#fff",
              border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Cairo',sans-serif",
            }}
          >
            تواصل معنا 💬
          </button>
        </div>
      </div>
    </div>
  )
}