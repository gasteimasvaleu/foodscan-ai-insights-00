import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const PWAUpdatePrompt = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newWorker, setNewWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Recarrega a página quando um novo service worker assume o controle
        window.location.reload();
      });

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nova versão está disponível
                setNewWorker(installingWorker);
                setUpdateAvailable(true);
                
                toast({
                  title: "Atualização disponível!",
                  description: "Uma nova versão do app está pronta.",
                });
              }
            });
          }
        });
      });

      // Verifica por atualizações a cada 60 segundos
      setInterval(() => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }, 60000);
    }
  }, []);

  const handleUpdate = () => {
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-in-right">
      <Card className="bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="font-semibold text-sm">Atualização disponível</h4>
                <p className="text-xs text-muted-foreground">
                  Uma nova versão do FoodScan AI está pronta para instalar.
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white text-xs px-3 py-1 h-7"
                >
                  Atualizar
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  className="text-xs px-3 py-1 h-7"
                >
                  Depois
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};