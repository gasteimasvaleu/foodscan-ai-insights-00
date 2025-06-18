
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Component as PricingComponent } from '@/components/ui/squishy-pricing';
import { Sparkles, Camera, Brain, MessageCircle, Target, CheckCircle, ChefHat, Users } from 'lucide-react';

const Subscription = () => {
  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navbar />
      
      <div className="pt-20 pb-12 px-0">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Quero Assinar
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Transforme sua alimentação com tecnologia de ponta
            </p>
          </div>

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

          {/* New Pricing Card Component */}
          <div className="animate-scale-in">
            <PricingComponent />
          </div>

          {/* Features List */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 mt-8 animate-scale-in">
            <CardContent className="p-8 py-[29px] px-[14px]">
              <h3 className="text-2xl font-bold text-primary-600 mb-6 text-center">
                Incluído na Assinatura
              </h3>
              <div className="space-y-4">
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
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <span className="text-gray-700"><strong>MasterCheFIT:</strong> Cardápios personalizados por IA</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <span className="text-gray-700"><strong>MasterCheFIT:</strong> Receitas baseadas nos seus gostos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <span className="text-gray-700"><strong>MasterCheFIT:</strong> Planejamento semanal de refeições</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <span className="text-gray-700"><strong>ServiNUTRI:</strong> Rede de nutricionistas especializados</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <span className="text-gray-700"><strong>ServiNUTRI:</strong> Busca inteligente por profissionais</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <span className="text-gray-700"><strong>ServiNUTRI:</strong> Contato direto via WhatsApp</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Subscription;
