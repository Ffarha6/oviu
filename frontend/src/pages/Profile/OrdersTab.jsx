import { useState } from "react"
import { Link } from "react-router-dom"
import { FaSearch, FaFilter, FaBoxOpen, FaHeadset } from "react-icons/fa"
import FullOrderCard from "./FullOrderCard"
import OrderDetailsView from "./OrderDetailsView"
import { ORDER_FILTERS } from "./profileConstants"

export default function OrdersTab({ orders, ordersError }) {
  const [orderSearch, setOrderSearch] = useState("")
  const [orderFilter, setOrderFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)

  if (selectedOrder) {
    return <OrderDetailsView order={selectedOrder} onBack={() => setSelectedOrder(null)} />
  }

  const filteredOrders = orders.filter(o => {
    const matchFilter = orderFilter === "all" || o.status === orderFilter
    const matchSearch = orderSearch === "" || String(o.id).includes(orderSearch)
    return matchFilter && matchSearch
  })

  return (
    <div className="flex flex-col gap-5">

      <div className="flex justify-between items-center">
        <div>
          <h2 className="m-0 text-2xl font-bold text-[#222] dark:text-gray-100">طلباتي 📦</h2>
          <p className="mt-1 mb-0 text-[15px] text-[#aaa] dark:text-gray-500">تتبع جميع طلباتك وحالة الشحن الخاصة بها</p>
        </div>
        <span className="text-[15px] text-[#888] dark:text-gray-400 bg-white dark:bg-black px-3.5 py-1.5 rounded-[20px] border border-[#f0f0f0] dark:border-gray-700">
          {orders.length} طلب
        </span>
      </div>

      <div className="bg-white dark:bg-black rounded-2xl p-4 border border-[#f0f0f0] dark:border-gray-700">
        <div className="flex items-center gap-2.5 bg-[#f8f8f8] dark:bg-gray-700 rounded-[10px] px-3.5 py-2.5 mb-3.5">
          <FaSearch className="text-[#ccc] dark:text-gray-500 text-base" />
          <input
            value={orderSearch}
            onChange={e => setOrderSearch(e.target.value)}
            placeholder="ابحث برقم الطلب..."
            className="border-none bg-transparent outline-none text-base flex-1 text-[#222] dark:text-gray-100 placeholder:text-[#aaa] dark:placeholder:text-gray-500"
            style={{ fontFamily: "'Cairo',sans-serif", direction: "rtl" }}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-[15px] text-[#888] dark:text-gray-400 ml-1">
            <FaFilter className="text-[11px]" /> تصفية:
          </span>
          {ORDER_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setOrderFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-[20px] border-[1.5px] text-sm cursor-pointer transition-all duration-150
                ${orderFilter === f.key
                  ? "border-[#E8821A] bg-[#fff4ea] dark:bg-[#3a2410] text-[#E8821A] font-bold"
                  : "border-[#e0e0e0] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#666] dark:text-gray-300 font-normal"}
              `}
              style={{ fontFamily: "'Cairo',sans-serif" }}
            >
              {f.label}
              <span className={`mr-1 text-[13px] ${orderFilter === f.key ? "text-[#E8821A]" : "text-[#aaa] dark:text-gray-500"}`}>
                ({f.key === "all" ? orders.length : orders.filter(o => o.status === f.key).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {ordersError && (
        <div className="bg-[#fef2f2] dark:bg-[#3a1a1a] border border-[#fecaca] dark:border-[#5c2626] rounded-xl p-4 text-[#ef4444] dark:text-[#f87171] text-base text-center">
          {ordersError}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-black rounded-2xl border border-[#f0f0f0] dark:border-gray-700 text-center" style={{ padding: 60 }}>
          <FaBoxOpen className="text-5xl text-[#e0e0e0] dark:text-gray-600 mb-4 mx-auto" />
          <p className="text-lg font-semibold text-[#aaa] dark:text-gray-500 mb-2 mt-0">لا توجد طلبات</p>
          <p className="text-[15px] text-[#ccc] dark:text-gray-600 mb-6 mt-0">
            {orderSearch ? "لم يتم العثور على طلب بهذا الرقم" : "لم تقم بأي طلبات بعد"}
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2.5 bg-[#E8821A] text-white rounded-[10px] no-underline text-base font-semibold"
          >
            تسوق الآن
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredOrders.map(order => (
            <FullOrderCard
              key={order.id}
              order={order}
              onViewDetails={setSelectedOrder}
            />
          ))}
        </div>
      )}

      <div className="bg-[#fff4ea] dark:bg-[#3a2410] rounded-2xl px-6 py-5 flex items-center justify-between border border-[#fed7aa] dark:border-[#5c3d1a] flex-wrap gap-3">
        <div className="flex items-center gap-3.5">
          <FaHeadset className="text-[28px] text-[#E8821A]" />
          <div>
            <p className="m-0 text-base font-bold text-[#222] dark:text-gray-100">تحتاج مساعدة في طلبك؟</p>
            <p className="m-0 text-sm text-[#888] dark:text-gray-400">فريق الدعم متاح 24/7 لمساعدتك</p>
          </div>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
          className="px-5 py-2.5 bg-[#E8821A] text-white border-none rounded-[10px] text-[15px] font-semibold cursor-pointer"
          style={{ fontFamily: "'Cairo',sans-serif" }}
        >
          تواصل معنا 💬
        </button>
      </div>
    </div>
  )
}