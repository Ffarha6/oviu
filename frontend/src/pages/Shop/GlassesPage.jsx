import { useEffect, useState, useContext, useRef } from "react"
import api from "../../api/axios"

import { useParams, useNavigate, Link } from "react-router-dom"
import { LanguageContext } from "../../context/LanguageContext"
import { ThemeContext } from "../../context/ThemeContext"
import { motion } from "framer-motion"
import { FiSliders, FiRefreshCw, FiChevronDown } from "react-icons/fi"
import ProductCard from "../../components/products/ProductCard"
import bannersunglass from "../../assets/images/banner-sunglass.png"
import bannerMedical from "../../assets/images/banner-medical.png"
import bannerReading from "../../assets/images/banner-reading.png"
import bannerLenses from "../../assets/images/banner-lenses.png"
import bannerMen from "../../assets/images/banner-men.png"
import bannerWomen from "../../assets/images/banner-women.jpg"
import bannerKids from "../../assets/images/banner-kids.png"
import bannerUnisex from "../../assets/images/bannerUnisex.png"
// ===== إعدادات كل فئة =====
const categoryConfig = {
  sunglasses: {
    ar: { title: "نظارات شمسية", desc: "مجموعة مختارة من أفضل النظارات الشمسية بتصاميم عصرية وحماية فائقة من أشعة الشمس" },
    en: { title: "Sunglasses", desc: "A curated selection of the finest sunglasses with modern designs and superior UV protection" },
    apiParam: { product_type: "sunglasses" },
  },
  medical: {
    ar: { title: "نظارات طبية", desc: "نظارات طبية بأعلى معايير الجودة لتصحيح النظر بأناقة وراحة" },
    en: { title: "Medical Glasses", desc: "Medical glasses with the highest quality standards for vision correction with elegance and comfort" },
    apiParam: { product_type: "medical" },
  },
  reading: {
    ar: { title: "نظارات قراءة", desc: "نظارات قراءة مريحة بعدسات عالية الجودة لحماية عينيك" },
    en: { title: "Reading Glasses", desc: "Comfortable reading glasses with high quality lenses to protect your eyes" },
    apiParam: { product_type: "reading" },
  },
  men: {
    ar: { title: "نظارات رجالي", desc: "تشكيلة حصرية من النظارات الرجالية بتصاميم عصرية وأنيقة" },
    en: { title: "Men's Glasses", desc: "An exclusive collection of men's glasses with modern and elegant designs" },
    apiParam: { audience: "men" },
  },
  women: {
    ar: { title: "نظارات نسائي", desc: "مجموعة متميزة من النظارات النسائية الأنيقة لكل مناسبة" },
    en: { title: "Women's Glasses", desc: "A distinguished collection of elegant women's glasses for every occasion" },
    apiParam: { audience: "women" },
  },
  kids: {
    ar: { title: "نظارات أطفال", desc: "نظارات أطفال آمنة ومريحة بألوان وتصاميم مرحة" },
    en: { title: "Kids Glasses", desc: "Safe and comfortable kids glasses with fun colors and designs" },
    apiParam: { audience: "kids" },
  },
  lenses: {
    ar: { title: "العدسات اللاصقة", desc: "عدسات لاصقة بأعلى معايير الراحة والسلامة لعينيك" },
    en: { title: "Contact Lenses", desc: "Contact lenses with the highest standards of comfort and safety for your eyes" },
    apiParam: { product_type: "lenses" },
  },
  unisex: {
    ar: { title: "نظارات للجنسين", desc: "تشكيلة نظارات تناسب الجنسين بتصاميم عصرية ومريحة" },
    en: { title: "Unisex Glasses", desc: "A collection of glasses suited for everyone, with modern and comfortable designs" },
    apiParam: { audience: "unisex" },
  },
}


// ===== خريطة صور البانر لكل قسم =====
const categoryBanners = {
  sunglasses: bannersunglass,
  medical: bannerMedical,
  reading: bannerReading,
  lenses: bannerLenses,
  men: bannerMen,
  women: bannerWomen,
  kids: bannerKids,
  unisex: bannerUnisex,
}

// ===== SKELETON CARD =====
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 animate-pulse">
      <div className="h-[200px] bg-gray-100 dark:bg-gray-800" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/2" />
        <div className="flex gap-1">
          {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-full" />)}
        </div>
        <div className="flex gap-2 pt-1">
          <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ===== COLLAPSIBLE SECTION =====
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <span className="font-semibold text-black dark:text-white text-sm">{title}</span>
        <FiChevronDown
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

// ===== MAIN PAGE =====
function GlassesPage() {
  
  const { category } = useParams()
  
  const { language } = useContext(LanguageContext)
  const { darkMode } = useContext(ThemeContext)
  const [showBanner, setShowBanner] = useState(true);

useEffect(() => {
  api.get("/settings/")
    .then((res) => {
      setShowBanner(res.data.show_home_banner);
    })
    .catch(() => {});
}, []);
  const navigate = useNavigate()
  const isAr = language === "ar"

  const [products, setProducts]               = useState([])
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState(null)
  const [totalCount, setTotalCount]           = useState(0)
  const [currentPage, setCurrentPage]         = useState(1)
  const [totalPages, setTotalPages]           = useState(1)

  const [viewMode, setViewMode]               = useState("grid")
  const [sortBy, setSortBy]                   = useState("-created_at")
  const [priceRange, setPriceRange]           = useState(2000)
  const [selectedShapes, setSelectedShapes]   = useState([])
  const [selectedGenders, setSelectedGenders] = useState([])
  // ✅ الفلاتر على الموبايل بتفتح كقائمة منسدلة بدل ما تكون مخفية خالص
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  // ✅ قائمة الترتيب بقت عائمة (dropdown) بدل select عادي، عشان تترسم فوق
  // المحتوى مش تدفعه لتحت، وتقدر تتحكم في مكانها بالظبط جنب قائمة الفلاتر
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const dropdownsRef = useRef(null)

  // ✅ FIX: السايدبار كان fixed دايمًا، فكان بيفضل ظاهر حتى لو نزلتي لتحت
  // الفوتر خالص (بيتراكب فوقه). دلوقتي بنراقب السكرول: طول ما فيه مساحة
  // كافية جوه قسم المنتجات (قبل الفوتر) يفضل fixed زي ما هو، ولو المساحة
  // خلصت (يعني قربنا من آخر الصفحة) بيتحول لـ absolute وياخد آخر نقطة تحت
  // (bottom: 0) جوه حاوية المحتوى، فيوقف هناك ومايكملش فوق الفوتر
  const contentWrapRef = useRef(null)
  const sidebarRef = useRef(null)
  const [sidebarFixed, setSidebarFixed] = useState(true)
  const SIDEBAR_TOP_OFFSET = 190

  useEffect(() => {
    const handleScroll = () => {
      if (!contentWrapRef.current || !sidebarRef.current) return
      const wrapBottom = contentWrapRef.current.getBoundingClientRect().bottom
      const sidebarHeight = sidebarRef.current.offsetHeight
      // المساحة المتاحة من نقطة ثبات السايدبار لحد ما تخلص حاوية المحتوى
      const spaceAvailable = wrapBottom - SIDEBAR_TOP_OFFSET
      setSidebarFixed(spaceAvailable > sidebarHeight)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  // ✅ FIX: القائمتين بقوا جوه حاوية واحدة مشتركة، فبنقفلهم مع بعض بس لو
  // الضغطة برة الحاوية دي خالص. طالما الضغطة جوه الحاوية (على أي زرار أو أي
  // قائمة من الاتنين) بيفضلوا مفتوحين، فتقدر تفتحي الاتنين مع بعض براحتك
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownsRef.current && !dropdownsRef.current.contains(e.target)) {
        setMobileFiltersOpen(false)
        setSortDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ✅ عدّلنا العدّادات دي عشان تبقى بس للفئة (شمسية/طبية/قراءة/عدسات)،
  // شيلنا "kids" من هنا لأنه بقى في قسم "النوع" مش "الفئة"
  const [categoryCounts, setCategoryCounts] = useState({
    sunglasses: "...",
    medical:    "...",
    reading:    "...",
    lenses:     "...",
  })

  const toggleShape = (s) => {
    setSelectedShapes(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s])
    setCurrentPage(1)
  }
  const toggleGender = (g) => {
    setSelectedGenders(prev => prev.includes(g) ? prev.filter(i => i !== g) : [...prev, g])
    setCurrentPage(1)
  }
  const resetFilters = () => {
    setSelectedShapes([])
    setSelectedGenders([])
    setPriceRange(2000)
    setCurrentPage(1)
  }

  const config    = categoryConfig[category] || categoryConfig["sunglasses"]
  const pageTitle = config[language].title
  const pageDesc  = config[language].desc
  const bannerImage = categoryBanners[category] || bannersunglass


  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [sunglasses, medical, reading, lenses] = await Promise.all([
          api.get("/products/", { params: { product_type: "sunglasses", page_size: 1 } }),
          api.get("/products/", { params: { product_type: "medical",    page_size: 1 } }),
          api.get("/products/", { params: { product_type: "reading",    page_size: 1 } }),
          api.get("/products/", { params: { product_type: "lenses",     page_size: 1 } }),
        ])
        setCategoryCounts({
          sunglasses: sunglasses.data.count ?? 0,
          medical:    medical.data.count    ?? 0,
          reading:    reading.data.count    ?? 0,
          lenses:     lenses.data.count     ?? 0,
        })
      } catch (err) {
        console.error("Error fetching category counts:", err)
      }
    }
    fetchCounts()
  }, [])


  useEffect(() => { setCurrentPage(1) }, [category])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = {
          ...config.apiParam,
          ordering: sortBy,
          max_price: priceRange,
          page: currentPage,
          page_size: 20,
        }
        if (selectedShapes.length === 1)  params.frame_shape = selectedShapes[0]
        if (selectedGenders.length === 1) params.audience    = selectedGenders[0]

        const res = await api.get("/products/", { params })
        setProducts(res.data.results || [])
        setTotalCount(res.data.count || 0)
        setTotalPages(Math.ceil((res.data.count || 0) / 20))
      } catch (err) {
        console.error("Error fetching products:", err)
        setError(isAr ? "حدث خطأ أثناء تحميل المنتجات" : "Error loading products")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [category, sortBy, priceRange, selectedShapes, selectedGenders, currentPage])

  const content = {
    ar: {
      home: "الرئيسية",
      glasses: "النظارات",
      filter: "تصفية النتائج",
      category: "الفئة",
      shape: "شكل الإطار",
      gender: "النوع",
      price: "النطاق السعري",
      reset: "مسح كل الفلاتر",
      // ✅ شيلنا "طيار" و"كات آي" من شكل الإطار
      shapes: {
        round: "دائري", rectangle: "مستطيل", square: "مربع", oval: "بيضاوي",
      },
      // ✅ ضفنا "للجنسين" في النوع
      genders: { men: "رجالي", women: "نسائي", kids: "أطفال", unisex: "للجنسين" },
      // ✅ الفئة بقت بس: شمسية / طبية / قراءة / عدسات (شلنا الأطفال من هنا)
      categories: [
        { label: "نظارات شمسية", key: "sunglasses", count: categoryCounts.sunglasses },
        { label: "نظارات طبية",  key: "medical",    count: categoryCounts.medical    },
        { label: "نظارات قراءة", key: "reading",    count: categoryCounts.reading    },
        { label: "عدسات لاصقة",  key: "lenses",     count: categoryCounts.lenses     },
      ],
      newest: "الأحدث", priceAsc: "السعر: الأقل", priceDesc: "السعر: الأعلى",
      showing: "عرض", of: "من", product: "منتج",
      addCart: "أضف للسلة", tryNow: "جرّب الآن",
      noProducts: "لا توجد منتجات في هذا القسم",
    },
    en: {
      home: "Home",
      glasses: "Glasses",
      filter: "Filter Results",
      category: "Category",
      shape: "Frame Shape",
      gender: "Gender",
      price: "Price Range",
      reset: "Clear All Filters",
      shapes: {
        round: "Round", rectangle: "Rectangle", square: "Square", oval: "Oval",
      },
      genders: { men: "Men", women: "Women", kids: "Kids", unisex: "Unisex" },
      categories: [
        { label: "Sunglasses",      key: "sunglasses", count: categoryCounts.sunglasses },
        { label: "Medical Glasses", key: "medical",    count: categoryCounts.medical    },
        { label: "Reading Glasses", key: "reading",    count: categoryCounts.reading    },
        { label: "Contact Lenses",  key: "lenses",     count: categoryCounts.lenses     },
      ],
      newest: "Newest", priceAsc: "Price: Low to High", priceDesc: "Price: High to Low",
      showing: "Showing", of: "of", product: "products",
      addCart: "Add to Cart", tryNow: "Try Now",
      noProducts: "No products found in this category",
    },
  }

  const t = content[language]

  // ✅ محتوى الفلاتر (الفئة، شكل الإطار، النوع، النطاق السعري، زرار المسح) مستخرج
  // هنا في متغير واحد عشان نستخدمه مرتين: في السايدبار للديسكتوب، وجوه القائمة
  // المنسدلة بتاعة الموبايل، من غير ما نكرر نفس الكود مرتين
  const filtersContent = (
    <>
      {/* ── Category ── */}
      <FilterSection title={t.category}>
        <div className="flex flex-col gap-2">
          {t.categories.map((cat) => (
            <label
              key={cat.key}
              className={`flex items-center justify-between cursor-pointer group ${isAr ? "flex-row-reverse" : ""}`}
            >
              <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                <input
                  type="checkbox"
                  checked={cat.key === category}
                  readOnly
                  onClick={() => navigate(`/glasses/${cat.key}`)}
                  className="w-4 h-4 accent-[#D9A066] rounded"
                />
                <span className={`text-sm transition ${cat.key === category ? "text-[#D9A066] font-semibold" : "text-gray-500 dark:text-gray-400 group-hover:text-[#D9A066]"}`}>
                  {cat.label}
                </span>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded-full">
                ({cat.count})
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <div className="h-px bg-black/5 dark:bg-white/5 my-4" />

      {/* ── Frame Shape ── */}
      <FilterSection title={t.shape}>
        <div className="flex flex-col gap-2">
          {Object.entries(t.shapes).map(([key, label]) => (
            <label key={key} className={`flex items-center gap-2 cursor-pointer group ${isAr ? "flex-row-reverse" : ""}`}>
              <input
                type="checkbox"
                checked={selectedShapes.includes(key)}
                onChange={() => toggleShape(key)}
                className="w-4 h-4 accent-[#D9A066]"
              />
              <span className="text-gray-500 dark:text-gray-400 text-sm group-hover:text-[#D9A066] transition">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <div className="h-px bg-black/5 dark:bg-white/5 my-4" />

      {/* ── Gender ── */}
      <FilterSection title={t.gender}>
        <div className="flex flex-col gap-2">
          {Object.entries(t.genders).map(([key, label]) => (
            <label key={key} className={`flex items-center gap-2 cursor-pointer group ${isAr ? "flex-row-reverse" : ""}`}>
              <input
                type="checkbox"
                checked={selectedGenders.includes(key)}
                onChange={() => toggleGender(key)}
                className="w-4 h-4 accent-[#D9A066]"
              />
              <span className="text-gray-500 dark:text-gray-400 text-sm group-hover:text-[#D9A066] transition">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <div className="h-px bg-black/5 dark:bg-white/5 my-4" />

      {/* ── Price Range ── */}
      <FilterSection title={t.price}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-xs">100 {isAr ? "جنيه" : "EGP"}</span>
          <span className="text-[#D9A066] text-sm font-bold">
            {priceRange.toLocaleString()} {isAr ? "جنيه" : "EGP"}
          </span>
        </div>
        <input
          type="range" min={100} max={2000} step={50}
          value={priceRange}
          onChange={(e) => { setPriceRange(Number(e.target.value)); setCurrentPage(1) }}
          className="w-full accent-[#D9A066] cursor-pointer"
        />
        <div className={`flex items-center justify-between mt-1 ${isAr ? "flex-row-reverse" : ""}`}>
          <span className="text-gray-400 text-xs">100</span>
          <span className="text-gray-400 text-xs">2000</span>
        </div>
      </FilterSection>

      {/* Reset */}
      <button
        onClick={resetFilters}
        className={`w-full flex items-center justify-center gap-2 mt-2 border border-[#D9A066]/50 text-[#D9A066] hover:bg-[#D9A066] hover:text-white py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${isAr ? "flex-row-reverse" : ""}`}
      >
        <FiRefreshCw size={13} />
        {t.reset}
      </button>
    </>
  )

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className={`min-h-screen bg-[#FAF8F5] dark:bg-[#0a0a0a] transition-all duration-500 ${isAr ? "font-[Cairo,sans-serif]" : ""}`} style={{ paddingTop: "0px" }}>

     
      {/* ===== CONTENT ===== */}
      {/* ✅ FIX: رجّعنا المحتوى (الجزء اللي فيه المنتجات) بالظبط لمكانه ووضعه
          الأصلي (max-w-[1400px] mx-auto) من غير أي تغيير، عشان آخر تعديل كان
          بيأثر على الجزء ده كمان وده مش المطلوب. السايدبار (تصفية النتائج)
          بقى مستقل تمامًا (position: absolute) وبيوصل لحافة الصفحة من غير ما
          يأثر على مكان المحتوى خالص، لأنه بقى برّة تدفق الصفحة العادي */}
      <div className="relative" ref={contentWrapRef}>

        {/* ===== SIDEBAR ===== */}
        {/* ✅ FIX: كان fixed دايمًا فكان بيتراكب فوق الفوتر لو نزلتي لآخر
            الصفحة. دلوقتي بيفضل fixed (ثابت وانتي بتعملي سكرول) طول ما لسه
            فيه مساحة جوه قسم المنتجات، وأول ما يقرب من نهايته بيتحول
            absolute ويوقف عند آخر نقطة (bottom-0) جوه حاوية المحتوى، فمايكملش
            فوق الفوتر خالص (المنطق في useEffect باسم handleScroll فوق) */}
        <aside
          ref={sidebarRef}
          className={`
            hidden lg:block ${sidebarFixed ? "fixed top-[190px]" : "absolute bottom-0"}
            ${isAr ? "left-4 lg:left-10" : "right-4 lg:right-10"}
            w-[220px] max-h-[calc(100vh-210px)] overflow-y-auto scrollbar-hide
            ${isAr ? "text-right" : "text-left"}
          `}
        >
          {/* Header */}
          <div className={`flex items-center justify-between mb-5 ${isAr ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
              <FiSliders className="text-[#D9A066]" size={15} />
              <h3 className="font-bold text-black dark:text-white text-sm">{t.filter}</h3>
            </div>
          </div>

          {/* ── Category ── */}
          {filtersContent}
        </aside>

        <div className="max-w-[1400px] mx-auto px-2 sm:px-6 lg:px-10 pt-0 pb-5 flex gap-6 lg:gap-8 flex-row-reverse">

          {/* حيّز فاضي مكانه بالظبط زي ما كان السايدبار قبل كده، عشان المحتوى
              يفضل في نفس مكانه الأصلي بالظبط ومايتحركش لمكان السايدبار الحقيقي */}
          <div className="hidden lg:block shrink-0 w-[220px]" aria-hidden="true" />

          {/* ===== MAIN CONTENT ===== */}
          <div className="flex-1 min-w-0">

          {/* breadcrumb */}
          <div 
            className={`flex items-center gap-2 text-gray-400 mb-3 ${isAr ? "flex-row" : "flex-row"}`}
            style={{ fontSize: "20px", fontWeight: "500" }}
          >
            {isAr ? (
              <>
                <span onClick={() => navigate("/")} className="cursor-pointer hover:text-[#D9A066] transition" style={{ fontSize: "inherit" }}>{t.home}</span>
                <span style={{ fontSize: "20px" }}>›</span>
                <span onClick={() => navigate("/glasses")} className="cursor-pointer hover:text-[#D9A066] transition" style={{ fontSize: "inherit" }}>{t.glasses}</span>
                <span style={{ fontSize: "20px" }}>›</span>
                <span className="text-[#D9A066] font-semibold" style={{ fontSize: "inherit" }}>{pageTitle}</span>
              </>
            ) : (
              <>
                <span onClick={() => navigate("/")} className="cursor-pointer hover:text-[#D9A066] transition" style={{ fontSize: "inherit" }}>{t.home}</span>
                <span style={{ fontSize: "20px" }}>›</span>
                <span onClick={() => navigate("/glasses")} className="cursor-pointer hover:text-[#D9A066] transition" style={{ fontSize: "inherit" }}>{t.glasses}</span>
                <span style={{ fontSize: "20px" }}>›</span>
                <span className="text-[#D9A066] font-semibold" style={{ fontSize: "inherit" }}>{pageTitle}</span>
              </>
            )}
          </div>

          {/* ===== BANNER =====
              ✅ على الموبايل (أصغر من lg): الصورة بقت خلفية كاملة، والنص بيترسم فوقيها
              بتدرج غامق خفيف عشان يبان واضح.
              من lg فأكبر: رجعنا لنفس الشكل القديم بالظبط (نص جنب الصورة) زي ما هو. */}
              {showBanner && (

          <div className="relative overflow-hidden rounded-[32px] mb-8 min-h-[320px] lg:min-h-0">
            <div className="grid lg:grid-cols-2 items-center min-h-[320px]">

              {/* الصورة: خلفية كاملة على الموبايل (absolute)، عمود عادي من lg فأكبر */}
              <div className="absolute inset-0 lg:relative lg:h-full lg:order-2">
                <img
                  src={bannerImage}
                  alt={pageTitle}
                  className="w-full h-full object-cover"
                />
                {/* التدرج ده بيظهر على الموبايل بس، عشان النص الأبيض يبان واضح فوق الصورة */}
                <div className="absolute inset-0 lg:hidden bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              </div>

              {/* النص */}
              <div className={`
                relative z-10
                px-6 lg:px-14
                py-10
                min-h-[320px] lg:min-h-0
                flex flex-col justify-end lg:justify-center
                order-1 lg:order-1
                ${isAr ? "items-end text-right" : "items-start text-left"}
              `}>
                <h1 className="
                  text-3xl lg:text-6xl
                  font-bold
                  text-white lg:text-black lg:dark:text-white
                  mb-5
                  lg:-mt-28
                  whitespace-nowrap
                  inline-block
                ">
                  {pageTitle}
                </h1>

                <p className="
                  text-white/85 lg:text-gray-500 lg:dark:text-gray-400
                  text-base lg:text-lg
                  leading-relaxed
                  max-w-[500px]
                  lg:mt-10
                ">
                  {pageDesc}
                </p>
              </div>
            </div>
          </div>
          )}

          {/* TOOLBAR */}
          {/* ✅ FIX: الصفحة أصلاً RTL، يعني justify-end بتوّدي العناصر أقصى الشمال
              مش اليمين (العكس تمامًا) — الصح هو justify-start. وكمان رتّبنا
              العناصر في الـ DOM بنفس ترتيب القراءة المطلوب من اليمين للشمال:
              الأحدث، بعدين تصفية النتائج، بعدين نص "عرض X من Y منتج" في الآخر */}
          <div className="flex items-center justify-start mb-3 flex-wrap gap-3">

            {/* ✅ FIX: زرارين الترتيب والفلاتر بقوا جوه حاوية relative واحدة
                مشتركة، والقائمتين بقوا جوه صف flex واحد بعدها بدل ما كل واحدة
                تتمركز تحت زرارها الصغير لوحدها — كده بيترصوا جنب بعض تلقائيًا
                من غير ما يتلامسوا أو يتراكبوا فوق بعض، أيًا كان حجم كل واحدة */}
            <div className="relative" ref={dropdownsRef}>
              <div className="flex items-center gap-3">
                {/* Sort trigger */}
                <button
                  onClick={() => setSortDropdownOpen(o => !o)}
                  className="flex items-center gap-1.5 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 text-black dark:text-white text-sm rounded-xl px-4 py-2 shadow-sm"
                >
                  {[
                    { value: "-created_at", label: t.newest },
                    { value: "price", label: t.priceAsc },
                    { value: "-price", label: t.priceDesc },
                  ].find(o => o.value === sortBy)?.label}
                  <FiChevronDown className={`text-gray-400 transition-transform duration-200 ${sortDropdownOpen ? "rotate-180" : ""}`} size={14} />
                </button>

                {/* Filter trigger — موبايل بس */}
                <button
                  onClick={() => setMobileFiltersOpen(o => !o)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 shadow-sm text-sm font-semibold text-black dark:text-white"
                >
                  <FiSliders className="text-[#D9A066]" size={13} />
                  {t.filter}
                  <FiChevronDown className={`text-gray-400 transition-transform duration-200 ${mobileFiltersOpen ? "rotate-180" : ""}`} size={12} />
                </button>
              </div>

              {/* صف واحد فيه القائمتين، flexbox بيرصهم جنب بعض من غير تراكب */}
              {(sortDropdownOpen || mobileFiltersOpen) && (
                <div className={`absolute z-30 top-full mt-2 flex items-start gap-2 ${isAr ? "right-0" : "left-0"}`}>

                  {sortDropdownOpen && (
                    <div className="w-36 shrink-0 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl shadow-lg overflow-hidden">
                      {[
                        { value: "-created_at", label: t.newest },
                        { value: "price", label: t.priceAsc },
                        { value: "-price", label: t.priceDesc },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setCurrentPage(1); setSortDropdownOpen(false) }}
                          className={`w-full px-3 py-2.5 text-sm transition ${isAr ? "text-right" : "text-left"} ${
                            sortBy === opt.value
                              ? "bg-[#D9A066]/10 text-[#D9A066] font-semibold"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {mobileFiltersOpen && (
                    <div className={`w-56 shrink-0 max-h-[70vh] overflow-y-auto scrollbar-hide p-4 rounded-xl bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 shadow-lg ${isAr ? "text-right" : "text-left"}`}>
                      {filtersContent}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* نص "عرض X من Y منتج" — آخر حاجة، تفضل أقصى الشمال */}
            <p className="text-gray-400 text-sm">
              {t.showing}{" "}
              <span className="text-black dark:text-white font-semibold">
                {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, totalCount)}
              </span>{" "}
              {t.of}{" "}
              <span className="text-black dark:text-white font-semibold">{totalCount}</span>{" "}
              {t.product}
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="text-center py-20 text-red-400 text-base">{error}</div>
          )}

          {/* PRODUCTS GRID */}
          {/* ✅ FIX: شيلنا props "wishlist" و"toggleWishlist" و"onAddToCart" - كلهم
              كانوا كود ميت، ProductCard بيستخدم useWishlist() و useCart() بنفسه */}
          {!error && (
            <div className={
  viewMode === "grid"
    ? "grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4"
    : "grid grid-cols-1 gap-4"
}>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                : products.length === 0
                  ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
                      <span className="text-6xl">🕶️</span>
                      <p className="text-gray-400 text-lg">{t.noProducts}</p>
                    </div>
                  )
                  : products.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                    >
                      <ProductCard
                        product={product}
                        isAr={isAr}
                        t={t}
                      />
                    </motion.div>
                  ))
              }
            </div>
          )}

          {/* PAGINATION */}
          {!loading && totalPages > 1 && (
            <div className={`flex items-center justify-center gap-1.5 mt-10 flex-wrap ${isAr ? "flex-row-reverse" : ""}`}>
              {/* Prev */}
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-400 hover:border-[#D9A066] hover:text-[#D9A066] transition text-sm disabled:opacity-30 bg-white dark:bg-[#111]"
              >
                {isAr ? "›" : "‹"}
              </button>

              {getPageNumbers().map((p, i) => (
                <button
                  key={i}
                  onClick={() => typeof p === "number" && setCurrentPage(p)}
                  disabled={p === "..."}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
                    p === currentPage
                      ? "bg-[#D9A066] text-white shadow-md"
                      : p === "..."
                        ? "text-gray-400 cursor-default"
                        : "border border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-[#D9A066] hover:text-[#D9A066] bg-white dark:bg-[#111]"
                  }`}
                >
                  {p}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-400 hover:border-[#D9A066] hover:text-[#D9A066] transition text-sm disabled:opacity-30 bg-white dark:bg-[#111]"
              >
                {isAr ? "‹" : "›"}
              </button>
            </div>
          )}

        </div>
        </div>
      </div>
    </div>
  )
}

export default GlassesPage