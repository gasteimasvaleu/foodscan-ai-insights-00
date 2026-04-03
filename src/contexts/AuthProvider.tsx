import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  authReady: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionLoading: boolean;
  subscriptionReady: boolean;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<SubscriptionStatus>;
  forceSubscriptionActive: (expirationDate?: string | null) => void;
  setPurchaseInProgress: (value: boolean) => void;
  loading: boolean;
  subscription: {
    subscriptionStatus: SubscriptionStatus;
    loading: boolean;
    checkSubscription: () => Promise<SubscriptionStatus>;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionReady, setSubscriptionReady] = useState(false);

  const currentUserIdRef = useRef<string | null>(null);
  const purchaseInProgressRef = useRef(false);
  const forcedAtRef = useRef<number | null>(null);

  const isNativeIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  // Force subscription active locally (skip DB roundtrip)
  const forceSubscriptionActive = useCallback((expirationDate?: string | null) => {
    console.log('[AuthProvider] forceSubscriptionActive called, expiration:', expirationDate);
    forcedAtRef.current = Date.now();
    setSubscriptionStatus({
      subscribed: true,
      subscription_tier: 'Premium',
      subscription_end: expirationDate || null,
    });
    setSubscriptionReady(true);
    setSubscriptionLoading(false);
  }, []);

  const setPurchaseInProgress = useCallback((value: boolean) => {
    console.log('[AuthProvider] setPurchaseInProgress:', value);
    purchaseInProgressRef.current = value;
  }, []);

  // ─── Check subscription (returns result for sync usage) ───
  const checkSubscription = useCallback(async (): Promise<SubscriptionStatus> => {
    const defaultStatus: SubscriptionStatus = { subscribed: false, subscription_tier: null, subscription_end: null };
    
    if (!currentUserIdRef.current) {
      setSubscriptionStatus(defaultStatus);
      setSubscriptionReady(true);
      return defaultStatus;
    }

    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('[AuthProvider] Error checking subscription:', error);
        setSubscriptionReady(true);
        setSubscriptionLoading(false);
        return defaultStatus;
      }

      const result: SubscriptionStatus = {
        subscribed: data?.subscribed || false,
        subscription_tier: data?.subscription_tier || null,
        subscription_end: data?.subscription_end || null,
      };

      setSubscriptionStatus(result);
      setSubscriptionReady(true);
      setSubscriptionLoading(false);
      return result;
    } catch (error) {
      console.error('[AuthProvider] Error in checkSubscription:', error);
      setSubscriptionReady(true);
      setSubscriptionLoading(false);
      return defaultStatus;
    }
  }, []);

  // ─── Auth bootstrap ───
  useEffect(() => {
    let mounted = true;

    // 1) Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log('[AuthProvider] Auth event:', event);

        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          currentUserIdRef.current = newSession.user.id;

          // RevenueCat sync on native iOS (non-blocking)
          if (isNativeIOS && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            setTimeout(async () => {
              try {
                const { identifyUser, syncSubscriptionAfterLogin } = await import('@/lib/revenuecat');
                const userId = newSession.user.id;
                const email = newSession.user.email || '';
                console.log('[AuthProvider] Identifying with RevenueCat:', userId);
                await identifyUser(userId);
                await syncSubscriptionAfterLogin(userId, email);
              } catch (err) {
                console.error('[AuthProvider] RevenueCat sync error:', err);
              }
            }, 0);
          }
        } else {
          setSession(null);
          setUser(null);
          currentUserIdRef.current = null;
          setSubscriptionStatus({ subscribed: false, subscription_tier: null, subscription_end: null });
          setSubscriptionReady(false);
        }

        if (!authReady) setAuthReady(true);
      }
    );

    // 2) Then check existing session
    supabase.auth.getSession().then(({ data: { session: existingSession }, error }) => {
      if (!mounted) return;

      if (error || !existingSession) {
        // No valid session or error - clean state
        if (error) {
          console.warn('[AuthProvider] Session restore error, forcing clean state:', error.message);
          supabase.auth.signOut().catch(() => {});
        }
        setSession(null);
        setUser(null);
        currentUserIdRef.current = null;
        setAuthReady(true);
        setSubscriptionReady(true);
        return;
      }

      setSession(existingSession);
      setUser(existingSession.user);
      currentUserIdRef.current = existingSession.user.id;
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-check subscription when user changes ───
  useEffect(() => {
    if (!authReady) return;

    if (user) {
      // Skip re-check if a purchase is in progress
      if (purchaseInProgressRef.current) {
        console.log('[AuthProvider] Purchase in progress, skipping checkSubscription');
        return;
      }

      // Race condition protection for newly created users
      const userCreatedAt = new Date(user.created_at).getTime();
      const secondsSinceCreation = (Date.now() - userCreatedAt) / 1000;

      if (secondsSinceCreation < 10) {
        console.log('[AuthProvider] New user, waiting 10s before checking subscription...');
        const timer = setTimeout(() => checkSubscription(), 10000);
        return () => clearTimeout(timer);
      } else {
        checkSubscription();
      }
    } else {
      setSubscriptionStatus({ subscribed: false, subscription_tier: null, subscription_end: null });
      setSubscriptionReady(true);
    }
  }, [user, authReady, checkSubscription]);

  // ─── Actions ───
  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: redirectUrl },
    });

    if (error) {
      toast({ title: 'Erro no cadastro', description: error.message, variant: 'destructive' });
      return { error, data: null };
    }

    toast({ title: 'Cadastro realizado!', description: 'Você já pode fazer login.' });
    return { error: null, data };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Erro no login', description: error.message, variant: 'destructive' });
      return { error };
    }
    return { error: null };
  };

  const signOut = async () => {
    // Clear local state first
    setSession(null);
    setUser(null);
    currentUserIdRef.current = null;
    setSubscriptionStatus({ subscribed: false, subscription_tier: null, subscription_end: null });
    setSubscriptionReady(false);

    // Logout RevenueCat on native iOS
    if (isNativeIOS) {
      try {
        const { logOutRevenueCat } = await import('@/lib/revenuecat');
        await logOutRevenueCat();
      } catch (err) {
        console.warn('[AuthProvider] RevenueCat logout error:', err);
      }
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error && !error.message.toLowerCase().includes('session')) {
        toast({ title: 'Erro ao sair', description: error.message, variant: 'destructive' });
      }
    } catch (err) {
      console.warn('[AuthProvider] Logout error (local state cleared):', err);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    authReady,
    subscriptionStatus,
    subscriptionLoading,
    subscriptionReady,
    signUp,
    signIn,
    signOut,
    checkSubscription,
    forceSubscriptionActive,
    setPurchaseInProgress,
    loading: !authReady,
    // Backward-compatible shape
    subscription: {
      subscriptionStatus,
      loading: subscriptionLoading,
      checkSubscription,
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
