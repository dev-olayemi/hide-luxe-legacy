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
    </div>
  );
};

export default AdminLayout;
