import { useState, useEffect } from 'react';
import { useNativePlatform } from './useNativePlatform';

interface UseRevenueCatReturn {
  price: string | null;
  hasPurchased: boolean;
  loading: boolean;
  initialized: boolean;
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

  useEffect(() => {
    if (!isNative || !isIOS) return;
    initRevenueCat();
  }, [isNative, isIOS]);

  const initRevenueCat = async () => {
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      
      await Purchases.configure({ apiKey: RC_API_KEY });
      setInitialized(true);

      // Check existing subscriptions
      await checkExistingSubscription();
      
      // Get localized price
      await fetchPrice();
    } catch (err) {
      console.error('RevenueCat init error:', err);
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
      }
    } catch (err) {
      console.error('Error fetching price:', err);
    }
  };

  const purchaseMonthly = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const offerings = await Purchases.getOfferings();
      
      const monthlyPackage = offerings.current?.monthly;
      if (!monthlyPackage) {
        console.error('No monthly package found');
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
    purchaseMonthly,
    restorePurchases,
  };
};
