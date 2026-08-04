import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom"
import { CartProvider } from "../context/CartContext.jsx"
import { useEffect } from "react"

import Register      from "../pages/Login/Register.jsx"
import Home          from "../pages/Home/Home.jsx"
import GlassesPage   from "../pages/Shop/GlassesPage.jsx"
import CartPage      from "../pages/Cart/CartPage.jsx"
import ProfilePage   from "../pages/Profile/ProfilePage.jsx"
import Login         from "../pages/Login/Login.jsx"
import Wishlist      from "../pages/Wishlist/WishlistPage.jsx"
import ProductDetail from "../pages/ProductDetails/ProductDetails.jsx"
import Layout        from "../components/layout/Layout.jsx"
import ProtectedRoute from "../components/common/ProtectedRoute.jsx"
import CheckoutPage  from "../pages/Checkout/CheckoutPage.jsx"
import FloatingChatbot from "../components/ui/FloatingChatbot.jsx"
import VirtualTryOn  from "../pages/VirtualTryOn/VirtualTryOn.jsx"
import OAuthCallback from "../pages/Login/OAuthCallback.jsx"
import OrderConfirmationPage from "../pages/Orders/OrderConfirmationPage.jsx"
// ✅ صفحتين جداد لتسجيل الدخول: نسيت كلمة المرور + إعادة التعيين
import ForgotPassword from "../pages/Login/ForgotPassword.jsx"
import ResetPassword   from "../pages/Login/ResetPassword.jsx"
// ✅ صفحة العروض — كانت ناقصة من الراوتس، عشان كده الصفحة كانت بتفضل بيضا لما تدوسي "العروض"
import OffersPage from "../pages/Shop/OffersPage.jsx"
import PrivacyPolicy from "../pages/PrivacyPolicy/PrivacyPolicy.jsx"
// ✅ أدمن بانل
import AdminLayout        from "../components/admin/layout/AdminLayout.jsx"

import Dashboard          from "../pages/Admin/Dashboard.jsx"
import Products           from "../pages/Admin/Products.jsx"
import ProductForm        from "../pages/Admin/ProductForm.jsx"
import Orders             from "../pages/Admin/Orders.jsx"
import OrderDetail        from "../pages/Admin/OrderDetail.jsx"
import Customers          from "../pages/Admin/Customers.jsx"
import AiTryOn            from "../pages/Admin/AITryOn.jsx"
import Reviews            from "../pages/Admin/Reviews.jsx"
import Coupons            from "../pages/Admin/Coupons.jsx"
import CouponForm         from "../pages/Admin/CouponForm.jsx"
import Payments           from "../pages/Admin/Payments.jsx"
import AdminWishlist      from "../pages/Admin/Wishlist.jsx"
import Chatbot            from "../pages/Admin/Chatbot.jsx"
import AdminSettings      from "../pages/Admin/Settings.jsx"
import Analytics          from "../pages/Admin/Analytics.jsx"
import Reports            from "../pages/Admin/Reports.jsx"
import Offers             from "../pages/Admin/Offers.jsx"
import AdminsPage         from "../pages/Admin/Admins.jsx"
import AddAdmin           from "../pages/Admin/AddAdmin.jsx"
import ProtectedAdminRoute from "../components/common/ProtectedAdminRoute.jsx"

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// ✅ الشات بوت العائم كان ظاهر في كل الصفحات لأنه متحط برا الـ <Routes> في
// App، حتى في صفحات تسجيل الدخول/التسجيل اللي مفروض تبقى نضيفة بدون عناصر
// زيادة فوق الكارد. الكومبوننت ده بيقفل عرضه في الصفحات دي بس.
const AUTH_ROUTES_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/oauth/callback",
];

function ChatbotGate() {
  const { pathname } = useLocation();

  const isAuthPage = AUTH_ROUTES_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const isAdminPage = pathname.startsWith("/dashboard");

  if (isAuthPage || isAdminPage) {
    return null;
  }

  return <FloatingChatbot />;
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* بدون Navbar */}
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          {/* ✅ نفس مجموعة صفحات اللوجين (من غير Layout/Navbar) */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* ✅ الباك إند بيبعت التوكن في الـ path مش query string، بناءً على شكل الإيميل الفعلي */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* مع Navbar */}
          <Route path="/"                  element={<Layout><Home /></Layout>} />
          <Route path="/glasses/:category" element={<Layout><GlassesPage /></Layout>} />
          <Route path="/product/:id"       element={<Layout><ProductDetail /></Layout>} />
          <Route path="/wishlist"          element={<Layout><Wishlist /></Layout>} />
          {/* ✅ الراوت الناقص: صفحة العروض */}
          <Route path="/offers"            element={<Layout><OffersPage /></Layout>} />
          <Route path="/privacy-policy"    element={<Layout><PrivacyPolicy /></Layout>} />

          <Route path="/cart" element={
            <Layout><CartPage /></Layout>
          } />

          <Route path="/virtual-tryon" element={
            <Layout><VirtualTryOn /></Layout>
          } />

          {/* ✅ profile محمي بـ ProtectedRoute — طلباتي بقت تاب جواها */}
          <Route path="/profile" element={
            <Layout>
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            </Layout>
          } />

          {/* ✅ أي رابط قديم أو مفضلة متصفح على /orders يوديك لتاب الطلبات جوه البروفايل */}
          <Route path="/orders" element={
            <Navigate to="/profile" state={{ tab: "orders" }} replace />
          } />

          <Route path="/checkout" element={
            <Layout>
              <ProtectedRoute><CheckoutPage /></ProtectedRoute>
            </Layout>
          } />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />

          {/* ✅ أدمن بانل — محمية بـ ProtectedAdminRoute (is_staff / is_superuser بس) */}
          <Route path="/dashboard" element={
            <ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/add" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="customers" element={<Customers />} />
            <Route path="ai-try-on" element={<AiTryOn />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="coupons/add" element={<CouponForm />} />
            <Route path="coupons/:id/edit" element={<CouponForm />} />
            <Route path="payments" element={<Payments />} />
            <Route path="wishlist" element={<AdminWishlist />} />
            <Route path="chatbot" element={<Chatbot />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="offers" element={<Offers />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="admins/add" element={<AddAdmin />} />
          </Route>
        </Routes>

        <ChatbotGate />
      </BrowserRouter>
    </CartProvider>
  )
}

export default App