import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { AuthCard } from '@/components/AuthCard';
import { QuickActions } from '@/components/QuickActions';
import { useAuth } from '@/hooks/useAuth';

import SplashScreen from '@/components/SplashScreen';

const Index = () => {
  const { user } = useAuth();
  
  const [showSplash, setShowSplash] = useState(() => {
    const shouldSkipSplash = sessionStorage.getItem('skipSplash');
    if (shouldSkipSplash) {
      sessionStorage.removeItem('skipSplash');
      return false;
    }
    
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    
    if (isPWA) return true;
    
    const hasShownInSession = sessionStorage.getItem('splashShown');
    return !hasShownInSession;
  });

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('splashShown', 'true');
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <>
      <Navbar />
      <div className={`min-h-screen bg-gradient-primary font-inter ${user ? 'pb-20 pt-[calc(env(safe-area-inset-top)+2.5rem)]' : 'pb-0 pt-4'}`}>
        <div className="container mx-auto py-0 px-[13px]">
          <div className="max-w-4xl mx-auto space-y-6">
            <AuthCard />
            <QuickActions />
          </div>
        </div>
      </div>
      


    </>;
};
export default Index;