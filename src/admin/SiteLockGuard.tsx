import { ReactNode } from "react";
import { useSiteLock } from "@/hooks/useSiteLock";
import { Navigate, useLocation } from "react-router-dom";

interface SiteLockGuardProps {
  children: ReactNode;
  allowAdmin?: boolean;
}

/**
 * SiteLockGuard - Redirects users to /we-locked if site is locked
 * @param children - Components to render when site is not locked
 * @param allowAdmin - If true, allows /admin routes to bypass the lock (default: true)
 */
const SiteLockGuard = ({ children, allowAdmin = true }: SiteLockGuardProps) => {
  const { lockStatus, loading } = useSiteLock();
  const location = useLocation();

  // If checking lock status, show nothing (loading state)
  if (loading) {
    return null;
  }

  // Get current path
  const currentPath = location.pathname;
  const isAdminPath = currentPath.startsWith("/admin");
  const isLockedPath = currentPath === "/we-locked";

  // If site is locked, not in admin, and not already on /we-locked page
  if (lockStatus?.isLocked && !isAdminPath && !isLockedPath) {
    return <Navigate to="/we-locked" replace />;
  }

  return <>{children}</>;
};

export default SiteLockGuard;
