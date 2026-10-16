import { supabase } from '@/integrations/supabase/client';

const RC_API_KEY = 'appl_XcPKgINorAUFAGLjSAjImHHPiJD';

// Module-level state — lives outside React, no stale closures
let configured = false;
let configuringPromise: Promise<void> | null = null;
let loggedInUserId: string | null = null;

/**
 * Initialises the RevenueCat SDK exactly once.
 */
export const initRevenueCat = async (): Promise<void> => {
  if (configured) return;
  if (configuringPromise) {
    await configuringPromise;
    return;
  }

  configuringPromise = (async () => {
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      console.log('[RevenueCat] Configuring SDK…');
      await Purchases.configure({ apiKey: RC_API_KEY });
      configured = true;
      console.log('[RevenueCat] SDK configured successfully');
    } catch (err) {
      console.error('[RevenueCat] configure() failed:', err);
      throw err;
    } finally {
      configuringPromise = null;
    }
  })();

  await configuringPromise;
};

/**
 * Fetches the monthly subscription price string from RevenueCat offerings.
 */
export const getSubscriptionPrice = async (): Promise<string | null> => {
  await initRevenueCat();
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  const offerings = await Purchases.getOfferings();
  const monthly = offerings.current?.monthly;
  if (monthly) return monthly.product.priceString;
  console.warn('[RevenueCat] No monthly offering found');
  return null;
};

/**
 * Checks whether the current customer has any active entitlement.
 */
export const checkSubscriptionStatus = async (): Promise<boolean> => {
  await initRevenueCat();
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  const { customerInfo } = await Purchases.getCustomerInfo();
  const active = customerInfo.entitlements?.active;
  return !!(active && Object.keys(active).length > 0);
};

/**
 * Purchases the monthly package and returns customerInfo on success.
 */
export const purchaseMonthly = async (): Promise<any | null> => {
  await initRevenueCat();
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  const offerings = await Purchases.getOfferings();
  const monthlyPackage = offerings.current?.monthly;
  if (!monthlyPackage) throw new Error('MONTHLY_NOT_FOUND');

  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: monthlyPackage });
    return customerInfo;
  } catch (err: any) {
    if (err?.code === 1) return null;
    throw err;
  }
};

/**
 * Restores purchases and returns customerInfo if active entitlements exist.
 */
export const restorePurchases = async (): Promise<any | null> => {
  await initRevenueCat();
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  const { customerInfo } = await Purchases.restorePurchases();
  const active = customerInfo.entitlements?.active;
  if (active && Object.keys(active).length > 0) return customerInfo;
  return null;
};

/**
 * Associates the Supabase user ID with RevenueCat.
 * This transfers any anonymous purchases to the real user.
 */
export const identifyUser = async (userId: string): Promise<any> => {
  await initRevenueCat();
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  console.log('[RevenueCat] Calling logIn for', userId);
  const { customerInfo } = await Purchases.logIn({ appUserID: userId });
  loggedInUserId = userId;
  console.log('[RevenueCat] identifyUser success for', userId);
  return customerInfo;
};

// Keep old name as alias
export const logInRevenueCat = identifyUser;

/**
 * Logs out from RevenueCat — returns to anonymous state.
 */
export const logOutRevenueCat = async (): Promise<void> => {
  if (!configured) return;
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    await Purchases.logOut();
    loggedInUserId = null;
    console.log('[RevenueCat] logOut success');
  } catch (err) {
    console.error('[RevenueCat] logOut error:', err);
  }
};


const invokeServerSync = async (): Promise<{ success: boolean; error?: string }> => {
  const { data, error } = await supabase.functions.invoke('rc-sync');
  if (error) return { success: false, error: error.message };
  return { success: !!data?.subscribed, error: data?.subscribed ? undefined : 'No active subscription' };
};

/**
 * Asks the server to confirm with RevenueCat and save the subscription.
 * The app never writes subscription rows itself.
 */
export const upsertSubscriptionFromCustomerInfo = async (
  _userId: string,
  _email: string,
  _customerInfo: any,
): Promise<{ success: boolean; error?: string }> => invokeServerSync();

/**
 * Called after login. Never calls restorePurchases (only the "Restaurar Compras" button does).
 */
export const syncSubscriptionAfterLogin = async (
  _userId: string,
  _email: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    return await invokeServerSync();
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unknown error' };
  }
};
