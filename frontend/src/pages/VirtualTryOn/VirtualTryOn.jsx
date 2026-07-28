import { useState, useRef, useCallback, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { LanguageContext } from "../../context/LanguageContext";

const BASE_URL = "http://localhost:8000";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

const api = {
  getProducts: () =>
    fetch(`${BASE_URL}/tryon/api/products/`, { credentials: "include" })
      .then((r) => { if (!r.ok) throw new Error("فشل جلب المنتجات"); return r.json(); }),

  uploadImage: (file, productId = null) => {
    const fd = new FormData();
    fd.append("image", file);
    if (productId) fd.append("glasses_product_id", productId);
    return fetch(`${BASE_URL}/tryon/api/upload/`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
      body: fd,
    }).then((r) => { if (!r.ok) throw new Error("فشل رفع الصورة"); return r.json(); });
  },

  selectGlasses: (productId, imageId) =>
    fetch(`${BASE_URL}/tryon/select-glasses/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-CSRFToken": getCookie("csrftoken") },
      body: JSON.stringify({ product_id: productId, image_id: imageId }),
    }).then((r) => { if (!r.ok) throw new Error("فشل اختيار النظارة"); return r.json(); }),

  applyGlasses: (imageId, productId) =>
    fetch(`${BASE_URL}/tryon/api/process/${imageId}/${productId}/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-CSRFToken": getCookie("csrftoken") },
      body: JSON.stringify({ image_id: imageId, product_id: productId }),
    }).then((r) => { if (!r.ok) throw new Error("فشل تطبيق النظارة"); return r.json(); }),

  saveResult: (imageId, productId) =>
    fetch(`${BASE_URL}/tryon/save-result/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-CSRFToken": getCookie("csrftoken") },
      body: JSON.stringify({ image_id: imageId, product_id: productId }),
    }).then((r) => { if (!r.ok) throw new Error("فشل حفظ النتيجة"); return r.json(); }),
};

function GlassPlaceholder({ color = "#999" }) {
  return (
    <svg viewBox="0 0 80 30" width="64" height="24" fill="none">
      <rect x="2" y="6" width="30" height="18" rx="9" stroke={color} strokeWidth="2" fill="none" />
      <rect x="48" y="6" width="30" height="18" rx="9" stroke={color} strokeWidth="2" fill="none" />
      <path d="M32 15 Q40 10 48 15" stroke={color} strokeWidth="1.8" fill="none" />
      <line x1="2" y1="14" x2="-5" y2="11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="78" y1="14" x2="85" y2="11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function VirtualTryOn({ onBack }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [selectedId, setSelectedId] = useState(null);
  const [currentImageId, setCurrentImageId] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentResultId, setCurrentResultId] = useState(null);

  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("image");
  const [category, setCategory] = useState("all");
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef();

  const { darkMode } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const isAr = language === "ar";

  const c = {
    pageBg:   darkMode ? "#000000" : "#F7F2EE",
    cardBg:   darkMode ? "#2a2a2a" : "#fff",
    border:   darkMode ? "#3a3a3a" : "#efefef",
    border2:  darkMode ? "#444"    : "#e8e8e8",
    text:     darkMode ? "#f0f0f0" : "#222",
    text2:    darkMode ? "#ccc"    : "#333",
    subText:  darkMode ? "#aaa"    : "#555",
    mutedText:darkMode ? "#666"    : "#aaa",
    uploadBg: darkMode ? "#2f2f2f" : "#fafafa",
    uploadBorder: darkMode ? "#4a3a2a" : "#e4ddd6",
    camBg:    darkMode ? "#2a2a2a" : "#e8e4df",
    iconBg:   darkMode ? "#3a2a1a" : "#fff6ed",
    pillBg:   darkMode ? "#333"    : "#fff",
    pillText: darkMode ? "#ccc"    : "#666",
    inputBorder: darkMode ? "#3a3a3a" : "#e0e0e0",
    scrollTrack: darkMode ? "#222"  : "#f0f0f0",
    scrollThumb: darkMode ? "#444"  : "#ddd",
    cardShadow: darkMode ? "0 1px 6px rgba(0,0,0,0.3)" : "0 1px 8px rgba(20,20,20,0.04)",
  };

  const t = {
    uploadTitle:    isAr ? "ارفع صورتك"                       : "Upload Your Photo",
    uploadHint:     isAr ? "ارفع صورة واضحة لوجهك"            : "Upload a clear face photo",
    uploadDone:     isAr ? "صورة مرفوعة — اضغط لتغييرها"      : "Photo uploaded — tap to change",
    chooseFile:     isAr ? "🖼️ اختر صورة من جهازك"            : "🖼️ Choose from device",
    orText:         isAr ? "أو"                                : "or",
    useCamera:      isAr ? "📷 التقط صورة بالكاميرا"           : "📷 Take a photo",
    tipsTitle:      isAr ? "نصائح لأفضل نتيجة"                : "Tips for best result",
    tips:           isAr
      ? ["واجه الكاميرا مباشرة", "إضاءة طبيعية جيدة", "أزل النظارات أو القبعات", "تأكد من وضوح الوجه"]
      : ["Face camera directly", "Good natural lighting", "Remove glasses or hats", "Keep face clearly visible"],
    faceFrame:      isAr ? "ضع وجهك داخل الإطار"              : "Position face in frame",
    processing:     isAr ? "جاري المعالجة..."                  : "Processing...",
    emptyHint:      isAr ? "ارفع صورة واضحة لوجهك"            : "Upload a clear face photo",
    emptyHint2:     isAr ? "بأفضل صورة أمامية للإضاءة الجيدة" : "Best results with front-facing good light",
    compare:        isAr ? "↔ مقارنة"                         : "↔ Compare",
    likeIt:         isAr ? "هل أعجبتك النظارة؟"               : "Like these glasses?",
    likeDesc:       isAr ? "أضفها إلى المفضلة أو اطلبها الآن" : "Add to wishlist or order now",
    addWish:        isAr ? "إضافة للمفضلة"                     : "Add to Wishlist",
    orderNow:       isAr ? "اطلب الآن"                         : "Order Now",
    ordering:       isAr ? "جاري..."                           : "Loading...",
    chooseGlasses:  isAr ? "اختر نظارتك"                      : "Choose Glasses",
    catAll:         isAr ? "كل النظارات"                      : "All",
    catSun:         isAr ? "شمسية"                             : "Sunglasses",
    catMed:         isAr ? "طبية"                              : "Medical",
    catRead:        isAr ? "قراءة"                             : "Reading",
    loadingProds:   isAr ? "جاري تحميل المنتجات..."            : "Loading products...",
    noProds:        isAr ? "لا توجد منتجات في هذا القسم"      : "No products in this category",
    currency:       isAr ? "جنيه"                              : "EGP",
    viewAll:        isAr ? "عرض كل المنتجات →"                : "View all products →",
    home:           isAr ? "الرئيسية"                          : "Home",
    tryOnLabel:     isAr ? "تجربة افتراضية"                    : "Virtual Try-On",
    aiTryOn:        isAr ? "AI Try-On"                         : "AI Try-On",
    camError:       isAr ? "تعذر الوصول للكاميرا. تأكد من منح الإذن." : "Camera access denied. Please allow permission.",
    back:           isAr ? "العودة"                            : "Back",
    feat1t:         isAr ? "تجربة واقعية"                      : "Realistic Try-On",
    feat1d:         isAr ? "تقنية AI متطورة تحاكي الواقع بدقة" : "Advanced AI for realistic results",
    feat2t:         isAr ? "أمن وخاص"                          : "Secure & Private",
    feat2d:         isAr ? "صورتك محمية ولا يتم تخزينها"       : "Your photo is protected & not stored",
    feat3t:         isAr ? "سريع وسهل"                         : "Fast & Easy",
    feat3d:         isAr ? "نتيجة فورية في ثوانٍ معدودة"       : "Instant results in seconds",
    foot1t:         isAr ? "ضمان 12 شهر"                       : "12-Month Warranty",
    foot1d:         isAr ? "على جميع النظارات"                 : "On all glasses",
    foot2t:         isAr ? "شحن سريع"                          : "Fast Shipping",
    foot2d:         isAr ? "توصيل خلال 1-3 أيام"               : "Delivery in 1-3 days",
    foot3t:         isAr ? "إرجاع واستبدال مجاني"              : "Free Returns",
    foot3d:         isAr ? "خلال 14 يوم"                       : "Within 14 days",
    toastLoadFail:  isAr ? "تعذر تحميل المنتجات"               : "Failed to load products",
    toastApplied:   isAr ? "تم تطبيق النظارة بنجاح ✓"          : "Glasses applied successfully ✓",
    toastChanged:   isAr ? "تم تغيير النظارة ✓"                : "Glasses changed ✓",
    toastSaved:     isAr ? "تم حفظ النتيجة وإضافة النظارة للسلة 🛒" : "Saved and added to cart 🛒",
    toastFail:      isAr ? "حدث خطأ"                           : "Something went wrong",
    toastChooseFirst: isAr ? "ارفع صورة واختر نظارة أولاً"     : "Upload a photo and choose glasses first",
    addedWish:      isAr ? "تم الإضافة للمفضلة ❤️"             : "Added to wishlist ❤️",
    removedWish:    isAr ? "تم الإزالة من المفضلة"             : "Removed from wishlist",
  };

  useEffect(() => {
    setProductsLoading(true);
    api.getProducts()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.results ?? data.products ?? []);
        setProducts(list);
        const fromUrl = searchParams.get("glass");
        setSelectedId(fromUrl ? Number(fromUrl) : list[0]?.id ?? null);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        showToast(t.toastLoadFail, "error");
      })
      .finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const selectedProduct = products.find((p) => p.id === selectedId);

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setCameraError(t.camError);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      stopCamera();
      setMode("image");
      runTryOn(file, selectedId);
    }, "image/jpeg", 0.92);
  };

  const runTryOn = useCallback(async (file, productId) => {
    setLoading(true);
    setUploadedImageUrl(URL.createObjectURL(file));
    setCurrentImageId(null);
    setCurrentResultId(null);
    try {
      const uploadRes = await api.uploadImage(file, productId);
      const imgId = uploadRes.image_id;
      setCurrentImageId(imgId);
      setCurrentSessionId(uploadRes.session_id);
      if (productId && imgId) {
        await api.selectGlasses(productId, imgId);
        const applyRes = await api.applyGlasses(imgId, productId);
        setCurrentResultId(applyRes.result_id);
        showToast(t.toastApplied);
      }
    } catch (err) {
      showToast(err.message || t.toastFail, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileUpload = (file) => {
    if (!file) return;
    runTryOn(file, selectedId);
  };

  const handleSelectProduct = async (productId) => {
    setSelectedId(productId);
    if (currentImageId && !loading) {
      setLoading(true);
      try {
        await api.selectGlasses(productId, currentImageId);
        const applyRes = await api.applyGlasses(currentImageId, productId);
        setCurrentResultId(applyRes.result_id);
        showToast(t.toastChanged);
      } catch (err) {
        showToast(err.message || t.toastFail, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOrder = async () => {
    if (!currentImageId || !selectedId) {
      showToast(t.toastChooseFirst, "error");
      return;
    }
    setCartLoading(true);
    try {
      const res = await api.saveResult(currentImageId, selectedId);
      setCurrentResultId(res.result_id);
      showToast(t.toastSaved);
    } catch (err) {
      showToast(err.message || t.toastFail, "error");
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlist = (id, e) => {
    if (e) e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    showToast(wishlist.includes(id) ? t.removedWish : t.addedWish);
  };

  const filtered = products.filter((p) => category === "all" || p.category === category);

  return (
    <div className="tryon-page" dir={isAr ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo','Segoe UI',sans-serif", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", background: c.pageBg, color: c.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInDown { from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);} }
        .glass-card { transition: all .2s; }
        .glass-card:hover { border-color: #E8821A !important; box-shadow: 0 2px 14px rgba(232,130,26,.13); }
        .btn-ghost:hover { background: #fff4ea !important; color: #E8821A !important; }
        .cat-pill { transition: all .2s; }
        .cat-pill:hover { border-color: #E8821A !important; color: #E8821A !important; }
        .upload-zone:hover { border-color: #E8821A !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${c.scrollTrack}; border-radius: 2px; }
        ::-webkit-scrollbar-thumb { background: ${c.scrollThumb}; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #E8821A; }

        /* ✅ ديسكتوب: نفس التقسيمة التلاتة أعمدة — رفع الصورة والنصائح كارت واحد،
           والكانفاس والمنتجات كل واحد ياخد نفس ارتفاع الصف */
        .tryon-block-upload   { grid-column: 1; grid-row: 1; }
        .tryon-block-canvas   { grid-column: 2; grid-row: 1; }
        .tryon-block-products { grid-column: 3; grid-row: 1; }

        /* ✅ تابلت: رفع الصورة والكانفاس جنب بعض فوق، والمنتجات تحت بعرض كامل */
        @media (max-width: 1024px) {
          .tryon-page { height: auto !important; overflow: visible !important; }
          .tryon-body { overflow: visible !important; }
          .tryon-container { overflow: visible !important; padding-left: 20px !important; padding-right: 20px !important; }
          .tryon-grid { grid-template-columns: 1fr 1fr !important; grid-template-rows: auto auto !important; overflow: visible !important; }
          .tryon-block-upload   { grid-column: 1 !important; grid-row: 1 !important; height: auto !important; overflow: visible !important; }
          .tryon-block-canvas   { grid-column: 2 !important; grid-row: 1 !important; height: auto !important; }
          .tryon-block-products { grid-column: 1 / -1 !important; grid-row: 2 !important; height: auto !important; overflow: visible !important; }
          .tryon-canvas { flex: none !important; height: 420px !important; }
        }

        /* ✅ موبايل: كل جزء يترتب تحت التاني بالترتيب المنطقي —
           رفع الصورة والنصائح مع بعض، بعدها الكانفاس، وبعدين المنتجات */
        @media (max-width: 640px) {
          .tryon-container { padding-left: 14px !important; padding-right: 14px !important; }
          .tryon-grid { grid-template-columns: 1fr !important; grid-template-rows: auto auto auto !important; }
          .tryon-block-upload   { grid-column: 1 !important; grid-row: 1 !important; height: auto !important; overflow: visible !important; }
          .tryon-block-canvas   { grid-column: 1 !important; grid-row: 2 !important; }
          .tryon-block-products { grid-column: 1 !important; grid-row: 3 !important; }
          .tryon-canvas { height: 320px !important; }
          .tryon-products-grid { grid-template-columns: repeat(2, 1fr) !important; }

          /* ✅ من غير ما يترفع صورة أو يتفتح الكاميرا، منستخبيش مساحة الكانفاس
             الفاضية دي خالص على الموبايل — بس "ارفع صورتك" اللي فوقها تظهر */
          .tryon-block-canvas.tryon-canvas-empty-mobile { display: none !important; }

          /* ✅ لما الكاميرا تتفتح، الكانفاس ياخد الشاشة كلها بدل ما يكون بوكس صغير جوه الصفحة */
          .tryon-block-canvas.tryon-camera-fullscreen-mobile {
            position: fixed !important;
            inset: 0 !important;
            z-index: 500 !important;
            grid-column: 1 !important;
            grid-row: 1 !important;
          }
          .tryon-camera-fullscreen-mobile .tryon-canvas {
            height: 100vh !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 110, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: c.cardBg, border: `1.5px solid ${toast.type === "error" ? "#f88" : "#E8821A"}`, borderRadius: 12, padding: "10px 28px", fontSize: 14, fontWeight: 600, color: toast.type === "error" ? "#f66" : c.text, animation: "fadeInDown .25s ease", boxShadow: "0 6px 24px rgba(0,0,0,.1)", whiteSpace: "nowrap" }}>
          {toast.msg}
        </div>
      )}

      <div className="tryon-body" style={{ paddingTop: "8px", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        <div className="tryon-container" style={{ maxWidth: 1400, margin: "0 auto", padding: "8px 40px 24px", width: "100%", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 20, color: c.mutedText, display: "flex", gap: 6, alignItems: "center", marginBottom: 20 }}>
          <span style={{ cursor: "pointer", color: "#E8821A" }} onClick={() => onBack ? onBack() : navigate("/")}>{t.home}</span>
          <span>›</span>
          <span style={{ color: c.text2, fontWeight: 600 }}>{t.tryOnLabel}</span>
        </div>

        {/* Main 3-column grid */}
        <div className="tryon-grid" style={{ display: "grid", gridTemplateColumns: "250px 1fr 420px", gap: 18, flex: 1, minHeight: 0 }}>

          {/* ─── Upload + Tips (كارت واحد بدل كارتين منفصلين) ─── */}
          <div className="tryon-block-upload" style={{ background: c.cardBg, borderRadius: 16, padding: "18px 16px", border: `1px solid ${c.border}`, boxShadow: c.cardShadow, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: c.text, textAlign: isAr ? "right" : "left" }}>{t.uploadTitle}</h3>

              <div
                className="upload-zone"
                onClick={() => fileInputRef.current?.click()}
                style={{ border: `2px dashed ${c.uploadBorder}`, borderRadius: 16, aspectRatio: "1 / 1", padding: uploadedImageUrl ? 0 : 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", background: c.uploadBg, marginBottom: 14, transition: "all .2s", overflow: "hidden" }}
              >
                {uploadedImageUrl ? (
                  <img src={uploadedImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 13 }} />
                ) : (
                  <>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                      🖼️
                    </div>
                    <p style={{ margin: 0, fontSize: 12.5, color: c.mutedText, textAlign: "center", lineHeight: 1.6 }}>
                      {t.uploadHint}
                    </p>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />

              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ width: "100%", padding: "11px 0", background: "#E8821A", color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 3px 10px rgba(232,130,26,.22)" }}
              >
                {t.chooseFile}
              </button>

              <div style={{ textAlign: "center", fontSize: 11, color: c.mutedText, margin: "4px 0" }}>{t.orText}</div>

              <button
                onClick={() => { setMode("camera"); startCamera(); }}
                style={{ width: "100%", padding: "11px 0", background: c.cardBg, color: c.text, border: `1.5px solid ${c.inputBorder}`, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                {t.useCamera}
              </button>

              {currentSessionId && (
                <p style={{ margin: "10px 0 0", fontSize: 10, color: "#ccc", textAlign: "center" }}>
                  Session #{currentSessionId} · Image #{currentImageId}
                  {currentResultId ? ` · Result #${currentResultId}` : ""}
                </p>
              )}

              {/* النصائح — بقت جوه نفس الكارت بدل ما تكون كارت منفصل، فاصل خفيف بس */}
              <div style={{ borderTop: `1px solid ${c.border}`, marginTop: 16, paddingTop: 14 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: c.text, textAlign: isAr ? "right" : "left" }}>{t.tipsTitle}</h3>
                {t.tips.map((tip) => (
                  <div key={tip} style={{ display: "flex", flexDirection: isAr ? "row-reverse" : "row", alignItems: "center", gap: 8, fontSize: 12, color: c.subText, marginBottom: 8 }}>
                    <span style={{ color: "#E8821A", fontSize: 13 }}>✓</span>{tip}
                  </div>
                ))}
              </div>
          </div>

          {/* ─── CENTER (Canvas + CTA) ─── */}
          <div
            className={`tryon-block-canvas ${mode === "image" && !uploadedImageUrl ? "tryon-canvas-empty-mobile" : ""} ${mode === "camera" ? "tryon-camera-fullscreen-mobile" : ""}`}
            style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%", minHeight: 0 }}
          >

            <div className="tryon-canvas" style={{ background: c.camBg, borderRadius: 18, overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flex: 1, minHeight: 0, boxShadow: c.cardShadow }}>

              {/* Camera active */}
              {mode === "camera" && cameraActive && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                  />
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "16px" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 200, height: 260, border: "2px dashed rgba(255,255,255,0.6)", borderRadius: "50%", boxShadow: "0 0 0 9999px rgba(0,0,0,0.18)" }} />
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, textAlign: "center", margin: 0, background: "rgba(0,0,0,.35)", borderRadius: 8, padding: "6px 14px", alignSelf: "center" }}>
                      {t.faceFrame}
                    </p>
                  </div>
                  <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 14, alignItems: "center" }}>
                    <button
                      onClick={capturePhoto}
                      style={{ width: 64, height: 64, borderRadius: "50%", background: "#E8821A", border: "3px solid #fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: "0 4px 20px rgba(0,0,0,.3)" }}
                    >
                      📸
                    </button>
                    <button
                      onClick={() => { stopCamera(); setMode("image"); }}
                      style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(0,0,0,.5)", border: "2px solid rgba(255,255,255,.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff" }}
                    >
                      ✕
                    </button>
                  </div>
                </>
              )}

              {/* Camera error */}
              {mode === "camera" && cameraError && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24 }}>
                  <div style={{ fontSize: 40 }}>📷</div>
                  <p style={{ color: "#c00", fontSize: 13, textAlign: "center", margin: 0 }}>{cameraError}</p>
                  <button
                    onClick={() => { setMode("image"); setCameraError(null); }}
                    style={{ padding: "8px 20px", background: "#E8821A", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}
                  >
                    {t.back}
                  </button>
                </div>
              )}

              {/* Image uploaded */}
              {mode === "image" && uploadedImageUrl && (
                <>
                  <img src={uploadedImageUrl} alt="صورتك" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {loading && (
                    <div style={{ position: "absolute", inset: 0, background: darkMode ? "rgba(0,0,0,.75)" : "rgba(255,255,255,.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                      <div style={{ width: 44, height: 44, border: "3px solid #f0f0f0", borderTop: "3px solid #E8821A", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                      <p style={{ color: c.subText, fontSize: 14, margin: 0 }}>{t.processing}</p>
                    </div>
                  )}
                </>
              )}

              {/* Empty state */}
              {mode === "image" && !uploadedImageUrl && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14, padding: 24 }}>
                  <div style={{
                    width: 76, height: 76, borderRadius: "50%",
                    background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 34,
                  }}>
                    🕶️
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 6px" }}>{t.emptyHint}</p>
                    <p style={{ fontSize: 13, color: c.mutedText, margin: 0, lineHeight: 1.7 }}>{t.emptyHint2}</p>
                  </div>
                </div>
              )}

              {/* Overlay controls */}
              {!(mode === "camera" && cameraActive) && (
                <>
                  <button style={{ position: "absolute", top: 14, left: 14, background: darkMode ? "rgba(40,40,40,.92)" : "rgba(255,255,255,.92)", border: `1px solid ${c.border}`, color: c.text, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    {t.compare}
                  </button>
                  <div style={{ position: "absolute", bottom: 14, right: 14, display: "flex", gap: 8 }}>
                    {["🔍+", "🔍-"].map((z) => (
                      <button key={z} style={{ width: 36, height: 36, borderRadius: 8, background: darkMode ? "rgba(40,40,40,.92)" : "rgba(255,255,255,.92)", border: `1px solid ${c.border}`, color: c.text, cursor: "pointer", fontSize: 14 }}>{z}</button>
                    ))}
                  </div>
                  <button style={{ position: "absolute", bottom: 14, left: 14, width: 36, height: 36, borderRadius: 8, background: darkMode ? "rgba(40,40,40,.92)" : "rgba(255,255,255,.92)", border: `1px solid ${c.border}`, color: c.text, cursor: "pointer", fontSize: 16 }}>⛶</button>
                </>
              )}
            </div>

            {/* CTA */}
            {selectedProduct && (
              <div style={{ background: c.cardBg, borderRadius: 16, padding: "18px", border: `1px solid ${c.border}`, boxShadow: c.cardShadow }}>
                <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, textAlign: "center", color: c.text }}>{t.likeIt}</p>
                <p style={{ margin: "0 0 18px", fontSize: 12.5, color: c.mutedText, textAlign: "center" }}>{t.likeDesc}</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="btn-ghost"
                    onClick={() => handleWishlist(selectedId)}
                    style={{ flex: 1, padding: "12px 0", border: "1.5px solid #E8821A", borderRadius: 12, background: c.cardBg, color: "#E8821A", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    {wishlist.includes(selectedId) ? "❤️" : "🤍"} {t.addWish}
                  </button>
                  <button
                    onClick={handleOrder}
                    style={{ flex: 1, padding: "12px 0", background: cartLoading ? "#f0a060" : "#E8821A", color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 3px 10px rgba(232,130,26,.22)" }}
                  >
                    🛒 {cartLoading ? t.ordering : t.orderNow}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─── RIGHT PANEL — Products ─── */}
          <div className="tryon-block-products" style={{ background: c.cardBg, borderRadius: 16, padding: "18px 16px", border: `1px solid ${c.border}`, boxShadow: c.cardShadow, height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: c.text, textAlign: isAr ? "right" : "left", flex: "0 0 auto" }}>{t.chooseGlasses}</h3>

            {/* Category pills */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", flex: "0 0 auto" }}>
              {[
                { k: "all",        label: t.catAll  },
                { k: "sunglasses", label: t.catSun  },
                { k: "medical",    label: t.catMed  },
                { k: "reading",    label: t.catRead },
              ].map(({ k, label }) => (
                <button
                  key={k}
                  className="cat-pill"
                  onClick={() => setCategory(k)}
                  style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${category === k ? "#E8821A" : c.border2}`, background: category === k ? "#E8821A" : c.pillBg, color: category === k ? "#fff" : c.pillText, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Product list — بيسكرول لوحده جوه المساحة المتاحة بس، والهيدر والزرار تحت بيفضلوا ثابتين */}
            {productsLoading && (
              <div style={{ textAlign: "center", padding: "32px 0", color: c.mutedText }}>
                <div style={{ width: 28, height: 28, border: "2.5px solid #f0f0f0", borderTop: "2.5px solid #E8821A", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 10px" }} />
                <span style={{ fontSize: 13 }}>{t.loadingProds}</span>
              </div>
            )}

            {!productsLoading && filtered.length === 0 && (
              <p style={{ textAlign: "center", color: c.mutedText, fontSize: 13, padding: "24px 0" }}>{t.noProds}</p>
            )}

            {!productsLoading && filtered.length > 0 && (
              <div className="tryon-products-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, flex: "1 1 auto", minHeight: 0, overflowY: "auto", alignContent: "start", paddingBottom: 4 }}>
                {filtered.map((p) => {
                  const isSel = p.id === selectedId;
                  return (
                    <div
                      key={p.id}
                      className="glass-card"
                      onClick={() => handleSelectProduct(p.id)}
                      style={{
                        border: `1.5px solid ${isSel ? "#E8821A" : c.border}`,
                        borderRadius: 14, padding: 10, cursor: "pointer",
                        background: isSel ? (darkMode ? "#3a2010" : "#fff8f2") : c.cardBg,
                        position: "relative",
                        boxShadow: isSel ? "0 3px 12px rgba(232,130,26,.16)" : "none",
                        display: "flex", flexDirection: "column", gap: 8,
                      }}
                    >
                      {isSel && (
                        <div style={{ position: "absolute", top: 8, left: 8, width: 20, height: 20, borderRadius: "50%", background: "#E8821A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700, zIndex: 1 }}>✓</div>
                      )}
                      <div style={{ width: "100%", aspectRatio: "4 / 3", background: "#fff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", padding: 6 }}>
                        {p.image_url
                          ? <img src={`${BASE_URL}${p.image_url}`} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                          : <GlassPlaceholder color={darkMode ? "#666" : "#999"} />
                        }
                        <button
                          onClick={(e) => handleWishlist(p.id, e)}
                          style={{ position: "absolute", top: 6, insetInlineEnd: 6, background: "rgba(255,255,255,.9)", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: 14, color: wishlist.includes(p.id) ? "#E8821A" : "#999", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          {wishlist.includes(p.id) ? "❤️" : "♡"}
                        </button>
                      </div>
                      <div style={{ textAlign: isAr ? "right" : "left" }}>
                        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                        {p.color && <p style={{ margin: "2px 0", fontSize: 10.5, color: c.mutedText }}>{p.color}</p>}
                        <p style={{ margin: "2px 0 0", fontSize: 13.5, fontWeight: 800, color: "#E8821A" }}>
                          {Number(p.price).toFixed(0)}{" "}
                          <span style={{ fontSize: 10.5, fontWeight: 500, color: c.subText }}>{t.currency}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => navigate("/products")}
              style={{ width: "100%", marginTop: 12, padding: "9px 0", background: "none", border: `1px solid ${c.border}`, borderRadius: 10, fontSize: 13, color: "#E8821A", fontWeight: 600, cursor: "pointer", flex: "0 0 auto" }}
            >
              {t.viewAll}
            </button>
          </div>

        </div>

        </div>

      </div>
    </div>
  );
}