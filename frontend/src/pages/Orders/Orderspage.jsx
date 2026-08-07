import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  FaBox, FaChevronLeft, FaFilter, FaSearch,
  FaTruck, FaCheckCircle, FaClock, FaTimesCircle,
  FaSpinner, FaBoxOpen, FaHeadset
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

const FILTERS = [
  { key: "all",       label: "الكل" },
  { key: "pending",   label: "قيد المعالجة" },
  { key: "shipped",   label: "تم الشحن" },
  { key: "delivered", label: "تم التوصيل" },
  { key: "cancelled", label: "ملغاة" },
]

// ── Status Badge ─────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#888", bg: "#f5f5f5", icon: <FaBox /> }
  return (
    <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="status-badge-icon">{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}

// ── Slim segmented progress bar (replaces the old circle-strip) ──
function OrderProgress({ status }) {
  if (status === "cancelled") return null
  const cfg = STATUS_CONFIG[status]
  const currentIdx = STEPS.indexOf(status)
  const pct = Math.round(((currentIdx + 1) / STEPS.length) * 100)

  return (
    <div className="progress-wrap">
      <div className="progress-track">
        {STEPS.map((step, i) => (
          <span
            key={step}
            className="progress-segment"
            style={{ background: i <= currentIdx ? cfg.color : "#eee" }}
          />
        ))}
      </div>
      <div className="progress-caption">
        <span className="progress-caption-icon" style={{ color: cfg.color }}>{cfg.icon}</span>
        <span>{cfg.label}</span>
        <span className="progress-caption-pct">{pct}%</span>
      </div>
    </div>
  )
}

// ── Order Card ────────────────────────────────────────────────────
function OrderCard({ order, onExpand, expanded }) {
  const firstItem = order.items?.[0]
  const itemCount = order.items?.length || 0

  return (
    <div className={`order-card ${expanded ? "order-card--expanded" : ""}`}>
      <div className="order-card-main">

        <div className="order-thumb">
          {firstItem?.product_image
            ? <img src={firstItem.product_image} alt="" />
            : <FaBoxOpen className="order-thumb-placeholder" />
          }
        </div>

        <div className="order-info">
          <div className="order-title-row">
            <span className="order-id">طلب رقم #{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <div className="order-date">
            {new Date(order.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div className="order-meta-row">
            <span>عدد المنتجات: <strong>{itemCount} {itemCount === 1 ? "منتج" : "منتجات"}</strong></span>
            <span className="order-total">الإجمالي: <strong>{order.total_price} ج.م</strong></span>
          </div>

          <OrderProgress status={order.status} />
        </div>

        <div className="order-actions">
          <button className="detail-btn" onClick={() => onExpand(order.id)}>
            عرض التفاصيل
            <FaChevronLeft className={`detail-btn-chevron ${expanded ? "is-open" : ""}`} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="order-details">
          <p className="details-heading">المنتجات:</p>
          <div className="items-list">
            {order.items?.map((item, i) => (
              <div key={i} className="item-row">
                <div className="item-thumb"><FaBox /></div>
                <div className="item-info">
                  <p className="item-name">{item.product_name}</p>
                  <p className="item-sub">
                    الكمية: {item.quantity}
                    {item.color_name && ` · اللون: ${item.color_name}`}
                  </p>
                </div>
                <span className="item-price">{item.price_at_time} ج.م</span>
              </div>
            ))}
          </div>

          <div className="meta-grid">
            {[
              { label: "طريقة الدفع", value: order.payment_method_display },
              { label: "العنوان", value: order.address },
              { label: "رقم التتبع", value: order.tracking_number || "—" },
              { label: "تاريخ الشحن", value: order.shipped_date ? new Date(order.shipped_date).toLocaleDateString("ar-EG") : "—" },
              { label: "تاريخ التسليم", value: order.delivered_date ? new Date(order.delivered_date).toLocaleDateString("ar-EG") : "—" },
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

        .filter-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .filter-row-label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #888; margin-left: 4px; }
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
          overflow: hidden; transition: box-shadow .2s; margin-bottom: 12px;
        }
        .order-card--expanded { box-shadow: 0 4px 24px rgba(0,0,0,0.08); }

        .order-card-main { padding: 18px 20px; display: flex; align-items: flex-start; gap: 16px; }

        .order-thumb {
  width: 90px;
  height: 90px;
  border-radius: 14px;
  background: #f8f8f8;
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
        .order-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .order-thumb-placeholder { color: #ddd; font-size: 22px; }

        .order-info { flex: 1; min-width: 0; }
        .order-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; flex-wrap: wrap; }
        .order-id { font-size: 15px; font-weight: 700; color: #222; }
        .order-date { font-size: 12px; color: #aaa; margin-bottom: 8px; }
        .order-meta-row { display: flex; gap: 16px; font-size: 12px; color: #666; flex-wrap: wrap; margin-bottom: 4px; }
        .order-meta-row strong { color: #222; }
        .order-total strong { color: #E8821A; }

        .status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600;
        }
        .status-badge-icon { font-size: 10px; display: inline-flex; }

        /* ── new segmented progress bar ── */
        .progress-wrap { margin-top: 12px; max-width: 320px; }
        .progress-track { display: flex; gap: 4px; height: 5px; margin-bottom: 6px; }
        .progress-segment { flex: 1; border-radius: 3px; transition: background .3s; }
        .progress-caption { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #888; }
        .progress-caption-icon { font-size: 11px; display: inline-flex; }
        .progress-caption-pct { margin-right: auto; color: #bbb; }

        .order-actions { flex-shrink: 0; }
        .detail-btn {
          display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px;
          border: 1.5px solid #E8821A; background: #fff; color: #E8821A;
          font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Cairo',sans-serif;
          transition: all .2s; white-space: nowrap;
        }
        .order-card--expanded .detail-btn { background: #E8821A; color: #fff; }
        .detail-btn-chevron { font-size: 10px; transition: transform .2s; }
        .detail-btn-chevron.is-open { transform: rotate(-90deg); }

        /* ── expanded details ── */
        .order-details { border-top: 1px solid #f5f5f5; padding: 16px 20px; background: #fafafa; }
        .details-heading { margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #444; }

        .items-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .item-row {
          display: flex; align-items: center; gap: 12px; background: #fff;
          border-radius: 10px; padding: 10px 14px; border: 1px solid #f0f0f0;
        }
        .item-thumb{
    width:48px;
    height:48px;
    border-radius:8px;
    background:#f5f5f5;
    display:flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
    overflow:hidden;
}
        .item-info { flex: 1; min-width: 0; }
        .item-name { margin: 0; font-size: 13px; font-weight: 600; }
        .item-sub { margin: 0; font-size: 11px; color: #aaa; }
        .item-price { font-size: 13px; font-weight: 700; color: #222; white-space: nowrap; }

        .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
        .meta-item { background: #fff; border-radius: 8px; padding: 10px 12px; border: 1px solid #f0f0f0; min-width: 0; }
        .meta-label { margin: 0 0 2px; font-size: 11px; color: #aaa; }
        .meta-value { margin: 0; font-size: 12px; font-weight: 600; color: #333; overflow-wrap: break-word; }

        .total-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 16px; background: #fff; border-radius: 10px; border: 1px solid #f0f0f0;
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

        /* ── Mobile ──
           order-card-main is a flex row with 3 children: order-thumb, order-info, order-actions.
           order-info itself just wraps order-title-row / order-date / order-meta-row / progress-wrap
           stacked normally. On mobile we "dissolve" order-info with display:contents so all of its
           children become direct flex items of order-card-main, then use \`order\` + flex-basis:100%
           to lay everything out as clean full-width rows: [thumb + title] / date / meta / progress / button.
        */
        @media (max-width: 680px) {
          .orders-page { padding-top: 76px; }
          .orders-container { padding: 0 14px 36px; }

          .page-header h1 { font-size: 20px; }

          .order-card-main {
            flex-wrap: wrap;
            align-items: flex-start;
            padding: 14px;
            gap: 8px 10px;
          }

          .order-thumb { width: 56px; height: 56px; order: 1; }

          .order-info { display: contents; }

          .order-title-row {
            order: 2;
            flex: 1;
            min-width: 0;
            margin-bottom: 0;
            gap: 8px;
          }
          .order-id { font-size: 14px; }

          .order-date {
            order: 3;
            flex-basis: 100%;
            margin-bottom: 2px;
          }

          .order-meta-row {
            order: 4;
            flex-basis: 100%;
            gap: 10px;
            font-size: 11.5px;
            margin-bottom: 0;
          }

          .progress-wrap { order: 5; flex-basis: 100%; max-width: none; margin-top: 2px; }

          .order-actions { order: 6; flex-basis: 100%; }
          .detail-btn { width: 100%; justify-content: center; margin-top: 4px; }

          .meta-grid { grid-template-columns: repeat(2, 1fr); }

          .help-banner { flex-direction: column; align-items: stretch; text-align: center; }
          .help-banner-left { flex-direction: column; }
          .help-btn { width: 100%; }
        }

        @media (max-width: 380px) {
          .meta-grid { grid-template-columns: 1fr; }
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