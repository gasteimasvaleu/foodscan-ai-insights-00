import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = (user: any) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const [loading, setLoading] = useState(false);

  const checkSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      setSubscriptionStatus({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
      });
    } catch (error) {
      console.error('Error in checkSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-check subscription when user changes
  useEffect(() => {
    if (user) {
      // 🛡️ PROTEÇÃO CONTRA RACE CONDITION: Delay para usuários recém-criados
      const userCreatedAt = new Date(user.created_at).getTime();
      const now = Date.now();
      const secondsSinceCreation = (now - userCreatedAt) / 1000;
      
      if (secondsSinceCreation < 10) {
        // Usuário muito novo - aguardar 10 segundos antes de checar
        console.log('⏱️ Usuário recém-criado, aguardando 10s antes de checar subscription...');
        const timer = setTimeout(() => {
          console.log('✅ 10 segundos passados, checando subscription agora...');
          checkSubscription();
        }, 10000);
        return () => clearTimeout(timer);
      } else {
        // Usuário antigo - pode checar imediatamente
        checkSubscription();
      }
    } else {
      setSubscriptionStatus({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
      });
    }
  }, [user]);

  return {
    subscriptionStatus,
    loading,
    checkSubscription,
  };
};