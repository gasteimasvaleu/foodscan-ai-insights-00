import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { AuthCard } from '@/components/AuthCard';
import { QuickActions } from '@/components/QuickActions';
import { Footer } from '@/components/Footer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PWAOfflineIndicator from '@/components/PWAOfflineIndicator';
import SplashScreen from '@/components/SplashScreen';
import foodscanLogo from '@/assets/foodscan-logo-main.png';
const Index = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary font-inter pt-[180px] pb-[20px]">
        <div className="container mx-auto py-0 px-[13px]">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Logo */}
            <div className="flex justify-center">
              <img 
                src={foodscanLogo} 
                alt="FoodScan & Diet Logo" 
                className="w-24 h-24 rounded-xl shadow-lg animate-pulse-glow hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Auth Card */}
            <AuthCard />
            
            {/* Quick Actions for logged users */}
            <QuickActions />
          </div>
        </div>
      </div>
      <Footer />
      <PWAInstallPrompt />
      <PWAOfflineIndicator />
    </>;
};
export default Index;