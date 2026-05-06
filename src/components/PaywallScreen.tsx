import { useState, useEffect, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import {
  Crown,
  Sparkles,
  Salad,
  Dumbbell,
  Brain,
  ChefHat,
  Shirt,
  Activity,
  Moon,
  TrendingUp,
  MessageCircle,
  Check,
} from 'lucide-react';

import {
  getSubscriptionPrice,
  purchaseMonthly as rcPurchaseMonthly,
  restorePurchases as rcRestorePurchases,
  identifyUser,
  upsertSubscriptionFromCustomerInfo,
} from '@/lib/revenuecat';
import { useAuthContext } from '@/contexts/AuthProvider';

interface PaywallScreenProps {
  user: { id: string; email?: string };
  onSubscribed: () => Promise<void>;
  contextBadge?: ReactNode;
}

const PaywallScreen = ({ user, onSubscribed, contextBadge }: PaywallScreenProps) => {
  const navigate = useNavigate();
  const { forceSubscriptionActive, setPurchaseInProgress } = useAuthContext();
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
    setPurchaseInProgress(true);
    try {
      console.log('[PaywallScreen] Identifying user before purchase:', user.id);
      await identifyUser(user.id);

      const customerInfo = await rcPurchaseMonthly();
      if (customerInfo) {
        toast({ title: '✅ Assinatura realizada!', description: 'Bem-vindo ao We Diet Pro!' });

        const premiumEntitlement =
          customerInfo.entitlements?.active?.['Premium'] ||
          customerInfo.entitlements?.active?.['premium'];
        const expirationDate = premiumEntitlement?.expirationDate || null;

        console.log('[PaywallScreen] Purchase success, forcing subscription active. Expiration:', expirationDate);
        forceSubscriptionActive(expirationDate);

        upsertSubscriptionFromCustomerInfo(user.id, user.email || '', customerInfo).catch((err) => {
          console.warn('[PaywallScreen] Upsert after purchase error:', err);
        });
      }
    } catch (err: any) {
      console.error('[PaywallScreen] Purchase error:', JSON.stringify(err));
      toast({
        title: 'Erro na compra',
        description: `Não foi possível completar. ${err?.message || ''}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setPurchaseInProgress(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    setPurchaseInProgress(true);
    try {
      console.log('[PaywallScreen] Identifying user before restore:', user.id);
      await identifyUser(user.id);

      const customerInfo = await rcRestorePurchases();
      if (customerInfo) {
        const premiumEntitlement =
          customerInfo.entitlements?.active?.['Premium'] ||
          customerInfo.entitlements?.active?.['premium'];

        if (premiumEntitlement) {
          toast({ title: '✅ Compra restaurada!', description: 'Sua assinatura está ativa.' });

          const expirationDate = premiumEntitlement.expirationDate || null;
          console.log('[PaywallScreen] Restore success, forcing subscription active. Expiration:', expirationDate);
          forceSubscriptionActive(expirationDate);

          upsertSubscriptionFromCustomerInfo(user.id, user.email || '', customerInfo).catch((err) => {
            console.warn('[PaywallScreen] Upsert after restore error:', err);
          });
        } else {
          toast({
            title: 'Nenhuma assinatura encontrada',
            description: 'Não encontramos assinaturas ativas para restaurar.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Nenhuma assinatura encontrada',
          description: 'Não encontramos assinaturas ativas para restaurar.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('[PaywallScreen] Restore error:', err);
      toast({ title: 'Erro ao restaurar', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setLoading(false);
      setPurchaseInProgress(false);
    }
  };

  const benefits = [
    { icon: Salad, text: 'FoodScan ilimitado' },
    { icon: Brain, text: 'NutriCoach IA' },
    { icon: Sparkles, text: 'Cardápio com IA' },
    { icon: Dumbbell, text: 'Treinos em vídeo' },
    { icon: ChefHat, text: 'Faça em Casa' },
    { icon: Shirt, text: 'Provador IA' },
    { icon: Activity, text: 'Apple Health & FitTracker' },
    { icon: Moon, text: 'Jejum, Sono & Hidratação' },
    { icon: TrendingUp, text: 'Gráficos & Objetivos' },
    { icon: MessageCircle, text: 'Lembretes WhatsApp' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-[calc(env(safe-area-inset-top)+3.5rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      <div className="w-full max-w-md space-y-3 relative">
        {/* Glow rosa de fundo */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[#FD46A1]/30 blur-3xl rounded-full"
        />

        {contextBadge}

        <Card className="bg-gradient-to-br from-white via-[#FFE9F3] to-[#FFD1E7] rounded-3xl border border-white/60 shadow-2xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            {/* Header */}
            <div className="text-center space-y-2">
              <img
                src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/logoapp.png"
                alt="We Diet Logo"
                className="h-12 object-contain mx-auto"
              />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FD46A1] to-[#FF6FB5] text-white text-[11px] font-semibold shadow-md">
                <Crown className="w-3 h-3" />
                WE DIET PRO
              </div>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-3xl font-bold text-[#FD46A1]">
                  {price || 'R$ 49,90'}
                </span>
                <span className="text-xs font-medium text-muted-foreground">/mês</span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                <Check className="w-3 h-3 text-[#FD46A1]" />
                Cancele quando quiser
              </p>
            </div>

            {/* Lista de benefícios em grid */}
            <div className="grid grid-cols-2 gap-2">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white/70 rounded-xl px-2.5 py-2 border border-white/80"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#FD46A1]/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-3.5 h-3.5 text-[#FD46A1]" />
                  </div>
                  <span className="text-[11px] text-gray-700 leading-tight">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FD46A1] to-[#FF6FB5] hover:opacity-95 text-white text-base py-6 rounded-2xl shadow-lg shadow-[#FD46A1]/40"
            >
              {loading ? 'Processando...' : 'Começar agora'}
            </Button>

            {/* Restaurar */}
            <button
              type="button"
              onClick={handleRestore}
              disabled={loading}
              className="w-full text-xs text-[#FD46A1] underline hover:opacity-80"
            >
              Restaurar Compras
            </button>

            {/* Legal */}
            <p className="text-[9px] text-muted-foreground/80 text-center leading-tight">
              A assinatura é renovada automaticamente, a menos que seja cancelada pelo menos 24 horas antes do término do período atual. O pagamento será cobrado na sua conta do iTunes.
            </p>

            <div className="flex justify-center gap-4 text-[10px]">
              <button
                type="button"
                onClick={() => navigate('/politica-de-privacidade')}
                className="text-[#FD46A1] underline opacity-80"
              >
                Privacidade
              </button>
              <button
                type="button"
                onClick={() => navigate('/termos-de-uso')}
                className="text-[#FD46A1] underline opacity-80"
              >
                Termos
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaywallScreen;
