import { useEffect, useState } from "react";
import { getSiteLockStatus } from "@/firebase/firebaseUtils";

interface SiteLockStatus {
  isLocked: boolean;
  reason: string;
  expectedLiftTime: Date | null;
  lockedBy: string;
  lockedAt: Date | null;
}

export const useSiteLock = () => {
  const [lockStatus, setLockStatus] = useState<SiteLockStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getSiteLockStatus();
        setLockStatus(status);
      } catch (error) {
        console.error("Error checking site lock status:", error);
      } finally {
        setLoading(false);
      }
    };

    // Check immediately
    fetchStatus();

    // Check every 30 seconds for lock status changes
    const interval = setInterval(fetchStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return { lockStatus, loading };
};
