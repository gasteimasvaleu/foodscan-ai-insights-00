import { supabase } from '@/integrations/supabase/client';

const RC_API_KEY = 'appl_XcPKgINorAUFAGLjSAjImHHPiJD';

// Module-level state — lives outside React, no stale closures
let configured = false;
let configuringPromise: Promise<void> | null = null;
let loggedInUserId: string | null = null;

/**
 * Initialises the RevenueCat SDK exactly once.
 * Uses a module-level flag + promise mutex so multiple callers
 * never race or double-configure.
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
  if (monthly) {
    return monthly.product.priceString;
  }
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
  console.log('[RevenueCat] customerInfo entitlements:', JSON.stringify(customerInfo.entitlements));
  const active = customerInfo.entitlements.active;
  return !!(active && Object.keys(active).length > 0);
};

/**
 * Purchases the monthly package and returns customerInfo on success.
 * Returns null if the user cancels.
 */
export const purchaseMonthly = async (): Promise<any | null> => {
  await initRevenueCat();
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  const offerings = await Purchases.getOfferings();
  const monthlyPackage = offerings.current?.monthly;

  if (!monthlyPackage) {
    throw new Error('MONTHLY_NOT_FOUND');
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: monthlyPackage });
    return customerInfo;
  } catch (err: any) {
    // code 1 = user cancelled
    if (err?.code === 1) return null;
    throw err;
  }
};

/**
 * Restores purchases and returns customerInfo if active entitlements exist.
 * Returns null otherwise.
 */
export const restorePurchases = async (): Promise<any | null> => {
  await initRevenueCat();
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  const { customerInfo } = await Purchases.restorePurchases();
  const active = customerInfo.entitlements.active;
  if (active && Object.keys(active).length > 0) {
    return customerInfo;
  }
  return null;
};

/**
 * Associates the Supabase user ID with RevenueCat (idempotent).
 */
export const logInRevenueCat = async (userId: string): Promise<any> => {
  if (loggedInUserId === userId) return null;
  await initRevenueCat();
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  const { customerInfo } = await Purchases.logIn({ appUserID: userId });
  loggedInUserId = userId;
  console.log('[RevenueCat] logIn success for', userId);
  return customerInfo;
};

/**
 * Logs out from RevenueCat.
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

/**
 * Syncs RevenueCat subscription data to the Supabase `subscribers` table.
 */
export const syncSubscriptionAfterLogin = async (
  userId: string,
  email: string,
  customerInfo: any,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const entitlements = customerInfo.entitlements?.active;
    if (!entitlements || Object.keys(entitlements).length === 0) {
      console.log('[RevenueCat] No active entitlements to sync');
      return { success: false, error: 'No active entitlements' };
    }

    const firstKey = Object.keys(entitlements)[0];
    const firstEntitlement = entitlements[firstKey];
    const expirationDate = firstEntitlement.expirationDate || null;

    const upsertData = {
      user_id: userId,
      email,
      subscribed: true,
      subscription_tier: 'Premium',
      subscription_end: expirationDate,
      payment_provider: 'apple',
      updated_at: new Date().toISOString(),
    };

    console.log('[RevenueCat] Attempting upsert to subscribers:', JSON.stringify(upsertData));

    // Try upsert by email first (existing flow)
    const { data, error } = await supabase.from('subscribers').upsert(
      upsertData,
      { onConflict: 'email' },
    );

    if (error) {
      console.error('[RevenueCat] Upsert by email failed:', error.message, error.code, error.details);
      // Fallback: try to update by user_id
      const { error: updateError } = await supabase
        .from('subscribers')
        .update({
          subscribed: true,
          subscription_tier: 'Premium',
          subscription_end: expirationDate,
          payment_provider: 'apple',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('[RevenueCat] Update by user_id also failed:', updateError.message);
        return { success: false, error: `Upsert: ${error.message}, Update: ${updateError.message}` };
      }
      console.log('[RevenueCat] Fallback update by user_id succeeded');
    }

    console.log('[RevenueCat] Synced subscription to Supabase', { expirationDate, userId });
    return { success: true };
  } catch (err: any) {
    console.error('[RevenueCat] Error syncing to Supabase:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
};
