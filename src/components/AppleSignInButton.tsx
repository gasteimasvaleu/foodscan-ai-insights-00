import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNativePlatform } from '@/hooks/useNativePlatform';
import NativeAppleSignIn from '@/plugins/NativeAppleSignIn';
import { toast } from '@/hooks/use-toast';

export const AppleSignInButton = () => {
  const { isIOS } = useNativePlatform();
  const [loading, setLoading] = useState(false);

  if (!isIOS) return null;

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const result = await NativeAppleSignIn.authorize();

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: result.identityToken,
      });

      if (error) {
        toast({
          title: 'Erro no login com Apple',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        sessionStorage.setItem('skipSplash', 'true');
      }
    } catch (err: any) {
      if (err?.code === '1001') {
        // User cancelled - do nothing
        return;
      }
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer login com Apple.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAppleSignIn}
      disabled={loading}
      variant="outline"
      className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-900 border-black"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
      {loading ? 'Entrando...' : 'Entrar com Apple'}
    </Button>
  );
};
