import { useEffect } from "react"
import api from "../../api/axios"
import Navbar from "../../components/layout/Navbar"
import HeroSection from "./HeroSection"
import CategoriesSection from "./CategoriesSection"
import SocialSidebar from "./SocialSidebar"
import BestSellers from "./Bestsellers"
import PromoBanners from "./Promobanners"
import TrustBar from "./TrustBar"

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
      <Navbar />
      <SocialSidebar />
      <HeroSection />
      <CategoriesSection />
      <BestSellers />
      <PromoBanners />
      <TrustBar />
      {/* لو عندك Footer component جاهز، ضيفيه هنا تحت TrustBar مباشرة */}
    </div>
  )
}

export default Home