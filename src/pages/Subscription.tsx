import React from 'react';
import { Navbar } from '@/components/Navbar';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { Sparkles, Camera, Brain, MessageCircle, Target, CheckCircle, ChefHat, Users, CreditCard, Clock, Dumbbell, Play, Heart, TrendingUp, Calendar, BarChart3, Zap } from 'lucide-react';
const Subscription = () => {
  return <div className="min-h-screen bg-gradient-primary pb-28">
      <Navbar />
      
      <div className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-12 px-0">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-[#FD46A1]">Assinatura</h1>
            </div>
          </div>

          {/* Description Card */}
          <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 mb-8 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary-600 text-center mb-4">
                We Diet – Nutrição Inteligente na Palma da Mão!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                Com o We Diet, basta uma foto para descobrir todos os detalhes nutricionais da sua refeição. Nossa IA avançada identifica alimentos, calcula calorias, macronutrientes e micronutrientes com precisão, e ainda reconhece o método de preparo. Registre suas refeições automaticamente, acompanhe suas metas nutricionais e receba uma avaliação diária com recomendações personalizadas. Quer compartilhar com seu nutricionista? Envie o resumo direto via WhatsApp em um clique. Controle, orientação e tecnologia para sua saúde alimentar!
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

          {/* Subscription Plans */}
          <SubscriptionPlans />

        </div>
      </div>
      
    </div>;
};
export default Subscription;