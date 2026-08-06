import { createContext, useContext, useState, useEffect, useCallback } from "react"

export const CartContext = createContext()

const API = "https://oviu-production.up.railway.app/api/cart"

// مفتاح ثابت لحفظ هوية سلة الزائر في المتصفح
const CART_ID_KEY = "oviu_guest_cart_id"

// الحصول على Guest Cart ID ثابت.
// بيتعمل مرة واحدة فقط وبعدها يفضل محفوظ في localStorage.
function getGuestCartId() {
  let cartId = localStorage.getItem(CART_ID_KEY)

  if (!cartId) {
    cartId = crypto.randomUUID()
    localStorage.setItem(CART_ID_KEY, cartId)
  }

  return cartId
}

// كل طلب خاص بالسلة هيبعت نفس X-Cart-Id للـ Backend
function getCartHeaders(includeContentType = false) {
  const headers = {
    "X-Cart-Id": getGuestCartId(),
  }

  const token = localStorage.getItem("access_token")

  if (token) {
    headers["Authorization"] = `Token ${token}`
  }

  if (includeContentType) {
    headers["Content-Type"] = "application/json"
  }

  return headers
}

// قراءة رد الـ Backend واستخراج رسالة خطأ واضحة
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
    error.data = data

    throw error
  }

  return data
}


export function CartProvider({ children }) {
  const [cart, setCart] = useState({
    items: [],
    total_price: 0,
    total_items: 0,
  })

  const [loading, setLoading] = useState(false)


  // =========================
  // GET CART
  // =========================
  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch(`${API}/`, {
        credentials: "include",
        headers: getCartHeaders(),
      })

      const data = await parseCartResponse(res)
      setCart(data)
    } catch (err) {
      console.error("Cart fetch error:", err)
    }
  }, [])


  useEffect(() => {
    fetchCart()
  }, [fetchCart])


  // =========================
  // ADD TO CART
  // =========================
  const addToCart = async (
    product_id,
    color_id = null,
    quantity = 1
  ) => {
    setLoading(true)

    try {
      const res = await fetch(`${API}/add/`, {
        method: "POST",
        credentials: "include",
        headers: getCartHeaders(true),
        body: JSON.stringify({
          product_id,
          color_id,
          quantity,
        }),
      })

      const data = await parseCartResponse(res)

      setCart(data)

      return data
    } finally {
      setLoading(false)
    }
  }


  // =========================
  // UPDATE ITEM
  // =========================
  const updateItem = async (item_id, quantity) => {
    setLoading(true)

    try {
      const res = await fetch(`${API}/item/${item_id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: getCartHeaders(true),
        body: JSON.stringify({
          quantity,
        }),
      })

      const data = await parseCartResponse(res)

      setCart(data)

      return data
    } finally {
      setLoading(false)
    }
  }


  // =========================
  // REMOVE ITEM
  // =========================
  const removeItem = async (item_id) => {
    setLoading(true)

    try {
      const res = await fetch(`${API}/remove/${item_id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: getCartHeaders(),
      })

      const data = await parseCartResponse(res)

      setCart(data)

      return data
    } finally {
      setLoading(false)
    }
  }


  // =========================
  // CLEAR CART
  // =========================
  const clearCart = async () => {
    setLoading(true)

    try {
      const res = await fetch(`${API}/clear/`, {
        method: "DELETE",
        credentials: "include",
        headers: getCartHeaders(),
      })

      await parseCartResponse(res)

      setCart({
        items: [],
        total_price: 0,
        total_items: 0,
      })
    } finally {
      setLoading(false)
    }
  }


  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        cartCount: cart.total_items ?? 0,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}


export const useCart = () => useContext(CartContext)