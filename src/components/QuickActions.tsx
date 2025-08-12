import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Activity, Dumbbell, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const quickActions = [
    {
      icon: Camera,
      title: "Escanear Comida",
      description: "Analise sua refeição",
      path: "/foodscan",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Activity,
      title: "Registrar Exercício",
      description: "Adicione atividade física",
      path: "/fit-tracker",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Dumbbell,
      title: "Ver Treinos",
      description: "Acesse biblioteca",
      path: "/treinos",
      color: "from-purple-500 to-violet-600"
    },
    {
      icon: ChefHat,
      title: "Gerar Cardápio",
      description: "Receitas personalizadas",
      path: "/masterchef",
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-white/30 shadow-xl mb-8">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Ações Rápidas
          </h3>
          <p className="text-gray-600">
            Acesse rapidamente suas principais funcionalidades
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={() => navigate(action.path)}
              className={`h-auto p-4 bg-gradient-to-br ${action.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-white border-0`}
              variant="default"
            >
              <div className="flex flex-col items-center space-y-2 text-center">
                <action.icon className="w-6 h-6" />
                <div>
                  <div className="font-semibold text-sm">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};