import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Activity, Dumbbell, ChefHat, MessageCircle, User } from 'lucide-react';
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
      color: "from-pink-500 to-rose-600"
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
        
        <div className="space-y-4">
          {/* Botão Meu Perfil - largura total */}
          <Button
            onClick={() => navigate("/profile")}
            className="w-full h-auto py-3 px-4 bg-gradient-to-br from-primary-500 to-pink-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-white border-0"
            variant="default"
          >
            <div className="flex items-center justify-center space-x-3">
              <User className="w-5 h-5" />
              <div className="text-center">
                <div className="font-semibold text-sm">Meu Perfil</div>
                <div className="text-xs opacity-90">Veja seu progresso e balanço calórico</div>
              </div>
            </div>
          </Button>

          {/* Grid original 2x2 (mobile) e 1x4 (desktop) */}
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

          {/* Botão WhatsApp - largura total */}
          <Button
            onClick={() => navigate("/whatsapp-settings")}
            className="w-full h-auto py-3 px-4 bg-gradient-to-br from-green-600 to-green-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-white border-0"
            variant="default"
          >
            <div className="flex items-center justify-center space-x-3">
              <MessageCircle className="w-5 h-5" />
              <div className="text-center">
                <div className="font-semibold text-sm">Configurar WhatsApp</div>
                <div className="text-xs opacity-90">Conecte e receba análises automáticas</div>
              </div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};