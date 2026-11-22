import { useState, useEffect, useCallback, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { Crown, Salad, Brain, Sparkles, ChefHat, MessageCircle, Check, Loader2 } from 'lucide-react';
import {
  getPlans,
  purchasePackage,
  restorePurchases as rcRestorePurchases,
  identifyUser,
  upsertSubscriptionFromCustomerInfo,
  hasProEntitlement,
} from '@/lib/revenuecat';
import { useAuthContext } from '@/contexts/AuthProvider';

interface PaywallScreenProps {
  user: { id: string; email?: string };
  onSubscribed: () => Promise<void>;
  contextBadge?: ReactNode;
}

const APP_STORE_URL = 'https://apps.apple.com/app/we-diet/id6761124021';

const formatBRL = (v: number, currency = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(v);

const hasFreeTrial = (pkg: any) => {
  const intro = pkg?.product?.introPrice;
  return !!intro && Number(intro.price) === 0;
};

const benefits = [
  { icon: Salad, text: 'FoodScan ilimitado' },
  { icon: Brain, text: 'NutriCoach com IA' },
  { icon: Sparkles, text: 'Cardápio personalizado com IA' },
  { icon: ChefHat, text: 'Faça em Casa: versão caseira de qualquer prato' },
  { icon: MessageCircle, text: 'Lembretes e resumos no WhatsApp' },
];

const PaywallScreen = ({ user, onSubscribed, contextBadge }: PaywallScreenProps) => {
  const navigate = useNavigate();
  const { forceSubscriptionActive, setPurchaseInProgress } = useAuthContext();
  const isNative = Capacitor.isNativePlatform();
  const isAndroid = Capacitor.getPlatform() === 'android';

  const [plans, setPlans] = useState<{ annual: any | null; monthly: any | null } | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(isNative);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<'annual' | 'monthly'>('annual');
  const [busy, setBusy] = useState(false);
  const [purchaseError, setPurchaseError] = useState(false);

  const loadPlans = useCallback(async () => {
    if (!isNative) return;
    setLoadingPlans(true);
    setLoadError(false);
    try {
      const p = await getPlans();
      if (!p.annual && !p.monthly) throw new Error('empty');
      setPlans(p);
      setSelected(p.annual ? 'annual' : 'monthly');
    } catch (err) {
      console.error('[PaywallScreen] getOfferings error:', err);
      setLoadError(true);
    } finally {
      setLoadingPlans(false);
    }
  }, [isNative]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const annual = plans?.annual;
  const monthly = plans?.monthly;
  const selectedPkg = selected === 'annual' ? annual : monthly;
  const selectedTrial = hasFreeTrial(selectedPkg);
  const currency = (annual || monthly)?.product?.currencyCode || 'BRL';

  const savings =
    annual && monthly && monthly.product.price > 0
      ? Math.round((1 - annual.product.price / (monthly.product.price * 12)) * 100)
      : 0;

  const finishPro = async (title: string) => {
    const res = await upsertSubscriptionFromCustomerInfo(user.id, user.email || '', null);
    if (res.success) {
      forceSubscriptionActive(res.subscription_end ?? null);
      toast({ title });
      await onSubscribed();
      navigate('/');
      return true;
    }
    return false;
  };

  const handlePurchase = async () => {
    if (!selectedPkg) return;
    setBusy(true);
    setPurchaseError(false);
    setPurchaseInProgress(true);
    try {
      await identifyUser(user.id);
      const { customerInfo, cancelled } = await purchasePackage(selectedPkg);
      if (cancelled) return;
      if (customerInfo && hasProEntitlement(customerInfo)) {
        const ok = await finishPro('Bem-vindo ao Wediet Pro!');
        if (!ok) {
          toast({ title: 'Confirmando assinatura...', description: 'Ainda não recebemos a confirmação. Toque em "Restaurar compras" em instantes.' });
        }
      } else {
        setPurchaseError(true);
      }
    } catch (err) {
      console.error('[PaywallScreen] Purchase error:', err);
      setPurchaseError(true);
    } finally {
      setBusy(false);
      setPurchaseInProgress(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    setPurchaseInProgress(true);
    try {
      await identifyUser(user.id);
      const customerInfo = await rcRestorePurchases();
      const ok = hasProEntitlement(customerInfo) && (await finishPro('Assinatura restaurada'));
      if (!ok) toast({ title: 'Nenhuma assinatura encontrada nesta conta', variant: 'destructive' });
    } catch (err) {
      console.error('[PaywallScreen] Restore error:', err);
      toast({ title: 'Nenhuma assinatura encontrada nesta conta', variant: 'destructive' });
    } finally {
      setBusy(false);
      setPurchaseInProgress(false);
    }
  };

  const TrialBadge = () => (
    <span className="inline-block px-2 py-0.5 rounded-full bg-[#FD46A1]/10 text-[#FD46A1] text-[10px] font-semibold">
      7 dias grátis
    </span>
  );

  const PlanCard = ({ kind, pkg }: { kind: 'annual' | 'monthly'; pkg: any }) => {
    const active = selected === kind;
    const isAnnual = kind === 'annual';
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => setSelected(kind)}
        aria-pressed={active}
        className={`relative w-full text-left rounded-2xl p-3.5 transition-all disabled:opacity-60 ${
          active
            ? 'bg-white border-2 border-[#FD46A1] shadow-lg shadow-[#FD46A1]/20'
            : 'bg-white/60 border border-white/80'
        }`}
      >
        {isAnnual && (
          <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FD46A1] to-[#FF6FB5] text-white text-[10px] font-semibold shadow">
            Mais escolhido
          </span>
        )}
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${active ? 'bg-[#FD46A1]' : 'border-2 border-gray-300'}`}>
            {active && <Check className="w-3 h-3 text-white" />}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-800">{isAnnual ? 'Anual' : 'Mensal'}</span>
              {hasFreeTrial(pkg) && <TrialBadge />}
              {isAnnual && savings > 0 && (
                <span className="text-[10px] font-semibold text-emerald-600">Economize {savings}%</span>
              )}
            </div>
            {isAnnual ? (
              <>
                <p className="text-xl font-bold text-[#FD46A1]">{formatBRL(pkg.product.price / 12, currency)}/mês</p>
                <p className="text-[11px] text-muted-foreground">cobrado {pkg.product.priceString} por ano</p>
              </>
            ) : (
              <p className="text-base font-semibold text-gray-700">{pkg.product.priceString}/mês</p>
            )}
          </div>
        </div>
      </button>
    );
  };

  const legal = isAndroid
    ? 'A assinatura renova automaticamente, a menos que seja cancelada pelo menos 24 horas antes do fim do período atual. O pagamento é cobrado na sua conta do Google Play. Gerencie ou cancele na Play Store > Pagamentos e assinaturas.'
    : 'A assinatura renova automaticamente, a menos que seja cancelada pelo menos 24 horas antes do fim do período atual. O pagamento é cobrado na sua Conta Apple. Gerencie ou cancele em Ajustes > Assinaturas.';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-[calc(env(safe-area-inset-top)+3.5rem)] pb-[calc(env(safe-area-inset-bottom)+7rem)]">
      <div className="w-full max-w-md md:max-w-2xl space-y-3 relative">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[#FD46A1]/30 blur-3xl rounded-full" />
        {contextBadge}

        <Card className="bg-gradient-to-br from-white via-[#FFE9F3] to-[#FFD1E7] rounded-3xl border border-white/60 shadow-2xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
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
            </div>

            <ul className="space-y-2">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#FD46A1]/10 flex items-center justify-center flex-shrink-0">
                    <b.icon className="w-3.5 h-3.5 text-[#FD46A1]" />
                  </div>
                  <span className="text-sm text-gray-700 leading-tight">{b.text}</span>
                </li>
              ))}
            </ul>

            {!isNative ? (
              <div className="text-center space-y-3 pt-1">
                <p className="text-base text-gray-800">Assine pelo app</p>
                <Button asChild className="w-full bg-[#FD46A1] hover:opacity-95 text-white rounded-2xl">
                  <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">App Store</a>
                </Button>
              </div>
            ) : loadingPlans ? (
              <div className="grid gap-3 md:grid-cols-2 pt-2">
                <Skeleton className="h-24 rounded-2xl bg-white/70" />
                <Skeleton className="h-20 rounded-2xl bg-white/70" />
              </div>
            ) : loadError ? (
              <div className="text-center space-y-3 py-2">
                <p className="text-sm text-gray-700">Não foi possível carregar os planos agora</p>
                <Button onClick={loadPlans} variant="outline" className="rounded-2xl border-[#FD46A1] text-[#FD46A1]">
                  Tentar de novo
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2 pt-2">
                  {annual && <PlanCard kind="annual" pkg={annual} />}
                  {monthly && <PlanCard kind="monthly" pkg={monthly} />}
                </div>

                <div className="space-y-1.5">
                  <Button
                    onClick={handlePurchase}
                    disabled={busy || !selectedPkg}
                    className="w-full bg-gradient-to-r from-[#FD46A1] to-[#FF6FB5] hover:opacity-95 text-white text-base py-6 rounded-2xl shadow-lg shadow-[#FD46A1]/40"
                  >
                    {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : selectedTrial ? 'Começar 7 dias grátis' : 'Assinar agora'}
                  </Button>
                  {selectedPkg && (
                    <p className="text-[11px] text-muted-foreground text-center">
                      {selected === 'annual'
                        ? selectedTrial
                          ? `Grátis por 7 dias, depois ${selectedPkg.product.priceString} por ano. Cancele quando quiser.`
                          : `${selectedPkg.product.priceString} por ano. Cancele quando quiser.`
                        : selectedTrial
                          ? `Grátis por 7 dias, depois ${selectedPkg.product.priceString} por mês. Cancele quando quiser.`
                          : `${selectedPkg.product.priceString} por mês. Cancele quando quiser.`}
                    </p>
                  )}
                </div>

                {purchaseError && (
                  <div role="alert" className="bg-white/80 rounded-2xl p-3 text-center space-y-2 border border-[#FD46A1]/30">
                    <p className="text-xs text-gray-800">Não foi possível concluir a assinatura. Nenhuma cobrança foi feita.</p>
                    <button type="button" onClick={handlePurchase} disabled={busy} className="text-xs text-[#FD46A1] underline">
                      Tentar de novo
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={busy}
                  className="w-full text-xs text-[#FD46A1] underline hover:opacity-80"
                >
                  Restaurar compras
                </button>

                <p className="text-[10px] text-muted-foreground/80 text-center leading-tight">{legal}</p>
              </>
            )}

            <div className="flex justify-center gap-4 text-[11px]">
              <button type="button" onClick={() => navigate('/termos-de-uso')} className="text-[#FD46A1] underline opacity-80">
                Termos de Uso
              </button>
              <button type="button" onClick={() => navigate('/politica-de-privacidade')} className="text-[#FD46A1] underline opacity-80">
                Política de Privacidade
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaywallScreen;
