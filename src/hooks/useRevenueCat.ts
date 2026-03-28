import { useState, useEffect, useRef, useCallback } from 'react';
import { useNativePlatform } from './useNativePlatform';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

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

// Singleton promise to prevent concurrent configure calls across hook instances
let configurePromise: Promise<boolean> | null = null;

const ensureRevenueCatReady = async (): Promise<boolean> => {
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    
    // Check if SDK is already configured natively
    const { isConfigured } = await Purchases.isConfigured();
    console.log('[RevenueCat] isConfigured check:', isConfigured);
    
    if (isConfigured) return true;

    // If another call is already configuring, wait for it
    if (configurePromise) {
      console.log('[RevenueCat] Waiting for existing configure promise...');
      return await configurePromise;
    }

    // Configure the SDK
    configurePromise = (async () => {
      try {
        console.log('[RevenueCat] Configuring SDK with API key...');
        await Purchases.configure({ apiKey: RC_API_KEY });
        
        // Verify it actually worked
        const { isConfigured: nowConfigured } = await Purchases.isConfigured();
        console.log('[RevenueCat] Post-configure isConfigured:', nowConfigured);
        return nowConfigured;
      } catch (err) {
        console.error('[RevenueCat] configure() failed:', err);
        return false;
      } finally {
        configurePromise = null;
      }
    })();

    return await configurePromise;
  } catch (err) {
    console.error('[RevenueCat] ensureRevenueCatReady failed:', err);
    configurePromise = null;
    return false;
  }
};

export const useRevenueCat = (user?: User | null): UseRevenueCatReturn => {
  const { isNative, isIOS } = useNativePlatform();
  const [price, setPrice] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [initError, setInitError] = useState(false);
  const loggedInUserId = useRef<string | null>(null);

  const syncToSupabase = useCallback(async (customerInfo: any) => {
    if (!user?.id || !user?.email) return;
    
    try {
      const entitlements = customerInfo.entitlements?.active;
      if (!entitlements || Object.keys(entitlements).length === 0) return;

      const firstKey = Object.keys(entitlements)[0];
      const firstEntitlement = entitlements[firstKey];
      const expirationDate = firstEntitlement.expirationDate || null;

      await supabase.from('subscribers').upsert({
        user_id: user.id,
        email: user.email,
        subscribed: true,
        subscription_tier: 'Premium',
        subscription_end: expirationDate,
        payment_provider: 'apple',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      console.log('[RevenueCat] Synced subscription to Supabase', { expirationDate });
    } catch (err) {
      console.error('[RevenueCat] Error syncing to Supabase:', err);
    }
  }, [user?.id, user?.email]);

  // Initialize on mount (native iOS only)
  useEffect(() => {
    if (!isNative || !isIOS) return;
    
    console.log('[RevenueCat] Platform: native iOS, starting init...');
    
    (async () => {
      const ready = await ensureRevenueCatReady();
      if (ready) {
        setInitialized(true);
        await checkExistingSubscription();
        await fetchPrice();
      } else {
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
    if (!isNative || !isIOS || !user?.id || loggedInUserId.current === user.id) return;
    
    (async () => {
      const ready = await ensureRevenueCatReady();
      if (!ready) return;
      
      try {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        const { customerInfo } = await Purchases.logIn({ appUserID: user.id });
        loggedInUserId.current = user.id;
        console.log('[RevenueCat] logIn success for', user.id);

        const activeEntitlements = customerInfo.entitlements.active;
        if (activeEntitlements && Object.keys(activeEntitlements).length > 0) {
          setHasPurchased(true);
          await syncToSupabase(customerInfo);
        }
      } catch (err) {
        console.error('[RevenueCat] logIn error:', err);
      }
    })();
  }, [isNative, isIOS, user?.id, syncToSupabase]);

  const checkExistingSubscription = async () => {
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { customerInfo } = await Purchases.getCustomerInfo();
      console.log('[RevenueCat] customerInfo entitlements:', JSON.stringify(customerInfo.entitlements));
      
      const activeEntitlements = customerInfo.entitlements.active;
      if (activeEntitlements && Object.keys(activeEntitlements).length > 0) {
        setHasPurchased(true);
      }
    } catch (err) {
      console.error('[RevenueCat] Error checking subscription:', err);
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
        console.warn('[RevenueCat] No monthly offering found');
        toast({
          title: 'Produto não disponível',
          description: 'Não foi possível carregar o plano de assinatura.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('[RevenueCat] Error fetching price:', err);
      toast({
        title: 'Erro ao carregar preço',
        description: 'Não foi possível obter informações do plano.',
        variant: 'destructive',
      });
    }
  };

  const purchaseMonthly = async (): Promise<boolean> => {
    const ready = await ensureRevenueCatReady();
    if (!ready) {
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível conectar à App Store. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }

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

      const { customerInfo } = await Purchases.purchasePackage({ aPackage: monthlyPackage });
      setHasPurchased(true);
      await syncToSupabase(customerInfo);
      return true;
    } catch (err: any) {
      if (err?.code === 1) {
        return false;
      }
      console.error('[RevenueCat] Purchase error:', err);
      console.error('[RevenueCat] Purchase error details:', JSON.stringify(err));
      toast({
        title: 'Erro na compra',
        description: `Não foi possível completar a compra. ${err?.message || 'Código: ' + (err?.code || 'desconhecido')}`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    const ready = await ensureRevenueCatReady();
    if (!ready) {
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível conectar à App Store. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }

    setLoading(true);
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { customerInfo } = await Purchases.restorePurchases();
      
      const activeEntitlements = customerInfo.entitlements.active;
      if (activeEntitlements && Object.keys(activeEntitlements).length > 0) {
        setHasPurchased(true);
        await syncToSupabase(customerInfo);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[RevenueCat] Restore purchases error:', err);
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
