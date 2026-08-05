import { useContext } from "react"
import { Link, useLocation } from "react-router-dom"
import { FaHome, FaThLarge, FaPercent, FaUser, FaShoppingCart } from "react-icons/fa"
import { LanguageContext } from "../../context/LanguageContext"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { FaHeart } from "react-icons/fa"
import { useSettings } from "../../context/SettingsContext"

function BottomNav() {
  const location = useLocation()
  const { language } = useContext(LanguageContext)
  const { cartCount } = useCart()
  const { user } = useAuth()
  const { settings } = useSettings()
  const isAr = language === "ar"

  const t = {
    ar: { home: "الرئيسية", categories: "الفئات", offers: "العروض", account: "حسابي", cart: "السلة" },
    en: { home: "Home", categories: "Categories", offers: "Offers", account: "Account", cart: "Cart" },
  }[language]

  // ✅ الفئات بقت تفتح نفس الدرج الجانبي اللي بيفتحه زرار الهامبرجر بدل ما
  // تودي لصفحة معينة، عن طريق حدث مخصص (custom event) بيسمعه الـ Navbar
  const openCategoriesDrawer = () => {
    window.dispatchEvent(new CustomEvent("open-mobile-menu"))
  }

  // ✅ حسابي في النص (مكان العروض القديم)، والعروض مكان حسابي القديم
  const items = [
  {
    key: "home",
    icon: FaHome,
    path: "/",
    label: t.home,
    active: location.pathname === "/",
  },

  {
    key: "categories",
    icon: FaThLarge,
    label: t.categories,
    active: false,
    onClick: openCategoriesDrawer,
  },

  {
    key: "account",
    icon: FaUser,
    path: user ? "/profile" : "/login",
    label: t.account,
    active:
      location.pathname.startsWith("/profile") ||
      location.pathname.startsWith("/login"),
  },

  settings?.enable_offers
    ? {
        key: "offers",
        icon: FaPercent,
        path: "/offers",
        label: t.offers,
        active: location.pathname.startsWith("/offers"),
      }
    : {
        key: "wishlist",
        icon: FaHeart,
        path: "/wishlist",
        label: language === "ar" ? "المفضلة" : "Wishlist",
        active: location.pathname.startsWith("/wishlist"),
      },

  {
    key: "cart",
    icon: FaShoppingCart,
    path: "/cart",
    label: t.cart,
    active: location.pathname.startsWith("/cart"),
    badge: cartCount,
  },
]

  return (
    <nav
      dir={isAr ? "rtl" : "ltr"}
      className="
        lg:hidden fixed bottom-0 inset-x-0 z-40
        bg-white dark:bg-[#111]
        border-t border-gray-100 dark:border-gray-800
        flex items-stretch justify-around
        pb-[env(safe-area-inset-bottom)]
      "
    >
      {items.map((item) => {
        const Icon = item.icon
        const className = `
          flex-1 flex flex-col items-center justify-center gap-0.5
          py-2 text-[11px] font-medium transition
          ${item.active ? "text-[#C89072]" : "text-gray-500 dark:text-gray-400"}
        `
        const content = (
          <>
            <div className="relative">
              <Icon className="text-xl" />
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#C89072] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </>
        )

        // ✅ عنصر "الفئات" بقاله onClick بدل ما يكون Link عادي — بيفتح الدرج
        // بدل ما ينتقل لصفحة تانية
        if (item.onClick) {
          return (
            <button key={item.key} onClick={item.onClick} className={className}>
              {content}
            </button>
          )
        }

        return (
          <Link key={item.key} to={item.path} className={className}>
            {content}
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNav