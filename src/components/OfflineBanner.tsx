import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Offline Mode — Cached data is being used. Health entries will sync when reconnected.</span>
    </div>
  );
};
