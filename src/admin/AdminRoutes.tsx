import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import AdminGuard from "./AdminGuard";
import Admin404 from "./pages/Admin404";
import AdminAuth from "./AdminAuth";

/* pages */
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import BespokeRequests from "./pages/BespokeRequests";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Users from "./pages/Users";
// Admin-specific users management (with points editing)
import AdminUsers from "./pages/AdminUsers";
import Subscriptions from "./pages/Subscriptions";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import HeroManagement from "./pages/HeroManagement";
import AdminMessaging from "./AdminMessaging";
import AdminNotifications from "./pages/AdminNotifications";
import AdminCoupons from "./pages/AdminCoupons";
import AdminCollections from "./pages/AdminCollections";
import AdminContacts from "./pages/AdminContacts";
import SiteLock from "./pages/SiteLock";

const AdminRoutes: React.FC = () => (
  <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
    <Routes>
      <Route path="auth" element={<AdminAuth />} />
      <Route
        path="/"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="bespoke" element={<BespokeRequests />} />
        <Route path="bespoke-requests" element={<BespokeRequests />} />
        <Route path="products" element={<Products />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        {/* Use the admin users management page which includes store-points controls */}
        <Route path="users" element={<AdminUsers />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="hero" element={<HeroManagement />} />
        <Route path="collections" element={<AdminCollections />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="messaging" element={<AdminMessaging />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="site-lock" element={<SiteLock />} />
        <Route path="*" element={<Admin404 />} />
      </Route>
    </Routes>
  </Suspense>
);

export default AdminRoutes;
