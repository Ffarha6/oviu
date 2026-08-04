import "./i18n.js";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.jsx'
import { SettingsProvider } from "./context/SettingsContext";
import ThemeProvider from "./context/ThemeContext"
import LanguageProvider from "./context/LanguageContext"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { ToastProvider } from "./context/ToastContext"       // ✅ إضافة جديدة
import { WishlistProvider } from "./context/WishlistContext" // ✅ إضافة جديدة

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            {/* ✅ ToastProvider لازم يكون فوق WishlistProvider
                لأن WishlistContext بيستخدم useToast() جواه */}
            <ToastProvider>
              <WishlistProvider>
                  <SettingsProvider>
                <App />
                  </SettingsProvider>
              </WishlistProvider>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>
)