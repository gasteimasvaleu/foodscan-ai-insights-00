import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, ChefHat, Activity, Dumbbell, Users, ArrowRight } from 'lucide-react';

export const EcosystemSection = () => {
  const ecosystemParts = [
    {
      title: "Nutrição Inteligente",
      icon: Camera,
      features: ["FoodScan", "MasterCheFIT"],
      description: "Análise por foto e receitas personalizadas",
      color: "from-green-500/10 to-emerald-500/10",
      iconColor: "text-green-600"
    },
    {
      title: "Fitness Completo",
      icon: Activity,
      features: ["FitTracker", "Treinos"],
      description: "Exercícios monitorados e biblioteca de treinos",
      color: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-600"
    },
    {
      title: "Suporte Profissional",
      icon: Users,
      features: ["ServiNUTRI"],
      description: "Conecte-se com nutricionistas qualificados",
      color: "from-purple-500/10 to-violet-500/10",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-white/95 to-primary-50/50 backdrop-blur-sm border border-white/30 shadow-2xl">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ecossistema Completo de{' '}
            <span className="bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
              Saúde e Bem-Estar
            </span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Todas as funcionalidades trabalham em conjunto para oferecer uma experiência única 
            e resultados consistentes na sua jornada de saúde.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {ecosystemParts.map((part, index) => (
            <div key={index} className={`relative p-6 rounded-xl bg-gradient-to-br ${part.color} border border-white/40`}>
              <div className={`bg-white rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-md`}>
                <part.icon className={`w-6 h-6 ${part.iconColor}`} />
              </div>
              
              <h3 className="font-bold text-gray-800 mb-2 text-lg">{part.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{part.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {part.features.map((feature, i) => (
                  <span key={i} className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Integration Flow */}
        <div className="bg-white/50 rounded-xl p-6 border border-white/40">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Como Tudo se Conecta
          </h3>
          
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Camera className="w-5 h-5 text-green-600" />
              <span>Escaneie Comida</span>
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
            <div className="block md:hidden w-px h-4 bg-gray-300"></div>
            
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Registre Exercícios</span>
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
            <div className="block md:hidden w-px h-4 bg-gray-300"></div>
            
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <ChefHat className="w-5 h-5 text-orange-600" />
              <span>Receba Feedback</span>
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
            <div className="block md:hidden w-px h-4 bg-gray-300"></div>
            
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Evolua com Profissionais</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};