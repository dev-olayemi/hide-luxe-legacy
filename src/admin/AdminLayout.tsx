<<<<<<< HEAD
import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
=======
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    return <Navigate to="/admin/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
>>>>>>> 2b41995b4140bb9a884eef29d3d7edadd5435333
    </div>
  );
};

export default AdminLayout;
