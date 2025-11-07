import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/LoadingState';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHotmartFlow, setIsHotmartFlow] = useState(false);
  const [hotmartToken, setHotmartToken] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [validatingToken, setValidatingToken] = useState(false);
  const [waitingAuth, setWaitingAuth] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      setIsHotmartFlow(true);
      setHotmartToken(token);
      validateHotmartToken(token);
    }
  }, []);


  const validateHotmartToken = async (token: string) => {
    setValidatingToken(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-token', {
        body: { token }
      });
      
      if (error || !data?.valid) {
        setTokenError(data?.reason || 'Token inválido');
        return;
      }
      
      setTokenData(data);
      setEmail(data.email);
      setName(data.name);
    } catch (err) {
      setTokenError('Erro ao validar token');
    } finally {
      setValidatingToken(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  };

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

      // Ativar assinatura Hotmart em background (se aplicável)
      if (isHotmartFlow && hotmartToken && result.data?.user) {
        supabase.functions.invoke('activate-subscription', {
          body: { token: hotmartToken, user_id: result.data.user.id }
        }).catch(err => console.error('Erro ao ativar assinatura:', err));
      }

      // Marcar que estamos aguardando autenticação
      setWaitingAuth(true);
      setLoading(false);
      
      toast({
        title: "✅ Cadastro realizado!",
        description: "Finalizando autenticação...",
      });
      
    } catch (err) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro no cadastro. Tente novamente.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Detectar quando usuário está autenticado e redirecionar
  useEffect(() => {
    if (waitingAuth && user) {
      window.location.href = '/?from=signup';
    }
  }, [waitingAuth, user]);

  // Tela de aguardando autenticação após signup
  if (waitingAuth && !user) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">
              🔄 Finalizando Cadastro
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="animate-pulse">
              <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-[shimmer_1.5s_infinite]" style={{ width: '60%' }}></div>
              </div>
            </div>
            <p className="text-gray-700">
              Aguarde enquanto configuramos sua conta...
            </p>
            <p className="text-sm text-gray-500">
              Você será redirecionado automaticamente
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navbar />
      
      <div className="pt-32 pb-12 px-4">
        <div className="container mx-auto max-w-md">
          {tokenError && (
            <Card className="bg-red-50 border-red-200 mb-6">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  ❌ Link de Cadastro Inválido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600 mb-4">{tokenError}</p>
                <p className="text-sm text-gray-600 mb-4">
                  Este link pode estar expirado, já ter sido utilizado, ou ser inválido.
                </p>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Voltar ao Início
                </Button>
              </CardContent>
            </Card>
          )}

          {validatingToken && <LoadingState />}

          {isHotmartFlow && tokenData && !tokenError && (
            <>
              <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">🎉 Complete seu Cadastro</CardTitle>
                  <p className="text-gray-700">
                    Você adquiriu o <strong>{tokenData.plan_name}</strong> via Hotmart!
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input value={name} disabled className="bg-gray-100" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={email} disabled className="bg-gray-100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Escolha uma Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Criando conta...' : '✅ Finalizar Cadastro'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="mt-4 bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-700 mb-4">
                    ℹ️ Após finalizar o cadastro, clique em <strong>Começar Agora</strong>
                  </p>
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <a href="/">🚀 Começar Agora</a>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {!isHotmartFlow && !validatingToken && (
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-primary-600">
                  Entre na sua conta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Entrar</TabsTrigger>
                    <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
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
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup">
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
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Auth;