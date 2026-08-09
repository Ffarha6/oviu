import {
  FaBox, FaTruck, FaCheckCircle, FaClock, FaTimesCircle, FaSpinner
} from "react-icons/fa"

// ── API ─────────────────────────────────────────────────────────
export const BASE_URL = "https://oviu-production.up.railway.app"

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

// المفاتيح بس (مش نص جاهز) — الترجمة بتتحصل وقت الاستخدام عن طريق getGovernorates(t)
export const GOVERNORATE_KEYS = [
  "cairo", "giza", "alexandria", "dakahlia", "redSea",
  "beheira", "fayoum", "gharbia", "ismailia", "monufia",
  "minya", "qalyubia", "newValley", "suez", "aswan",
  "asyut", "beniSuef", "portSaid", "damietta", "sharqia",
  "southSinai", "kafrElSheikh", "matrouh", "luxor", "qena",
  "northSinai", "sohag",
]

// استخدميها في أي Component عشان تجيبي القايمة مترجمة: getGovernorates(t)
export function getGovernorates(t) {
  return GOVERNORATE_KEYS.map(key => ({
    value: key,
    label: t(`governorates.${key}`),
  }))
}

// ── Areas (المناطق/المراكز التابعة لكل محافظة) ──────────────────
// بيانات عربي ثابتة مباشرة (من غير ملف ترجمة) لأن الموقع عربي بالكامل.
// بتتستخدم في قايمة منسدلة تانية بتتفعّل بعد اختيار المحافظة.
export const AREAS_BY_GOVERNORATE = {
  cairo: [
    "حلوان", "المعادي", "الخليفة", "قصر النيل", "بولاق أبو العلا", "الأزبكية",
    "الدرب الأحمر", "الجمالية", "باب الشعرية", "شبرا", "الزمالك", "منشأة ناصر",
    "القاهرة الجديدة", "الشروق", "مدينة بدر", "العاشر من رمضان", "التجمع الخامس",
    "مدينة نصر", "المقطم", "عين شمس", "المرج", "حدائق القبة", "الوايلي",
    "الساحل", "الزيتون", "مصر الجديدة", "السيدة زينب", "عابدين", "الموسكي",
    "الظاهر", "الأميرية", "الزاوية الحمراء", "الشرابية", "روض الفرج",
  ],
  giza: [
    "الدقي", "العجوزة", "الهرم", "فيصل", "بولاق الدكرور", "إمبابة", "الوراق",
    "أوسيم", "البدرشين", "الصف", "أطفيح", "منشأة القناطر", "كرداسة",
    "الحوامدية", "6 أكتوبر", "الشيخ زايد", "حدائق الأهرام", "العمرانية",
  ],
  alexandria: [
    "المنتزه", "شرق", "وسط", "غرب", "الجمرك", "العطارين", "اللبان", "الرمل",
    "سيدي جابر", "سموحة", "ميامي", "سيدي بشر", "العصافرة", "محرم بك",
    "كرموز", "الدخيلة", "العامرية", "برج العرب", "أبو قير", "المندرة",
  ],
  dakahlia: [
    "المنصورة", "طلخا", "ميت غمر", "أجا", "منية النصر", "السنبلاوين",
    "الجمالية", "شربين", "المنزلة", "تمي الأمديد", "دكرنس", "بلقاس",
    "ميت سلسيل", "نبروه",
  ],
  redSea: [
    "الغردقة", "سفاجا", "القصير", "مرسى علم", "رأس غارب", "الشلاتين", "حلايب",
  ],
  beheira: [
    "دمنهور", "كفر الدوار", "رشيد", "إدكو", "أبو المطامير", "أبو حمص",
    "الدلنجات", "المحمودية", "إيتاي البارود", "حوش عيسى", "شبراخيت",
    "كوم حمادة", "بدر", "النوبارية الجديدة",
  ],
  fayoum: [
    "مدينة الفيوم", "طامية", "سنورس", "إطسا", "يوسف الصديق", "إبشواي", "طوسون",
  ],
  gharbia: [
    "طنطا", "المحلة الكبرى", "كفر الزيات", "زفتى", "السنطة", "سمنود", "بسيون", "قطور",
  ],
  ismailia: [
    "مدينة الإسماعيلية", "فايد", "القنطرة شرق", "القنطرة غرب", "التل الكبير", "القصاصين",
  ],
  monufia: [
    "شبين الكوم", "منوف", "أشمون", "الباجور", "بركة السبع", "سرس الليان",
    "تلا", "الشهداء", "قويسنا",
  ],
  minya: [
    "مدينة المنيا", "ملوي", "سمالوط", "بني مزار", "مغاغة", "مطاي",
    "أبو قرقاص", "دير مواس", "العدوة",
  ],
  qalyubia: [
    "بنها", "شبرا الخيمة", "القناطر الخيرية", "قليوب", "طوخ", "كفر شكر",
    "الخانكة", "العبور", "شبين القناطر",
  ],
  newValley: [
    "الخارجة", "الداخلة", "الفرافرة", "باريس", "بلاط",
  ],
  suez: [
    "مدينة السويس", "عتاقة", "الجناين", "فيصل",
  ],
  aswan: [
    "مدينة أسوان", "إدفو", "كوم أمبو", "دراو", "نصر النوبة", "البصيلية",
    "الرديسية", "السباعية",
  ],
  asyut: [
    "مدينة أسيوط", "ديروط", "منفلوط", "أبنوب", "أبوتيج", "ساحل سليم",
    "صدفا", "القوصية", "البداري",
  ],
  beniSuef: [
    "مدينة بني سويف", "الواسطى", "ناصر", "إهناسيا", "ببا", "سمسطا", "الفشن",
  ],
  portSaid: [
    "المناخ", "الشرق", "الضواحي", "الزهور", "بورفؤاد", "العرب",
  ],
  damietta: [
    "مدينة دمياط", "رأس البر", "فارسكور", "الزرقا", "كفر سعد",
    "ميت أبو غالب", "كفر البطيخ", "عزبة البرج",
  ],
  sharqia: [
    "الزقازيق", "بلبيس", "منيا القمح", "أبوحماد", "ههيا", "أبو كبير",
    "فاقوس", "الحسينية", "كفر صقر", "ديرب نجم", "مشتول السوق",
    "أولاد صقر", "صان الحجر", "القرين", "القنايات",
  ],
  southSinai: [
    "شرم الشيخ", "دهب", "نويبع", "طابا", "سانت كاترين", "رأس سدر",
    "أبو رديس", "الطور",
  ],
  kafrElSheikh: [
    "مدينة كفر الشيخ", "دسوق", "فوه", "مطوبس", "بلطيم", "الحامول",
    "سيدي سالم", "قلين", "بيلا", "الرياض",
  ],
  matrouh: [
    "مرسى مطروح", "سيدي براني", "السلوم", "سيوة", "الحمام", "العلمين", "النجيلة",
  ],
  luxor: [
    "مدينة الأقصر", "الزينية", "البياضية", "القرنة", "الطود", "إسنا", "أرمنت",
  ],
  qena: [
    "مدينة قنا", "نجع حمادي", "دشنا", "فرشوط", "أبو تشت", "قوص", "نقادة", "الوقف",
  ],
  northSinai: [
    "العريش", "الشيخ زويد", "رفح", "بئر العبد", "الحسنة", "نخل",
  ],
  sohag: [
    "مدينة سوهاج", "أخميم", "جرجا", "طهطا", "طما", "المراغة", "البلينا",
    "ساقلته", "دار السلام", "جهينة",
  ],
}

// بترجع مناطق محافظة معينة (array فاضية لو المحافظة لسه مش مختارة)
export function getAreasByGovernorate(governorateKey) {
  return AREAS_BY_GOVERNORATE[governorateKey] || []
}

export const GENDER_KEYS = ["male", "female"]

export function getGenderOptions(t) {
  return GENDER_KEYS.map(key => ({
    value: key,
    label: t(`gender.${key}`),
  }))
}

export function genderLabel(value, t) {
  if (!value) return "—"
  return t(`gender.${value}`, { defaultValue: "—" })
}

// ── Orders ──────────────────────────────────────────────────────
// الألوان والأيقونات ثابتة (مش نص، فمش محتاجة ترجمة)
// النص بس بييجي من t() وقت الاستخدام
const STATUS_VISUALS = {
  pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: <FaClock />,       border: "rgba(245,158,11,0.35)" },
  confirmed: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: <FaCheckCircle />, border: "rgba(59,130,246,0.35)" },
  preparing: { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", icon: <FaSpinner />,     border: "rgba(139,92,246,0.35)" },
  shipped:   { color: "#E8821A", bg: "rgba(232,130,26,0.12)", icon: <FaTruck />,       border: "rgba(232,130,26,0.35)" },
  delivered: { color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: <FaCheckCircle />, border: "rgba(16,185,129,0.35)" },
  cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: <FaTimesCircle />, border: "rgba(239,68,68,0.35)" },
}

// استخدميها بدل STATUS_CONFIG القديمة: getStatusConfig(t)[status]
export function getStatusConfig(t) {
  const config = {}
  for (const key in STATUS_VISUALS) {
    config[key] = {
      ...STATUS_VISUALS[key],
      label: t(`orderStatusDetailed.${key}`),
    }
  }
  return config
}

export function getDefaultStatusConfig(t) {
  return {
    label: "—", color: "#888", bg: "rgba(136,136,136,0.12)", icon: <FaBox />, border: "rgba(136,136,136,0.35)",
  }
}

// استخدميها بدل ORDER_FILTERS القديمة: getOrderFilters(t)
export function getOrderFilters(t) {
  return [
    { key: "all",       label: t("orderFilters.all") },
    { key: "pending",   label: t("orderFilters.pending") },
    { key: "shipped",   label: t("orderFilters.shipped") },
    { key: "delivered", label: t("orderFilters.delivered") },
    { key: "cancelled", label: t("orderFilters.cancelled") },
  ]
}






// ==========================================
// Backward compatibility
// ==========================================

export const EGYPT_GOVERNORATES = GOVERNORATE_KEYS.map(key => ({
  value: key,
  label: key,
}))

export const GENDER_OPTIONS = GENDER_KEYS.map(key => ({
  value: key,
  label: key,
}))

export const STATUS_CONFIG = Object.fromEntries(
  Object.entries(STATUS_VISUALS).map(([key, value]) => [
    key,
    {
      ...value,
      label: key,
    },
  ])
)

export const DEFAULT_STATUS_CONFIG = {
  label: "—",
  color: "#888",
  bg: "rgba(136,136,136,0.12)",
  icon: <FaBox />,
  border: "rgba(136,136,136,0.35)",
}