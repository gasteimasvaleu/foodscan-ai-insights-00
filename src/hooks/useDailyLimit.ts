import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNativePlatform } from '@/hooks/useNativePlatform';
import { FREEMIUM_ENABLED } from '@/config/freemium';

interface UseDailyLimitResult {
  count: number;
  remaining: number;
  canUse: boolean;
  loading: boolean;
  increment: () => Promise<void>;
  refresh: () => Promise<void>;
  /** True quando este usuário/plataforma está sujeito à quota. */
  isGated: boolean;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Controla quota diária de uma feature por usuário.
 *
 * Salvaguarda: usuários assinantes (subscribed === true), web e Android
 * sempre retornam canUse=true e increment() é no-op. Apenas iOS nativo +
 * free fica realmente gated.
 */
export const useDailyLimit = (
  feature: string,
  dailyLimit: number,
): UseDailyLimitResult => {
  const { user, subscriptionStatus } = useAuth();
  const { isNative, isIOS } = useNativePlatform();

  const isGated =
    FREEMIUM_ENABLED &&
    isNative &&
    isIOS &&
    !!user &&
    !subscriptionStatus.subscribed;

  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isGated || !user) {
      setCount(0);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('daily_usage_limits')
        .select('count')
        .eq('user_id', user.id)
        .eq('feature', feature)
        .eq('usage_date', todayISO())
        .maybeSingle();

      if (error) {
        console.warn('[useDailyLimit] fetch error', error);
        setCount(0);
      } else {
        setCount(data?.count ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [isGated, user, feature]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const increment = useCallback(async () => {
    if (!isGated || !user) return;
    const today = todayISO();
    try {
      // Upsert com count = count + 1 via RPC simples: lê → soma → upsert
      const { data: existing } = await supabase
        .from('daily_usage_limits')
        .select('id, count')
        .eq('user_id', user.id)
        .eq('feature', feature)
        .eq('usage_date', today)
        .maybeSingle();

      const newCount = (existing?.count ?? 0) + 1;

      if (existing) {
        await supabase
          .from('daily_usage_limits')
          .update({ count: newCount })
          .eq('id', existing.id);
      } else {
        await supabase.from('daily_usage_limits').insert({
          user_id: user.id,
          feature,
          usage_date: today,
          count: newCount,
        });
      }
      setCount(newCount);
    } catch (err) {
      console.warn('[useDailyLimit] increment error', err);
    }
  }, [isGated, user, feature]);

  const remaining = isGated ? Math.max(0, dailyLimit - count) : dailyLimit;
  const canUse = !isGated || count < dailyLimit;

  return { count, remaining, canUse, loading, increment, refresh, isGated };
};
