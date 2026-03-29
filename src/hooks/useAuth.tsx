import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useSubscription } from './useSubscription';
import { Capacitor } from '@capacitor/core';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const subscription = useSubscription(user);

  useEffect(() => {
    const isNativeIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // ─── RevenueCat sync on login (native iOS only) ───
        if (isNativeIOS && session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(async () => {
            try {
              const { identifyUser, syncSubscriptionAfterLogin } = await import('@/lib/revenuecat');
              const userId = session.user.id;
              const email = session.user.email || '';

              console.log('[useAuth] Auth event:', event, '- identifying user with RevenueCat:', userId);
              await identifyUser(userId);

              console.log('[useAuth] Starting subscription sync...');
              const result = await syncSubscriptionAfterLogin(userId, email);
              if (result.success) {
                console.log('[useAuth] Subscription synced successfully');
              } else {
                console.log('[useAuth] Sync result:', result.error);
              }
            } catch (err) {
              console.error('[useAuth] RevenueCat sync error:', err);
            }
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
      return { error, data: null };
    }

    toast({
      title: "Cadastro realizado!",
      description: "Você já pode fazer login.",
    });

    return { error: null, data };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    return { error: null };
  };

  const signOut = async () => {
    // Limpar estado local primeiro
    setSession(null);
    setUser(null);

    // Logout RevenueCat on native iOS
    const isNativeIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
    if (isNativeIOS) {
      try {
        const { logOutRevenueCat } = await import('@/lib/revenuecat');
        await logOutRevenueCat();
        console.log('[useAuth] RevenueCat logout done');
      } catch (err) {
        console.warn('[useAuth] RevenueCat logout error:', err);
      }
    }

    if (!session) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error && !error.message.toLowerCase().includes('session')) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.warn('Logout error (estado local limpo):', err);
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    subscription,
  };
};
