import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../api/axios"
import { useToast } from "./ToastContext"

const WishlistContext = createContext(null)

function hasToken() {
  return !!(localStorage.getItem("access_token") || localStorage.getItem("token"))
}

/**
 * WishlistProvider
 * لازم يتحط مرة واحدة لافّ التطبيق كله، وبعد <ToastProvider> في الترتيب
 * (عشان بيستخدم useToast() جواه).
 *
 * بيدي لأي كومبوننت (كارت منتج، صفحة تفاصيل، ...) طريقة موحدة يعرف بيها
 * هل المنتج ده في المفضلة ولا لأ، وطريقة موحدة يضيف/يشيل بيها، من غير
 * ما كل كارت يعمل الطلب لوحده أو يمسك حالة منفصلة.
 */
export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState(new Set())
  const [loaded, setLoaded] = useState(false)
  const { showToast } = useToast()

  const fetchWishlist = useCallback(async () => {
    if (!hasToken()) {
      setWishlistIds(new Set())
      setLoaded(true)
      return
    }
    try {
      const res = await api.get("/wishlist/")
      const list = Array.isArray(res.data) ? res.data : []
      const ids = list.map(item => item.product_detail?.id ?? item.product)
      setWishlistIds(new Set(ids))
    } catch (err) {
      // تجاهل بهدوء - مش المفروض يكسر أي صفحة لو الطلب فشل
      console.error("Wishlist fetch error:", err)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const isWishlisted = useCallback(
    (productId) => wishlistIds.has(productId),
    [wishlistIds]
  )

  const toggleWishlist = useCallback(async (productId) => {
    if (!productId) return

    if (!hasToken()) {
      showToast("سجل الدخول الأول عشان تضيف للمفضلة", "info")
      return
    }

    const currentlyIn = wishlistIds.has(productId)

    // ✅ Optimistic update: نحدّث الشكل فورًا من غير ما ننتظر رد السيرفر
    setWishlistIds(prev => {
      const next = new Set(prev)
      if (currentlyIn) next.delete(productId)
      else next.add(productId)
      return next
    })

    try {
      if (currentlyIn) {
        await api.delete(`/wishlist/remove/${productId}/`)
        showToast("تمت الإزالة من المفضلة", "info")
      } else {
        await api.post("/wishlist/add/", { product_id: productId })
        showToast("تمت الإضافة إلى المفضلة ❤️", "success")
      }
    } catch (err) {
      // ❌ لو الطلب فشل، نرجع الحالة زي ما كانت (rollback) عشان الواجهة
      // متفضلش تقول حاجة غلط عن الباك
      setWishlistIds(prev => {
        const next = new Set(prev)
        if (currentlyIn) next.add(productId)
        else next.delete(productId)
        return next
      })
      console.error("Wishlist toggle error:", err)
      showToast("حصل خطأ، حاولي تاني", "error")
    }
  }, [wishlistIds, showToast])

  return (
    <WishlistContext.Provider value={{ isWishlisted, toggleWishlist, loaded, refreshWishlist: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) {
    throw new Error("useWishlist لازم يتستخدم جوه <WishlistProvider>")
  }
  return ctx
}