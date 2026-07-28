import { useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"

function Layout({ children }) {
  const location = useLocation()
  // ✅ صفحات السلة والشيك أوت بقى ليهم بار سفلي ثابت (إجمالي + زرار) على الموبايل/التابلت
  // زي نون، فمينفعش الفوتر العادي يبان تحته/جنبه هناك — بيتشال بس على الموبايل،
  // ويفضل ظاهر عادي على الديسكتوب
  const hideFooterOnMobile = ["/cart", "/checkout"].includes(location.pathname)

  return (
    <>
      <Navbar />
      {/*
        ✅ FIX: بدل الرقم الثابت المخمّن (كان فيه شريط علوي 36px اتشال من
        Navbar.jsx زمان بس الرقم فضل زي ما هو هنا، فكان بيحجز مساحة لحاجة مش
        موجودة أصلاً وده اللي كان بيبين كفراغ فاضي فوق كل صفحة). دلوقتي
        Navbar.jsx نفسه بيقيس ارتفاعه الحقيقي أول ما يترسم، وأي مرة يتغيّر
        فيها (زي طي شريط التصنيفات وقت السكرول)، وبيحطه في متغير CSS مشترك
        اسمه --navbar-height. إحنا هنا بنقرأ نفس المتغير ده بدل رقم ثابت،
        فمهما اتغيّر شكل الـ Navbar مستقبلًا، المسافة هتتظبط تلقائيًا لوحدها
        من غير ما حد يحتاج يرجع يعدّل رقم يدويًا في مكانين مختلفين.
        الـ fallback (168px) بيستخدم بس في اللحظة الأولى قبل ما الـ Navbar
        يترسم ويحسب ارتفاعه الفعلي، عشان مايحصلش قفزة واضحة في المحتوى.
      */}
      <main
        className="overflow-x-hidden w-full"
        style={{ paddingTop: "var(--navbar-height, 168px)" }}
      >
        {children}
      </main>
      <div className={hideFooterOnMobile ? "hidden lg:block" : ""}>
        <Footer />
      </div>
    </>
  )
}

export default Layout