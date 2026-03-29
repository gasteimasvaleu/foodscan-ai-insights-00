import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNativePlatform } from '@/hooks/useNativePlatform';
import NativeAppleSignIn from '@/plugins/NativeAppleSignIn';
import { toast } from '@/hooks/use-toast';

interface AppleSignInButtonProps {
  disabled?: boolean;
  label?: string;
}

export const AppleSignInButton = ({ disabled = false, label }: AppleSignInButtonProps) => {
  const { isNative, isIOS } = useNativePlatform();
  const [loading, setLoading] = useState(false);

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      if (isNative && isIOS) {
        // Native flow: use Capacitor plugin
        const result = await NativeAppleSignIn.authorize();
        console.log('[AppleSignIn] Plugin authorize success, token preview:', result.identityToken?.substring(0, 20));
        console.log('[AppleSignIn] givenName:', result.givenName, 'familyName:', result.familyName, 'email:', result.email);

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: result.identityToken,
        });

        if (error) {
          console.error('[AppleSignIn] signInWithIdToken error:', error.message, error);
          toast({
            title: 'Erro no login com Apple',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          sessionStorage.setItem('skipSplash', 'true');
          
          // Upsert profile name from Apple data
          if (data.user && (result.givenName || result.familyName)) {
            const fullName = [result.givenName, result.familyName].filter(Boolean).join(' ');
            if (fullName) {
              await supabase
                .from('profiles')
                .update({ name: fullName })
                .eq('id', data.user.id);
            }
          }

          // Sync RevenueCat subscription to subscribers table
          if (data.user) {
            try {
              const { logInRevenueCat, syncSubscriptionAfterLogin } = await import('@/lib/revenuecat');
              await logInRevenueCat(data.user.id);
              // Always fetch fresh customerInfo after logIn
              const { Purchases } = await import('@revenuecat/purchases-capacitor');
              const { customerInfo: fullInfo } = await Purchases.getCustomerInfo();
              console.log('[AppleSignIn] Post-login entitlements:', JSON.stringify(fullInfo.entitlements));
              const active = fullInfo.entitlements?.active;
              if (active && Object.keys(active).length > 0) {
                const result = await syncSubscriptionAfterLogin(
                  data.user.id,
                  data.user.email || '',
                  fullInfo
                );
                if (result.success) {
                  console.log('[AppleSignIn] Subscription synced to subscribers table');
                } else {
                  console.error('[AppleSignIn] Sync failed:', result.error);
                  toast({
                    title: 'Aviso',
                    description: 'Login realizado, mas houve um erro ao sincronizar sua assinatura. Tente restaurar compras.',
                    variant: 'destructive',
                  });
                }
              } else {
                console.log('[AppleSignIn] No active entitlements found after login');
              }
            } catch (err) {
              console.error('[AppleSignIn] RC sync error:', err);
            }
          }
        }
      } else {
        // Web flow: OAuth redirect
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
        });

        if (error) {
          toast({
            title: 'Erro no login com Apple',
            description: error.message,
            variant: 'destructive',
          });
        }
      }
    } catch (err: any) {
      if (err?.code === '1001') {
        console.log('[AppleSignIn] User cancelled');
        return;
      }
      console.error('[AppleSignIn] Unexpected error:', err);
      toast({
        title: 'Erro no login com Apple',
        description: err?.message || 'Não foi possível fazer login com Apple.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const appleSvg = (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );

  const buttonLabel = label || (loading ? 'Entrando...' : 'Continuar com Apple');

  return (
    <Button
      onClick={handleAppleSignIn}
      disabled={loading || disabled}
      variant="outline"
      className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-900 border-black disabled:opacity-50"
    >
      {appleSvg}
      {buttonLabel}
    </Button>
  );
};
