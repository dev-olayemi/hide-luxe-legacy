import { useEffect, useState } from "react";
import { useSiteLock } from "@/hooks/useSiteLock";
import { AlertTriangle, Clock, X } from "lucide-react";

const SiteLockBanner = () => {
  const { lockStatus } = useSiteLock();
  const [countdown, setCountdown] = useState<string>("");
  const [dismissed, setDismissed] = useState(false);

  // Hide banner in admin area
  const isAdminPage = window.location.pathname.startsWith("/admin");

  // Countdown timer
  useEffect(() => {
    if (!lockStatus?.isLocked || !lockStatus?.expectedLiftTime) return;

    setCountdown("Calculating..."); // Show immediately

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const liftTime = new Date(lockStatus.expectedLiftTime!).getTime();
      const difference = liftTime - now;

      if (difference <= 0) {
        setCountdown("Expired - please refresh manually");
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        if (days > 0) {
          setCountdown(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setCountdown(`${minutes}m ${seconds}s`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockStatus?.isLocked, lockStatus?.expectedLiftTime]);

  // If not locked, dismissed, or on admin page, don't show
  if (!lockStatus?.isLocked || dismissed || isAdminPage) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 w-full">
      {/* Animated banner */}
      <div className="relative h-auto bg-gradient-to-r from-red-600 via-red-500 to-orange-600 text-white overflow-hidden">
        {/* Animated background shine effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
        </div>

        {/* Content */}
        <div className="relative px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left side - Message */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 animate-bounce" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm sm:text-base">
                  Site is Temporarily Locked
                </p>
                <p className="text-xs sm:text-sm opacity-90 truncate">
                  {lockStatus.reason || "We are performing maintenance"}
                </p>
              </div>
            </div>

            {/* Center - Countdown */}
            {countdown && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold text-sm sm:text-base">
                  {countdown}
                </span>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Additional info line */}
          {lockStatus.expectedLiftTime && (
            <p className="text-xs mt-3 opacity-85">
              Expected to be back online: {new Date(lockStatus.expectedLiftTime).toLocaleString()}
            </p>
          )}
        </div>

        {/* Bottom animated line */}
        <div className="h-1 bg-white opacity-30">
          <div className="h-full bg-white opacity-50 animate-pulse" style={{
            animation: "slide 2s infinite"
          }}></div>
        </div>
      </div>

      <style>{`
        @keyframes slide {
          0% {
            width: 0%;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SiteLockBanner;
