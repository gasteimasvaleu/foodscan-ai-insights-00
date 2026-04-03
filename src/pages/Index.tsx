import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { AuthCard } from '@/components/AuthCard';
import { QuickActions } from '@/components/QuickActions';
import { useAuth } from '@/hooks/useAuth';
import { useNativePlatform } from '@/hooks/useNativePlatform';

import SplashScreen from '@/components/SplashScreen';
import PaywallScreen from '@/components/PaywallScreen';

const Index = () => {
  const { user, authReady, subscriptionReady, subscriptionStatus, checkSubscription } = useAuth();
  const { isNative, isIOS } = useNativePlatform();
  const isNativeIOS = isNative && isIOS;

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

  // Wait for auth to be ready before making any UI decisions
  if (!authReady) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="animate-pulse">
          <img
            src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/logoapp.png"
            alt="We Diet"
            className="h-16 object-contain opacity-60"
          />
        </div>
      </div>
    );
  }

  // Not logged in → show login card
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-primary font-inter pb-0 pt-4">
          <div className="container mx-auto py-0 px-[13px]">
            <div className="max-w-4xl mx-auto space-y-6">
              <AuthCard />
            </div>
          </div>
        </div>
      </>
    );
  }

  // User is logged in on native iOS — wait for subscription check before deciding
  if (isNativeIOS && !subscriptionReady) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="animate-pulse">
          <img
            src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/logoapp.png"
            alt="We Diet"
            className="h-16 object-contain opacity-60"
          />
        </div>
      </div>
    );
  }

  // Logged in on native iOS, subscription checked, not subscribed → paywall
  if (isNativeIOS && !subscriptionStatus.subscribed) {
    return (
      <PaywallScreen
        user={{ id: user.id, email: user.email }}
        onSubscribed={async () => {
          // Re-validate subscription from backend before entering app
          await checkSubscription();
        }}
      />
    );
  }

  // Logged in and subscribed (or not native iOS) → full app
  return (
    <>
      <Navbar />
      <div className={`min-h-screen bg-gradient-primary font-inter pb-32 pt-[calc(env(safe-area-inset-top)+2.5rem)]`}>
        <div className="container mx-auto py-0 px-[13px]">
          <div className="max-w-4xl mx-auto space-y-6">
            <AuthCard />
            <QuickActions />
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
