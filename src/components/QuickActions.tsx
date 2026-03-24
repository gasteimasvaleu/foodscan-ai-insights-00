import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Camera, Activity, ChefHat, MessageCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const actions = [
    {
      icon: User,
      title: "Meu Perfil",
      tags: ["Progresso", "Balanço calórico"],
      path: "/profile",
      gradient: "from-fuchsia-400 to-pink-500",
    },
    {
      icon: Camera,
      title: "Escanear Comida",
      tags: ["IA", "Foto", "Nutrição"],
      path: "/foodscan",
      gradient: "from-pink-400 to-rose-500",
    },
    {
      icon: Activity,
      title: "Registrar Exercício",
      tags: ["Calorias", "Atividade"],
      path: "/fit-tracker",
      gradient: "from-rose-400 to-pink-600",
    },
    {
      icon: Dumbbell,
      title: "Ver Treinos",
      tags: ["Biblioteca", "Vídeos"],
      path: "/treinos",
      gradient: "from-pink-500 to-fuchsia-500",
    },
    {
      icon: ChefHat,
      title: "Gerar Cardápio",
      tags: ["Receitas", "Personalizado"],
      path: "/masterchef",
      gradient: "from-fuchsia-500 to-pink-600",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      tags: ["Automático", "Análises"],
      path: "/whatsapp-settings",
      gradient: "from-rose-500 to-fuchsia-600",
    },
  ];

  return (
    <div className="flex flex-col" style={{ marginBottom: '-24px' }}>
      {actions.map((action, index) => {
        const isLast = index === actions.length - 1;
        return (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className={`relative w-full bg-gradient-to-r ${action.gradient} rounded-2xl flex items-start text-white shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]`}
            style={{
              zIndex: index,
              marginTop: index === 0 ? 0 : '-52px',
              minHeight: isLast ? '120px' : '120px',
              paddingTop: '16px',
              paddingBottom: isLast ? '32px' : '16px',
              paddingLeft: '20px',
              paddingRight: '20px',
            }}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg leading-tight">{action.title}</h3>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {action.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium bg-white/25 backdrop-blur-sm rounded-full px-2 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
