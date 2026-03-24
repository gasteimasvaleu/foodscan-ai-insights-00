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
import { AppleSignInButton } from '@/components/AppleSignInButton';

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

  // Redirect automático após autenticação bem-sucedida
  useEffect(() => {
    if (user) {
      // Marcar para pular splash screen
      sessionStorage.setItem('skipSplash', 'true');
      
      // Aguardar 1.5s para garantir que tudo foi processado
      // (criação do usuário, ativação de subscription, etc.)
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    }
  }, [user, navigate]);


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

      // Login automático para signup MANUAL (não-Hotmart)
      if (!isHotmartFlow && result.data?.user) {
        console.log('🔑 Fazendo login automático após signup manual...');
        
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!loginError) {
          console.log('✅ Login automático realizado com sucesso!');
          
          // Marcar para pular splash screen
          sessionStorage.setItem('skipSplash', 'true');
          
          // Mostrar feedback
          toast({
            title: "✅ Cadastro realizado!",
            description: "Redirecionando...",
          });
          
          // Hard reload garantido
          setTimeout(() => {
            window.location.href = '/';
          }, 800);
          
          setLoading(false);
          return; // IMPORTANTE: não continuar para o toast genérico
        }
        
        // Se deu erro no login automático, continua o fluxo normal
        console.error('❌ Erro no login automático:', loginError);
      }

      // Ativar assinatura Hotmart se aplicável - AGUARDAR a conclusão
      if (isHotmartFlow && hotmartToken && result.data?.user?.id) {
        const { error: activationError } = await supabase.functions.invoke('activate-subscription', {
          body: { 
            token: hotmartToken, 
            user_id: result.data.user.id 
          }
        });

        if (activationError) {
          console.error('Erro ao ativar assinatura:', activationError);
          toast({
            title: "⚠️ Atenção",
            description: "Cadastro criado mas houve um problema ao ativar a assinatura. Entre em contato com suporte.",
            variant: "destructive",
          });
        } else {
          // Login automático após signup + ativação bem-sucedida
          console.log('🔑 Fazendo login automático após signup Hotmart...');
          
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (loginError) {
            console.error('❌ Erro no login automático:', loginError);
            toast({
              title: "⚠️ Atenção",
              description: "Cadastro concluído! Por favor, faça login manualmente.",
              variant: "destructive",
            });
          } else {
            console.log('✅ Login automático realizado com sucesso!');
            
            // Marcar para pular splash screen na próxima navegação
            sessionStorage.setItem('skipSplash', 'true');
            
            // Mostrar feedback ao usuário
            toast({
              title: "✅ Bem-vindo!",
              description: "Sua assinatura está ativa. Redirecionando...",
            });
            
            // Hard reload para garantir estado limpo e redirecionamento
            setTimeout(() => {
              window.location.href = '/';
            }, 800);
          }
        }
      }

      // Mostrar mensagem de sucesso
      toast({
        title: "✅ Cadastro realizado!",
        description: isHotmartFlow ? "Sua assinatura está ativa!" : "Você já pode fazer login.",
      });
      
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