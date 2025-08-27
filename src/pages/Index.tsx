import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { AuthCard } from '@/components/AuthCard';
import { QuickActions } from '@/components/QuickActions';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { Footer } from '@/components/Footer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PWAOfflineIndicator from '@/components/PWAOfflineIndicator';
import SplashScreen from '@/components/SplashScreen';
import { useAuth } from '@/hooks/useAuth';
const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { user } = useAuth();

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary font-inter pt-24 pb-[20px]">
        <div className="container mx-auto py-0 px-[13px]">
          <div className="max-w-4xl mx-auto space-y-8">
            {!user ? (
              /* Auth Card for non-logged users */
              <AuthCard />
            ) : (
              /* Welcome message and Quick Actions for logged users */
              <>
                <WelcomeMessage />
                <QuickActions />
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <PWAInstallPrompt />
      <PWAOfflineIndicator />
    </>;
};
export default Index;