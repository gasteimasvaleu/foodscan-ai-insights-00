import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNativePlatform } from '@/hooks/useNativePlatform';
import { Camera, Activity, MessageCircle, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FREEMIUM_ENABLED } from '@/config/freemium';

export const QuickActions = () => {
  const { user, subscriptionStatus } = useAuth();
  const { isNative, isIOS } = useNativePlatform();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAnimated = sessionStorage.getItem('quickActionsAnimated');
    if (hasAnimated) {
      setIsVisible(true);
      return;
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);
        sessionStorage.setItem('quickActionsAnimated', 'true');
      });
    });
  }, []);

  if (!user) return null;

  const isGatedUser =
    FREEMIUM_ENABLED && isNative && isIOS && !subscriptionStatus.subscribed;

  const actions = [
    {
      icon: Camera,
      title: 'Escanear Comida',
      tags: ['IA', 'Foto', 'Nutrição'],
      path: '/foodscan',
      color: '#FA1690',
      isPro: false,
      featureSlug: 'foodscan',
    },
    {
      icon: Activity,
      title: 'Registrar Exercício',
      tags: ['Calorias', 'Atividade'],
      path: '/fit-tracker',
      color: '#E24989',
      isPro: true,
      featureSlug: 'fit-tracker',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      tags: ['Automático', 'Análises'],
      path: '/whatsapp-settings',
      color: '#FA1690',
      isPro: true,
      featureSlug: 'whatsapp-settings',
    },
  ];

  const handleClick = (action: typeof actions[number]) => {
    if (isGatedUser && action.isPro) {
      navigate(`/assinar?reason=feature_locked&feature=${action.featureSlug}`);
      return;
    }
    navigate(action.path);
  };

  return (
    <div className="flex flex-col" style={{ marginBottom: '-64px' }}>
      {actions.map((action, index) => {
        const isLast = index === actions.length - 1;
        const showLock = isGatedUser && action.isPro;
        return (
          <button
            key={index}
            onClick={() => handleClick(action)}
            className="relative w-full rounded-2xl flex items-start text-white shadow-lg hover:shadow-xl active:scale-[0.98]"
            style={{
              backgroundColor: action.color,
              zIndex: index,
              marginTop: index === 0 ? 0 : '-52px',
              minHeight: isLast ? '160px' : '120px',
              paddingTop: '16px',
              paddingBottom: isLast ? '64px' : '16px',
              paddingLeft: '20px',
              paddingRight: '20px',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
              transitionDelay: `${index * 80}ms`,
            }}
          >
            {showLock && (
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}
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
                    {showLock && (
                      <span className="text-[10px] font-semibold bg-white text-[#FD46A1] rounded-full px-2 py-0.5">
                        Pro
                      </span>
                    )}
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
