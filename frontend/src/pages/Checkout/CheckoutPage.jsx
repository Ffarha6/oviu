import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { LanguageContext } from "../../context/LanguageContext"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiTag, FiMessageCircle, FiX, FiMapPin, FiEdit2, FiPlus
} from "react-icons/fi"
import {
  FaTruck, FaHeadset,
  FaCreditCard, FaHandHoldingUsd
} from "react-icons/fa"
import { MdOutlineLocalShipping } from "react-icons/md"
// ⚠️ عدّلي المسار ده لو AddressModal.jsx و ProfileConstants.js عندك في مكان مختلف عن src/pages/Profile/
import AddressModal from "../Profile/AddressModal"
import { authFetch, getGovernorates } from "../Profile/ProfileConstants"
// ⚠️ عدّلي المسار ده لو حطيتي shippingRates.js في مكان مختلف
import { getShippingQuote } from "../../data/shippingRates"

// ✅ نفس فكرة صفحة البروفايل: رابط ثابت احتياطي لو VITE_API_URL مش متعرّف في .env
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://oviu-production.up.railway.app"

// خريطة تحويل اسم طريقة الدفع في الفرونت إلى الاسم اللي الباك إند فاهمه
// (الباك إند عنده: cash, card, wallet, bank -- الفرونت عنده: card, cod)
const PAYMENT_METHOD_MAP = {
  card: "card",
  cod: "cash",
}

// نفس دالة استخراج الصورة الموجودة في صفحة السلة، عشان الاتنين يتصرفوا بنفس الطريقة بالظبط
function getItemImage(item) {
  const pd = item?.product_detail

  if (item?.image)           return item.image
  if (item?.thumbnail)       return item.thumbnail
  if (item?.primary_image)   return item.primary_image

  if (pd?.primary_image)     return pd.primary_image
  if (pd?.image)             return pd.image
  if (pd?.thumbnail)         return pd.thumbnail

  if (Array.isArray(pd?.colors)) {
    for (const c of pd.colors) {
      if (c?.primary_image?.url)   return c.primary_image.url
      if (c?.primary_image)        return c.primary_image
      if (c?.images?.[0]?.url)     return c.images[0].url
      if (c?.images?.[0]?.image)   return c.images[0].image
      if (c?.image)                return c.image
    }
  }

  if (Array.isArray(pd?.images)) {
    for (const img of pd.images) {
      if (img?.url)   return img.url
      if (img?.image) return img.image
      if (typeof img === "string") return img
    }
  }

  return ""
}

export default function CheckoutPage() {
  const { language } = useContext(LanguageContext)
  const { cart, fetchCart, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAr = language === "ar"

  // نفس نظام الترجمة اللي بيستخدمه AddressModal وباقي صفحة البروفايل،
  // بنستخدمه هنا بس عشان نترجم اسم المحافظة (المخزنة كـ key زي "cairo") لعربي
  const { t: i18nT } = useTranslation()
  const governorates = getGovernorates(i18nT)
  const govLabel = (key) => governorates.find(g => g.value === key)?.label || key

  const items = cart?.items ?? []
  // ✅ عدد "المنتجات" اللي بيتكتب في العناوين لازم يبقى إجمالي عدد القطع (مجموع الكميات)
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const subtotal = parseFloat(cart?.total_price ?? 0)
  const discount = 0

  // ⚠️ ملحوظة مهمة: مفيش حقل orders_count في بيانات اليوزر الراجعة من
  // /api/auth/user/، فبنجيب عدد طلبات العميل من endpoint الطلبات نفسه.
  // ⚠️ عدّلي المسار "/api/orders/" ده لو مختلف عندك في الباك إند.
  // ⚠️ برضو: ده تحقق فرونت-فقط، سهل التلاعب فيه — لازم الباك إند يتأكد بنفسه
  // من عدد طلبات العميل وقت إنشاء الطلب قبل ما يطبق أي خصم فعلي على السعر.
  const [isFirstOrder, setIsFirstOrder] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState("")
  const [coupon, setCoupon] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // ── دليل العناوين: نفس البيانات بالظبط اللي في صفحة البروفايل (/api/auth/addresses/) ──
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [addressLoading, setAddressLoading] = useState(true)

  // سعر ومدة الشحن بيتحددوا حسب محافظة العنوان المختار + هل ده أول طلب للعميل
  const shippingQuote = selectedAddress ? getShippingQuote(selectedAddress.governorate, isFirstOrder) : null
  const shippingCost = shippingQuote ? shippingQuote.price : 0
  const total = subtotal - discount + shippingCost

  // مودال دليل العناوين (اختيار عنوان من اللي محفوظين)
  const [addressListOpen, setAddressListOpen] = useState(false)
  // مودال الإضافة/التعديل — هو نفسه AddressModal بتاع صفحة البروفايل بالظبط
  const [addressForm, setAddressForm] = useState({ open: false, isNew: true, initialData: null, addressId: null })

  useEffect(() => {
    fetchCart()
  }, [])

  useEffect(() => {
    const checkFirstOrder = async () => {
      try {
        const res = await authFetch("/api/orders/")
        if (!res.ok) return
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data?.results || [])
        setIsFirstOrder(list.length === 0)
      } catch (err) {
        console.log(err)
        // في حالة فشل الطلب، بنسيب isFirstOrder = false (الوضع الآمن الافتراضي)
      }
    }
    checkFirstOrder()
  }, [])

  const loadAddresses = async () => {
    try {
      setAddressLoading(true)
      const res = await authFetch("/api/auth/addresses/")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAddresses(data)

      if (data.length > 0) {
        setSelectedAddress(prev => {
          // لو فيه عنوان متختار قبل كده، حدّثيه بأحدث نسخة منه لو لسه موجود
          if (prev) {
            const stillThere = data.find(a => a.id === prev.id)
            if (stillThere) return stillThere
          }
          return data.find(a => a.is_default) || data[0]
        })
      } else {
        setSelectedAddress(null)
      }
    } catch (err) {
      console.log(err)
    } finally {
      setAddressLoading(false)
    }
  }

  useEffect(() => {
    loadAddresses()
  }, [])

  // فتح دليل العناوين: لو فيه عناوين محفوظة نعرضها للاختيار، لو مفيش نفتح فورم إضافة على طول
  const openAddressPicker = () => {
    if (addresses.length > 0) {
      setAddressListOpen(true)
    } else {
      setAddressForm({ open: true, isNew: true, initialData: null, addressId: null })
    }
  }

  const openAddNewAddress = () => {
    setAddressListOpen(false)
    setAddressForm({ open: true, isNew: true, initialData: null, addressId: null })
  }

  const openEditAddress = (addr) => {
    setAddressListOpen(false)
    setAddressForm({
      open: true,
      isNew: false,
      addressId: addr.id,
      initialData: {
        fullName: addr.full_name,
        phone: addr.phone?.replace(/^\+\d{1,4}/, "") || "",
        phoneCode: addr.phone?.match(/^\+\d{1,4}/)?.[0] || "+20",
        governorate: addr.governorate,
        area: addr.area || "",
        address: addr.address,
      },
    })
  }

  const closeAddressForm = () => setAddressForm(f => ({ ...f, open: false }))

  // بعد ما AddressModal يحفظ العنوان (سواء إضافة أو تعديل)، بنعيد تحميل الدليل
  // كامل من نفس الـ endpoint، عشان صفحة البروفايل والتشيك أوت يفضلوا متزامنين دايمًا
  const handleAddressSaved = async (savedAddress) => {
    await loadAddresses()
    if (savedAddress?.id) {
      setSelectedAddress(prev => ({ ...savedAddress }))
    }
  }

  const handleChooseFromList = (addr) => {
    setSelectedAddress(addr)
    setAddressListOpen(false)
  }

  const t = {
    ar: {
      breadcrumb: ["الرئيسية", "سلة التسوق", "إتمام الطلب"],
      title: "إتمام الطلب",
      subtitle: "اكمل معلوماتك لإتمام طلبك بأمان",
      summary: "ملخص الطلب",
      products: "منتجات",
      subtotalLabel: "المجموع الفرعي",
      discountLabel: "خصم",
      shippingLabel: "الشحن",
      free: "مجاناً",
      totalLabel: "الإجمالي",
      couponPlaceholder: "إدخال كود الخصم",
      apply: "تطبيق",
      needHelp: "تحتاج مساعدة؟",
      needHelpDesc: "فريق الدعم جاهز لمساعدتك",
      contactUs: "تواصل معنا",

      s1: "معلومات الشحن",
      addAddressBtn: "إضافة عنوان",
      addressLoadingTxt: "جاري تحميل العنوان...",
      modalTitleList: "تسليم إلى",
      addressBookLabel: "دليل العناوين",
      addNewAddress: "اضف عنوان",
      selectAddress: "اختيار العنوان",
      editAddress: "تعديل",
      cancel: "إلغاء",

      s2: "طريقة الشحن",
      fastShipTitle: "شحن سريع",
      fastShipComingSoon: "قريبًا",
      stdShipTitle: "التوصيل لباب البيت",
      stdShipSubPrefix: "يصلك خلال",
      daysUnit: "أيام",
      chooseAddressForShipping: "اختاري عنوان الشحن الأول عشان نظهرلك سعر ومدة التوصيل",
      firstOrderBadge: "خصم أول طلب",

      s3: "طريقة الدفع",
      cardTitle: "بطاقة ائتمان",
      cardSub: "Visa, Mastercard, Mada",
      codTitle: "الدفع عند الاستلام",
      codSub: "ادفع عند استلام طلبك",

      reviewTitle: "ملخص الطلب",
      paymentSummary: "ملخص الدفع",

      payNow: "تأكيد الطلب",
      currency: "ج.م",
      emptyCoupon: "الرجاء إدخال كود الخصم",
    },
    en: {
      breadcrumb: ["Home", "Shopping Cart", "Checkout"],
      title: "Checkout",
      subtitle: "Complete your information to place your order securely",
      summary: "Order Summary",
      products: "products",
      subtotalLabel: "Subtotal",
      discountLabel: "Discount",
      shippingLabel: "Shipping",
      free: "Free",
      totalLabel: "Total",
      couponPlaceholder: "Enter coupon code",
      apply: "Apply",
      needHelp: "Need Help?",
      needHelpDesc: "Support team ready to assist",
      contactUs: "Contact Us",

      s1: "Shipping Information",
      addAddressBtn: "Add Address",
      addressLoadingTxt: "Loading address...",
      modalTitleList: "Deliver to",
      addressBookLabel: "Address Book",
      addNewAddress: "Add Address",
      selectAddress: "Select Address",
      editAddress: "Edit",
      cancel: "Cancel",

      s2: "Shipping Method",
      fastShipTitle: "Fast Shipping",
      fastShipComingSoon: "Coming soon",
      stdShipTitle: "Home Delivery",
      stdShipSubPrefix: "Arrives in",
      daysUnit: "days",
      chooseAddressForShipping: "Choose a shipping address first to see the price and delivery time",
      firstOrderBadge: "First order discount",

      s3: "Payment Method",
      cardTitle: "Credit Card",
      cardSub: "Visa, Mastercard, Mada",
      codTitle: "Cash on Delivery",
      codSub: "Pay when you receive your order",

      reviewTitle: "Order Summary",
      paymentSummary: "Payment Summary",

      payNow: "Confirm Order",
      currency: "EGP",
      emptyCoupon: "Please enter a coupon code",
    },
  }[language]

  // فاضلة كخطاف بسيط لحد ما يتم ربط endpoint فعلي للكوبونات في الباك إند
  const handleApplyCoupon = () => {
    if (!coupon.trim()) {
      alert(t.emptyCoupon)
      return
    }
    // TODO: لما يبقى فيه endpoint للكوبونات في الباك إند اتربط هنا (مثال: /api/coupons/validate/)
  }

  const placeOrder = async () => {
    const token = localStorage.getItem("access_token")

    if (!token) {
      alert(isAr ? "الرجاء تسجيل الدخول أولاً" : "Please login first")
      navigate("/login")
      return false
    }

    // ✅ الباك إند (CreateOrderSerializer) مستني الحقول دي flat على مستوى الطلب
    // مباشرة (phone, address, payment_method, notes, items). مفيش عنده حقول منفصلة
    // للمحافظة أو المنطقة، فبندمجهم هنا جوه نص العنوان الواحد وقت إرسال الطلب بس
    // (العنوان المحفوظ في دليل العناوين بيفضل نضيف من غير دمج).
    const fullAddress = [govLabel(selectedAddress.governorate), selectedAddress.area, selectedAddress.address]
      .filter(Boolean)
      .join(" - ")

    // ⚠️ shipping_cost و is_first_order_shipping مبعوتين هنا احتياطًا، بس الباك إند
    // لازم يحسب سعر الشحن والخصم بنفسه من المحافظة وعدد طلبات العميل الفعلي،
    // مش يصدّق على القيم الجايه من الفرونت دي (عشان محدش يقدر يتلاعب في السعر).
    const orderNotesParts = []
    if (coupon) orderNotesParts.push(`Coupon: ${coupon}`)
    orderNotesParts.push(`Shipping: ${shippingQuote.price} EGP (${shippingQuote.daysMin}-${shippingQuote.daysMax} days)`)

    const orderData = {
      phone: selectedAddress.phone,
      address: fullAddress,
      payment_method: PAYMENT_METHOD_MAP[paymentMethod] || paymentMethod,
      notes: orderNotesParts.join(" | "),
      shipping_cost: shippingQuote.price,
      items: items.map((item) => ({
        product_id: item.product,
        quantity: item.quantity,
        color_id: item.color || null,
      })),
    }

    try {
      const orderUrl = `${API_BASE_URL}/api/orders/create/`
      const response = await fetch(orderUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(orderData),
      })

      const rawText = await response.text()
      let data = {}
      if (rawText) {
        try {
          data = JSON.parse(rawText)
        } catch {
          data = {}
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          alert(isAr ? "انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مرة أخرى" : "Session expired, please login again")
          navigate("/login")
          return false
        }

        let message = data.error || data.message || data.detail
        if (!message) {
          const firstFieldError = Object.values(data || {})[0]
          message = Array.isArray(firstFieldError) ? firstFieldError[0] : firstFieldError
        }
        if (!message) {
          message = isAr
            ? `تعذر الوصول للسيرفر (كود ${response.status})، تأكدي إن رابط الـ API صحيح`
            : `Could not reach the server (status ${response.status}), check the API URL`
        }
        throw new Error(message)
      }

      await clearCart()

      if (data.payment_url) {
        window.location.href = data.payment_url
      } else if (data.order_id || data.id) {
        const orderId = data.order_id || data.id
        navigate(`/order-confirmation/${orderId}`)
      } else {
        navigate("/orders")
      }

      return true
    } catch (error) {
      console.error("Order failed:", error)
      alert(isAr ? `فشل إتمام الطلب: ${error.message}` : `Order failed: ${error.message}`)
      return false
    }
  }

  const handleSubmitOrder = async () => {
    if (!selectedAddress) {
      alert(isAr ? "الرجاء اختيار أو إضافة عنوان الشحن" : "Please select or add a shipping address")
      return
    }
    if (!shippingQuote) {
      alert(isAr ? "مقدرناش نحدد سعر الشحن لمحافظتك، جربي تختاري العنوان تاني" : "Couldn't determine shipping cost for your governorate, try re-selecting the address")
      return
    }
    if (!paymentMethod) {
      alert(isAr ? "الرجاء اختيار طريقة الدفع" : "Please select a payment method")
      return
    }
    if (items.length === 0) {
      alert(isAr ? "السلة فارغة" : "Cart is empty")
      return
    }

    setIsProcessing(true)
    try {
      await placeOrder()
    } catch (error) {
      // الخطأ تم التعامل معه في placeOrder
    } finally {
      setIsProcessing(false)
    }
  }

  const SectionHeader = ({ title, subtitle }) => (
    <div className={`w-full py-4 ${isAr ? "text-right" : "text-left"}`}>
      <p className="font-bold text-black dark:text-white text-base">{title}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  )

  const renderOrderReview = () => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">{isAr ? "السلة فارغة" : "Cart is empty"}</p>
          <button
            onClick={() => navigate("/shop")}
            className="mt-3 text-[#D9A066] text-sm underline"
          >
            {isAr ? "تسوق الآن" : "Shop now"}
          </button>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-4">
        {items.map((item, idx) => {
          const detail = item.product_detail || {}
          const name = item.product_name || detail.name || (isAr ? "منتج" : "Product")
          const image = getItemImage(item)
          const color = item.color_name || ""
          const unitPrice = parseFloat(item.product_price ?? 0)

          return (
            <div key={item.id || idx} dir={isAr ? "rtl" : "ltr"} className={`flex gap-3 py-3 ${idx !== items.length - 1 ? "border-b border-black/5 dark:border-white/5" : ""}`}>
              <div className="relative w-[140px] h-[140px] bg-white dark:bg-[#1a1a1a] rounded-[14px] shrink-0 flex items-center justify-center overflow-hidden border border-black/5 dark:border-white/5">
                <img
                  src={image || "https://placehold.co/140x140/e8ddd4/8a6a4a?text=No+Image"}
                  alt={name}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => { e.target.src = "https://placehold.co/140x140/e8ddd4/8a6a4a?text=No+Image" }}
                />
                {item.quantity > 1 && (
                  <span className={`absolute top-1 ${isAr ? "left-1" : "right-1"} bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md`}>
                    x{item.quantity}
                  </span>
                )}
              </div>
              <div className={`flex-1 flex flex-col min-w-0 ${isAr ? "text-right" : "text-left"}`}>
                <p className="font-semibold text-black dark:text-white text-sm leading-snug line-clamp-2">{name}</p>
                {color && <p className="text-xs text-gray-400 mt-1">{color}</p>}
                <p className="font-bold text-[#D9A066] text-base mt-auto">
                  {unitPrice.toFixed(2)} {t.currency}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ── مودال دليل العناوين: عرض كل العناوين المحفوظة (نفس الـ endpoint بتاع صفحة البروفايل) ──
  const addressListContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setAddressListOpen(false)}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#111] rounded-[24px] w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6"
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-black dark:text-white text-lg">{t.modalTitleList}</h3>
          <button
            onClick={() => setAddressListOpen(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <FiX className="text-black dark:text-white text-lg" />
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-3 text-right">
          {t.addressBookLabel} ({addresses.length})
        </p>

        <div className="flex flex-col gap-3 mb-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              onClick={() => handleChooseFromList(addr)}
              className={`flex items-start justify-between gap-3 border-2 rounded-[16px] p-4 cursor-pointer transition text-right ${
                selectedAddress?.id === addr.id
                  ? "border-[#D9A066] bg-[#D9A066]/5"
                  : "border-black/10 dark:border-white/10"
              }`}
            >
              <div className="flex-1">
                <p className="font-bold text-black dark:text-white text-sm mb-1">{addr.full_name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {addr.phone} — {govLabel(addr.governorate)}{addr.area ? ` — ${addr.area}` : ""} — {addr.address}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); openEditAddress(addr) }}
                  className="flex items-center gap-1 text-[#D9A066] text-xs font-semibold mt-2 hover:underline"
                >
                  <FiEdit2 size={12} />
                  {t.editAddress}
                </button>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selectedAddress?.id === addr.id ? "border-[#D9A066]" : "border-gray-300"}`}>
                {selectedAddress?.id === addr.id && <div className="w-2.5 h-2.5 rounded-full bg-[#D9A066]" />}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={openAddNewAddress}
          className="flex items-center gap-2 text-[#D9A066] font-semibold text-sm mb-6"
        >
          <FiPlus className="w-6 h-6 rounded-full border-2 border-[#D9A066] p-1" />
          {t.addNewAddress}
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setAddressListOpen(false)}
            className="flex-1 bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold text-sm py-3 rounded-full transition"
          >
            {t.selectAddress}
          </button>
          <button
            onClick={() => setAddressListOpen(false)}
            className="flex-1 border border-black/10 dark:border-white/10 text-black dark:text-white font-semibold text-sm py-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            {t.cancel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-[#F7F2EE] dark:bg-[#050505] transition-all duration-500">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-28 lg:pb-12">

        <div className={`flex flex-col ${isAr ? "lg:flex-row-reverse" : "lg:flex-row"} gap-6 items-start`}>

          {/* LEFT — FORM */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-4">

            {/* SECTION 1 — Shipping Info */}
            <div className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[20px] px-4 sm:px-6">
              <SectionHeader title={t.s1} />
              <div className="pb-4">
                {addressLoading && (
                  <p className="text-sm text-gray-400 py-2">{t.addressLoadingTxt}</p>
                )}

                {!addressLoading && selectedAddress && (
                  <button
                    onClick={openAddressPicker}
                    className={`w-full flex items-center gap-3 bg-[#F7F2EE] dark:bg-[#1a1a1a] rounded-[14px] px-3.5 sm:px-4 py-3 ${isAr ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#D9A066]/10 flex items-center justify-center shrink-0">
                      <FiMapPin className="text-[#D9A066]" />
                    </div>
                    <div className={`flex-1 min-w-0 ${isAr ? "text-right" : "text-left"}`}>
                      <p className="font-bold text-black dark:text-white text-sm mb-0.5">{selectedAddress.full_name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed truncate">
                        {selectedAddress.phone} — {govLabel(selectedAddress.governorate)}
                        {selectedAddress.area ? ` — ${selectedAddress.area}` : ""} — {selectedAddress.address}
                      </p>
                    </div>
                  </button>
                )}

                {!addressLoading && !selectedAddress && (
                  <button
                    onClick={openAddressPicker}
                    className={`flex items-center gap-2 text-[#D9A066] font-semibold text-sm ${isAr ? "flex-row-reverse" : ""}`}
                  >
                    <span className="w-6 h-6 rounded-full border-2 border-[#D9A066] flex items-center justify-center text-base leading-none">+</span>
                    {t.addAddressBtn}
                  </button>
                )}
              </div>
            </div>

            {/* SECTION 2 — Shipping Method */}
            <div className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[20px] px-4 sm:px-6">
              <SectionHeader title={t.s2} />
              <div className="pb-6 flex flex-col gap-3">

                {/* شحن سريع — معطل مؤقتًا، مكتوب عليه "قريبًا" ومينفعش يتختار */}
                <div
                  className={`w-full flex items-center justify-between px-3.5 sm:px-5 py-3.5 sm:py-4 rounded-[16px] border-2 border-black/10 dark:border-white/10 bg-[#F7F2EE] dark:bg-[#1a1a1a] opacity-50 cursor-not-allowed ${isAr ? "flex-row-reverse" : ""}`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0" />
                    <div className="text-[#D9A066] text-lg sm:text-xl shrink-0"><FaTruck /></div>
                    <div className={isAr ? "text-right" : "text-left"}>
                      <p className="font-semibold text-black dark:text-white text-xs sm:text-sm">{t.fastShipTitle}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[11px] sm:text-xs shrink-0 text-gray-400 bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full">
                    {t.fastShipComingSoon}
                  </span>
                </div>

                {/* التوصيل القياسي — دايمًا مختار تلقائي، السعر والمدة بيتحددوا حسب محافظة العنوان المختار */}
                {selectedAddress && shippingQuote ? (
                  <div className={`w-full flex items-center justify-between px-3.5 sm:px-5 py-3.5 sm:py-4 rounded-[16px] border-2 border-[#D9A066] bg-[#D9A066]/5 ${isAr ? "flex-row-reverse" : ""}`}>
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-[#D9A066] flex items-center justify-center shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#D9A066]" />
                      </div>
                      <div className="text-[#D9A066] text-lg sm:text-xl shrink-0"><MdOutlineLocalShipping /></div>
                      <div className={isAr ? "text-right" : "text-left"}>
                        <p className="font-semibold text-black dark:text-white text-xs sm:text-sm">{t.stdShipTitle}</p>
                        <p className="text-[11px] sm:text-xs text-gray-400">
                          {t.stdShipSubPrefix} {shippingQuote.daysMin}-{shippingQuote.daysMax} {t.daysUnit}
                        </p>
                      </div>
                    </div>
                    <div className={`flex flex-col ${isAr ? "items-start" : "items-end"} shrink-0`}>
                      {shippingQuote.isDiscounted && (
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#D9A066] bg-[#D9A066]/10 px-2 py-0.5 rounded-full mb-0.5">
                          {t.firstOrderBadge}
                        </span>
                      )}
                      <span className={`font-bold text-xs sm:text-sm ${shippingQuote.isFree ? "text-green-500" : "text-black dark:text-white"}`}>
                        {shippingQuote.isFree ? t.free : `${shippingQuote.price} ${t.currency}`}
                      </span>
                      {shippingQuote.isDiscounted && !shippingQuote.isFree && (
                        <span className="text-[10px] text-gray-400 line-through">
                          {shippingQuote.originalPrice} {t.currency}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 px-2 py-2">{t.chooseAddressForShipping}</p>
                )}
              </div>
            </div>

            {/* SECTION 3 — Payment */}
            <div className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[20px] px-4 sm:px-6">
              <SectionHeader title={t.s3} />
              <div className="pb-6 flex flex-col gap-3">
                {[
                  {
                    key: "card",
                    icon: <FaCreditCard className="text-[#D9A066] text-lg sm:text-xl shrink-0" />,
                    title: t.cardTitle,
                    sub: t.cardSub,
                  },
                  {
                    key: "cod",
                    icon: <FaHandHoldingUsd className="text-[#D9A066] text-lg sm:text-xl shrink-0" />,
                    title: t.codTitle,
                    sub: t.codSub,
                  },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setPaymentMethod(opt.key)}
                    className={`w-full flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-3.5 sm:py-4 rounded-[16px] border-2 transition-all duration-200 ${paymentMethod === opt.key
                      ? "border-[#D9A066] bg-[#D9A066]/5"
                      : "border-black/10 dark:border-white/10 bg-[#F7F2EE] dark:bg-[#1a1a1a]"
                    }`}
                  >
                    {opt.icon}
                    <div className={isAr ? "text-right" : "text-left"}>
                      <p className="font-semibold text-black dark:text-white text-xs sm:text-sm">{opt.title}</p>
                      {opt.sub && <p className="text-[11px] sm:text-xs text-gray-400">{opt.sub}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="w-full lg:w-[420px] lg:shrink-0 flex flex-col gap-4 lg:sticky lg:top-[110px]">

            <div className={`flex items-center gap-2 px-1 w-full ${isAr ? "justify-end" : "justify-start"}`}>
              <h2 className="font-bold text-black dark:text-white text-base sm:text-lg">
                {t.reviewTitle} <span className="text-[#D9A066]">({totalQuantity} {t.products})</span>
              </h2>
            </div>

            <div className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[24px] p-5 sm:p-7">
              {renderOrderReview()}
            </div>

            <div className="w-full bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[24px] p-5 sm:p-7">

              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-bold text-black dark:text-white text-base sm:text-lg">{t.paymentSummary}</h2>
                <span className="bg-[#F7F2EE] dark:bg-[#1a1a1a] text-gray-400 text-xs font-medium px-3 py-1.5 rounded-full">
                  {totalQuantity} {t.products}
                </span>
              </div>

              <div className="flex flex-col gap-2 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t.subtotalLabel}</span>
                  <span className="text-black dark:text-white font-semibold text-sm">{subtotal.toFixed(2)} {t.currency}</span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t.discountLabel}</span>
                    <span className="text-[#D9A066] font-semibold text-sm">- {discount} {t.currency}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t.shippingLabel}</span>
                  <span className={`font-semibold text-sm ${shippingCost === 0 ? "text-green-500" : "text-black dark:text-white"}`}>
                    {shippingCost === 0 ? t.free : `${shippingCost} ${t.currency}`}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 mt-1 border-t border-black/5 dark:border-white/5">
                  <span className="font-bold text-black dark:text-white text-sm sm:text-base">{t.totalLabel}</span>
                  <span className="font-bold text-[#D9A066] text-lg sm:text-xl">{total.toFixed(2)} {t.currency}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-5">
                <div className="flex-1 flex items-center gap-2 bg-[#F7F2EE] dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-full px-4 py-2.5">
                  <FiTag className="text-gray-400 text-sm shrink-0" />
                  <input
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder={t.couponPlaceholder}
                    className={`flex-1 bg-transparent outline-none text-sm text-black dark:text-white placeholder:text-gray-400 ${isAr ? "text-right" : "text-left"}`}
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  className="bg-[#D9A066] hover:bg-[#c98d54] text-white text-sm font-semibold px-4 py-2.5 rounded-full transition shrink-0"
                >
                  {t.apply}
                </button>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={isProcessing || items.length === 0}
                className={`hidden lg:flex w-full items-center justify-center gap-2 bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold text-sm sm:text-base py-3 sm:py-3.5 rounded-full transition-all duration-300 hover:scale-[1.02] shadow-[0_8px_25px_rgba(217,160,102,0.4)] ${(isProcessing || items.length === 0) ? "opacity-70 cursor-not-allowed hover:scale-100" : ""} ${isAr ? "flex-row-reverse" : ""}`}
              >
                {isProcessing && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {t.payNow}
              </button>
            </div>

            <div className="hidden lg:block bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[20px] p-4 sm:p-5">
              <div className={`flex items-center gap-3 mb-3 ${isAr ? "flex-row-reverse" : ""}`}>
                <FaHeadset className="text-[#D9A066] text-lg shrink-0" />
                <div className={isAr ? "text-right" : "text-left"}>
                  <p className="text-black dark:text-white text-xs font-semibold">{t.needHelp}</p>
                  <p className="text-gray-400 text-xs">{t.needHelpDesc}</p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = "/contact"}
                className={`w-full flex items-center justify-center gap-2 border border-[#D9A066] text-[#D9A066] text-sm font-semibold py-2.5 rounded-full hover:bg-[#D9A066]/10 transition ${isAr ? "flex-row-reverse" : ""}`}
              >
                <FiMessageCircle />
                {t.contactUs}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* بار سفلي ثابت للموبايل/التابلت */}
      <div className={`lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-[#111] border-t border-black/10 dark:border-white/10 px-4 py-3 flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
        <div className={isAr ? "text-right" : "text-left"}>
          <p className="text-[11px] text-gray-400">{totalQuantity} {t.products}</p>
          <p className="font-bold text-black dark:text-white text-lg leading-tight">{total.toFixed(2)} {t.currency}</p>
        </div>
        <button
          onClick={handleSubmitOrder}
          disabled={isProcessing || items.length === 0}
          className={`flex-1 flex items-center justify-center gap-2 bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold text-sm py-3 rounded-full transition-all duration-300 ${(isProcessing || items.length === 0) ? "opacity-70 cursor-not-allowed" : ""} ${isAr ? "flex-row-reverse" : ""}`}
        >
          {isProcessing && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {t.payNow}
        </button>
      </div>

      {/* دليل العناوين (اختيار من المحفوظ) */}
      <AnimatePresence>
        {addressListOpen && addressListContent}
      </AnimatePresence>

      {/* فورم إضافة/تعديل عنوان — نفس الكومبوننت اللي بيتستخدم في صفحة البروفايل بالظبط */}
      <AnimatePresence>
        {addressForm.open && (
          <AddressModal
            initialData={addressForm.initialData}
            isNew={addressForm.isNew}
            addressId={addressForm.addressId}
            onClose={closeAddressForm}
            onSaved={handleAddressSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}