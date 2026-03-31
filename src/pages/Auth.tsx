import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Crown, CheckCircle2, Apple } from 'lucide-react';

const APP_STORE_URL = 'https://apps.apple.com/app/we-diet/id6761124021';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signUp(email, password, name);

      if (result.error) {
        toast({
          title: "Erro no cadastro",
          description: result.error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (result.data?.user) {
        // Auto-login após signup
        await supabase.auth.signInWithPassword({ email, password });
      }

      toast({
        title: "✅ Cadastro realizado com sucesso!",
        description: "Agora baixe o app para começar sua jornada.",
      });

      setRegistered(true);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro no cadastro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAppStore = () => {
    window.open(APP_STORE_URL, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-primary pb-28">
      <Navbar />

      <div className="pt-32 pb-12 px-4">
        <div className="container mx-auto max-w-md">
          <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
            <CardHeader className="text-center">
              {!registered ? (
                <>
                  {token && (
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <Crown className="w-10 h-10 text-yellow-500 drop-shadow-lg" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                        Acesso VIP
                      </span>
                    </div>
                  )}
                  <CardTitle className="text-2xl font-bold text-primary-600">
                    {token ? 'Você recebeu um Acesso VIP!' : 'Crie sua conta'}
                  </CardTitle>
                  {token && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Parabéns! Você foi selecionado(a) para ter acesso exclusivo ao <strong>We Diet</strong>. Preencha seus dados abaixo para ativar seu acesso.
                    </p>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-14 h-14 text-green-500" />
                  <CardTitle className="text-2xl font-bold text-primary-600">
                    Cadastro realizado!
                  </CardTitle>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!registered ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col items-center gap-5 py-4">
                  <p className="text-center text-muted-foreground">
                    Agora baixe o app na App Store para começar sua jornada fitness! 💪
                  </p>
                  <Button
                    onClick={handleOpenAppStore}
                    className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white rounded-xl py-6 text-base"
                  >
                    <Apple className="w-5 h-5" />
                    Baixar na App Store
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
