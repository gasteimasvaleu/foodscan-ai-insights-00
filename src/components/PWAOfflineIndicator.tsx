import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff } from 'lucide-react';

const PWAOfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Hide offline message after 5 seconds
    let timeout: NodeJS.Timeout;
    if (!isOnline) {
      timeout = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 5000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeout) clearTimeout(timeout);
    };
  }, [isOnline]);

  if (isOnline || !showOfflineMessage) return null;

  return (
    <Alert className="fixed top-20 left-4 right-4 z-50 border-orange-200 bg-orange-50 animate-fade-in safe-area-top">
      <WifiOff className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        Você está offline. Algumas funcionalidades podem estar limitadas.
      </AlertDescription>
    </Alert>
  );
};

export default PWAOfflineIndicator;