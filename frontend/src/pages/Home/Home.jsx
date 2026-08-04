import { useEffect } from "react"
import api from "../../api/axios"
import HeroSection from "./HeroSection"
import CategoriesSection from "./CategoriesSection"
import SocialSidebar from "./SocialSidebar"
import BestSellers from "./Bestsellers"
//import PromoBanners from "./Promobanners"

function Home() {
  useEffect(() => {
    const testApi = async () => {
      try {
        const res = await api.get("/products/")
        console.log(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    testApi()
  }, [])

  return (
    <div className="bg-[#F7F2EE] dark:bg-[#050505] transition-colors duration-500 min-h-screen">
      {/* ✅ الـ Navbar اتشالت من هنا — كانت بترسم مرتين لأن App.jsx بيلف
          الصفحة دي أصلاً بـ <Layout><Home /></Layout>، والـ Layout بيرسم
          Navbar واحدة بنفسه. فكان فيه Navbar مكرر بيدي فراغ زيادة غريب فوق
          صفحة الهوم بالذات، وهو سبب الفراغ اللي شايفاه */}
      <SocialSidebar />
      <HeroSection />
      <CategoriesSection />
      <BestSellers />
      {/* <PromoBanners /> */}
      {/* لو عندك Footer component جاهز، ضيفيه هنا تحت TrustBar مباشرة */}
    </div>
  )
}

export default Home