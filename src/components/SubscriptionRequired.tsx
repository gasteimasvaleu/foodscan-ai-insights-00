import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNativePlatform } from '@/hooks/useNativePlatform';
import { toast } from '@/hooks/use-toast';
import {
  initRevenueCat,
  getSubscriptionPrice,
  purchaseMonthly as rcPurchaseMonthly,
  syncSubscriptionAfterLogin,
} from '@/lib/revenuecat';

interface SubscriptionRequiredProps {
  children: React.ReactNode;
}

export const SubscriptionRequired: React.FC<SubscriptionRequiredProps> = ({ children }) => {
  const { user, subscription } = useAuth();
  const { isNative, isIOS } = useNativePlatform();
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<string | null>(null);

  const isNativeIOS = isNative && isIOS;

  useEffect(() => {
    if (!isNativeIOS) return;
    (async () => {
      try {
        await initRevenueCat();
        const priceStr = await getSubscriptionPrice();
        if (priceStr) setPrice(priceStr);
      } catch (err) {
        console.error('[SubscriptionRequired] RC init error:', err);
      }
    })();
  }, [isNativeIOS]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!subscription.subscriptionStatus.subscribed) {
    const handlePurchase = async () => {
      setLoading(true);
      try {
        const customerInfo = await rcPurchaseMonthly();
        if (customerInfo && user.id && user.email) {
          await syncSubscriptionAfterLogin(user.id, user.email, customerInfo);
          toast({ title: '✅ Assinatura realizada!' });
          window.location.reload();
        }
      } catch (err: any) {
        console.error('[SubscriptionRequired] Purchase error:', JSON.stringify(err));
        toast({ title: 'Erro na compra', description: err?.message || 'Tente novamente.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center px-4">
        <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 max-w-md w-full">
          <CardHeader className="text-center pb-6">
            <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-foreground flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              Assinatura Necessária
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              Esta funcionalidade está disponível apenas para assinantes premium.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Com a assinatura você tem acesso a:</h4>
              <div className="space-y-2">
                {[
                  "Análise ilimitada de fotos",
                  "Relatórios nutricionais detalhados",
                  "MasterCheFIT completo",
                  "ServiNUTRI completo",
                  "Suporte prioritário"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handlePurchase}
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Processando...' : `Assinar${price ? ` por ${price}/mês` : ''}`}
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
