import { WifiOff, RefreshCw } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useEffect, useState } from 'react';

interface Props {
  /** Show as a full-page empty state instead of a top banner */
  fullPage?: boolean;
  onRetry?: () => void;
  message?: string;
}

/**
 * Shows a sticky top banner when the user goes offline.
 * Optionally renders a full-page empty state with a retry button.
 */
export const OfflineBanner = ({ fullPage = false, onRetry, message }: Props) => {
  const isOnline = useNetworkStatus();
  const [visible, setVisible] = useState(!isOnline);

  useEffect(() => {
    if (!isOnline) { setVisible(true); return; }
    // Keep banner visible briefly after reconnect so user sees "back online"
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, [isOnline]);

  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
        <WifiOff className="w-14 h-14 text-gray-300" />
        <div>
          <p className="text-gray-800 font-semibold text-xl">You're offline</p>
          <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
            {message || "Check your internet connection and try again."}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        )}
      </div>
    );
  }

  if (!visible) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-300 ${isOnline ? 'bg-green-600 text-white' : 'bg-gray-900 text-white'}`}>
      {isOnline ? (
        <>
          <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
          Back online
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          No internet connection — some content may not load
          {onRetry && (
            <button onClick={onRetry} className="ml-2 underline underline-offset-2 hover:no-underline">
              Retry
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default OfflineBanner;
