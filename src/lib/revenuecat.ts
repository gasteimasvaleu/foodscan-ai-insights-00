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

// ─── Helper: small delay ───
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Upserts subscription data directly from a customerInfo object to the Supabase
 * `subscribers` table. Does NOT retry entitlement detection — expects customerInfo
 * to already contain active entitlements (e.g. right after a purchase).
 */
export const upsertSubscriptionFromCustomerInfo = async (
  userId: string,
  email: string,
  customerInfo: any,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const entitlements = customerInfo.entitlements?.active;
    if (!entitlements || Object.keys(entitlements).length === 0) {
      console.log('[RevenueCat] upsert: no active entitlements in customerInfo');
      return { success: false, error: 'No active entitlements' };
    }

    const firstKey = Object.keys(entitlements)[0];
    const firstEntitlement = entitlements[firstKey];
    const expirationDate = firstEntitlement.expirationDate || null;

    const originalTransactionId = firstEntitlement.originalPurchaseDate
      ? `apple_${firstEntitlement.productIdentifier}_${firstEntitlement.originalPurchaseDate}`
      : null;

    const now = new Date().toISOString();
    const updateFields = {
      subscribed: true,
      subscription_tier: 'Premium',
      subscription_end: expirationDate,
      payment_provider: 'apple',
      product_source: 'revenuecat',
      subscription_status: 'active',
      transaction_id: originalTransactionId,
      updated_at: now,
    };

    console.log('[RevenueCat] upsert direct:', JSON.stringify({
      userId, email, expirationDate, transactionId: originalTransactionId,
    }));

    // Try claim orphan by transaction_id
    if (originalTransactionId) {
      const { data: orphanByTxn } = await supabase
        .from('subscribers')
        .select('id, user_id')
        .eq('transaction_id', originalTransactionId)
        .is('user_id', null)
        .maybeSingle();

      if (orphanByTxn) {
        console.log('[RevenueCat] upsert: claiming orphan by txn:', orphanByTxn.id);
        const { error } = await supabase
          .from('subscribers')
          .update({ ...updateFields, user_id: userId, email })
          .eq('id', orphanByTxn.id);
        if (!error) return { success: true };
      }
    }

    // Try claim orphan by email
    const { data: orphanByEmail } = await supabase
      .from('subscribers')
      .select('id, user_id')
      .eq('email', email)
      .is('user_id', null)
      .maybeSingle();

    if (orphanByEmail) {
      console.log('[RevenueCat] upsert: claiming orphan by email:', orphanByEmail.id);
      const { error } = await supabase
        .from('subscribers')
        .update({ ...updateFields, user_id: userId })
        .eq('id', orphanByEmail.id);
      if (!error) return { success: true };
    }

    // Try update existing by user_id
    const { data: existingByUserId } = await supabase
      .from('subscribers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingByUserId) {
      console.log('[RevenueCat] upsert: updating existing by user_id');
      const { error } = await supabase
        .from('subscribers')
        .update(updateFields)
        .eq('user_id', userId);
      if (!error) return { success: true };
      return { success: false, error: error.message };
    }

    // Insert new
    console.log('[RevenueCat] upsert: inserting new record');
    const { error: insertError } = await supabase
      .from('subscribers')
      .insert({ user_id: userId, email, ...updateFields });

    if (insertError) {
      console.error('[RevenueCat] upsert insert failed:', insertError.message);
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[RevenueCat] upsert error:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
};

/**
 * Syncs RevenueCat subscription data to the Supabase `subscribers` table.
 * 
 * Follows the proven flow:
 * 1. Retry entitlement check 3 times (1.5s delay)
 * 2. restorePurchases() fallback
 * 3. If no active subscription, exit without creating record
 * 4. If active: claim orphan by transaction_id, then by email, then update by user_id, then insert
 */
export const syncSubscriptionAfterLogin = async (
  userId: string,
  email: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await initRevenueCat();
    const { Purchases } = await import('@revenuecat/purchases-capacitor');

    // ─── Step 1: Retry entitlement check with delay ───
    let customerInfo: any = null;
    let hasActiveEntitlement = false;

    for (let attempt = 1; attempt <= 3; attempt++) {
      const { customerInfo: info } = await Purchases.getCustomerInfo();
      const active = info.entitlements?.active;
      if (active && Object.keys(active).length > 0) {
        customerInfo = info;
        hasActiveEntitlement = true;
        console.log(`[RevenueCat] Entitlement found on attempt ${attempt}`);
        break;
      }
      console.log(`[RevenueCat] No entitlement on attempt ${attempt}, waiting 1.5s...`);
      if (attempt < 3) await delay(1500);
    }

    // ─── Step 2: restorePurchases fallback ───
    if (!hasActiveEntitlement) {
      console.log('[RevenueCat] No entitlement after 3 attempts, trying restorePurchases...');
      try {
        const { customerInfo: restored } = await Purchases.restorePurchases();
        const active = restored.entitlements?.active;
        if (active && Object.keys(active).length > 0) {
          customerInfo = restored;
          hasActiveEntitlement = true;
          console.log('[RevenueCat] Entitlement found after restorePurchases');
        }
      } catch (restoreErr) {
        console.warn('[RevenueCat] restorePurchases failed:', restoreErr);
      }
    }

    // ─── Step 3: No active subscription → exit without creating record ───
    if (!hasActiveEntitlement || !customerInfo) {
      console.log('[RevenueCat] No active subscription found, not creating record');
      return { success: false, error: 'No active subscription' };
    }

    // ─── Extract entitlement data ───
    const entitlements = customerInfo.entitlements.active;
    const firstKey = Object.keys(entitlements)[0];
    const firstEntitlement = entitlements[firstKey];
    const expirationDate = firstEntitlement.expirationDate || null;

    // Try to get transaction_id from originalPurchaseDate or latest transaction
    const transactionId = customerInfo.originalAppUserId || 
      firstEntitlement.productIdentifier || null;
    // The real original_transaction_id from the entitlement
    const originalTransactionId = firstEntitlement.originalPurchaseDate 
      ? `apple_${firstEntitlement.productIdentifier}_${firstEntitlement.originalPurchaseDate}`
      : null;

    const now = new Date().toISOString();
    const updateFields = {
      subscribed: true,
      subscription_tier: 'Premium',
      subscription_end: expirationDate,
      payment_provider: 'apple',
      product_source: 'revenuecat',
      subscription_status: 'active',
      transaction_id: originalTransactionId,
      updated_at: now,
    };

    console.log('[RevenueCat] Syncing subscription:', JSON.stringify({
      userId, email, expirationDate, transactionId: originalTransactionId,
    }));

    // ─── Step 4a: Try claim orphan by transaction_id ───
    if (originalTransactionId) {
      const { data: orphanByTxn } = await supabase
        .from('subscribers')
        .select('id, user_id')
        .eq('transaction_id', originalTransactionId)
        .is('user_id', null)
        .maybeSingle();

      if (orphanByTxn) {
        console.log('[RevenueCat] Claiming orphan by transaction_id:', orphanByTxn.id);
        const { error } = await supabase
          .from('subscribers')
          .update({ ...updateFields, user_id: userId, email })
          .eq('id', orphanByTxn.id);
        if (!error) return { success: true };
        console.error('[RevenueCat] Orphan claim by txn failed:', error.message);
      }
    }

    // ─── Step 4b: Try claim orphan by email ───
    const { data: orphanByEmail } = await supabase
      .from('subscribers')
      .select('id, user_id')
      .eq('email', email)
      .is('user_id', null)
      .maybeSingle();

    if (orphanByEmail) {
      console.log('[RevenueCat] Claiming orphan by email:', orphanByEmail.id);
      const { error } = await supabase
        .from('subscribers')
        .update({ ...updateFields, user_id: userId })
        .eq('id', orphanByEmail.id);
      if (!error) return { success: true };
      console.error('[RevenueCat] Orphan claim by email failed:', error.message);
    }

    // ─── Step 4c: Try update existing record by user_id ───
    const { data: existingByUserId } = await supabase
      .from('subscribers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingByUserId) {
      console.log('[RevenueCat] Updating existing record by user_id');
      const { error } = await supabase
        .from('subscribers')
        .update(updateFields)
        .eq('user_id', userId);
      if (!error) return { success: true };
      console.error('[RevenueCat] Update by user_id failed:', error.message);
      return { success: false, error: error.message };
    }

    // ─── Step 4d: Insert new record ───
    console.log('[RevenueCat] No existing record found, inserting new');
    const { error: insertError } = await supabase
      .from('subscribers')
      .insert({
        user_id: userId,
        email,
        ...updateFields,
      });

    if (insertError) {
      console.error('[RevenueCat] Insert failed:', insertError.message, insertError.code);
      return { success: false, error: insertError.message };
    }

    console.log('[RevenueCat] Successfully synced subscription for', userId);
    return { success: true };
  } catch (err: any) {
    console.error('[RevenueCat] Error syncing to Supabase:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
};
