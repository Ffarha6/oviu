import { useState } from "react";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// ✅ الـ Layout الرئيسي لكل صفحات الأدمن
// استخدميه كـ parent route في الراوتر بتاعك:
// <Route path="/admin" element={<AdminLayout />}>
//   <Route index element={<Dashboard />} />
//   <Route path="products" element={<Products />} />
//   ...
// </Route>
export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      {/* Mobile sidebar drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-primary/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-primary">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 right-4 text-background/60 p-1"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}