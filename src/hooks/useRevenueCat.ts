import { useState, useEffect, useCallback } from 'react';
import { useNativePlatform } from './useNativePlatform';
import { toast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';
import {
  initRevenueCat,
  getSubscriptionPrice,
  checkSubscriptionStatus,
  purchaseMonthly as rcPurchaseMonthly,
  restorePurchases as rcRestorePurchases,
  logInRevenueCat,
  syncSubscriptionAfterLogin,
} from '@/lib/revenuecat';

interface UseRevenueCatReturn {
  price: string | null;
  hasPurchased: boolean;
  loading: boolean;
  initialized: boolean;
  initError: boolean;
  purchaseMonthly: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

export const useRevenueCat = (user?: User | null): UseRevenueCatReturn => {
  const { isNative, isIOS } = useNativePlatform();
  const [price, setPrice] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [initError, setInitError] = useState(false);

  // Initialize on mount (native iOS only)
  useEffect(() => {
    if (!isNative || !isIOS) return;

    (async () => {
      try {
        await initRevenueCat();
        setInitialized(true);

        // Check existing subscription
        const hasActive = await checkSubscriptionStatus();
        if (hasActive) setHasPurchased(true);

        // Fetch price
        const priceStr = await getSubscriptionPrice();
        if (priceStr) {
          setPrice(priceStr);
        } else {
          toast({
            title: 'Produto não disponível',
            description: 'Não foi possível carregar o plano de assinatura.',
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('[useRevenueCat] Init failed:', err);
        setInitError(true);
        toast({
          title: 'Erro ao inicializar compras',
          description: 'Não foi possível conectar à App Store. Tente novamente mais tarde.',
          variant: 'destructive',
        });
      }
    })();
  }, [isNative, isIOS]);

  // When user logs in, associate with RevenueCat
  useEffect(() => {
    if (!isNative || !isIOS || !user?.id) return;

    (async () => {
      try {
        const customerInfo = await logInRevenueCat(user.id);
        if (!customerInfo) return; // already logged in

        const active = customerInfo.entitlements?.active;
        if (active && Object.keys(active).length > 0) {
          setHasPurchased(true);
          if (user.email) {
            await syncSubscriptionAfterLogin(user.id, user.email, customerInfo);
          }
        }
      } catch (err) {
        console.error('[useRevenueCat] logIn error:', err);
      }
    })();
  }, [isNative, isIOS, user?.id, user?.email]);

  const purchaseMonthly = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const customerInfo = await rcPurchaseMonthly();
      if (!customerInfo) return false; // user cancelled

      setHasPurchased(true);
      if (user?.id && user?.email) {
        await syncSubscriptionAfterLogin(user.id, user.email, customerInfo);
      }
      return true;
    } catch (err: any) {
      console.error('[useRevenueCat] Purchase error:', err);
      if (err?.message === 'MONTHLY_NOT_FOUND') {
        toast({
          title: 'Plano não encontrado',
          description: 'Não foi possível encontrar o plano mensal.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro na compra',
          description: `Não foi possível completar a compra. ${err?.message || 'Tente novamente.'}`,
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const customerInfo = await rcRestorePurchases();
      if (!customerInfo) return false;

      setHasPurchased(true);
      if (user?.id && user?.email) {
        await syncSubscriptionAfterLogin(user.id, user.email, customerInfo);
      }
      return true;
    } catch (err) {
      console.error('[useRevenueCat] Restore error:', err);
      toast({
        title: 'Erro ao restaurar',
        description: 'Não foi possível restaurar suas compras. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email]);

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
