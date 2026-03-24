import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Download, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS install prompt after 3 seconds if on iOS and not installed
    if (iOS && !isInstalled) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Don't show again for 24 hours
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Check if prompt was dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < oneDayInMs) {
        setIsVisible(false);
        return;
      }
    }
  }, []);

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 p-4 border-primary/20 bg-white/95 backdrop-blur-sm shadow-lg safe-area-bottom animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Download className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            Instalar We Diet
          </h3>
          
          {isIOS ? (
            <div className="text-xs text-muted-foreground mb-3">
              <p>Para instalar o app:</p>
              <div className="flex items-center gap-1 mt-1">
                <Share className="h-3 w-3" />
                <span>Toque em "Compartilhar" → "Adicionar à Tela de Início"</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mb-3">
              Adicione o We Diet à sua tela inicial para acesso rápido!
            </p>
          )}
          
          <div className="flex gap-2">
            {!isIOS && (
              <Button 
                size="sm" 
                onClick={handleInstallClick}
                className="text-xs h-8"
              >
                Instalar
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClose}
              className="text-xs h-8"
            >
              Agora não
            </Button>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default PWAInstallPrompt;