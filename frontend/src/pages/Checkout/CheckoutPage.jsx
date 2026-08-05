import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { LanguageContext } from "../../context/LanguageContext"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiShield,
  FiTag, FiMessageCircle, FiX, FiMapPin
} from "react-icons/fi"
import {
  FaTruck, FaHeadset,
  FaCreditCard, FaHandHoldingUsd
} from "react-icons/fa"
import { MdOutlineLocalShipping } from "react-icons/md"

// ✅ نفس فكرة صفحة البروفايل: رابط ثابت احتياطي لو VITE_API_URL مش متعرّف في .env
// (لو ده هو اللي حصل، كان الطلب رايح لمسار غلط عند سيرفر الفرونت نفسه وبيرجع HTML
// مش JSON، فده كان سبب رسالة "فشل إتمام الطلب" الفاضية اللي بتظهر بدون أي تفاصيل)
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://oviu-production.up.railway.app"

const PHONE_CODES = ["+966", "+20", "+971", "+965", "+974", "+973", "+968"]

const CITIES_AR = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "أبها", "تبوك", "القصيم", "حائل"]
const CITIES_EN = ["Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam", "Khobar", "Abha", "Tabuk", "Qassim", "Hail"]

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
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const isAr = language === "ar"

  const items = cart?.items ?? []
  // ✅ عدد "المنتجات" اللي بيتكتب في العناوين لازم يبقى إجمالي عدد القطع (مجموع الكميات)
  // مش عدد الأنواع المختلفة (items.length)، عشان لو عندك نوعين وكل واحد كميته أكتر من 1
  // يبقى العدد الحقيقي أكبر من 2
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const subtotal = parseFloat(cart?.total_price ?? 0)
  const discount = 0
  const tax = Math.round(subtotal * 0.15)
  // مفيش قيمة افتراضية لطريقة الشحن ولا الدفع، المستخدم لازم يختار بنفسه
  const [shippingMethod, setShippingMethod] = useState("")
  const shippingCost = shippingMethod === "fast" ? 20 : 0
  const total = subtotal - discount + tax + shippingCost

  const [form, setForm] = useState({
    fullName: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "",
    phone: user?.phone || "",
    phoneCode: "+20",
    email: user?.email || "",
    city: user?.governorate || "",
    address: user?.address || "",
    saveAddress: true,
  })
  const [paymentMethod, setPaymentMethod] = useState("")
  const [coupon, setCoupon] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // ── العنوان المحفوظ ──
  // savedAddress = null لحد ما نتأكد إن مفيش عنوان (بنفرق بينه وبين "لسه بيحمل" بـ addressLoading)
 const [addresses, setAddresses] = useState([])
const [selectedAddress, setSelectedAddress] = useState(null)
  const [addressLoading, setAddressLoading] = useState(true)
  // بدل ما الفورم يتوسّع جوه الصفحة، دلوقتي addressModalOpen بيفتح مودال منبثق فوق الصفحة كلها
  // (نفس فكرة جوميا: كارت مختصر + زرار "تغيير"/"إضافة عنوان" يفتح بوب أب)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  // نسخة مؤقتة من الفورم بنشتغل عليها جوه المودال، عشان لو المستخدم قفل المودال من غير حفظ
  // ميتغيرش العنوان المحفوظ اللي ظاهر في الكارت المختصر
  const [draftForm, setDraftForm] = useState(form)
  // بيبقى true وإحنا بنبعت طلب الحفظ للباك إند
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  // شكل المودال: 'list' = دليل العناوين (فيه العنوان المحفوظ + زرار اضف عنوان)، 'form' = فورم إدخال/تعديل العنوان
  const [addressModalView, setAddressModalView] = useState("form")

  useEffect(() => {
    fetchCart()
  }, [])

  useEffect(() => {
  const loadAddresses = async () => {
    try {
      setAddressLoading(true)

      const res = await authFetch("/api/auth/addresses/")

      if (!res.ok) throw new Error()

      const data = await res.json()

      setAddresses(data)

      if (data.length > 0) {
        const selected = data.find(a => a.is_default) || data[0]
        setSelectedAddress(selected)
      }
    } catch (err) {
      console.log(err)
    } finally {
      setAddressLoading(false)
    }
  }

  loadAddresses()
}, [])
  // لو لقينا عنوان محفوظ، نملى بيه الفورم تلقائيًا (يظهر في الكارت المختصر، ويبقى أساس المودال لو "تغيير")
  useEffect(() => {
    if (savedAddress) {
      setForm(f => ({
        ...f,
        fullName: savedAddress.full_name || f.fullName,
        phone: savedAddress.phone?.replace(/^\+\d{1,4}/, "") || f.phone,
        city: savedAddress.city || f.city,
        address: savedAddress.address || f.address,
      }))
    }
  }, [savedAddress])

  // فتح المودال: لو فيه عنوان محفوظ نبدأ بشاشة "دليل العناوين"، ولو مفيش نروح للفورم على طول
  const openAddressModal = () => {
    setDraftForm(form)
    setAddressModalView(savedAddress ? "list" : "form")
    setAddressModalOpen(true)
  }

  // من جوه دليل العناوين: زرار تعديل العنوان الموجود
  const openEditAddressForm = () => {
    setDraftForm(form)
    setAddressModalView("form")
  }

  // من جوه دليل العناوين: زرار "+ اضف عنوان" — فورم فاضي تمامًا
  const openAddNewAddressForm = () => {
    setDraftForm({
      fullName: "",
      phone: "",
      phoneCode: "+20",
      email: form.email,
      city: "",
      address: "",
      saveAddress: true,
    })
    setAddressModalView("form")
  }

  const closeAddressModal = () => setAddressModalOpen(false)

  const handleDraftChange = (e) => setDraftForm({ ...draftForm, [e.target.name]: e.target.value })

  const handleSaveAddress = async () => {
    // تحقق بسيط قبل الحفظ
    if (!draftForm.fullName || !draftForm.phone || !draftForm.city || !draftForm.address) {
      alert(isAr ? "الرجاء تعبئة كل الحقول المطلوبة" : "Please fill in all required fields")
      return
    }

    setForm(draftForm)

    // لو المستخدم مش عايز يحفظ العنوان لاستخدامه لاحقًا، نستخدمه بس في الطلب الحالي من غير ما نبعته للباك إند
    if (!draftForm.saveAddress) {
      setSavedAddress({
        full_name: draftForm.fullName,
        phone: draftForm.phone,
        city: draftForm.city,
        address: draftForm.address,
      })
      setAddressModalView("list")
      return
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      alert(isAr ? "الرجاء تسجيل الدخول لحفظ العنوان" : "Please login to save your address")
      setAddressModalOpen(false)
      return
    }

    // اليوزر عنده first_name / last_name بس مفيش full_name واحد، فبنقسم الاسم المدخل
    const [firstName, ...rest] = draftForm.fullName.trim().split(/\s+/)
    const lastName = rest.join(" ")

    // city في الفورم بتتخزن في حقل governorate عند اليوزر (أقرب حقل موجود فعليًا في الباك إند)
    const payload = {
      phone: draftForm.phone,
      address: draftForm.address,
      governorate: draftForm.city,
      first_name: firstName || "",
      last_name: lastName || "",
    }

    setIsSavingAddress(true)
    try {
      console.log("Saving address to:", `${API_BASE_URL}/api/auth/profile/`)
      const res = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      })

      // بعض الردود بترجع من غير body خالص (مثلاً 204)، فبنقرأ كـ نص الأول
      // وبعدين نحاول نحوّله JSON، بدل ما نستنى JSON مباشرة ويكسر الكود لو فاضي
      const rawText = await res.text()
      let data = {}
      if (rawText) {
        try {
          data = JSON.parse(rawText)
        } catch {
          data = {}
        }
      }

      if (!res.ok) {
        // رسائل الأخطاء بتيجي من DRF كـ object فيه مصفوفة لكل حقل، بناخد أول رسالة نلاقيها
        const firstError = Object.values(data || {})[0]
        const message = Array.isArray(firstError) ? firstError[0] : (data.detail || data.message)
        throw new Error(message || (isAr ? "فشل حفظ العنوان" : "Failed to save address"))
      }

      setSavedAddress({
        full_name: `${data.first_name || firstName || ""} ${data.last_name || lastName || ""}`.trim(),
        phone: data.phone || draftForm.phone,
        city: data.governorate || draftForm.city,
        address: data.address || draftForm.address,
      })
      // بعد الحفظ نرجع لشاشة دليل العناوين بدل ما نقفل المودال كله
      setAddressModalView("list")

      // نحدّث بيانات اليوزر في الـ AuthContext عشان أي مكان تاني في التطبيق (زي الـ Navbar) يعكس التعديل فورًا
      if (refreshUser) refreshUser()
    } catch (error) {
      console.error("Save address failed:", error)
      alert(isAr ? `فشل حفظ العنوان: ${error.message}` : `Failed to save address: ${error.message}`)
    } finally {
      setIsSavingAddress(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

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
      taxLabel: "الضريبة (15%)",
      totalLabel: "الإجمالي",
      couponPlaceholder: "إدخال كود الخصم",
      apply: "تطبيق",
      needHelp: "تحتاج مساعدة؟",
      needHelpDesc: "فريق الدعم جاهز لمساعدتك",
      contactUs: "تواصل معنا",

      s1: "معلومات الشحن",
      fullName: "الاسم الكامل",
      fullNamePh: "أدخل اسمك الكامل",
      mobile: "رقم الجوال",
      mobilePh: "5xxxxxxxx",
      emailOpt: "البريد الإلكتروني (اختياري)",
      emailPh: "example@email.com",
      cityLabel: "المدينة",
      cityPh: "اختر المدينة",
      addressLabel: "تفاصيل العنوان",
      addressPh: "اسم الشارع، رقم المبنى، الشقة، المعلم القريب (اختياري)",
      saveAddr: "حفظ العنوان لاستخدامه لاحقاً",
      changeAddress: "تغيير",
      addAddressBtn: "إضافة عنوان",
      useThisAddress: "حفظ العنوان",
      addressLoadingTxt: "جاري تحميل العنوان...",
      modalTitleAdd: "إضافة عنوان الشحن",
      modalTitleEdit: "تعديل عنوان الشحن",
      modalTitleList: "تسليم إلى",
      addressBookLabel: "دليل العناوين",
      addNewAddress: "اضف عنوان",
      selectAddress: "اختيار العنوان",
      cancel: "إلغاء",

      s2: "طريقة الشحن",
      fastShipTitle: "شحن سريع",
      fastShipSub: "يصلك خلال 1-3 أيام عمل",
      stdShipTitle: "شحن قياسي",
      stdShipSub: "يصلك خلال 5-8 أيام عمل",
      fastPrice: "20 ج.م",
      stdPrice: "مجاناً",

      s3: "طريقة الدفع",
      cardTitle: "بطاقة ائتمان",
      cardSub: "Visa, Mastercard, Mada",
      codTitle: "الدفع عند الاستلام",
      codSub: "ادفع عند استلام طلبك",

      reviewTitle: "ملخص الطلب",
      reviewSub: "راجع تفاصيل طلبك قبل التأكيد",
      paymentSummary: "ملخص الدفع",

      payNow: "تأكيد الطلب",
      currency: "ج.م",
      orderSuccess: "تم إرسال الطلب بنجاح!",
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
      taxLabel: "Tax (15%)",
      totalLabel: "Total",
      couponPlaceholder: "Enter coupon code",
      apply: "Apply",
      needHelp: "Need Help?",
      needHelpDesc: "Support team ready to assist",
      contactUs: "Contact Us",

      s1: "Shipping Information",
      fullName: "Full Name",
      fullNamePh: "Enter your full name",
      mobile: "Mobile Number",
      mobilePh: "5xxxxxxxx",
      emailOpt: "Email (Optional)",
      emailPh: "example@email.com",
      cityLabel: "City",
      cityPh: "Select City",
      addressLabel: "Address Details",
      addressPh: "Street name, building number, apartment, nearby landmark (optional)",
      saveAddr: "Save address for later use",
      changeAddress: "Change",
      addAddressBtn: "Add Address",
      useThisAddress: "Save Address",
      addressLoadingTxt: "Loading address...",
      modalTitleAdd: "Add Shipping Address",
      modalTitleEdit: "Edit Shipping Address",
      modalTitleList: "Deliver to",
      addressBookLabel: "Address Book",
      addNewAddress: "Add Address",
      selectAddress: "Select Address",
      cancel: "Cancel",

      s2: "Shipping Method",
      fastShipTitle: "Fast Shipping",
      fastShipSub: "Delivered in 1-3 business days",
      stdShipTitle: "Standard Shipping",
      stdShipSub: "Delivered in 5-8 business days",
      fastPrice: "20 EGP",
      stdPrice: "Free",

      s3: "Payment Method",
      cardTitle: "Credit Card",
      cardSub: "Visa, Mastercard, Mada",
      codTitle: "Cash on Delivery",
      codSub: "Pay when you receive your order",

      reviewTitle: "Order Summary",
      reviewSub: "Review your order details before confirming",
      paymentSummary: "Payment Summary",

      payNow: "Confirm Order",
      currency: "EGP",
      orderSuccess: "Order placed successfully!",
      emptyCoupon: "Please enter a coupon code",
    },
  }[language]

  const cities = isAr ? CITIES_AR : CITIES_EN

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
    // مباشرة (phone, address, payment_method, notes, items)، مش جوه object متداخل
    // اسمه shipping_address. كمان مفيش حقل city منفصل عند الباك إند، فبندمجه جوه
    // العنوان النصي الواحد اللي عنده (address).
    const fullAddress = form.city ? `${form.city} - ${form.address}` : form.address

    const orderData = {
      phone: `${form.phoneCode}${form.phone}`,
      address: fullAddress,
      // تحويل اسم طريقة الدفع لما الباك إند متوقعه فعلاً (cash / card / wallet)
      payment_method: PAYMENT_METHOD_MAP[paymentMethod] || paymentMethod,
      notes: coupon ? `Coupon: ${coupon}` : "",
      // item.product و item.color في الـ CartItemSerializer عبارة عن IDs مباشرة (مش objects).
      // مفيش داعي نبعت السعر، الباك إند بيحسبه بنفسه من المنتج مباشرة عشان الأمان.
      items: items.map((item) => ({
        product_id: item.product,
        quantity: item.quantity,
        color_id: item.color || null,
      })),
    }

    console.log("Sending order:", orderData)

    try {
      // ✅ الراوت الصحيح المسجل في orders/urls.py هو /api/orders/create/ مش الجذر
      const orderUrl = `${API_BASE_URL}/api/orders/create/`
      console.log("Sending order to:", orderUrl)
      const response = await fetch(orderUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(orderData),
      })

      const rawText = await response.text()
      console.log("Order response status:", response.status, "body:", rawText)
      let data = {}
      if (rawText) {
        try {
          data = JSON.parse(rawText)
        } catch {
          data = {}
        }
      }

      if (!response.ok) {
        // ✅ 401 لوحده معناه إن التوكن غلط/منتهي فعلاً، فده اللي المفروض
        // يوجه لتسجيل الدخول - مش أي خطأ تاني
        if (response.status === 401) {
          alert(isAr ? "انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مرة أخرى" : "Session expired, please login again")
          navigate("/login")
          return false
        }

        // ✅ استخراج الرسالة الحقيقية سواء جاية كـ {"error": "..."} من الـ view
        // أو كأخطاء validation لكل حقل من الـ serializer (زي {"phone": ["..."]})
        let message = data.error || data.message || data.detail
        if (!message) {
          const firstFieldError = Object.values(data || {})[0]
          message = Array.isArray(firstFieldError) ? firstFieldError[0] : firstFieldError
        }
        // ✅ لو مفيش رسالة خالص (مثلاً الرد رجع HTML بدل JSON، زي صفحة 404 من فايت
        // نفسه لو الرابط غلط) بنوضح ده صراحة بدل رسالة عامة تتكرر من غير فايدة
        if (!message) {
          message = isAr
            ? `تعذر الوصول للسيرفر (كود ${response.status})، تأكدي إن رابط الـ API صحيح`
            : `Could not reach the server (status ${response.status}), check the API URL`
        }
        throw new Error(message)
      }

      // تفريغ السلة بعد نجاح الطلب
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
    // التحقق من صحة البيانات
    if (!form.fullName) {
      alert(isAr ? "الرجاء إدخال الاسم الكامل" : "Please enter your full name")
      return
    }
    if (!form.phone) {
      alert(isAr ? "الرجاء إدخال رقم الجوال" : "Please enter your mobile number")
      return
    }
    if (!form.city) {
      alert(isAr ? "الرجاء اختيار المدينة" : "Please select a city")
      return
    }
    if (!form.address) {
      alert(isAr ? "الرجاء إدخال العنوان التفصيلي" : "Please enter your address details")
      return
    }
    if (!shippingMethod) {
      alert(isAr ? "الرجاء اختيار طريقة الشحن" : "Please select a shipping method")
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

  // عرض المنتجات في مراجعة الطلب
  // ملاحظة: item.product و item.color راجعين من الباك إند كـ IDs بس (مش objects)
  // الاسم/السعر/الصورة موجودين في حقول منفصلة: product_name, product_price, product_detail
  // ✅ السعر المكتوب دلوقتي هو سعر القطعة الواحدة بس (من غير ضرب في الكمية)،
  // والكمية نفسها بقت شارة "xN" فوق صورة المنتج بدل سطر "الكمية × السعر"
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
            <div key={item.id || idx} className={`flex gap-3 py-3 ${isAr ? "flex-row-reverse" : ""} ${idx !== items.length - 1 ? "border-b border-black/5 dark:border-white/5" : ""}`}>
              {/* صورة أكبر وأوضح زي نون */}
              <div className="relative w-[140px] h-[140px] bg-white dark:bg-[#1a1a1a] rounded-[14px] shrink-0 flex items-center justify-center overflow-hidden border border-black/5 dark:border-white/5">
                <img
                  src={image || "https://placehold.co/140x140/e8ddd4/8a6a4a?text=No+Image"}
                  alt={name}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => { e.target.src = "https://placehold.co/140x140/e8ddd4/8a6a4a?text=No+Image" }}
                />
                {/* شارة الكمية xN فوق الصورة */}
                {item.quantity > 1 && (
                  <span className={`absolute top-1 ${isAr ? "left-1" : "right-1"} bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md`}>
                    x{item.quantity}
                  </span>
                )}
              </div>
              {/* الاسم فوق، واللون تحته، والسعر في آخر نقطة تحت (بنفس ارتفاع الصورة) */}
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

  // ── محتوى مودال العنوان (يفتح فوق الصفحة كلها بدل التوسيع جوه السكشن) ──
  // ملحوظة مهمة: ده لازم يفضل متغير JSX عادي، مش function component (زي () => (...))
  // لو اتحول لـ function component بيتعرّف جوه الـ render، React هيعتبره نوع component جديد
  // كل مرة، وهيهدم كل الـ inputs جوّاه ويبنيها من الصفر كل ضغطة زرار (عشان كده كان السهم بيطير)
  const addressModalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeAddressModal}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#111] rounded-[24px] w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6"
      >
        {/* رأس المودال */}
        <div className={`flex items-center justify-between mb-5 ${isAr ? "flex-row-reverse" : ""}`}>
          <h3 className="font-bold text-black dark:text-white text-lg">
            {addressModalView === "list"
              ? t.modalTitleList
              : (savedAddress ? t.modalTitleEdit : t.modalTitleAdd)}
          </h3>
          <button
            onClick={closeAddressModal}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <FiX className="text-black dark:text-white text-lg" />
          </button>
        </div>

        {/* ── شاشة دليل العناوين: بتظهر لو فيه عنوان محفوظ أصلاً وضغط "تغيير" ── */}
        {addressModalView === "list" && (
          <>
            <p className={`text-xs text-gray-400 mb-3 ${isAr ? "text-right" : "text-left"}`}>
              {t.addressBookLabel} (1)
            </p>

            <div className={`flex items-start justify-between gap-3 border-2 border-[#D9A066] bg-[#D9A066]/5 rounded-[16px] p-4 mb-4 ${isAr ? "flex-row-reverse text-right" : "text-left"}`}>
              <div className="flex-1">
                <p className="font-bold text-black dark:text-white text-sm mb-1">{form.fullName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {form.phoneCode}{form.phone} {form.city ? `— ${form.city}` : ""}{form.address ? ` — ${form.address}` : ""}
                </p>
                <button
                  onClick={openEditAddressForm}
                  className="text-[#D9A066] text-xs font-semibold mt-2 hover:underline"
                >
                  {t.changeAddress}
                </button>
              </div>
            </div>

            <button
              onClick={openAddNewAddressForm}
              className={`flex items-center gap-2 text-[#D9A066] font-semibold text-sm mb-6 ${isAr ? "flex-row-reverse" : ""}`}
            >
              <span className="w-6 h-6 rounded-full border-2 border-[#D9A066] flex items-center justify-center text-base leading-none">+</span>
              {t.addNewAddress}
            </button>

            <div className={`flex gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
              <button
                onClick={closeAddressModal}
                className="flex-1 bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold text-sm py-3 rounded-full transition"
              >
                {t.selectAddress}
              </button>
              <button
                onClick={closeAddressModal}
                className="flex-1 border border-black/10 dark:border-white/10 text-black dark:text-white font-semibold text-sm py-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                {t.cancel}
              </button>
            </div>
          </>
        )}

        {/* ── شاشة الفورم: إضافة عنوان جديد أو تعديل عنوان موجود ── */}
        {addressModalView === "form" && (
          <>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 ${isAr ? "text-right" : "text-left"}`}>
              <div>
                <label className="text-sm font-semibold text-black dark:text-white mb-1.5 block">{t.fullName}</label>
                <input
                  name="fullName"
                  value={draftForm.fullName}
                  onChange={handleDraftChange}
                  placeholder={t.fullNamePh}
                  className={`w-full bg-[#F7F2EE] dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-[12px] px-4 py-3 text-sm text-black dark:text-white placeholder:text-gray-400 outline-none focus:border-[#D9A066] transition ${isAr ? "text-right" : "text-left"}`}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-black dark:text-white mb-1.5 block">{t.mobile}</label>
                <div className={`flex gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                  <select
                    value={draftForm.phoneCode}
                    onChange={e => setDraftForm({ ...draftForm, phoneCode: e.target.value })}
                    className="bg-[#F7F2EE] dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-[12px] px-3 py-3 text-sm text-black dark:text-white outline-none focus:border-[#D9A066] transition shrink-0"
                  >
                    {PHONE_CODES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input
                    name="phone"
                    value={draftForm.phone}
                    onChange={handleDraftChange}
                    placeholder={t.mobilePh}
                    className={`flex-1 bg-[#F7F2EE] dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-[12px] px-4 py-3 text-sm text-black dark:text-white placeholder:text-gray-400 outline-none focus:border-[#D9A066] transition ${isAr ? "text-right" : "text-left"}`}
                  />
                </div>
              </div>
            </div>

            <div className={`mb-4 ${isAr ? "text-right" : "text-left"}`}>
              <label className="text-sm font-semibold text-black dark:text-white mb-1.5 block">{t.emailOpt}</label>
              <input
                name="email"
                value={draftForm.email}
                onChange={handleDraftChange}
                placeholder={t.emailPh}
                className={`w-full bg-[#F7F2EE] dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-[12px] px-4 py-3 text-sm text-black dark:text-white placeholder:text-gray-400 outline-none focus:border-[#D9A066] transition ${isAr ? "text-right" : "text-left"}`}
              />
            </div>

            <div className={`mb-4 ${isAr ? "text-right" : "text-left"}`}>
              <label className="text-sm font-semibold text-black dark:text-white mb-1.5 block">{t.cityLabel}</label>
              <select
                name="city"
                value={draftForm.city}
                onChange={handleDraftChange}
                className={`w-full bg-[#F7F2EE] dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-[12px] px-4 py-3 text-sm text-black dark:text-white outline-none focus:border-[#D9A066] transition ${isAr ? "text-right" : "text-left"}`}
              >
                <option value="">{t.cityPh}</option>
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className={`mb-4 ${isAr ? "text-right" : "text-left"}`}>
              <label className="text-sm font-semibold text-black dark:text-white mb-1.5 block">{t.addressLabel}</label>
              <textarea
                name="address"
                value={draftForm.address}
                onChange={handleDraftChange}
                placeholder={t.addressPh}
                rows={3}
                className={`w-full bg-[#F7F2EE] dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-[12px] px-4 py-3 text-sm text-black dark:text-white placeholder:text-gray-400 outline-none focus:border-[#D9A066] transition resize-none ${isAr ? "text-right" : "text-left"}`}
              />
            </div>

            <label className={`flex items-center gap-2 cursor-pointer mb-6 ${isAr ? "flex-row-reverse justify-end" : ""}`}>
              <input
                type="checkbox"
                checked={draftForm.saveAddress}
                onChange={() => setDraftForm({ ...draftForm, saveAddress: !draftForm.saveAddress })}
                className="accent-[#D9A066] w-4 h-4"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.saveAddr}</span>
            </label>

            <div className={`flex gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
              <button
                onClick={handleSaveAddress}
                disabled={isSavingAddress}
                className={`flex-1 bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold text-sm py-3 rounded-full transition flex items-center justify-center gap-2 ${isSavingAddress ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isSavingAddress && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {t.useThisAddress}
              </button>
              <button
                onClick={() => savedAddress ? setAddressModalView("list") : closeAddressModal()}
                disabled={isSavingAddress}
                className="flex-1 border border-black/10 dark:border-white/10 text-black dark:text-white font-semibold text-sm py-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                {t.cancel}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-[#F7F2EE] dark:bg-[#050505] transition-all duration-500">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-28 lg:pb-12">

        {/* ✅ بترص فوق بعض على الموبايل والتابلت (ملخص الطلب تحت الفورم)، وجنب بعض من lg فأكبر */}
        <div className={`flex flex-col ${isAr ? "lg:flex-row-reverse" : "lg:flex-row"} gap-6 items-start`}>

          {/* LEFT — FORM (Shipping Info + Shipping Method + Payment) */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-4">

            {/* SECTION 1 — Shipping Info — بشكل صف "التوصيل إلى" زي نون: أيقونة موقع + العنوان + سهم */}
            <div className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[20px] px-4 sm:px-6">
              <SectionHeader title={t.s1} />
              <div className="pb-4">
                {/* ── حالة التحميل ── */}
                {addressLoading && (
                  <p className="text-sm text-gray-400 py-2">{t.addressLoadingTxt}</p>
                )}

                {/* ── فيه عنوان محفوظ: صف بأيقونة موقع، بيفتح مودال العنوان ── */}
                {!addressLoading && savedAddress && (
                  <button
                    onClick={openAddressModal}
                    className={`w-full flex items-center gap-3 bg-[#F7F2EE] dark:bg-[#1a1a1a] rounded-[14px] px-3.5 sm:px-4 py-3 ${isAr ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#D9A066]/10 flex items-center justify-center shrink-0">
                      <FiMapPin className="text-[#D9A066]" />
                    </div>
                    <div className={`flex-1 min-w-0 ${isAr ? "text-right" : "text-left"}`}>
                      <p className="font-bold text-black dark:text-white text-sm mb-0.5">{form.fullName}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed truncate">
                        {form.phoneCode}{form.phone} {form.city ? `— ${form.city}` : ""}{form.address ? ` — ${form.address}` : ""}
                      </p>
                    </div>
                  </button>
                )}

                {/* ── مفيش عنوان محفوظ خالص: زرار إضافة بيفتح نفس المودال ── */}
                {!addressLoading && !savedAddress && (
                  <button
                    onClick={openAddressModal}
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
                {[
                  { key: "fast", icon: <FaTruck />, title: t.fastShipTitle, sub: t.fastShipSub, price: t.fastPrice, priceClass: "text-black dark:text-white" },
                  { key: "standard", icon: <MdOutlineLocalShipping />, title: t.stdShipTitle, sub: t.stdShipSub, price: t.stdPrice, priceClass: "text-green-500" },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setShippingMethod(opt.key)}
                    className={`w-full flex items-center justify-between px-3.5 sm:px-5 py-3.5 sm:py-4 rounded-[16px] border-2 transition-all duration-200 ${shippingMethod === opt.key
                      ? "border-[#D9A066] bg-[#D9A066]/5"
                      : "border-black/10 dark:border-white/10 bg-[#F7F2EE] dark:bg-[#1a1a1a]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${shippingMethod === opt.key ? "border-[#D9A066]" : "border-gray-300 dark:border-gray-600"}`}>
                        {shippingMethod === opt.key && <div className="w-2.5 h-2.5 rounded-full bg-[#D9A066]" />}
                      </div>
                      <div className="text-[#D9A066] text-lg sm:text-xl shrink-0">{opt.icon}</div>
                      <div className={isAr ? "text-right" : "text-left"}>
                        <p className="font-semibold text-black dark:text-white text-xs sm:text-sm">{opt.title}</p>
                        <p className="text-[11px] sm:text-xs text-gray-400">{opt.sub}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-xs sm:text-sm shrink-0 ${opt.priceClass}`}>
                      {opt.price}
                    </span>
                  </button>
                ))}
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

          {/* RIGHT — كارتين منفصلين: المنتجات لوحده، والإجمالي لوحده
              ✅ عرض كامل تحت الفورم على الموبايل/التابلت، وعمود ثابت بجانبه من lg فأكبر */}
          <div className="w-full lg:w-[420px] lg:shrink-0 flex flex-col gap-4 lg:sticky lg:top-[110px]">

            {/* عنوان "ملخص الطلب" برا الكارت — محاذي لأقصى اليمين في العربي */}
            <div className={`flex items-center gap-2 px-1 w-full ${isAr ? "justify-end" : "justify-start"}`}>
              <h2 className="font-bold text-black dark:text-white text-base sm:text-lg">
                {t.reviewTitle} <span className="text-[#D9A066]">({totalQuantity} {t.products})</span>
              </h2>
            </div>

            {/* كارت المنتجات */}
            <div className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[24px] p-5 sm:p-7">
              {renderOrderReview()}
            </div>

            {/* كارت الإجمالي والدفع — ✅ يظهر بس من lg فأكبر، وعلى الموبايل/التابلت البار
                السفلي الثابت بيغطي مكانه (إجمالي + زرار تأكيد) */}
            <div className="hidden lg:block bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[24px] p-5 sm:p-7">

              {/* رأس الكارت: عنوان "ملخص الدفع" + عدد المنتجات (جنب بعض مباشرة) */}
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-bold text-black dark:text-white text-base sm:text-lg">{t.paymentSummary}</h2>
                <span className="bg-[#F7F2EE] dark:bg-[#1a1a1a] text-gray-400 text-xs font-medium px-3 py-1.5 rounded-full">
                  {totalQuantity} {t.products}
                </span>
              </div>

              {/* Totals breakdown */}
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
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t.taxLabel}</span>
                  <span className="text-black dark:text-white font-semibold text-sm">{tax.toFixed(2)} {t.currency}</span>
                </div>

                {/* الإجمالي: بقى في الآخر بعد الضريبة */}
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-black/5 dark:border-white/5">
                  <span className="font-bold text-black dark:text-white text-sm sm:text-base">{t.totalLabel}</span>
                  <span className="font-bold text-[#D9A066] text-lg sm:text-xl">{total.toFixed(2)} {t.currency}</span>
                </div>
              </div>

              {/* Coupon */}
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

              {/* Confirm Order Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={isProcessing || items.length === 0}
                className={`w-full flex items-center justify-center gap-2 bg-[#D9A066] hover:bg-[#c98d54] text-white font-bold text-sm sm:text-base py-3 sm:py-3.5 rounded-full transition-all duration-300 hover:scale-[1.02] shadow-[0_8px_25px_rgba(217,160,102,0.4)] ${(isProcessing || items.length === 0) ? "opacity-70 cursor-not-allowed hover:scale-100" : ""} ${isAr ? "flex-row-reverse" : ""}`}
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

            {/* Contact — مخفي على الموبايل/التابلت عشان الصفحة تفضل مركّزة على الطلب زي نون */}
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

      {/* ✅ بار سفلي ثابت للموبايل/التابلت بس (زي نون): عدد المنتجات + الإجمالي، وزرار تأكيد الطلب.
          من lg فأكبر مختفي لأن كارت الإجمالي والدفع الجانبي ظاهر أصلاً */}
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

      {/* المودال المنبثق لإضافة/تعديل عنوان الشحن — بيفتح فوق الصفحة كلها بدل التوسيع جوه السكشن */}
      <AnimatePresence>
        {addressModalOpen && addressModalContent}
      </AnimatePresence>
    </div>
  )
}