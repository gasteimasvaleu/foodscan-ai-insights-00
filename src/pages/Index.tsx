import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { AuthCard } from '@/components/AuthCard';
import { QuickActions } from '@/components/QuickActions';
import { Footer } from '@/components/Footer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PWAOfflineIndicator from '@/components/PWAOfflineIndicator';
import SplashScreen from '@/components/SplashScreen';
import { toast } from '@/hooks/use-toast';
const Index = () => {
  // Detectar se veio do signup
  const urlParams = new URLSearchParams(window.location.search);
  const fromSignup = urlParams.get('from') === 'signup';

  const [showSplash, setShowSplash] = useState(() => {
    // Se veio do signup, NUNCA mostrar splash
    if (fromSignup) return false;
    
    // Detectar se está rodando como PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    
    // Se está no PWA, SEMPRE mostra o splash (experiência de app)
    if (isPWA) return true;
    
    // Se está no navegador, verifica se já mostrou nesta sessão
    const hasShownInSession = sessionStorage.getItem('splashShown');
    
    // Não mostra se já foi exibido nesta sessão (evita aparecer após redirects)
    return !hasShownInSession;
  });

  // Detectar sucesso do cadastro via URL
  useEffect(() => {
    if (fromSignup) {
      toast({
        title: "🎉 Bem-vindo ao FoodScan!",
        description: "Sua conta foi criada com sucesso!",
      });
      
      // Limpar o parâmetro da URL
      window.history.replaceState({}, '', '/');
    }
  }, [fromSignup]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Marcar que já mostrou nesta sessão do navegador
    // (não afeta PWA, pois ele sempre vai mostrar na próxima abertura)
    sessionStorage.setItem('splashShown', 'true');
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary font-inter pt-24 pb-12">
        <div className="container mx-auto py-0 px-[13px]">
          <div className="max-w-4xl mx-auto space-y-8">
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