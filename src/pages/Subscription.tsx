
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { AuthCard } from '@/components/AuthCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Brain, MessageCircle, Target, CheckCircle, RefreshCw, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Subscription = () => {
  const { user, session, subscribed, subscriptionTier, subscriptionEnd, checkSubscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleCheckout = async () => {
    if (!session) {
      toast({
        title: "Erro",
        description: "Você precisa fazer login para assinar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Abrir checkout do Stripe em nova aba
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Abrir portal do cliente em nova aba
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro",
        description: "Erro ao abrir portal de gerenciamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSubscription = async () => {
    setRefreshing(true);
    await checkSubscription();
    setRefreshing(false);
    toast({
      title: "Atualizado",
      description: "Status da assinatura verificado.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 shadow-lg animate-pulse-glow">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Quero Assinar
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Transforme sua alimentação com tecnologia de ponta
            </p>
          </div>

          {/* Auth Card */}
          {!user && (
            <div className="mb-8">
              <AuthCard />
            </div>
          )}

          {/* Subscription Status */}
          {user && subscribed && (
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 mb-8 animate-scale-in">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-success-600 mb-2">
                  ✓ Assinatura Ativa
                </CardTitle>
                <div className="text-lg text-gray-600">
                  Plano: {subscriptionTier || 'Premium'}
                </div>
                {subscriptionEnd && (
                  <div className="text-sm text-gray-500">
                    Próxima cobrança: {new Date(subscriptionEnd).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Gerenciar Assinatura
                  </Button>
                  <Button
                    onClick={handleRefreshSubscription}
                    disabled={refreshing}
                    variant="outline"
                    className="px-4"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 mb-8 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary-600 text-center mb-4">
                FoodScan & Diet – Nutrição Inteligente na Palma da Mão!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                Com o FoodScan & Diet, basta uma foto para descobrir todos os detalhes nutricionais da sua refeição. Nossa IA avançada identifica alimentos, calcula calorias, macronutrientes e micronutrientes com precisão, e ainda reconhece o método de preparo. Registre suas refeições automaticamente, acompanhe suas metas nutricionais e receba uma avaliação diária com recomendações personalizadas. Quer compartilhar com seu nutricionista? Envie o resumo direto via WhatsApp em um clique. Controle, orientação e tecnologia para sua saúde alimentar!
              </p>
              
              {/* Features */}
              <div className="grid md:grid-cols-2 gap-4 mt-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 rounded-full p-2">
                    <Camera className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Análise por foto instantânea</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 rounded-full p-2">
                    <Brain className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-gray-700 font-medium">IA avançada de reconhecimento</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 rounded-full p-2">
                    <Target className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Acompanhamento de metas</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 rounded-full p-2">
                    <MessageCircle className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Compartilhamento via WhatsApp</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          {(!user || !subscribed) && (
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 animate-scale-in">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-primary-600 mb-2">
                  Assinatura Mensal
                </CardTitle>
                <div className="text-5xl font-bold text-primary-600 mb-4">
                  R$ 27,90
                </div>
                <p className="text-gray-600">
                  Acesso completo a todas as funcionalidades
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-500" />
                    <span className="text-gray-700">Análise ilimitada de fotos</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-500" />
                    <span className="text-gray-700">Relatórios nutricionais detalhados</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-500" />
                    <span className="text-gray-700">Acompanhamento diário personalizado</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-500" />
                    <span className="text-gray-700">Compartilhamento via WhatsApp</span>
                  </div>
                </div>
                
                <div className="pt-6">
                  <Button 
                    onClick={handleCheckout}
                    disabled={loading || !user}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? "Processando..." : user ? "Assinar Agora" : "Faça login para assinar"}
                  </Button>
                  {user && (
                    <div className="flex justify-center mt-4">
                      <Button
                        onClick={handleRefreshSubscription}
                        disabled={refreshing}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Verificar Status
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
