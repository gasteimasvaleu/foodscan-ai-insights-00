import React from 'react';
import { Camera, ChefHat, Target, Sparkles, BarChart3, BookOpen, Activity, Dumbbell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
export const FeaturesSection = () => {
  const features = [{
    icon: Camera,
    title: "Análise Inteligente por Foto",
    description: "Tire uma foto e nossa IA identifica alimentos, calcula calorias, macros e micronutrientes automaticamente!"
  }, {
    icon: ChefHat,
    title: "MasterCheFIT",
    description: "Gerador de cardápios personalizado com receitas detalhadas baseado nas suas preferências e metas."
  }, {
    icon: Activity,
    title: "FitTracker",
    description: "Registre exercícios, calcule calorias queimadas e monitore seu progresso fitness com análises detalhadas."
  }, {
    icon: Dumbbell,
    title: "Biblioteca de Treinos",
    description: "Acesse vídeos e dicas de exercícios personalizados para todos os níveis e objetivos fitness."
  }, {
    icon: Target,
    title: "Controle de Metas",
    description: "Acompanhe suas metas diárias e receba feedback personalizado sobre seu progresso completo."
  }];
  const benefits = [{
    icon: Sparkles,
    text: "Reconhece método de preparo"
  }, {
    icon: BarChart3,
    text: "Registro automático completo"
  }, {
    icon: BookOpen,
    text: "Treinos e receitas personalizados"
  }, {
    icon: Activity,
    text: "Cálculo automático de calorias"
  }];
  return <div className="space-y-8 animate-fade-in">
      {/* Main Description */}
      <Card className="bg-white/95 backdrop-blur-sm border border-white/30 shadow-2xl">
        <CardContent className="p-8 px-[11px]">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Transforme sua saúde com{' '}
              <span className="bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
                Inteligência Artificial
              </span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              O FoodScan & Diet é a plataforma completa que revoluciona como você cuida da sua saúde! 
              Análise nutricional por foto, controle de exercícios e biblioteca de treinos - tudo em um só lugar 
              para sua jornada de bem-estar.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {features.map((feature, index) => <div key={index} className="group p-6 rounded-xl bg-gradient-to-br from-white/50 to-white/30 border border-white/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 px-[8px]">
                <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>)}
          </div>

          {/* Benefits List */}
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {benefits.map((benefit, index) => <div key={index} className="flex items-center space-x-2 text-gray-700">
                <benefit.icon className="w-5 h-5 text-success-500" />
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>)}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-primary-500/10 to-purple-600/10 px-6 py-3 rounded-sm">
              <p className="text-primary-700 font-medium"> Feedback diário personalizado • Resultados reais • Fácil e divertido</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Description */}
      <Card className="bg-gradient-to-r from-primary-50/80 to-purple-50/80 backdrop-blur-sm border border-white/30 shadow-xl">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-700 leading-relaxed">
              No fim do dia, ainda tem o famoso <strong>feedback personalizado</strong>: parabéns se bateu as metas 
              de nutrição e exercícios ou aquele puxão de orelha maroto se deu uma escapada. 
              <span className="text-primary-600 font-semibold"> Tudo integrado, leve, divertido e com foco em resultados reais!</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
};