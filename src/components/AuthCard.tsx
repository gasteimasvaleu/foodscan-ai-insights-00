
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { DailyCalorieSummaryCard } from './DailyCalorieSummaryCard';
import { DailyHydrationSummaryCard } from './DailyHydrationSummaryCard';
import { DailyFastingSummaryCard } from './DailyFastingSummaryCard';
import { useNavigate } from 'react-router-dom';
import { useNativePlatform } from '@/hooks/useNativePlatform';
import { supabase } from '@/integrations/supabase/client';

import {
  restorePurchases as rcRestorePurchases,
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
  const [rcLoading, setRcLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [banners, setBanners] = useState<{ id: string; image_url: string }[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [profileName, setProfileName] = useState<string | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const isNativeIOS = isNative && isIOS;

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

  // Autoplay 5s — pauses when on summary card
  useEffect(() => {
    if (banners.length <= 0) return;
    const totalSlides = banners.length + 2; // +1 calorie summary +1 hydration
    const timer = setInterval(() => {
      setCurrentBanner(prev => {
        const next = prev + 1;
        // Stop autoplay at summary card (last slide)
        if (next >= totalSlides) return prev;
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Fetch profile name when logged in + realtime updates
  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('name').eq('id', user.id).single();
      if (data?.name) setProfileName(data.name);
    };
    fetchProfile();

    const channel = supabase
      .channel('authcard-profile')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`,
      }, (payload: any) => {
        if (payload.new?.name) setProfileName(payload.new.name);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const handleRestore = async () => {
    setRcLoading(true);
    try {
      const customerInfo = await rcRestorePurchases();
      if (customerInfo) {
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
    const totalSlides = bannerImages.length + 2; // +1 calorie +1 hydration


    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchMove = (e: React.TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = () => {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentBanner < totalSlides - 1) {
          setCurrentBanner(prev => prev + 1);
        } else if (diff < 0 && currentBanner > 0) {
          setCurrentBanner(prev => prev - 1);
        }
      }
    };

    return (
      <>
        <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden">
          <div
            className="aspect-video w-full relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Banner images */}
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

            {/* Summary card (calorie) */}
            <div
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
                currentBanner === bannerImages.length ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <DailyCalorieSummaryCard />
            </div>

            {/* Summary card (hydration) */}
            <div
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
                currentBanner === bannerImages.length + 1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <DailyHydrationSummaryCard />
            </div>

            {/* Dots */}
            {totalSlides > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentBanner ? 'bg-white w-4' : 'bg-white/50'
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

  // ─── Native iOS Flow (simplified: no purchase gate) ───
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="seu@email.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required placeholder="Sua senha" minLength={6} />
            </div>
            <Button type="submit" className="w-full">Entrar</Button>
          </form>

          <button
            type="button"
            onClick={handleRestore}
            disabled={rcLoading}
            className="w-full text-sm text-primary underline hover:text-primary/80"
          >
            Restaurar Compras
          </button>

          <p className="text-[10px] text-muted-foreground text-center leading-tight">
            A assinatura é renovada automaticamente, a menos que seja cancelada pelo menos 24 horas antes do término do período atual. O pagamento será cobrado na sua conta do iTunes. A gestão da assinatura pode ser feita nas Definições da conta após a compra.
          </p>

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
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-2rem)] flex items-center justify-center overflow-y-auto py-6">
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
