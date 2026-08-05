import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import {
  FaUser, FaHeart, FaMapMarkerAlt, FaCreditCard,
  FaTag, FaCog, FaSignOutAlt, FaCamera, FaBox, FaHeadset, FaSignOutAlt as FaSignOut,
  FaChevronLeft
} from "react-icons/fa"
import { useAuth } from "../../context/AuthContext"

import ProfileOverview from "./ProfileOverview"
import OrdersTab from "./OrdersTab"
import AddressesTab from "./AddressesTab"
import AddressModal from "./AddressModal"
import EditProfileModal from "./EditProfileModal"
import SettingsTab from "./SettingsTab"
import { authFetch } from "./ProfileConstants"

// ── Avatar ───────────────────────────────────────────────────────
// مستخدم هنا بس (جوه السايدبار)
function Avatar({ name, size = 80 }) {
  const initials = name
    ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "U"
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg,#E8821A,#f0a060)",
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  )
}

// ── Sidebar item ─────────────────────────────────────────────────
// مستخدم هنا بس (جوه السايدبار)
function SideItem({ icon, label, active, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 sm:px-4 py-2.5 sm:py-[11px] rounded-[10px] border-none cursor-pointer text-right transition-all duration-200 text-[15px] sm:text-base
        ${danger
          ? "text-[#e53935] bg-transparent"
          : active
            ? "bg-[#fff4ea] dark:bg-[#3a2410] text-[#E8821A] font-semibold"
            : "bg-transparent text-[#555] dark:text-gray-400 font-normal"}
      `}
      style={{ fontFamily: "'Cairo',sans-serif" }}
    >
      <span className={danger ? "text-[#e53935]" : active ? "text-[#E8821A]" : "text-[#aaa] dark:text-gray-500"}>
        {icon}
      </span>
      {label}
    </button>
  )
}

const SIDE_ITEMS = [
  { key: "profile",       icon: <FaUser />,        label: "الملف الشخصي" },
  { key: "orders",        icon: <FaBox />,         label: "طلباتي" },
  { key: "wishlist",      icon: <FaHeart />,       label: "المفضلة" },
  { key: "addresses",     icon: <FaMapMarkerAlt />,label: "العناوين" },
  { key: "payment",       icon: <FaCreditCard />,  label: "طرق الدفع" },
  { key: "prescription",  icon: <FaTag />,         label: "المقاسات المفضلة" },
  { key: "settings",      icon: <FaCog />,         label: "الإعدادات" },
]

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(location.state?.tab || "profile")
  const [editOpen, setEditOpen] = useState(false)
  const [addressModal, setAddressModal] = useState(null)

  const [orders, setOrders] = useState([])
  const [ordersError, setOrdersError] = useState(null)
  // ✅ جديد: قائمة عناوين حقيقية (مش حقل واحد بس على اليوزر) - المستخدم ممكن
  // يكون عنده أكتر من عنوان، وأي عنوان جديد بيتضاف من غير ما يمسح القديم
  const [addresses, setAddresses] = useState([])

  const fetchAddresses = () => {
    authFetch("/api/auth/addresses/")
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setAddresses(Array.isArray(data) ? data : []))
      .catch(() => setAddresses([]))
  }

  useEffect(() => {
    authFetch("/api/auth/user/")
      .then(res => {
        if (!res.ok) throw new Error("unauthorized")
        return res.json()
      })
      .then(data => setUser(data))
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false))

    authFetch("/api/orders/my-orders/")
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => { setOrders([]); setOrdersError("حدث خطأ في جلب الطلبات") })

    fetchAddresses()
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  if (loading) return (
    <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
      <div className="w-9 h-9 rounded-full border-[3px] border-[#f0f0f0] dark:border-gray-700 border-t-[#E8821A]" style={{ animation: "spin .8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.username

  // ✅ العنوان اللي بيتفتح المودال عليه للتعديل - جاي من العنوان المحدد نفسه
  // اللي دُست عليه (مش من حقول اليوزر العامة زي الأول)
  const buildModalDataFromAddress = (addr) => {
    const rawPhone = addr?.phone || ""
    const phoneCodeMatch = rawPhone.match(/^\+\d{1,4}/)
    return {
      fullName: addr?.full_name || "",
      phoneCode: phoneCodeMatch ? phoneCodeMatch[0] : "+20",
      phone: rawPhone.replace(/^\+\d{1,4}/, ""),
      governorate: addr?.governorate || "",
      address: addr?.address || "",
    }
  }

  const openAddressModalFromCard = (addr) => setAddressModal({ isNew: false, addressId: addr.id, data: buildModalDataFromAddress(addr) })
  const openAddressModalToAdd = () => setAddressModal({ isNew: true, addressId: null, data: null })

  const handleDeleteAddress = async (addr) => {
    if (!window.confirm(`متأكدة إنك عايزة تمسحي عنوان "${addr.full_name}"؟`)) return
    try {
      const res = await authFetch(`/api/auth/addresses/${addr.id}/`, { method: "DELETE" })
      if (res.ok) fetchAddresses()
    } catch {
      // تجاهل بصمت - العنوان هيفضل ظاهر لو الحذف فشل فعليًا
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F7F2EE] dark:bg-black text-[#222] dark:text-gray-100"
      style={{ fontFamily: "'Cairo','Segoe UI',sans-serif", paddingTop: 12 }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
      `}</style>

      {/* ✅ FIX: كان الـ grid ثابت 300px + 1fr مهما كان حجم الشاشة، فكان بيكسر
          خالص على الموبايل والتابلت. دلوقتي عمود واحد (السايدبار فوق، المحتوى
          تحت) لحد lg، وبعدها يرجع لشكل الديسكتوف الأصلي (سايدبار جنب المحتوى) */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 sm:gap-5 lg:gap-6 items-start px-3 sm:px-6 lg:px-10 pt-2 pb-8 sm:pb-10 lg:pb-12">

        {/* ── SIDEBAR ── */}
        {/* ✅ FIX: على الموبايل، الشاشة الجديدة (على نمط noon) في المحتوى
            الرئيسي بقت هي التنقل الوحيد — مفيش داعي لسايدبار تاني فوقها
            (كان بيطلع كارت أفاتار مكرر + شريط أفقي فيه نفس التابات). السايدبار
            القديم دلوقتي يبان بس من sm فما فوق (ديسكتوب/تابلت) زي الأول تمامًا. */}
        <div className="hidden sm:flex sm:flex-col gap-3 sm:gap-4">

          <div className="bg-white dark:bg-black rounded-2xl p-4 sm:p-6 border border-[#f0f0f0] dark:border-gray-700 text-center">
            <div className="relative inline-block mb-3">
              <Avatar name={fullName} size={64} />
              <button className="absolute bottom-0 left-0 w-[22px] h-[22px] sm:w-[26px] sm:h-[26px] rounded-full bg-[#E8821A] border-2 border-white dark:border-gray-800 flex items-center justify-center cursor-pointer">
                <FaCamera className="text-white text-[9px] sm:text-[10px]" />
              </button>
            </div>
            <p className="mb-0.5 mt-0 text-base sm:text-lg font-bold text-[#222] dark:text-gray-100">{fullName}</p>
            <p className="m-0 text-xs sm:text-sm text-[#aaa] dark:text-gray-500 truncate">{user?.email}</p>
          </div>

          {/* ✅ قائمة السايدبار على الموبايل بتبقى قابلة للسحب أفقيًا صف واحد
              بدل ما تاخد مساحة رأسية كبيرة قبل المحتوى الأساسي، وترجع عمودي
              عادي من sm فما فوق */}
          <div className="bg-white dark:bg-black rounded-2xl p-2 sm:p-3 border border-[#f0f0f0] dark:border-gray-700 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible scrollbar-hide">
            {SIDE_ITEMS.map(item => (
              <div key={item.key} className="shrink-0 sm:shrink sm:w-full">
                <SideItem
                  icon={item.icon}
                  label={item.label}
                  active={activeTab === item.key}
                  onClick={() => {
                    if (item.key === "wishlist") navigate("/wishlist")
                    else setActiveTab(item.key)
                  }}
                />
              </div>
            ))}
            <div className="hidden sm:block h-px bg-[#f5f5f5] dark:bg-gray-700 my-2" />
            <div className="shrink-0 sm:shrink sm:w-full">
              <SideItem icon={<FaSignOut />} label="تسجيل الخروج" onClick={handleLogout} danger />
            </div>
          </div>

          <div className="hidden sm:block bg-white dark:bg-black rounded-2xl p-5 border border-[#f0f0f0] dark:border-gray-700 text-center">
            <FaHeadset className="text-[28px] text-[#E8821A] mb-2 mx-auto" />
            <p className="mb-1 mt-0 text-[15px] font-bold text-[#222] dark:text-gray-100">تحتاج مساعدة؟</p>
            <p className="mb-3 mt-0 text-sm text-[#aaa] dark:text-gray-500">فريق الدعم جاهز لمساعدتك</p>
            <button
              className="w-full py-2.5 border-[1.5px] border-[#E8821A] rounded-[10px] bg-white dark:bg-transparent text-[#E8821A] text-[15px] font-semibold cursor-pointer"
              style={{ fontFamily: "'Cairo',sans-serif" }}
            >
              تواصل معنا 💬
            </button>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 min-w-0" style={{ animation: "fadeIn .3s ease" }}>

          {/* ✅ على الموبايل بس: زرار رجوع بسيط لما نبقى في تاب تاني غير
              الملف الشخصي، بما إن شريط التنقل القديم مبقاش ظاهر هناك */}
          {activeTab !== "profile" && (
  <button
    onClick={() => setActiveTab("profile")}
    className="sm:hidden w-9 h-9 rounded-xl bg-white dark:bg-black border border-[#f0f0f0] dark:border-gray-700 flex items-center justify-center mb-2"
  >
    <FaChevronLeft style={{ transform: "rotate(180deg)" }} />
  </button>
)}
          {activeTab === "profile" && (
            <>
              {/* ══════════════════════════════════════════════════════════
                  MOBILE-ONLY (sm وتحت): شاشة رئيسية على نمط تطبيق noon —
                  هيدر + شريط اكتمال الملف + كروت وصول سريع + قايمة "حسابي"
                  + قايمة إعدادات + زرار تسجيل خروج. الديسكتوب/التابلت (sm
                  فما فوق) بيفضل بالظبط زي ما هو، من غير أي تغيير خالص —
                  شايف ده في الـ hidden sm:block تحت.
              ══════════════════════════════════════════════════════════ */}
              <div className="sm:hidden flex flex-col gap-3">

                {/* Header */}
                <div className="bg-white dark:bg-black rounded-2xl p-4 border border-[#f0f0f0] dark:border-gray-700">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={fullName} size={48} />
                      <div className="min-w-0">
                        <p className="m-0 font-bold text-[#222] dark:text-gray-100 text-[15px] truncate">أهلاً {fullName}</p>
                        <p className="m-0 text-xs text-[#aaa] dark:text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditOpen(true)}
                      className="shrink-0 px-3.5 py-1.5 rounded-full bg-[#f5f5f5] dark:bg-gray-700 text-[#444] dark:text-gray-200 text-[13px] font-semibold"
                      style={{ fontFamily: "'Cairo',sans-serif" }}
                    >
                      تعديل
                    </button>
                  </div>
                </div>

                {/* كروت الوصول السريع — ارتفاع موحّد للكروت الأربعة عشان تبقى قد بعض بالظبط */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "orders",     icon: <FaBox />,         title: "طلباتي",   sub: `${orders.length} طلب` },
                    { key: "wishlist",   icon: <FaHeart />,       title: "المفضلة",  sub: "عرض القائمة" },
                    { key: "addresses", icon: <FaMapMarkerAlt />, title: "العناوين", sub: "إدارة العناوين" },
                    { key: "settings",   icon: <FaCog />,         title: "الإعدادات", sub: "الحساب والأمان" },
                  ].map(card => (
                    <button
                      key={card.key}
                      onClick={() => card.key === "wishlist" ? navigate("/wishlist") : setActiveTab(card.key)}
                      className="h-[104px] bg-white dark:bg-black rounded-2xl p-4 border border-[#f0f0f0] dark:border-gray-700 text-right flex flex-col justify-between"
                      style={{ fontFamily: "'Cairo',sans-serif" }}
                    >
                      <span className="text-[#E8821A] text-lg">{card.icon}</span>
                      <span className="flex flex-col gap-0.5">
                        <span className="font-bold text-[#222] dark:text-gray-100 text-[15px]">{card.title}</span>
                        <span className="text-xs text-[#999] dark:text-gray-500">{card.sub}</span>
                      </span>
                    </button>
                  ))}
                </div>

                {/* قايمة "حسابي" */}
                <div className="bg-white dark:bg-black rounded-2xl border border-[#f0f0f0] dark:border-gray-700 overflow-hidden">
                  <p className="px-4 pt-4 pb-2 m-0 text-[13px] font-bold text-[#999] dark:text-gray-500">حسابي</p>
                  {[
                    { key: "addresses",    icon: <FaMapMarkerAlt />, label: "العناوين" },
                    { key: "payment",      icon: <FaCreditCard />,   label: "طرق الدفع" },
                    { key: "prescription", icon: <FaTag />,          label: "المقاسات المفضلة" },
                  ].map((item, i, arr) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-[#f5f5f5] dark:border-gray-700" : ""}`}
                      style={{ fontFamily: "'Cairo',sans-serif" }}
                    >
                      <span className="flex items-center gap-3 text-[15px] text-[#333] dark:text-gray-200">
                        <span className="text-[#E8821A]">{item.icon}</span>
                        {item.label}
                      </span>
                      <FaChevronLeft className="text-[#ccc] dark:text-gray-600 text-xs" />
                    </button>
                  ))}
                </div>

                {/* قايمة "الإعدادات" */}
                <div className="bg-white dark:bg-black rounded-2xl border border-[#f0f0f0] dark:border-gray-700 overflow-hidden">
                  <p className="px-4 pt-4 pb-2 m-0 text-[13px] font-bold text-[#999] dark:text-gray-500">الإعدادات</p>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="w-full flex items-center justify-between px-4 py-3.5"
                    style={{ fontFamily: "'Cairo',sans-serif" }}
                  >
                    <span className="text-[15px] text-[#333] dark:text-gray-200">إعدادات الحساب</span>
                    <FaChevronLeft className="text-[#ccc] dark:text-gray-600 text-xs" />
                  </button>
                </div>

                {/* تسجيل الخروج */}
                <button
                  onClick={handleLogout}
                  className="bg-white dark:bg-black rounded-2xl border border-[#f0f0f0] dark:border-gray-700 py-3.5 flex items-center justify-center gap-2 text-[#e53935] font-semibold text-[15px]"
                  style={{ fontFamily: "'Cairo',sans-serif" }}
                >
                  <FaSignOut /> تسجيل الخروج
                </button>
              </div>

              {/* ══════════════════════════════════════════════════════════
                  DESKTOP / TABLET (sm فما فوق) — بالظبط زي ما كان، من غير
                  أي تغيير خالص
              ══════════════════════════════════════════════════════════ */}
              <div className="hidden sm:contents">
                <ProfileOverview
                  user={user}
                  orders={orders}
                  onEditClick={() => setEditOpen(true)}
                  onSeeAllOrders={() => setActiveTab("orders")}
                />
              </div>
            </>
          )}

          {activeTab === "orders" && (
            <OrdersTab orders={orders} ordersError={ordersError} />
          )}

          {activeTab === "addresses" && (
            <AddressesTab
              addresses={addresses}
              onEdit={openAddressModalFromCard}
              onAdd={openAddressModalToAdd}
              onDelete={handleDeleteAddress}
            />
          )}

          {activeTab === "settings" && <SettingsTab />}

          {!["profile","orders","addresses","settings"].includes(activeTab) && (
            <div className="bg-white dark:bg-black rounded-2xl border border-[#f0f0f0] dark:border-gray-700 text-center py-10 sm:py-12">
              <p className="text-[#bbb] dark:text-gray-500 text-base sm:text-[17px]">قريباً...</p>
            </div>
          )}
        </div>
      </div>

      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSave={(updated) => setUser(u => ({ ...u, ...updated }))}
        />
      )}

      <AnimatePresence>
        {addressModal && (
          <AddressModal
            isNew={addressModal.isNew}
            addressId={addressModal.addressId}
            initialData={addressModal.data}
            onClose={() => setAddressModal(null)}
            onSaved={() => fetchAddresses()}
          />
        )}
      </AnimatePresence>
    </div>
  )
}