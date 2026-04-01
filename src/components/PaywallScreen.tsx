import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Check, Crown, Sparkles, Salad, Dumbbell, Brain } from 'lucide-react';

import {
  getSubscriptionPrice,
  purchaseMonthly as rcPurchaseMonthly,
  restorePurchases as rcRestorePurchases,
  identifyUser,
  upsertSubscriptionFromCustomerInfo,
} from '@/lib/revenuecat';

interface PaywallScreenProps {
  user: { id: string; email?: string };
  onSubscribed: () => Promise<void>;
}

const PaywallScreen = ({ user, onSubscribed }: PaywallScreenProps) => {
  const navigate = useNavigate();
  const [price, setPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const priceStr = await getSubscriptionPrice();
        if (priceStr) setPrice(priceStr);
      } catch (err) {
        console.error('[PaywallScreen] Price load error:', err);
      }
    })();
  }, []);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      // 1. Ensure user is identified in RevenueCat BEFORE purchase
      console.log('[PaywallScreen] Identifying user before purchase:', user.id);
      await identifyUser(user.id);

      // 2. Execute purchase
      const customerInfo = await rcPurchaseMonthly();
      if (customerInfo) {
        toast({ title: '✅ Assinatura realizada!', description: 'Bem-vindo ao We Diet Pro!' });

        // 3. Upsert directly from customerInfo (no retry needed)
        try {
          await upsertSubscriptionFromCustomerInfo(user.id, user.email || '', customerInfo);
        } catch (err) {
          console.warn('[PaywallScreen] Upsert after purchase error:', err);
        }

        // 4. Re-validate subscription before entering app
        await onSubscribed();
      }
    } catch (err: any) {
      console.error('[PaywallScreen] Purchase error:', JSON.stringify(err));
      toast({ title: 'Erro na compra', description: `Não foi possível completar. ${err?.message || ''}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const customerInfo = await rcRestorePurchases();
      if (customerInfo) {
        toast({ title: '✅ Compra restaurada!', description: 'Sua assinatura está ativa.' });
        try {
          await syncSubscriptionAfterLogin(user.id, user.email || '');
        } catch (err) {
          console.warn('[PaywallScreen] Sync after restore error:', err);
        }
        // Re-validate subscription before entering app
        await onSubscribed();
      } else {
        toast({ title: 'Nenhuma assinatura encontrada', description: 'Não encontramos assinaturas ativas para restaurar.', variant: 'destructive' });
      }
    } catch (err) {
      console.error('[PaywallScreen] Restore error:', err);
      toast({ title: 'Erro ao restaurar', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Salad, text: 'Análise nutricional por foto com IA' },
    { icon: Brain, text: 'NutriCoach com inteligência artificial' },
    { icon: Dumbbell, text: 'Treinos em vídeo personalizados' },
    { icon: Sparkles, text: 'Cardápio semanal automático' },
  ];

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl w-full max-w-md">
        <CardHeader className="pb-2 text-center">
          <div className="flex justify-center mb-3">
            <img
              src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/logoapp.png"
              alt="We Diet Logo"
              className="h-16 object-contain"
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-primary" />
            <CardTitle className="text-gray-800 text-lg">We Diet Pro</CardTitle>
          </div>
          <p className="text-center text-2xl font-bold text-primary">
            {price || 'R$ 49,90'} <span className="text-sm font-normal text-muted-foreground">/mês</span>
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Benefits */}
          <div className="space-y-3">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-gray-700">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Purchase button */}
          <Button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base py-6"
          >
            {loading ? 'Processando...' : 'Assinar via App Store'}
          </Button>

          {/* Restore */}
          <button
            type="button"
            onClick={handleRestore}
            disabled={loading}
            className="w-full text-sm text-primary underline hover:text-primary/80"
          >
            Restaurar Compras
          </button>

          {/* Legal text */}
          <p className="text-[10px] text-muted-foreground text-center leading-tight">
            A assinatura é renovada automaticamente, a menos que seja cancelada pelo menos 24 horas antes do término do período atual. O pagamento será cobrado na sua conta do iTunes. A gestão da assinatura pode ser feita nas Definições da conta após a compra.
          </p>

          <div className="flex justify-center gap-4 text-[11px]">
            <button type="button" onClick={() => navigate('/politica-de-privacidade')} className="text-primary underline">
              Política de Privacidade
            </button>
            <button type="button" onClick={() => navigate('/termos-de-uso')} className="text-primary underline">
              Termos de Uso
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaywallScreen;
