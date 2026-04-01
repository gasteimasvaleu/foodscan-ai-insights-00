import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNativePlatform } from '@/hooks/useNativePlatform';

const STORAGE_KEY = 'widget_promo_shown';

interface WidgetPromoModalProps {
  shouldTrigger: boolean;
}

export const WidgetPromoModal = ({ shouldTrigger }: WidgetPromoModalProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isIOS, isNative } = useNativePlatform();

  useEffect(() => {
    if (!shouldTrigger || !isNative || !isIOS) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    
    const timer = setTimeout(() => setOpen(true), 1000);
    return () => clearTimeout(timer);
  }, [shouldTrigger, isNative, isIOS]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  };

  const handleViewGuide = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
    navigate('/widget-guide');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
        <DialogHeader className="items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Widget disponível! 🎉</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Agora você pode acompanhar suas calorias, macros e hidratação direto na tela inicial do iPhone — sem abrir o app!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Button onClick={handleViewGuide} className="w-full">
            Ver como adicionar
          </Button>
          <Button variant="ghost" onClick={handleDismiss} className="w-full text-muted-foreground">
            Depois
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
