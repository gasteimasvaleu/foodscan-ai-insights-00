
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Brain, MessageCircle, Target, CheckCircle } from 'lucide-react';

const Subscription = () => {
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
                <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Assinar Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
