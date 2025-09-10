import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Target, Bell, BellOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MotivationalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onNotificationPermissionGranted?: () => void;
}

export const MotivationalModal: React.FC<MotivationalModalProps> = ({
  isOpen,
  onClose,
  userName,
  onNotificationPermissionGranted,
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'motivation' | 'notifications'>('motivation');
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userName) {
      setStep('motivation');
      fetchMotivationalMessage();
    }
  }, [isOpen, userName]);

  const fetchMotivationalMessage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('motivational-coach', {
        body: { userName },
      });

      if (error) throw error;
      setMessage(data.message);
    } catch (error) {
      console.error('Erro ao buscar mensagem motivacional:', error);
      setMessage(`Olá, ${userName}! 🌟 Que bom te ver aqui! Hoje é um novo dia para cuidar da sua saúde e bem-estar. Lembre-se: cada pequena escolha saudável que você faz é um passo em direção aos seus objetivos. Você tem tudo o que precisa para alcançar o sucesso! Vamos começar essa jornada juntos? 💪✨`);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToNotifications = () => {
    setStep('notifications');
  };

  const handleRequestNotifications = async () => {
    console.log('🔔 Iniciando solicitação de permissão de notificação...');
    setNotificationLoading(true);
    try {
      // Verificar se o browser suporta notificações
      if (!('Notification' in window)) {
        console.log('❌ Este browser não suporta notificações');
        onClose();
        return;
      }

      console.log('📱 Browser suporta notificações, solicitando permissão...');
      console.log('🔍 Status atual da permissão:', Notification.permission);

      // Solicitar permissão
      const permission = await Notification.requestPermission();
      console.log('✅ Resultado da solicitação de permissão:', permission);
      
      if (permission === 'granted') {
        console.log('🎉 Permissão de notificação concedida! Aguardando antes de configurar...');
        
        // Aguardar um momento para garantir que a permissão foi processada
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🔧 Chamando callback para configurar as notificações...');
        console.log('📋 onNotificationPermissionGranted existe?', !!onNotificationPermissionGranted);
        
        // Chamar callback para configurar as notificações
        if (onNotificationPermissionGranted) {
          await onNotificationPermissionGranted();
          console.log('✅ Callback de configuração executado');
        } else {
          console.log('⚠️ Callback não definido');
        }
      } else {
        console.log('❌ Permissão de notificação negada ou não concedida:', permission);
      }
      
      onClose();
    } catch (error) {
      console.error('💥 Erro ao solicitar permissão de notificação:', error);
      onClose();
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleSkipNotifications = () => {
    console.log('Usuário optou por não receber notificações');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md mx-auto bg-background/95 backdrop-blur-xl border border-white/20 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 rounded-lg" />
        
        <DialogHeader className="relative text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-primary/10 p-3 rounded-full border border-primary/20">
                {step === 'motivation' ? (
                  <Sparkles className="w-6 h-6 text-primary" />
                ) : (
                  <Bell className="w-6 h-6 text-primary" />
                )}
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {step === 'motivation' ? `Bem-vindo, ${userName}! 🎉` : 'Quer receber lembretes? 🔔'}
          </DialogTitle>
        </DialogHeader>

        <div className="relative space-y-4 pt-2">
          {step === 'motivation' ? (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <p className="text-foreground/90 leading-relaxed text-sm">
                      {message}
                    </p>
                  </div>

                  <div className="flex justify-center space-x-4 py-2">
                    <div className="flex flex-col items-center space-y-1">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-muted-foreground">Saúde</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-muted-foreground">Foco</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">Energia</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-2">
                <Button 
                  onClick={handleContinueToNotifications}
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium px-6 py-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  Vamos começar! 🚀
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-foreground/90 leading-relaxed text-sm mb-3">
                    Quer receber lembretes motivacionais e dicas personalizadas de saúde diretamente no seu dispositivo?
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Você pode gerenciar essas notificações a qualquer momento nas configurações do seu navegador.
                  </p>
                </div>

                <div className="flex justify-center space-x-4 py-2">
                  <div className="flex flex-col items-center space-y-1">
                    <Bell className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-muted-foreground">Lembretes</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-muted-foreground">Dicas</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-muted-foreground">Metas</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-3 pt-2">
                <Button 
                  onClick={handleSkipNotifications}
                  variant="outline"
                  disabled={notificationLoading}
                  className="px-4 py-2 rounded-full text-sm"
                >
                  <BellOff className="w-4 h-4 mr-2" />
                  Não agora
                </Button>
                <Button 
                  onClick={handleRequestNotifications}
                  disabled={notificationLoading}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium px-4 py-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  {notificationLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Bell className="w-4 h-4 mr-2" />
                  )}
                  Permitir
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};