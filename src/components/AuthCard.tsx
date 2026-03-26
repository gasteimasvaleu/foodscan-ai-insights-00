
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useNativePlatform } from '@/hooks/useNativePlatform';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { PushNotificationSetup, PushNotificationSetupRef } from './PushNotificationSetup';
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
  const { price, hasPurchased, loading: rcLoading, purchaseMonthly, restorePurchases } = useRevenueCat();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const pushNotificationRef = useRef<PushNotificationSetupRef>(null);

  const isNativeIOS = isNative && isIOS;

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
    const success = await purchaseMonthly();
    if (success) {
      toast({ title: '✅ Assinatura realizada!', description: 'Agora faça login com sua conta Apple.' });
    }
  };

  const handleRestore = async () => {
    const found = await restorePurchases();
    if (found) {
      toast({ title: '✅ Compra restaurada!', description: 'Sua assinatura está ativa.' });
    } else {
      toast({ title: 'Nenhuma assinatura encontrada', description: 'Não encontramos assinaturas ativas para restaurar.', variant: 'destructive' });
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

  if (user) {
    const userName = user.user_metadata?.name || user.email;
    return (
      <>
        <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden">
          <CardContent className="p-4 flex justify-center">
            <img
              src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/logoapp.png"
              alt="We Diet Logo"
              className="h-16 object-contain"
              loading="lazy"
            />
          </CardContent>
        </Card>
        <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden">
          <div className="aspect-video w-full">
            <img
              src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/image_1774529760024_8eac27be_1774529764977_e41a0ea0.webp"
              alt="Banner"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </Card>
        <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground text-sm truncate text-center">
              Boas-vindas, {userName}!
            </h3>
          </CardContent>
        </Card>
        <PushNotificationSetup ref={pushNotificationRef} />
      </>
    );
  }

  // ─── Native iOS Flow ───
  if (isNativeIOS) {
    return (
      <div className="min-h-[calc(100vh-env(safe-area-inset-top)-6rem)] flex items-center">
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
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-6rem)] flex items-center">
    <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl w-full">
      <CardHeader>
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
