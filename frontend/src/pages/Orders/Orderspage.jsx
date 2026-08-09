import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  FaBox, FaChevronLeft, FaFilter, FaSearch,
  FaTruck, FaCheckCircle, FaClock, FaTimesCircle,
  FaSpinner, FaBoxOpen, FaHeadset, FaMapMarkerAlt, FaCopy
} from "react-icons/fa"

const BASE_URL = "https://oviu-production.up.railway.app"

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

// ✅ الباك إند بيرجّع مسار الصورة نسبي أحيانًا (زي /media/products/xyz.jpg) من غير
// الدومين، فبنضيف الدومين لو مش موجود أصلاً
function resolveImageUrl(path) {
  if (!path) return ""
  if (/^https?:\/\//i.test(path)) return path
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`
}

// ✅ الموقع عربي بس، فطريقة الدفع بترجع دايمًا بالعربي حتى لو الباك إند راجعها إنجليزي
const PAYMENT_METHOD_AR = {
  "Cash on Delivery": "الدفع عند الاستلام",
  "Cash On Delivery": "الدفع عند الاستلام",
  "COD": "الدفع عند الاستلام",
  "Card": "بطاقة ائتمان",
  "Credit Card": "بطاقة ائتمان",
  "Online Payment": "دفع إلكتروني",
}
function resolvePaymentMethod(value) {
  if (!value) return ""
  return PAYMENT_METHOD_AR[value] || value
}

function formatShortDate(value) {
  if (!value) return null
  return new Date(value).toLocaleDateString("ar-EG", { day: "numeric", month: "long" })
}

// ── Status config ────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: "قيد المعالجة", color: "#f59e0b", bg: "#fffbeb", icon: <FaClock /> },
  confirmed: { label: "تم التأكيد",   color: "#3b82f6", bg: "#eff6ff", icon: <FaCheckCircle /> },
  preparing: { label: "جاري التجهيز", color: "#8b5cf6", bg: "#f5f3ff", icon: <FaSpinner /> },
  shipped:   { label: "جاري التوصيل", color: "#E8821A", bg: "#fff4ea", icon: <FaTruck /> },
  delivered: { label: "تم التوصيل",   color: "#10b981", bg: "#ecfdf5", icon: <FaCheckCircle /> },
  cancelled: { label: "ملغي",         color: "#ef4444", bg: "#fef2f2", icon: <FaTimesCircle /> },
}

const STEPS = ["pending", "confirmed", "preparing", "shipped", "delivered"]

// ✅ التواريخ المتأكدين إنها موجودة في الباك إند بس: تاريخ إنشاء الطلب، تاريخ
// الشحن، وتاريخ التسليم. باقي الخطوات (تم التأكيد / جاري التجهيز) بتتعرض من غير
// تاريخ لحد ما تتأكدي إن الباك إند فعلاً بيرجّع تواريخ ليها
function dateForStep(order, step) {
  if (step === "pending") return order.created_at
  if (step === "shipped") return order.shipped_date
  if (step === "delivered") return order.delivered_date
  return null
}

const FILTERS = [
  { key: "all",       label: "الكل" },
  { key: "pending",   label: "قيد المعالجة" },
  { key: "shipped",   label: "تم الشحن" },
  { key: "delivered", label: "تم التوصيل" },
  { key: "cancelled", label: "ملغاة" },
]

// ── Unified status box (icon + label + % + progress bar, all ONE box) ──
function OrderStatus({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#888", bg: "#f5f5f5", icon: <FaBox /> }
  const isCancelled = status === "cancelled"
  const currentIdx = STEPS.indexOf(status)
  const pct = isCancelled ? 0 : Math.round(((currentIdx + 1) / STEPS.length) * 100)

  return (
    <div className="order-status-box" style={{ background: cfg.bg }}>
      <div className="order-status-top">
        <span className="order-status-icon" style={{ color: cfg.color }}>{cfg.icon}</span>
        <span className="order-status-label" style={{ color: cfg.color }}>{cfg.label}</span>
        {!isCancelled && <span className="order-status-pct" style={{ color: cfg.color }}>{pct}%</span>}
      </div>
      {!isCancelled && (
        <div className="order-status-track">
          {STEPS.map((step, i) => (
            <span
              key={step}
              className="order-status-segment"
              style={{ background: i <= currentIdx ? cfg.color : "rgba(0,0,0,0.08)" }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Order number chip (copy) ───────────────────────────────────────
function OrderNumberChip({ order }) {
  const [copied, setCopied] = useState(false)
  const value = order.order_number || order.id

  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(String(value))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="order-number-chip">
      <div>
        <p className="order-number-chip-label">رقم الطلب</p>
        <p className="order-number-chip-value">#{value}</p>
      </div>
      <button className={`order-number-copy-btn ${copied ? "is-copied" : ""}`} onClick={handleCopy}>
        <FaCopy />
        {copied ? "تم النسخ" : "نسخ"}
      </button>
    </div>
  )
}

// ── Address block ────────────────────────────────────────────────
function OrderAddress({ address }) {
  if (!address) return null
  return (
    <div className="order-address-block">
      <FaMapMarkerAlt className="order-address-icon" />
      <div className="order-address-text-wrap">
        <p className="order-address-label">عنوان التوصيل</p>
        <p className="order-address-text">{address}</p>
      </div>
    </div>
  )
}

// ── Timeline (collapsed summary ↔ full stepper, زي نون) ────────────
function OrderTimeline({ order, expanded, onToggle }) {
  const status = order.status
  const isCancelled = status === "cancelled"
  const currentIdx = STEPS.indexOf(status)

  if (isCancelled) {
    return (
      <div className="order-timeline-wrap">
        <div className="timeline-cancelled">
          <FaTimesCircle />
          <span>تم إلغاء هذا الطلب</span>
        </div>
      </div>
    )
  }

  const cfg = STATUS_CONFIG[status]
  const summaryDate = formatShortDate(dateForStep(order, status))

  return (
    <div className="order-timeline-wrap">
      <button className="timeline-toggle-btn" onClick={onToggle}>
        <span className="timeline-summary-label" style={{ color: cfg.color }}>
          {cfg.icon} {cfg.label}
        </span>
        {summaryDate && <span className="timeline-summary-date">{summaryDate}</span>}
        <FaChevronLeft className={`timeline-toggle-chevron ${expanded ? "is-open" : ""}`} />
      </button>

      {expanded && (
        <>
          <div className="timeline-steps">
            {STEPS.map((step, i) => {
              const stepCfg = STATUS_CONFIG[step]
              const done = i <= currentIdx
              const date = formatShortDate(dateForStep(order, step))
              return (
                <div key={step} className="timeline-step">
                  <div className="timeline-step-marker">
                    <span className="timeline-step-dot" style={{ background: done ? stepCfg.color : "#e5e5e5" }} />
                    {i !== STEPS.length - 1 && (
                      <span className="timeline-step-line" style={{ background: i < currentIdx ? stepCfg.color : "#e5e5e5" }} />
                    )}
                  </div>
                  <div className="timeline-step-body">
                    <p className="timeline-step-label" style={{ color: done ? "#222" : "#bbb" }}>{stepCfg.label}</p>
                    {date && <p className="timeline-step-date">{date}</p>}
                  </div>
                </div>
              )
            })}
          </div>
          <button className="timeline-toggle-btn timeline-toggle-btn--close" onClick={onToggle}>
            إخفاء التتبع الكامل
            <FaChevronLeft className="timeline-toggle-chevron is-open" />
          </button>
        </>
      )}
    </div>
  )
}

// ── Invoice / summary (collapsible) ─────────────────────────────────
function OrderInvoice({ order, expanded, onToggle }) {
  return (
    <div className="order-invoice-wrap">
      <button className="invoice-toggle-btn" onClick={onToggle}>
        <span>عرض ملخص الطلب / الفاتورة</span>
        <FaChevronLeft className={`invoice-toggle-chevron ${expanded ? "is-open" : ""}`} />
      </button>

      {expanded && (
        <div className="order-details">
          <p className="details-heading">المنتجات:</p>
          <div className="items-list">
            {order.items?.map((item, i) => {
              const imageUrl = resolveImageUrl(item.product_image)
              return (
                <div key={i} className="item-row">
                  <div className="item-thumb">
                    {imageUrl ? <img src={imageUrl} alt="" /> : <FaBox />}
                  </div>
                  <div className="item-info">
                    <p className="item-name">{item.product_name}</p>
                    <p className="item-sub">
                      الكمية: {item.quantity}
                      {item.color_name && ` · اللون: ${item.color_name}`}
                    </p>
                  </div>
                  <span className="item-price">{item.price_at_time} ج.م</span>
                </div>
              )
            })}
          </div>

          <div className="meta-grid">
            {[
              { label: "طريقة الدفع", value: resolvePaymentMethod(order.payment_method_display) },
              { label: "رقم التتبع", value: order.tracking_number || "—" },
              { label: "حالة الدفع", value: order.is_paid ? "✅ مدفوع" : "⏳ غير مدفوع" },
            ].map((meta, i) => (
              <div key={i} className="meta-item">
                <p className="meta-label">{meta.label}</p>
                <p className="meta-value">{meta.value}</p>
              </div>
            ))}
          </div>

          <div className="total-row">
            <span>الإجمالي الكلي</span>
            <span className="total-row-value">{order.total_price} ج.م</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Order Card ────────────────────────────────────────────────────
function OrderCard({ order, onExpand, expanded }) {
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [invoiceOpen, setInvoiceOpen] = useState(false)

  const firstItem = order.items?.[0]
  const itemCount = order.items?.length || 0
  const imageUrl = resolveImageUrl(firstItem?.product_image)

  return (
    <div className={`order-card ${expanded ? "order-card--expanded" : ""}`}>
      <div className="order-card-inner">

        <div className="order-image">
          {imageUrl
            ? <img src={imageUrl} alt="" />
            : <FaBoxOpen className="order-image-placeholder" />
          }
        </div>

        <div className="order-content">
          <div className="order-top-line">
            <span className="order-id">طلب رقم #{order.id}</span>
            <span className="order-date">
              {new Date(order.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>

          <div className="order-meta-row">
            <span>عدد المنتجات: <strong>{itemCount} {itemCount === 1 ? "منتج" : "منتجات"}</strong></span>
            <span className="order-total">الإجمالي: <strong>{order.total_price} ج.م</strong></span>
          </div>

          <OrderStatus status={order.status} />

          <button className="detail-btn" onClick={() => onExpand(order.id)}>
            عرض التفاصيل
            <FaChevronLeft className={`detail-btn-chevron ${expanded ? "is-open" : ""}`} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="order-expanded-body">
          <OrderNumberChip order={order} />
          <OrderAddress address={order.address} />
          <OrderTimeline order={order} expanded={timelineOpen} onToggle={() => setTimelineOpen(v => !v)} />
          <OrderInvoice order={order} expanded={invoiceOpen} onToggle={() => setInvoiceOpen(v => !v)} />
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
    <div className="orders-loading">
      <div className="orders-spinner" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div dir="rtl" className="orders-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        .orders-page {
          font-family: 'Cairo','Segoe UI',sans-serif;
          min-height: 100vh;
          background: #f8f8f8;
          color: #1e1e1e;
          padding-top: 100px;
        }

        .orders-loading {
          display: flex; align-items: center; justify-content: center; min-height: 60vh;
        }
        .orders-spinner {
          width: 36px; height: 36px; border: 3px solid #f0f0f0;
          border-top: 3px solid #E8821A; border-radius: 50%;
          animation: spin .8s linear infinite;
        }

        .orders-container { max-width: 900px; margin: 0 auto; padding: 0 24px 48px; }

        .breadcrumb { font-size: 13px; color: #999; display: flex; gap: 6px; margin-bottom: 24px; }
        .breadcrumb a { color: #E8821A; text-decoration: none; }
        .breadcrumb span.current { color: #222; }

        .page-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
        }
        .page-header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .page-header p { margin: 4px 0 0; font-size: 13px; color: #aaa; }
        .order-count-pill {
          font-size: 13px; color: #888; background: #fff; padding: 6px 14px;
          border-radius: 20px; border: 1px solid #f0f0f0; white-space: nowrap;
        }

        .toolbar { background: #fff; border-radius: 16px; padding: 16px; border: 1px solid #f0f0f0; margin-bottom: 20px; }

        .search-box {
          display: flex; align-items: center; gap: 10px; background: #f8f8f8;
          border-radius: 10px; padding: 10px 14px; margin-bottom: 14px;
        }
        .search-box svg { color: #ccc; font-size: 14px; flex-shrink: 0; }
        .search-box input {
          border: none; background: transparent; outline: none; font-size: 14px;
          font-family: 'Cairo',sans-serif; flex: 1; direction: rtl; min-width: 0;
        }

        .filter-row { display: flex; align-items: center; gap: 8px; }
        .filter-row-label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #888; flex-shrink: 0; }
        .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-chip {
          padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e0e0e0;
          background: #fff; color: #666; font-size: 12px; font-weight: 400;
          cursor: pointer; font-family: 'Cairo',sans-serif; transition: all .15s; white-space: nowrap;
        }
        .filter-chip.active { border-color: #E8821A; background: #fff4ea; color: #E8821A; font-weight: 700; }
        .filter-chip-count { margin-right: 4px; font-size: 11px; color: #aaa; }
        .filter-chip.active .filter-chip-count { color: #E8821A; }

        .error-banner {
          background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px;
          padding: 16px; margin-bottom: 20px; color: #ef4444; font-size: 14px; text-align: center;
        }

        /* ── Order card ── */
        .order-card {
          background: #fff; border-radius: 16px; border: 1px solid #f0f0f0;
          overflow: hidden; transition: box-shadow .2s; margin-bottom: 14px;
        }
        .order-card--expanded { box-shadow: 0 4px 24px rgba(0,0,0,0.08); }

        .order-card-inner { display: flex; gap: 16px; padding: 18px 20px; }

        .order-image {
          width: 100px; height: 100px; border-radius: 14px;
          background: #f8f8f8; border: 1px solid #f0f0f0;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; overflow: hidden;
        }
        .order-image img { width: 100%; height: 100%; object-fit: cover; }
        .order-image-placeholder { color: #ddd; font-size: 26px; }

        .order-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }

        .order-top-line { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
        .order-id { font-size: 15px; font-weight: 700; color: #222; }
        .order-date { font-size: 12px; color: #aaa; }

        .order-meta-row { display: flex; gap: 16px; font-size: 12px; color: #666; flex-wrap: wrap; }
        .order-meta-row strong { color: #222; }
        .order-total strong { color: #E8821A; }

        .order-status-box { border-radius: 12px; padding: 10px 14px; }
        .order-status-top { display: flex; align-items: center; gap: 8px; }
        .order-status-icon { font-size: 13px; display: inline-flex; flex-shrink: 0; }
        .order-status-label { font-size: 13px; font-weight: 700; flex: 1; min-width: 0; }
        .order-status-pct { font-size: 12px; font-weight: 700; opacity: .75; flex-shrink: 0; }
        .order-status-track { display: flex; gap: 4px; height: 5px; margin-top: 8px; }
        .order-status-segment { flex: 1; border-radius: 3px; transition: background .3s; }

        .detail-btn {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 9px 16px; border-radius: 10px; align-self: flex-end;
          border: 1.5px solid #E8821A; background: #fff; color: #E8821A;
          font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Cairo',sans-serif;
          transition: all .2s; white-space: nowrap;
        }
        .order-card--expanded .detail-btn { background: #E8821A; color: #fff; }
        .detail-btn-chevron { font-size: 10px; transition: transform .2s; }
        .detail-btn-chevron.is-open { transform: rotate(-90deg); }

        /* ── expanded body: number chip, address, timeline, invoice — زي نون ── */
        .order-expanded-body {
          border-top: 1px solid #f5f5f5; padding: 16px 20px; background: #fafafa;
          display: flex; flex-direction: column; gap: 12px;
        }

        .order-number-chip {
          display: flex; align-items: center; justify-content: space-between;
          background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; padding: 12px 16px;
        }
        .order-number-chip-label { margin: 0 0 2px; font-size: 11px; color: #aaa; }
        .order-number-chip-value { margin: 0; font-size: 14px; font-weight: 700; color: #222; }
        .order-number-copy-btn {
          display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600;
          padding: 7px 12px; border-radius: 20px; border: 1px solid #e0e0e0; background: #fff;
          color: #888; cursor: pointer; font-family: 'Cairo',sans-serif; transition: all .15s;
        }
        .order-number-copy-btn.is-copied { border-color: #86efac; background: #f0fdf4; color: #16a34a; }

        .order-address-block {
          display: flex; align-items: flex-start; gap: 10px;
          background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; padding: 14px 16px;
        }
        .order-address-icon { color: #E8821A; font-size: 15px; margin-top: 2px; flex-shrink: 0; }
        .order-address-label { margin: 0 0 4px; font-size: 11px; color: #aaa; }
        .order-address-text { margin: 0; font-size: 13px; font-weight: 600; color: #333; line-height: 1.6; }

        /* ── timeline (زي نون: ملخص مطوي + تايم لاين كامل قابل للفتح) ── */
        .order-timeline-wrap { background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; padding: 14px 16px; }
        .timeline-cancelled { display: flex; align-items: center; gap: 8px; color: #ef4444; font-size: 13px; font-weight: 600; }

        .timeline-toggle-btn {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          width: 100%; background: none; border: none; cursor: pointer;
          font-family: 'Cairo',sans-serif; padding: 0;
        }
        .timeline-summary-label { font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
        .timeline-summary-date { font-size: 12px; color: #888; }
        .timeline-toggle-chevron { font-size: 11px; color: #ccc; transition: transform .2s; flex-shrink: 0; }
        .timeline-toggle-chevron.is-open { transform: rotate(-90deg); }

        .timeline-toggle-btn--close {
          margin-top: 12px; padding-top: 12px; border-top: 1px solid #f5f5f5;
          justify-content: center; color: #E8821A; font-size: 12px; font-weight: 600; gap: 6px;
        }

        .timeline-steps { display: flex; flex-direction: column; margin-top: 14px; }
        .timeline-step { display: flex; gap: 12px; }
        .timeline-step-marker { display: flex; flex-direction: column; align-items: center; width: 12px; flex-shrink: 0; }
        .timeline-step-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
        .timeline-step-line { width: 2px; flex: 1; min-height: 26px; }
        .timeline-step-body { padding-bottom: 16px; }
        .timeline-step:last-child .timeline-step-body { padding-bottom: 0; }
        .timeline-step-label { margin: 0; font-size: 13px; font-weight: 700; }
        .timeline-step-date { margin: 2px 0 0; font-size: 11.5px; color: #aaa; }

        /* ── invoice toggle + panel ── */
        .invoice-toggle-btn {
          display: flex; align-items: center; justify-content: space-between; width: 100%;
          background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; padding: 14px 16px;
          font-size: 13px; font-weight: 700; color: #333; cursor: pointer; font-family: 'Cairo',sans-serif;
        }
        .invoice-toggle-chevron { font-size: 11px; color: #ccc; transition: transform .2s; }
        .invoice-toggle-chevron.is-open { transform: rotate(-90deg); }

        .order-details { border-top: none; margin-top: 10px; padding: 14px; background: #fff; border: 1px solid #f0f0f0; border-radius: 12px; }
        .details-heading { margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #444; }

        .items-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .item-row {
          display: flex; align-items: center; gap: 12px; background: #fafafa;
          border-radius: 10px; padding: 10px 14px; border: 1px solid #f0f0f0;
        }
        .item-thumb {
          width: 48px; height: 48px; border-radius: 8px; background: #fff;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; overflow: hidden; border: 1px solid #f0f0f0;
        }
        .item-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .item-info { flex: 1; min-width: 0; }
        .item-name { margin: 0; font-size: 13px; font-weight: 600; }
        .item-sub { margin: 0; font-size: 11px; color: #aaa; }
        .item-price { font-size: 13px; font-weight: 700; color: #222; white-space: nowrap; }

        .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
        .meta-item { background: #fafafa; border-radius: 8px; padding: 10px 12px; border: 1px solid #f0f0f0; min-width: 0; }
        .meta-label { margin: 0 0 2px; font-size: 11px; color: #aaa; }
        .meta-value { margin: 0; font-size: 12px; font-weight: 600; color: #333; overflow-wrap: break-word; }

        .total-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 16px; background: #fafafa; border-radius: 10px; border: 1px solid #f0f0f0;
          font-size: 14px; font-weight: 600; color: #444;
        }
        .total-row-value { font-size: 18px; font-weight: 700; color: #E8821A; }

        .empty-state { background: #fff; border-radius: 16px; padding: 60px 24px; border: 1px solid #f0f0f0; text-align: center; }
        .empty-state svg { font-size: 44px; color: #e0e0e0; margin-bottom: 16px; }
        .empty-state p:first-of-type { font-size: 16px; font-weight: 600; color: #aaa; margin: 0 0 8px; }
        .empty-state p:nth-of-type(2) { font-size: 13px; color: #ccc; margin: 0 0 24px; }
        .empty-cta {
          display: inline-block; padding: 10px 24px; background: #E8821A;
          color: #fff; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;
        }

        .orders-list-wrap { animation: fadeIn .3s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }

        .help-banner {
          margin-top: 28px; background: #fff4ea; border-radius: 16px; padding: 18px 22px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          border: 1px solid #fed7aa; flex-wrap: wrap;
        }
        .help-banner-left { display: flex; align-items: center; gap: 14px; }
        .help-banner-left svg { font-size: 26px; color: #E8821A; flex-shrink: 0; }
        .help-banner-left p:first-child { margin: 0; font-size: 14px; font-weight: 700; }
        .help-banner-left p:last-child { margin: 0; font-size: 12px; color: #888; }
        .help-btn {
          padding: 10px 20px; background: #E8821A; color: #fff; border: none; border-radius: 10px;
          font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Cairo',sans-serif; white-space: nowrap;
        }

        /* ── Mobile ── */
        @media (max-width: 680px) {
          .orders-page { padding-top: 76px; }
          .orders-container { padding: 0 14px 36px; }

          .page-header h1 { font-size: 20px; }

          .toolbar { padding: 14px; }

          .filter-row { flex-wrap: wrap; }
          .filter-chips { overflow-x: auto; flex-wrap: nowrap; width: 100%; padding-bottom: 2px; }
          .filter-chips::-webkit-scrollbar { display: none; }
          .filter-chip { flex-shrink: 0; }

          .order-card-inner { flex-direction: column; padding: 0; gap: 0; }

          .order-image { width: 100%; height: 180px; border-radius: 0; }
          .order-image-placeholder { font-size: 34px; }

          .order-content { padding: 14px; gap: 10px; }

          .order-top-line { gap: 6px; }
          .order-id { font-size: 14px; }
          .order-date { font-size: 11.5px; }

          .order-meta-row { font-size: 11.5px; gap: 14px; }

          .detail-btn { align-self: stretch; width: 100%; padding: 10px 14px; }

          .order-expanded-body { padding: 14px; gap: 10px; }
          .order-number-chip, .order-address-block, .order-timeline-wrap, .invoice-toggle-btn { padding: 12px 14px; }

          .meta-grid { grid-template-columns: 1fr; }

          .help-banner { flex-direction: column; align-items: stretch; text-align: center; }
          .help-banner-left { flex-direction: column; }
          .help-btn { width: 100%; }
        }
      `}</style>

      <div className="orders-container">

        <div className="breadcrumb">
          <Link to="/">الرئيسية</Link>
          <span>›</span>
          <Link to="/profile">حسابي</Link>
          <span>›</span>
          <span className="current">طلباتي</span>
        </div>

        <div className="page-header">
          <div>
            <h1>طلباتي</h1>
            <p>تتبع جميع طلباتك وحالة الشحن الخاصة بها</p>
          </div>
          <span className="order-count-pill">{orders.length} طلب</span>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <FaSearch />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث برقم الطلب..."
            />
          </div>

          <div className="filter-row">
            <span className="filter-row-label"><FaFilter style={{ fontSize: 11 }} /> تصفية:</span>
            <div className="filter-chips">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`filter-chip ${activeFilter === f.key ? "active" : ""}`}
                >
                  {f.label}
                  <span className="filter-chip-count">
                    ({f.key === "all" ? orders.length : orders.filter(o => o.status === f.key).length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {filtered.length === 0 ? (
          <div className="empty-state">
            <FaBoxOpen />
            <p>لا توجد طلبات</p>
            <p>{search ? "لم يتم العثور على طلب بهذا الرقم" : "لم تقم بأي طلبات بعد"}</p>
            <Link to="/" className="empty-cta">تسوق الآن</Link>
          </div>
        ) : (
          <div className="orders-list-wrap">
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

        <div className="help-banner">
          <div className="help-banner-left">
            <FaHeadset />
            <div>
              <p>تحتاج مساعدة في طلبك؟</p>
              <p>فريق الدعم متاح 24/7 لمساعدتك</p>
            </div>
          </div>
          <button className="help-btn" onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}>
            تواصل معنا 💬
          </button>
        </div>
      </div>
    </div>
  )
}