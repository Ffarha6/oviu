import {
  FaBox, FaTruck, FaCheckCircle, FaClock, FaTimesCircle, FaSpinner
} from "react-icons/fa"

// ── API ─────────────────────────────────────────────────────────
export const BASE_URL = "http://localhost:8000"

export function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem("access_token")
  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
      ...(options.headers || {}),
    },
  })
}

// ── Dropdown options ───────────────────────────────────────────
export const PHONE_CODES = ["+20", "+966", "+971", "+965", "+974", "+973", "+968"]

export const EGYPT_GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر",
  "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية",
  "المنيا", "القليوبية", "الوادي الجديد", "السويس", "أسوان",
  "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية",
  "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر", "قنا",
  "شمال سيناء", "سوهاج",
]

export const GENDER_OPTIONS = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
]

export function genderLabel(value) {
  return GENDER_OPTIONS.find(g => g.value === value)?.label || "—"
}

// ── Orders ──────────────────────────────────────────────────────
// خلفيات شفافة (rgba) عشان تشتغل صح في اللايت والدارك مود مع بعض
export const STATUS_CONFIG = {
  pending:   { label: "قيد المعالجة", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: <FaClock />,       border: "rgba(245,158,11,0.35)" },
  confirmed: { label: "تم التأكيد",   color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: <FaCheckCircle />, border: "rgba(59,130,246,0.35)" },
  preparing: { label: "جاري التجهيز", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", icon: <FaSpinner />,     border: "rgba(139,92,246,0.35)" },
  shipped:   { label: "جاري التوصيل", color: "#E8821A", bg: "rgba(232,130,26,0.12)", icon: <FaTruck />,       border: "rgba(232,130,26,0.35)" },
  delivered: { label: "تم التوصيل",   color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: <FaCheckCircle />, border: "rgba(16,185,129,0.35)" },
  cancelled: { label: "ملغي",         color: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: <FaTimesCircle />, border: "rgba(239,68,68,0.35)" },
}

export const DEFAULT_STATUS_CONFIG = {
  label: "—", color: "#888", bg: "rgba(136,136,136,0.12)", icon: <FaBox />, border: "rgba(136,136,136,0.35)",
}

export const ORDER_FILTERS = [
  { key: "all",       label: "الكل" },
  { key: "pending",   label: "قيد المعالجة" },
  { key: "shipped",   label: "تم الشحن" },
  { key: "delivered", label: "تم التوصيل" },
  { key: "cancelled", label: "ملغاة" },
]