import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { Sparkles, Camera, Brain, MessageCircle, Target, CheckCircle, ChefHat, Users, CreditCard, Clock, Dumbbell, Play, Heart, TrendingUp, Calendar, BarChart3, Zap } from 'lucide-react';
const Subscription = () => {
  return <div className="min-h-screen bg-gradient-primary">
      <Navbar />
      
      <div className="pt-20 pb-12 px-0">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Assinatura
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Transforme sua alimentação com tecnologia de ponta
            </p>
          </div>

          {/* Description Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 mb-8 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary-600 text-center mb-4">
                We Diet – Nutrição Inteligente na Palma da Mão!
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

                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <ChefHat className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-gray-700 font-medium"><strong>MasterCheFIT:</strong> Cardápios personalizados</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium"><strong>ServiNUTRI:</strong> Rede de nutricionistas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <SubscriptionStatus />

          {/* Payment Methods Info */}
          <div className="mb-8 animate-scale-in">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-primary-100 rounded-full p-3">
                    <CreditCard className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-primary-600 mb-2">
                  💳 Pagamento com PIX ou Cartão
                </h3>
                <p className="text-gray-700">
                  Acesso liberado em <strong>até 1 hora</strong> após confirmação do pagamento
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Plans */}
          <SubscriptionPlans />

          {/* Features List */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 mt-8 animate-scale-in">
            <CardContent className="p-8">
              <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary-600 to-orange-600 bg-clip-text text-transparent">
                Incluído na Assinatura
              </h3>
              
              {/* Análise Nutricional */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 rounded-full p-2 mr-3">
                    <Camera className="w-6 h-6 text-primary-600" />
                  </div>
                  <h4 className="text-xl font-bold text-primary-700">Análise Nutricional Inteligente</h4>
                </div>
                <div className="grid gap-3 ml-12">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Análise ilimitada de fotos com IA avançada</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Relatórios nutricionais completos e detalhados</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Reconhecimento de método de preparo e porções</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Cálculo automático de macros e micronutrientes</span>
                  </div>
                </div>
              </div>

              {/* Planejamento Alimentar */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 rounded-full p-2 mr-3">
                    <ChefHat className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="text-xl font-bold text-orange-700">MasterCheFIT - Planejamento Completo</h4>
                </div>
                <div className="grid gap-3 ml-12">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Cardápios personalizados gerados por IA</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Receitas baseadas nas suas preferências</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Planejamento semanal de refeições</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Histórico completo de cardápios salvos</span>
                  </div>
                </div>
              </div>

              {/* Fitness & Exercícios */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <Dumbbell className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-green-700">Fitness & Exercícios</h4>
                </div>
                <div className="grid gap-3 ml-12">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">FitTracker completo para registro de exercícios</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Cálculo preciso de calorias queimadas</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Biblioteca de treinos profissionais em vídeo</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Dashboard de desempenho e estatísticas</span>
                  </div>
                </div>
              </div>

              {/* Acompanhamento & Metas */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-bold text-purple-700">Acompanhamento & Metas</h4>
                </div>
                <div className="grid gap-3 ml-12">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Definição de metas nutricionais personalizadas</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Acompanhamento diário com Truth Moment</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Histórico completo de progresso</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Relatórios semanais e mensais</span>
                  </div>
                </div>
              </div>

              {/* Motivação & Comunidade */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="bg-pink-100 rounded-full p-2 mr-3">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <h4 className="text-xl font-bold text-pink-700">Motivação & Comunidade</h4>
                </div>
                <div className="grid gap-3 ml-12">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Coach motivacional com IA personalizada</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Comunidade de transformações inspiradoras</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Sistema de likes e comentários</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Análises motivacionais diárias</span>
                  </div>
                </div>
              </div>

              {/* Acompanhamento Profissional */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold text-blue-700">ServiNUTRI - Rede Profissional</h4>
                </div>
                <div className="grid gap-3 ml-12">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Rede de nutricionistas especializados</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Busca inteligente por localização e especialidade</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Contato direto via WhatsApp</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Compartilhamento de relatórios com profissionais</span>
                  </div>
                </div>
              </div>

              {/* Recursos Avançados */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 rounded-full p-2 mr-3">
                    <Zap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="text-xl font-bold text-indigo-700">Recursos Avançados</h4>
                </div>
                <div className="grid gap-3 ml-12">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Compartilhamento via WhatsApp integrado</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Sincronização de dados em tempo real</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Backup automático de todos os dados</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span className="text-gray-700">Acesso prioritário a novos recursos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>;
};
export default Subscription;