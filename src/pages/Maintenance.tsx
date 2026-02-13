import { useEffect, useState } from "react";
import { getSiteLockStatus } from "@/firebase/firebaseUtils";
import { Clock, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface SiteLockStatus {
  isLocked: boolean;
  reason: string;
  expectedLiftTime: Date | null;
}

const Maintenance = () => {
  const [lockStatus, setLockStatus] = useState<SiteLockStatus>({
    isLocked: true,
    reason: "We are currently performing maintenance",
    expectedLiftTime: null,
  });

  const [countdown, setCountdown] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLockStatus();
  }, []);

  const fetchLockStatus = async () => {
    try {
      const status = await getSiteLockStatus();
      setLockStatus({
        isLocked: status.isLocked,
        reason: status.reason,
        expectedLiftTime: status.expectedLiftTime,
      });
    } catch (error) {
      console.error("Error fetching lock status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!lockStatus.expectedLiftTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const liftTime = new Date(lockStatus.expectedLiftTime!).getTime();
      const difference = liftTime - now;

      if (difference <= 0) {
        setCountdown("Expired - the site should be back online now");
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        if (days > 0) {
          setCountdown(`${days} day${days > 1 ? "s" : ""}, ${hours}h ${minutes}m ${seconds}s`);
        } else if (hours > 0) {
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setCountdown(`${minutes}m ${seconds}s`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockStatus.expectedLiftTime]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-yellow-100 p-4 rounded-full">
              <AlertTriangle className="h-12 w-12 text-yellow-600" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">We're Locked</h1>
            <p className="text-gray-500 mt-2">Temporarily unavailable</p>
          </div>

          {/* Reason */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-gray-700 text-sm">{lockStatus.reason}</p>
          </div>

          {/* Countdown */}
          {lockStatus.expectedLiftTime && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Expected time to reopen:</span>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-2xl font-mono font-bold text-blue-600">
                  {countdown || "Calculating..."}
                </p>
              </div>
              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-semibold mb-1">Opens at:</p>
                <p>{new Date(lockStatus.expectedLiftTime).toLocaleString()}</p>
              </div>
            </div>
          )}

          {!lockStatus.expectedLiftTime && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-amber-800 text-sm">
                No expected reopening time set. We'll be back as soon as possible!
              </p>
            </div>
          )}

          {/* Contact Info */}
          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 mb-4">
              Have questions? Get in touch:
            </p>
            <a
              href="mailto:support@28thhideluxe.com"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Contact Support
            </a>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-400 space-y-2">
            <p className="font-semibold">28TH Hide Luxe</p>
            <p>Premium Leather. Luxury. Legacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
