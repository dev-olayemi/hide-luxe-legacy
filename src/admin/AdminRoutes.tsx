import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import AdminGuard from "./AdminGuard";
import Admin404 from "./Admin404";

/* pages */
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import BespokeRequests from "./pages/BespokeRequests";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import Users from "./pages/Users";
import Subscriptions from "./pages/Subscriptions";
import Settings from "./pages/Settings";

const AdminRoutes: React.FC = () => (
  <Suspense fallback={<div>Loading admin...</div>}>
    <Routes>
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
        <Route path="products" element={<Products />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="users" element={<Users />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Admin404 />} />
      </Route>
    </Routes>
  </Suspense>
);

export default AdminRoutes;
