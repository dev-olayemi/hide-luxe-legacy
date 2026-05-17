import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return isOnline;
}

/** Returns true if the error looks like a network/connectivity problem */
export function isNetworkError(err: unknown): boolean {
  if (!navigator.onLine) return true;
  const msg = ((err as any)?.message || (err as any)?.code || '').toLowerCase();
  return (
    msg.includes('network') ||
    msg.includes('unavailable') ||
    msg.includes('failed to fetch') ||
    msg.includes('timeout') ||
    msg.includes('offline') ||
    msg.includes('err_internet')
  );
}
