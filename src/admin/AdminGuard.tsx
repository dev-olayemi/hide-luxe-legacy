import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Simple guard: checks localStorage isAdmin flag or you can plug in AuthContext.
 * Replace with server-verified admin checks for production.
 */
const AdminGuard: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const location = useLocation();
  const isAdmin =
    typeof window !== "undefined" && localStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    return <Navigate to="/admin/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminGuard;
