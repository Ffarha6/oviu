import { createContext, useContext, useState, useEffect, useCallback } from "react"

export const CartContext = createContext()

const API = "http://localhost:8000/api/cart"

// ✅ بيقرا الـ body كـ JSON مرة واحدة، وبيستخرج رسالة خطأ واضحة لو الرد مش ok
// (سواء الباك إند رجع {error: "..."} أو {detail: "..."} أو أخطاء validation
// لكل حقل زي {"quantity": ["..."]})
async function parseCartResponse(res) {
  let data = {}
  try {
    data = await res.json()
  } catch {
    data = {}
  }

  if (!res.ok) {
    const firstFieldError = Object.values(data || {})[0]
    const message =
      data?.error ||
      data?.detail ||
      (Array.isArray(firstFieldError) ? firstFieldError[0] : firstFieldError) ||
      "حدث خطأ، حاولي مرة أخرى"
    const error = new Error(message)
    error.data = data // ✅ لو محتاجة تفاصيل زيادة زي available_stock
    throw error
  }

  return data
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total_price: 0, total_items: 0 })
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch(`${API}/`, { credentials: "include" })
      const data = await parseCartResponse(res)
      setCart(data)
    } catch (err) {
      console.error("Cart fetch error:", err)
    }
  }, [])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addToCart = async (product_id, color_id = null, quantity = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/add/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id, color_id, quantity }),
      })
      // ✅ الفرق الأساسي: بنستنى نتأكد إن الرد ok الأول، ولو لأ بنرمي Error
      // برسالة واضحة من غير ما نلمس الـ cart state خالص. ده اللي بيمنع
      // السلة من "تفضى" لما الباك إند يرفض الإضافة (مثلاً نفذ من المخزون).
      const data = await parseCartResponse(res)
      setCart(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (item_id, quantity) => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/item/${item_id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })
      const data = await parseCartResponse(res)
      setCart(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (item_id) => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/remove/${item_id}/`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await parseCartResponse(res)
      setCart(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/clear/`, {
        method: "DELETE",
        credentials: "include",
      })
      // ✅ endpoint الـ clear بيرجع {"message": "..."} مش شكل السلة، فبنتأكد
      // إن الطلب نجح بس (من غير ما نحط الرد نفسه في الـ cart state)
      await parseCartResponse(res)
      setCart({ items: [], total_price: 0, total_items: 0 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      fetchCart,
      addToCart,
      updateItem,
      removeItem,
      clearCart,
      cartCount: cart.total_items ?? 0,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)