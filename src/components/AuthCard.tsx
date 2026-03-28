
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useNativePlatform } from '@/hooks/useNativePlatform';
import { supabase } from '@/integrations/supabase/client';

import {
  initRevenueCat,
  getSubscriptionPrice,
  purchaseMonthly as rcPurchaseMonthly,
  restorePurchases as rcRestorePurchases,
  checkSubscriptionStatus,
  logInRevenueCat,
  syncSubscriptionAfterLogin,
} from '@/lib/revenuecat';

import { AppleSignInButton } from './AppleSignInButton';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

interface AuthCardProps {
  mode?: 'login' | 'signup';
}

export const AuthCard = ({ mode = 'login' }: AuthCardProps) => {
  const { user, signUp, signIn, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { isNative, isIOS } = useNativePlatform();
  const [price, setPrice] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [rcLoading, setRcLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [banners, setBanners] = useState<{ id: string; image_url: string }[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [profileName, setProfileName] = useState<string | null>(null);

  const isNativeIOS = isNative && isIOS;

  // RevenueCat init (native iOS only)
  useEffect(() => {
    if (!isNativeIOS) return;
    (async () => {
      try {
        await initRevenueCat();
        const hasActive = await checkSubscriptionStatus();
        if (hasActive) setHasPurchased(true);
        const priceStr = await getSubscriptionPrice();
        if (priceStr) setPrice(priceStr);
      } catch (err) {
        console.error('[AuthCard] RevenueCat init error:', err);
        toast({ title: 'Erro ao inicializar compras', description: 'Tente novamente mais tarde.', variant: 'destructive' });
      }
    })();
  }, [isNativeIOS]);

  // Associate user with RevenueCat after login
  useEffect(() => {
    if (!isNativeIOS || !user?.id) return;
    (async () => {
      try {
        const customerInfo = await logInRevenueCat(user.id);
        if (!customerInfo) return;
        const active = customerInfo.entitlements?.active;
        if (active && Object.keys(active).length > 0) {
          setHasPurchased(true);
          if (user.email) await syncSubscriptionAfterLogin(user.id, user.email, customerInfo);
        }
      } catch (err) {
        console.error('[AuthCard] RevenueCat logIn error:', err);
      }
    })();
  }, [isNativeIOS, user?.id, user?.email]);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from('homepage_banners')
        .select('id, image_url')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (data && data.length > 0) setBanners(data);
    };
    fetchBanners();
  }, []);

  // Autoplay 10s
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Fetch profile name when logged in
  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('name').eq('id', user.id).single();
      if (data?.name) setProfileName(data.name);
    };
    fetchProfile();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn(formData.email, formData.password);
    if (!result.error) {
      sessionStorage.setItem('skipSplash', 'true');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePurchase = async () => {
    setRcLoading(true);
    try {
      const customerInfo = await rcPurchaseMonthly();
      if (customerInfo) {
        setHasPurchased(true);
        if (user?.id && user?.email) {
          await syncSubscriptionAfterLogin(user.id, user.email, customerInfo);
        }
        toast({ title: '✅ Assinatura realizada!', description: 'Agora faça login com sua conta Apple.' });
      }
    } catch (err: any) {
      console.error('[AuthCard] Purchase error (full):', JSON.stringify(err));
      toast({ title: 'Erro na compra', description: `Não foi possível completar. ${err?.message || ''}`, variant: 'destructive' });
    } finally {
      setRcLoading(false);
    }
  };

  const handleRestore = async () => {
    setRcLoading(true);
    try {
      const customerInfo = await rcRestorePurchases();
      if (customerInfo) {
        setHasPurchased(true);
        if (user?.id && user?.email) {
          await syncSubscriptionAfterLogin(user.id, user.email, customerInfo);
        }
        toast({ title: '✅ Compra restaurada!', description: 'Sua assinatura está ativa.' });
      } else {
        toast({ title: 'Nenhuma assinatura encontrada', description: 'Não encontramos assinaturas ativas para restaurar.', variant: 'destructive' });
      }
    } catch (err) {
      console.error('[AuthCard] Restore error:', err);
      toast({ title: 'Erro ao restaurar', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setRcLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl">
        <CardContent className="p-6">
          <div className="text-center">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  const fallbackBannerUrl = "https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/image_1774529760024_8eac27be_1774529764977_e41a0ea0.webp";

  if (user) {
    const userName = profileName || user.email;
    const bannerImages = banners.length > 0 ? banners : [{ id: 'fallback', image_url: fallbackBannerUrl }];

    return (
      <>
        <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden">
          <div className="aspect-video w-full relative">
            {bannerImages.map((banner, index) => (
              <img
                key={banner.id}
                src={banner.image_url}
                alt={`Banner ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  index === currentBanner ? 'opacity-100' : 'opacity-0'
                }`}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ))}
            {/* Dots */}
            {bannerImages.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {bannerImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentBanner
                        ? 'bg-white w-4'
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
        <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground text-sm truncate text-center">
              Boas-vindas, {userName}!
            </h3>
          </CardContent>
        </Card>
        
      </>
    );
  }

  // ─── Native iOS Flow ───
  if (isNativeIOS) {
    return (
      <div className="min-h-[calc(100vh-env(safe-area-inset-top)-2rem)] flex items-center justify-center overflow-y-auto py-6">
      <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-2">
            <img
              src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/logoapp.png"
              alt="We Diet Logo"
              className="h-16 object-contain"
              loading="lazy"
            />
          </div>
          <CardTitle className="text-center text-gray-800 text-lg">
            We Diet - Dieta Inteligente
          </CardTitle>
          <p className="text-center text-2xl font-bold text-primary">
            {price || 'R$ 49,90'} <span className="text-sm font-normal text-muted-foreground">/mês</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Apple Sign In — disabled until purchased */}
          <AppleSignInButton disabled={!hasPurchased} />
          {!hasPurchased && (
            <p className="text-xs text-muted-foreground text-center -mt-2">
              Assine primeiro abaixo para habilitar o login com Apple
            </p>
          )}

          {/* Subscribe via App Store */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Caso ainda não tenha assinatura, clique antes em:
            </p>
            <Button
              onClick={handlePurchase}
              disabled={rcLoading || hasPurchased}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {rcLoading ? 'Processando...' : hasPurchased ? '✅ Assinatura ativa' : 'Assinar via App Store'}
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="seu@email.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required placeholder="Sua senha" minLength={6} />
            </div>
            <Button type="submit" className="w-full">Entrar</Button>
          </form>

          {/* Restore Purchases */}
          <button
            type="button"
            onClick={handleRestore}
            disabled={rcLoading}
            className="w-full text-sm text-primary underline hover:text-primary/80"
          >
            Restaurar Compras
          </button>

          {/* Legal text — Apple Guideline 3.1.2c */}
          <p className="text-[10px] text-muted-foreground text-center leading-tight">
            A assinatura é renovada automaticamente, a menos que seja cancelada pelo menos 24 horas antes do término do período atual. O pagamento será cobrado na sua conta do iTunes. A gestão da assinatura pode ser feita nas Definições da conta após a compra.
          </p>

          {/* Privacy & Terms links */}
          <div className="flex justify-center gap-4 text-[11px]">
            <button type="button" onClick={() => navigate('/politica-de-privacidade')} className="text-primary underline">
              Política de Privacidade
            </button>
            <button type="button" onClick={() => navigate('/termos-de-uso')} className="text-primary underline">
              Termos de Uso
            </button>
          </div>
        </CardContent>
      </Card>
      </div>
    );
  }

  // ─── Web Flow ───
  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-2rem)] flex items-center justify-center">
    <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl w-full">
      <CardHeader>
        <div className="flex justify-center mb-2">
          <img
            src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/logoapp.png"
            alt="We Diet Logo"
            className="h-16 object-contain"
            loading="lazy"
          />
        </div>
        <CardTitle className="text-center text-gray-800">Fazer Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AppleSignInButton />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">ou</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Login (Email)</label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="seu@email.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required placeholder="Sua senha" minLength={6} />
          </div>
          <Button type="submit" className="w-full">Entrar</Button>
        </form>

        <div className="flex justify-center gap-4 text-[11px]">
          <button type="button" onClick={() => navigate('/politica-de-privacidade')} className="text-primary underline">
            Política de Privacidade
          </button>
          <button type="button" onClick={() => navigate('/termos-de-uso')} className="text-primary underline">
            Termos de Uso
          </button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};
