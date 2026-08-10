import { useSettings } from "../../context/SettingsContext";
import logo from "../../assets/images/logo.png"
import { LanguageContext } from "../../context/LanguageContext"
import { ThemeContext } from "../../context/ThemeContext"
import { useContext, useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { FiSearch, FiX } from "react-icons/fi"
import { FaHeart, FaShoppingCart, FaUser, FaBars, FaMapMarkerAlt, FaBox, FaChevronDown, FaCog, FaSignOutAlt } from "react-icons/fa"
import { IoSunnyOutline } from "react-icons/io5"
import { HiOutlineMoon } from "react-icons/hi"
import SearchModal from "./SearchModal"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"   // ✅ إضافة جديدة

const categoryRoutes = {
  "الرئيسية":       "/",
  "نظارات شمسية":   "/glasses/sunglasses",
  "نظارات طبية":    "/glasses/medical",
  "نظارات قراءة":   "/glasses/reading",
  "عدسات":          "/glasses/lenses",
  "تجربة افتراضية": "/virtual-tryon",
  "العروض":         "/offers",
  "تواصل معنا":     null,

  "Home":            "/",
  "Sunglasses":      "/glasses/sunglasses",
  "medical":         "/glasses/medical",
  "Reading Glasses": "/glasses/reading",
  "Contact Lenses":  "/glasses/lenses",
  "Virtual Try-On":  "/virtual-tryon",
  "Offers":          "/offers",
  "Contact Us":      null,
}

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language, setLanguage } = useContext(LanguageContext)
  const { darkMode, setDarkMode } = useContext(ThemeContext)
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const { settings } = useSettings();   // ✅ logout إضافة جديدة عشان زرار تسجيل الخروج جوه الـ dropdown
  useEffect(() => {
  if (!settings) return;

  if (!settings.enable_multilanguage && language !== "ar") {
    setLanguage("ar");
  }
}, [settings, language, setLanguage]);


useEffect(() => {
  if (!settings) return;

  if (!settings.enable_dark_mode && darkMode) {
    setDarkMode(false);
  }
}, [settings, darkMode, setDarkMode]);


  // ✅ FIX: نعرض الاسم الكامل (الأول + العائلة) لو موجود، ولو مش موجود
  // نرجع لليوزرنيم، ولو برضو مش موجود نرجع للإيميل كحل أخير.
  const displayName = user
    ? (
        [user.first_name, user.last_name].filter(Boolean).join(" ").trim()
        || user.username
        || user.email
      )
    : ""

  // الحروف الأولى من الاسم لصورة الأفاتار الدائرية جوه الـ dropdown
  const initials = displayName
    ? displayName.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "U"

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  // ✅ القائمة المنسدلة بتاعة البروفايل: بتتفتح بالضغط (click) مش بالـ hover
  // وبترتسم عن طريق Portal مباشرة في نهاية الصفحة (document.body)، عشان
  // مستحيل أي حاوية عندها overflow-hidden (زي أي navbar مكرر جوه صفحة معينة)
  // تقدر تقصها أو تخبيها — الحل ده مش معتمد على مكان الـ Navbar في الصفحة خالص
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, right: 0 })
  const triggerRef = useRef(null)   // الزرار (الاسم + السهم) اللي بيفتح القائمة
  const dropdownRef = useRef(null)  // القائمة نفسها بعد ما تترسم في الـ portal
  // ✅ شريط التصنيفات يتطوى تلقائي لما ننزل تحت في الصفحة، ويرجع يظهر تاني لما نطلع فوق
  const [categoriesVisible, setCategoriesVisible] = useState(true)
  const navbarRef = useRef(null)

  // ✅ FIX: الحل الجذري لمشكلة "المسافة الفاضية فوق الصفحة". بدل ما Layout.jsx
  // يحجز مساحة برقم ثابت مخمّن (كان فيه شريط علوي 36px اتشال من هنا زمان بس
  // الرقم فضل زي ما هو في Layout، فبقى بيحجز مساحة لحاجة مش موجودة أصلاً)،
  // دلوقتي بنحسب الارتفاع الحقيقي مباشرة من نفس القيم اللي إحنا عارفينها
  // (ارتفاع الشريط الرئيسي + شريط التصنيفات) ومربوطة بنفس الـ state اللي
  // بيتحكم في ظهورهم فعليًا، بدل ما "نقيس" العنصر بعد ما يترسم (وده كان بيدي
  // نتيجة غلط أحيانًا بسبب فرق التوقيت بين لحظة الترسيم ولحظة القياس).
  // بنحطها في متغير CSS مشترك اسمه --navbar-height، والـ Layout.jsx بيقرأ
  // نفس المتغير ده بدل رقم ثابت
  useEffect(() => {
  const updateNavHeight = () => {
    if (!navbarRef.current) return;

    document.documentElement.style.setProperty(
      "--navbar-height",
      `${navbarRef.current.offsetHeight}px`
    );
  };

  updateNavHeight();

  window.addEventListener("resize", updateNavHeight);

  return () => {
    window.removeEventListener("resize", updateNavHeight);
  };
}, [categoriesVisible]);

  useEffect(() => {
    let lastY = window.scrollY
    const SHOW_THRESHOLD = 120 // متطويش إلا بعد ما ننزل شوية، مش من أول سكرول
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY <= SHOW_THRESHOLD) {
        setCategoriesVisible(true)
      } else if (currentY > lastY) {
        setCategoriesVisible(false) // نازل لتحت → يطوي
      } else if (currentY < lastY) {
        setCategoriesVisible(true) // طالع لفوق → يظهر
      }
      lastY = currentY
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // ✅ قفل القائمة المنسدلة لو المستخدم دس في أي مكان برّاها (برّا الزرار وبرّا القائمة نفسها)
  useEffect(() => {
    if (!profileMenuOpen) return
    const handleClickOutside = (e) => {
      const clickedTrigger = triggerRef.current && triggerRef.current.contains(e.target)
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(e.target)
      if (!clickedTrigger && !clickedDropdown) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [profileMenuOpen])

  // ✅ لو الشاشة اتغير حجمها والقائمة مفتوحة، نقفلها بدل ما تفضل في مكان غلط
  // (موضعها محسوب مرة واحدة وقت الفتح بس)
  useEffect(() => {
    if (!profileMenuOpen) return
    const handleResize = () => setProfileMenuOpen(false)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [profileMenuOpen])

  // ✅ بيسمح لأي حتة تانية في التطبيق (زي أيقونة "الفئات" في BottomNav) إنها
  // تفتح الدرج الجانبي من غير ما تحتاج ترتبط مباشرة بالـ state بتاعه، بنفس
  // فكرة حدث "open-chatbot" الموجود أصلاً لزرار "تواصل معنا"
  useEffect(() => {
    const openMenu = () => setMenuOpen(true)
    window.addEventListener("open-mobile-menu", openMenu)
    return () => window.removeEventListener("open-mobile-menu", openMenu)
  }, [])

  // ✅ فتح/قفل القائمة، وحساب مكانها بالظبط تحت الزرار (بما إنها بقت في الـ body
  // مش جوه الزرار، لازم نحسب الإحداثيات يدويًا وقت الفتح)
  const toggleProfileMenu = () => {
    if (!profileMenuOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 6,
        left: rect.left,
        right: window.innerWidth - rect.right,
      })
    }
    setProfileMenuOpen(o => !o)
  }

  const t = {
    ar: {
      search: "ما الذي تبحث عنه؟",
      login: "تسجيل الدخول",
      orders: "الطلبيات",
      wishlist: "المفضلة",
      cart: "عربتي",
      city: "القاهرة",
      darkModeLabel: "المظهر الداكن",
      langLabel: "اللغة",
      myProfile: "الملف الشخصي",
      addresses: "العناوين",
      settings: "الإعدادات",
      logout: "تسجيل الخروج",
      welcome: "أهلاً",
      cats: [
        "الرئيسية",
        "نظارات شمسية",
        "نظارات طبية",
        "نظارات قراءة",
        "عدسات",
        "تجربة افتراضية",
        "العروض",
        "تواصل معنا",
      ],
    },
    en: {
      search: "What are you looking for?",
      login: "Sign In",
      orders: "Orders",
      wishlist: "Wishlist",
      cart: "Cart",
      city: "Cairo",
      darkModeLabel: "Dark Mode",
      langLabel: "Language",
      myProfile: "My Profile",
      addresses: "Addresses",
      settings: "Settings",
      logout: "Sign Out",
      welcome: "Hi,",
      cats: [
        "Home",
        "Sunglasses",
        "Optical",
        "Reading Glasses",
        "Contact Lenses",
        "Virtual Try-On",
        "Offers",
        "Contact Us",
      ],
    },
  }[language]

  const isAr = language === "ar"

  const isActiveCat = (cat) => {
    const route = categoryRoutes[cat]
    if (!route) return false
    if (route === "/") return location.pathname === "/"
    return location.pathname.startsWith(route)
  }

  const handleCatClick = (cat) => {
    if (cat === "تواصل معنا" || cat === "Contact Us") {
      window.dispatchEvent(new CustomEvent("open-chatbot"))
      setMenuOpen(false)
      return
    }
    const route = categoryRoutes[cat]
    if (route) {
      navigate(route)
      setMenuOpen(false)
    }
  }

  // ✅ بدل ما نروح لصفحة /orders منفصلة، بنفتح تاب "طلباتي" جوه صفحة البروفايل
  const goToOrders = () => {
    navigate("/profile", { state: { tab: "orders" } })
    setMenuOpen(false)
    setProfileMenuOpen(false)
  }

  // ✅ تسجيل الخروج من جوه الـ dropdown
  const handleLogout = () => {
    setProfileMenuOpen(false)
    logout()
    navigate("/")
  }

  // زرار تبديل الدارك مود — مستخدم في الشريط الرئيسي (ديسكتوب) وفي قائمة الهامبرجر (موبايل)
  const DarkModeToggle = ({ className = "", colorClass = "text-gray-600 dark:text-gray-300" }) => (
    <button
      onClick={() => setDarkMode(!darkMode)}
      aria-label="تغيير المظهر"
      className={`
        flex items-center justify-center
        w-10 h-10 md:w-11 md:h-11 rounded-xl
        ${colorClass}
        ${className}
      `}
    >
      {darkMode
        ? <IoSunnyOutline className="text-xl" />
        : <HiOutlineMoon className="text-xl" />
      }

      
    </button>
  )



  const categories = t.cats.filter((cat) => {
  const isTryOn =
    cat === "تجربة افتراضية" || cat === "Virtual Try-On";

  const isOffers =
    cat === "العروض" || cat === "Offers";

  if (isTryOn && !settings?.show_virtual_tryon_in_navbar) {
    return false;
  }

  if (isOffers && !settings?.enable_offers) {
    return false;
  }

  return true;
});

  return (
    <div 
   ref={navbarRef}
    className="fixed top-0 left-0 w-full z-50 overflow-x-hidden overflow-y-visible" dir={isAr ? "rtl" : "ltr"}>

      {/* ── Main navbar — شريط مميز بلون الهوية زي نون ── */}
      <div
  
  className="
    bg-secondary
    shadow-sm px-3 md:px-6 h-16 md:h-20
        flex items-center justify-between gap-2 md:gap-4
      ">

        {/* ✅ Hamburger — موبايل فقط، وثابت على اليمين دايمًا بفضل order-1.
            lg:order-none بترجعه لترتيبه الطبيعي في الديسكتوب (مش هيبان أصلاً
            لأنه lg:hidden، بس بنرجعه احتياطًا عشان الـ order ميأثرش على حاجة تانية) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="
            lg:hidden order-1 lg:order-none
            p-2 rounded-xl transition shrink-0
            text-white
            hover:bg-white/15
          "
        >
          <FaBars className="text-xl" />
        </button>

        {/* Logo — على الموبايل بقى آخر عنصر (order-3) عشان يترسم في الناحية
            التانية من الهامبرجر (الشمال في RTL)، وفي الديسكتوب بيرجع لترتيبه
            الطبيعي الأول (lg:order-none) زي ما كان بالظبط */}
        <Link to="/" className="order-3 lg:order-none shrink-0 flex items-center">
          <img src={logo} alt="oviu" className="h-9 md:h-14 object-contain" />
        </Link>

        {/* Location — جمب اللوجو، ديسكتوب فقط */}
        <button className="
          hidden md:flex lg:order-none flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition text-sm shrink-0
          text-white
          hover:bg-white/15
        ">
          <FaMapMarkerAlt className="text-xl" />
          <span>{t.city}</span>
        </button>

        {/* Search — في النص بين الهامبرجر واللوجو على الموبايل بفضل order-2 */}
        <div
          onClick={() => setSearchOpen(true)}
          className="
            order-2 lg:order-none
            flex-1 flex items-center gap-2 md:gap-3
            bg-gray-50 dark:bg-white
            border border-gray-200 dark:border-gray-200
            rounded-full px-3 md:px-5 h-10 md:h-12 cursor-pointer
            hover:border-[#C89072] transition
            min-w-0
          "
        >
          <FiSearch className="text-gray-400 text-lg md:text-xl shrink-0" />
          <span className="text-xs md:text-sm text-gray-400 dark:text-gray-500 truncate">
            {t.search}
          </span>
        </div>

        {/* Actions — دلوقتي على الموبايل بتبقى فاضية فعليًا (كل عناصرها hidden md:)
            بعد ما نقلنا الهامبرجر برّاها، وده مقصود عشان الهامبرجر يفضل في
            مكانه الصحيح على أقصى اليمين في العربي */}
        <div className="flex items-center gap-0.5 md:gap-1 shrink-0">

          {/* ✅ Login / Username — ديسكتوب فقط، القائمة بتفتح بالضغط وبترتسم في الـ body مباشرة (Portal) */}
          {user ? (
            <div className="hidden md:block relative">
              <button
                ref={triggerRef}
                type="button"
                onClick={toggleProfileMenu}
                className="
                  flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition text-sm
                  text-white
                  hover:bg-white/15
                "
              >
                <FaUser className="text-xl" />
                <span className="flex items-center gap-1 max-w-[150px]">
                  <span className="truncate">{t.welcome} {displayName}</span>
                  <FaChevronDown className={`text-[10px] shrink-0 transition-transform duration-200 ${profileMenuOpen ? "rotate-180" : ""}`} />
                </span>
              </button>

              {/* ── Dropdown — بيترسم مباشرة في document.body عن طريق Portal، مش جوه الـ Navbar خالص ──
                  عشان كده مستحيل يتقص أو يتخبى ورا أي حاجة تانية في الصفحة مهما كان شكل باقي الصفحة */}
              {profileMenuOpen && createPortal(
                <div
                  ref={dropdownRef}
                  style={{
                    position: "fixed",
                    top: dropdownPos.top,
                    ...(isAr ? { right: dropdownPos.right } : { left: dropdownPos.left }),
                  }}
                  className="w-80 z-[9999]"
                  dir={isAr ? "rtl" : "ltr"}
                >
                  <div className="
                    bg-white dark:bg-neutral-900
                    border border-gray-100 dark:border-gray-800
                    rounded-2xl shadow-xl overflow-hidden
                  ">
                    {/* Header: أفاتار + الاسم + رابط "الملف الشخصي" تحته (زي نون)، بدل الإيميل */}
                    <Link
                      to="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3.5 px-5 py-5 border-b border-gray-100 dark:border-gray-800 hover:bg-orange-50 dark:hover:bg-gray-800 transition"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C89072] to-[#e0a878] flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0 text-right rtl:text-right">
                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{displayName}</p>
                        <p className="text-xs text-[#C89072] font-medium truncate">{t.myProfile}</p>
                      </div>
                    </Link>

                    {/* Items */}
                    <div className="py-2">
                      <button
                        onClick={goToOrders}
                        className="w-full flex items-center gap-3 px-5 py-3 text-[15px] text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-[#C89072] transition"
                      >
                        <FaBox className="text-lg shrink-0" />
                        {t.orders}
                      </button>

                      <Link
                        to="/wishlist"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-[15px] text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-[#C89072] transition"
                      >
                        <FaHeart className="text-lg shrink-0" />
                        {t.wishlist}
                      </Link>

                      <button
                        onClick={() => { navigate("/profile", { state: { tab: "addresses" } }); setProfileMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-[15px] text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-[#C89072] transition"
                      >
                        <FaMapMarkerAlt className="text-lg shrink-0" />
                        {t.addresses}
                      </button>

                      <button
                        onClick={() => { navigate("/profile", { state: { tab: "settings" } }); setProfileMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-[15px] text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-[#C89072] transition"
                      >
                        <FaCog className="text-lg shrink-0" />
                        {t.settings}
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 dark:border-gray-800 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3 text-[15px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                      >
                        <FaSignOutAlt className="text-lg shrink-0" />
                        {t.logout}
                      </button>
                    </div>
                  </div>
                </div>,
                document.body
              )}
            </div>
          ) : (
            <Link to="/login" className="
              hidden md:flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition text-sm
              text-white
              hover:bg-white/15
            ">
              <FaUser className="text-xl" />
              <span>{t.login}</span>
            </Link>
          )}

          {/* Orders — ديسكتوب فقط — بيفتح تاب الطلبات جوه البروفايل */}
          <button onClick={goToOrders} className="
            hidden md:flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition text-sm
            text-white
            hover:bg-white/15
          ">
            <FaBox className="text-xl" />
            <span>{t.orders}</span>
          </button>

          {/* Wishlist — ديسكتوب فقط */}
          <Link to="/wishlist" className="
            hidden md:flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition text-sm
            text-white
            hover:bg-white/15
          ">
            <FaHeart className="text-xl" />
            <span>{t.wishlist}</span>
          </Link>

          {/* Cart — ديسكتوب فقط، على الموبايل بقت في الـ BottomNav تحت */}
          <Link to="/cart" className="
            hidden md:flex flex-col items-center gap-1 px-2 md:px-3 py-1.5 rounded-xl transition text-sm
            text-white
            hover:bg-white/15
          ">
            <div className="relative">
              <FaShoppingCart className="text-xl md:text-2xl" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -left-2 bg-white text-[#C89072] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden md:block mt-0.5">{t.cart}</span>
          </Link>

          {/* ✅ Dark Mode Toggle — بقى ديسكتوب بس، اتنقل نسخته للموبايل جوه قائمة الهامبرجر
              عشان يفضى مساحة لشريط البحث في الهيدر الضيق */}
          {settings?.enable_dark_mode && (
  <DarkModeToggle
    className="hidden md:flex"
    colorClass="text-white"
  />
)}

          {/* ✅ Language — بقى ديسكتوب بس، نص عادي من غير مربع أو هايلايت، وبيكتب اسم اللغة كامل */}
          {settings?.enable_multilanguage && (
  <button
    onClick={() => setLanguage(isAr ? "en" : "ar")}
    className="
      hidden md:inline-flex
      text-base font-semibold px-2
      text-white
    "
  >
    {isAr ? "English" : "العربية"}
  </button>
)}
        </div>
      </div>

      {/* ── Categories bar — ديسكتوب فقط، بيتطوى تلقائي مع اتجاه السكرول.
          على الموبايل بقى مخفي خالص لأنه موجود جوه الدرج الجانبي بدل كده ── */}
      <div
        className="hidden md:block overflow-hidden transition-[height] duration-300 ease-in-out"
        style={{ height: categoriesVisible ? 52 : 0 }}
      >
        <div
          className="transition-transform duration-300 ease-in-out"
          style={{ transform: categoriesVisible ? "translateY(0)" : "translateY(-100%)" }}
        >
          <div className="
            bg-white dark:bg-black
            border-b border-gray-100 dark:border-gray-800
            px-3 md:px-6 flex items-center overflow-x-auto scrollbar-hide
          ">
            {categories.map((cat, i) => (
              <span
                key={i}
                onClick={() => handleCatClick(cat)}
                className={`
                  px-3 md:px-5 py-3 md:py-4 text-xs md:text-sm font-medium whitespace-nowrap border-b-2 cursor-pointer transition
                  ${isActiveCat(cat)
                    ? "border-[#C89072] text-[#C89072] font-semibold"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-[#C89072] hover:border-[#C89072]"
                  }
                `}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile menu (Drawer) — بيترسم فوق الصفحة كأوفرلاي عن طريق Portal
          بدل ما يدفع محتوى الصفحة لتحت، ومعاه خلفية غامقة شفافة وزرار X للإغلاق ── */}
      {menuOpen && createPortal(
        <div className="lg:hidden fixed inset-0 z-[9999]" dir={isAr ? "rtl" : "ltr"}>

          {/* الخلفية الغامقة الشفافة — الضغط عليها بيقفل الدرج */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />

          {/* الدرج نفسه — بياخد جزء من الشاشة بس (مش كامل العرض) وبيدخل من الجنب */}
          <div className="
            absolute top-0 bottom-0 right-0
            w-[80%] max-w-xs
            bg-white dark:bg-black
            shadow-xl overflow-y-auto
            flex flex-col gap-4 px-6 py-4 text-base text-gray-700 dark:text-gray-300
          ">

            {/* Header فيه زرار الإغلاق X */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <span className="font-bold text-lg text-black dark:text-white">{isAr ? "القائمة الرئيسية" : "Menu"}</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-300"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <button
              onClick={goToOrders}
              className="flex items-center gap-3 cursor-pointer hover:text-[#C89072] transition"
            >
              <FaBox className="text-lg" />
              <span>{t.orders}</span>
            </button>

            <Link
              to="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 cursor-pointer hover:text-[#C89072] transition"
            >
              <FaHeart className="text-lg" />
              <span>{t.wishlist}</span>
            </Link>

            <button className="flex items-center gap-3 cursor-pointer hover:text-[#C89072] transition">
              <FaMapMarkerAlt className="text-lg" />
              <span>{t.city}</span>
            </button>

            <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

           {categories.map((cat, i) => (
              <span
                key={i}
                onClick={() => handleCatClick(cat)}
                className={`cursor-pointer transition ${isActiveCat(cat) ? "text-[#C89072] font-semibold" : "hover:text-[#C89072]"}`}
              >
                {cat}
              </span>
            ))}

            <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

            {/* ✅ الدارك مود واللغة اتنقلوا هنا من الهيدر الرئيسي عشان يوفروا مساحة على الموبايل */}
            {settings?.enable_dark_mode && (
  <div className="flex items-center justify-between">
    <span className="text-sm">{t.darkModeLabel}</span>
    <DarkModeToggle />
  </div>
)}
            {settings?.enable_multilanguage && (
  <div className="flex items-center justify-between">
    <span className="text-sm">{t.langLabel}</span>

    <button
      onClick={() => setLanguage(isAr ? "en" : "ar")}
      className="text-base font-semibold text-gray-600 dark:text-gray-300"
    >
      {isAr ? "English" : "العربية"}
    </button>
  </div>
)}
          </div>
        </div>,
        document.body
      )}

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

export default Navbar