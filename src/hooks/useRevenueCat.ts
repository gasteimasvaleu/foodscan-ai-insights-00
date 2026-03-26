import { useState, useEffect } from 'react';
import { useNativePlatform } from './useNativePlatform';
import { toast } from '@/hooks/use-toast';

interface UseRevenueCatReturn {
  price: string | null;
  hasPurchased: boolean;
  loading: boolean;
  initialized: boolean;
  initError: boolean;
  purchaseMonthly: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

const RC_API_KEY = 'appl_XcPKgINorAUFAGLjSAjImHHPiJD';

export const useRevenueCat = (): UseRevenueCatReturn => {
  const { isNative, isIOS } = useNativePlatform();
  const [price, setPrice] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [initError, setInitError] = useState(false);

  useEffect(() => {
    if (!isNative || !isIOS) return;
    initRevenueCat();
  }, [isNative, isIOS]);

  const initRevenueCat = async () => {
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      
      await Purchases.configure({ apiKey: RC_API_KEY });
      setInitialized(true);

      await checkExistingSubscription();
      await fetchPrice();
    } catch (err) {
      console.error('RevenueCat init error:', err);
      setInitError(true);
      toast({
        title: 'Erro ao inicializar compras',
        description: 'Não foi possível conectar à App Store. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const checkExistingSubscription = async () => {
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { customerInfo } = await Purchases.getCustomerInfo();
      
      const activeEntitlements = customerInfo.entitlements.active;
      if (activeEntitlements && Object.keys(activeEntitlements).length > 0) {
        setHasPurchased(true);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  };

  const fetchPrice = async () => {
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const offerings = await Purchases.getOfferings();
      
      const currentOffering = offerings.current;
      if (currentOffering?.monthly) {
        setPrice(currentOffering.monthly.product.priceString);
      } else {
        console.warn('No monthly offering found');
        toast({
          title: 'Produto não disponível',
          description: 'Não foi possível carregar o plano de assinatura.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error fetching price:', err);
      toast({
        title: 'Erro ao carregar preço',
        description: 'Não foi possível obter informações do plano.',
        variant: 'destructive',
      });
    }
  };

  const purchaseMonthly = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const offerings = await Purchases.getOfferings();
      
      const monthlyPackage = offerings.current?.monthly;
      if (!monthlyPackage) {
        toast({
          title: 'Plano não encontrado',
          description: 'Não foi possível encontrar o plano mensal. Verifique sua conexão e tente novamente.',
          variant: 'destructive',
        });
        return false;
      }

      await Purchases.purchasePackage({ aPackage: monthlyPackage });
      setHasPurchased(true);
      return true;
    } catch (err: any) {
      if (err?.code === 1) {
        // User cancelled
        return false;
      }
      console.error('Purchase error:', err);
      toast({
        title: 'Erro na compra',
        description: `Não foi possível completar a compra. Código: ${err?.code || 'desconhecido'}`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { customerInfo } = await Purchases.restorePurchases();
      
      const activeEntitlements = customerInfo.entitlements.active;
      if (activeEntitlements && Object.keys(activeEntitlements).length > 0) {
        setHasPurchased(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Restore purchases error:', err);
      toast({
        title: 'Erro ao restaurar',
        description: 'Não foi possível restaurar suas compras. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    price,
    hasPurchased,
    loading,
    initialized,
    initError,
    purchaseMonthly,
    restorePurchases,
  };
};
