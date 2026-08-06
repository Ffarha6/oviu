import { useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import BottomNav from "./BottomNav"

function Layout({ children }) {
  const location = useLocation()
  // ✅ صفحات السلة والشيك أوت بقى ليهم بار سفلي ثابت (إجمالي + زرار) على الموبايل/التابلت
  // زي نون، فمينفعش الفوتر العادي أو الـ BottomNav العام يبانوا تحته/جنبه هناك —
  // بيتشالوا بس على الموبايل، ويفضلوا ظاهرين عادي على الديسكتوب
  const hideMobileBottomBar = ["/cart", "/checkout"].includes(location.pathname)

  return (
    <>
      <Navbar />
      {/*
        ✅ FIX: بدل الرقم الثابت المخمّن (كان فيه شريط علوي 36px اتشال من
        Navbar.jsx زمان بس الرقم فضل زي ما هو هنا، فكان بيحجز مساحة لحاجة مش
        موجودة أصلاً وده اللي كان بيبين كفراغ فاضي فوق كل صفحة). دلوقتي
        Navbar.jsx نفسه بيقيس ارتفاعه الحقيقي أول ما يترسم، وأي مرة يتغيّر
        فيها (زي طي شريط التصنيفات وقت السكرول، أو اختفاء شريط الفئات خالص
        على الموبايل)، وبيحطه في متغير CSS مشترك اسمه --navbar-height. إحنا
        هنا بنقرأ نفس المتغير ده بدل رقم ثابت (على الموبايل والديسكتوب
        الاتنين)، فمهما اتغيّر شكل الـ Navbar مستقبلًا، المسافة هتتظبط
        تلقائيًا لوحدها من غير ما حد يحتاج يرجع يعدّل رقم يدويًا في أي مكان.
        الـ fallback (168px) بيستخدم بس في اللحظة الأولى قبل ما الـ Navbar
        يترسم ويحسب ارتفاعه الفعلي، عشان مايحصلش قفزة واضحة في المحتوى.

        ✅ ضفنا كمان padding-bottom على الموبايل بس (pb-20) عشان محتوى الصفحة
        مايختفيش تحت الـ BottomNav الجديد الثابت تحت، وشيلناه في صفحات
        السلة/الشيك أوت لأنهم ليهم بار سفلي خاص بيهم مختلف
      */}
      <main
  className={`overflow-x-hidden w-full ${hideMobileBottomBar ? "" : "pb-20 lg:pb-0"}`}
  style={{
  paddingTop: window.innerWidth >= 1024
    ? "100px"
    : "var(--navbar-height, 132px)"
}}
>
  {children}
</main>
      <div className={hideMobileBottomBar ? "hidden lg:block" : ""}>
        <Footer />
      </div>
      {!hideMobileBottomBar && <BottomNav />}
    </>
  )
}

export default Layout